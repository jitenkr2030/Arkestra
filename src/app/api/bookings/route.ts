import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const eventId = searchParams.get('eventId')
    const memberId = searchParams.get('memberId')
    const status = searchParams.get('status')
    const paymentStatus = searchParams.get('paymentStatus')

    const where: Record<string, unknown> = {}

    if (eventId) where.eventId = eventId
    if (memberId) where.memberId = memberId
    if (status) where.status = status
    if (paymentStatus) where.paymentStatus = paymentStatus

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        event: {
          include: { orchestra: true },
        },
        member: {
          include: { user: true },
        },
        payments: true,
      },
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, memberId, status, paymentStatus, paymentAmount, notes } = body

    const booking = await prisma.booking.create({
      data: {
        eventId,
        memberId,
        status: status || 'PENDING',
        paymentStatus: paymentStatus || 'UNPAID',
        paymentAmount: paymentAmount || 0,
        notes,
      },
      include: {
        event: true,
        member: { include: { user: true } },
      },
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}