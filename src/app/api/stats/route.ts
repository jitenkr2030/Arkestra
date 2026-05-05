import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const stats = await Promise.all([
      // Total events
      prisma.event.count(),
      // Upcoming events
      prisma.event.count({
        where: {
          startTime: { gte: new Date() },
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
        },
      }),
      // Total bookings
      prisma.booking.count(),
      // Pending bookings
      prisma.booking.count({ where: { status: 'PENDING' } }),
      // Total members
      prisma.member.count(),
      // Total clients
      prisma.client.count(),
      // Revenue from paid bookings
      prisma.booking.aggregate({
        _sum: { paymentAmount: true },
        where: { paymentStatus: 'PAID' },
      }),
      // Pending payments
      prisma.booking.aggregate({
        _sum: { paymentAmount: true },
        where: { paymentStatus: { in: ['UNPAID', 'PARTIAL'] } },
      }),
      // Unread notifications count
      prisma.notification.count({ where: { read: false } }),
    ])

    return NextResponse.json({
      totalEvents: stats[0],
      upcomingEvents: stats[1],
      totalBookings: stats[2],
      pendingBookings: stats[3],
      totalMembers: stats[4],
      totalClients: stats[5],
      totalRevenue: stats[6]._sum.paymentAmount || 0,
      pendingRevenue: stats[7]._sum.paymentAmount || 0,
      unreadNotifications: stats[8],
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}