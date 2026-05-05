import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const bookingId = searchParams.get('bookingId')

    const where: Record<string, unknown> = {}
    if (bookingId) where.bookingId = bookingId

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { paymentDate: 'desc' },
      include: {
        booking: {
          include: {
            event: true,
            member: { include: { user: true } },
          },
        },
      },
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, amount, paymentDate, paymentMethod, reference, notes } = body

    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        paymentMethod: paymentMethod || 'CASH',
        reference,
        notes,
      },
      include: {
        booking: true,
      },
    })

    // Update booking payment status
    const allPayments = await prisma.payment.findMany({
      where: { bookingId },
    })
    const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0)
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    })

    let paymentStatus = 'UNPAID'
    if (totalPaid >= (booking?.paymentAmount || 0)) {
      paymentStatus = 'PAID'
    } else if (totalPaid > 0) {
      paymentStatus = 'PARTIAL'
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: { paymentStatus },
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}