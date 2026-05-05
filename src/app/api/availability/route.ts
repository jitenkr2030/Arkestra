import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const memberId = searchParams.get('memberId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}

    if (memberId) where.memberId = memberId
    if (status) where.status = status
    if (startDate || endDate) {
      where.date = {}
      if (startDate) (where.date as Record<string, Date>).gte = new Date(startDate)
      if (endDate) (where.date as Record<string, Date>).lte = new Date(endDate)
    }

    const availabilities = await prisma.availability.findMany({
      where,
      orderBy: { date: 'asc' },
      include: {
        member: {
          include: { user: true },
        },
      },
    })

    return NextResponse.json(availabilities)
  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { memberId, date, status, reason } = body

    // Check for existing availability on the same date
    const existing = await prisma.availability.findFirst({
      where: {
        memberId,
        date: {
          gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
          lte: new Date(new Date(date).setHours(23, 59, 59, 999)),
        },
      },
    })

    if (existing) {
      // Update existing
      const availability = await prisma.availability.update({
        where: { id: existing.id },
        data: {
          status: status || 'AVAILABLE',
          reason,
        },
        include: { member: { include: { user: true } } },
      })
      return NextResponse.json(availability)
    }

    const availability = await prisma.availability.create({
      data: {
        memberId,
        date: new Date(date),
        status: status || 'AVAILABLE',
        reason,
      },
      include: { member: { include: { user: true } } },
    })

    return NextResponse.json(availability, { status: 201 })
  } catch (error) {
    console.error('Error creating availability:', error)
    return NextResponse.json({ error: 'Failed to create availability' }, { status: 500 })
  }
}