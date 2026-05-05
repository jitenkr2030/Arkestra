import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: {
        booking: {
          include: {
            event: true,
            member: { include: { user: true } },
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error fetching payment:', error)
    return NextResponse.json({ error: 'Failed to fetch payment' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { amount, paymentDate, paymentMethod, reference, notes } = body

    const payment = await prisma.payment.update({
      where: { id: params.id },
      data: {
        amount,
        paymentDate: paymentDate ? new Date(paymentDate) : undefined,
        paymentMethod,
        reference,
        notes,
      },
    })

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    await prisma.payment.delete({
      where: { id: params.id },
    })

    // Update booking payment status
    const allPayments = await prisma.payment.findMany({
      where: { bookingId: payment.bookingId },
    })
    const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0)
    const booking = await prisma.booking.findUnique({
      where: { id: payment.bookingId },
    })

    let paymentStatus = 'UNPAID'
    if (totalPaid >= (booking?.paymentAmount || 0)) {
      paymentStatus = 'PAID'
    } else if (totalPaid > 0) {
      paymentStatus = 'PARTIAL'
    }

    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { paymentStatus },
    })

    return NextResponse.json({ message: 'Payment deleted successfully' })
  } catch (error) {
    console.error('Error deleting payment:', error)
    return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 })
  }
}