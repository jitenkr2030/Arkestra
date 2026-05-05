import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const orchestraId = searchParams.get('orchestraId')
    const status = searchParams.get('status')
    const eventType = searchParams.get('eventType')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: Record<string, unknown> = {}

    if (orchestraId) where.orchestraId = orchestraId
    if (status) where.status = status
    if (eventType) where.eventType = eventType
    if (startDate || endDate) {
      where.startTime = {}
      if (startDate) (where.startTime as Record<string, Date>).gte = new Date(startDate)
      if (endDate) (where.startTime as Record<string, Date>).lte = new Date(endDate)
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { startTime: 'asc' },
      include: {
        orchestra: true,
        bookings: {
          include: { member: { include: { user: true } } },
        },
        repertoires: true,
        _count: {
          select: { bookings: true, repertoires: true },
        },
      },
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orchestraId, title, description, eventType, location, startTime, endTime, status, notes } = body

    const event = await prisma.event.create({
      data: {
        orchestraId,
        title,
        description,
        eventType: eventType || 'CONCERT',
        location,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: status || 'SCHEDULED',
        notes,
      },
      include: {
        orchestra: true,
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}