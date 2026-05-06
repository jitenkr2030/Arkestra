'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import AppLayout from '@/components/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import {
  Calendar,
  Users,
  Ticket,
  Music,
  DollarSign,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

/* ================= TYPES ================= */

interface Stats {
  totalEvents: number
  upcomingEvents: number
  totalBookings: number
  pendingBookings: number
  totalMembers: number
  totalClients: number
  totalRevenue: number
  pendingRevenue: number
  unreadNotifications: number
}

interface Event {
  id: string
  title: string
  eventType: string
  startTime: string
  location: string
  status: string
  _count: { bookings: number }
}

interface Booking {
  id: string
  status: string
  paymentStatus: string
  paymentAmount: number
  member?: {
    user?: { name?: string }
  }
  event?: {
    title?: string
    startTime?: string
  }
}

interface Payment {
  id: string
  amount: number
  paymentDate: string
  paymentMethod: string

  booking?: {
    member?: {
      user?: { name?: string }
    }
    event?: {
      title?: string
    }
  }

  event?: {
    title?: string
  }
}

/* ================= PAGE ================= */

export default function DashboardPage() {
  const { data: session } = useSession()

  const [stats, setStats] = useState<Stats | null>(null)
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [recentPayments, setRecentPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, eventsRes, bookingsRes, paymentsRes] =
          await Promise.all([
            fetch('/api/stats'),
            fetch('/api/events?status=SCHEDULED&status=CONFIRMED'),
            fetch('/api/bookings'),
            fetch('/api/payments'),
          ])

        const statsData = await statsRes.json()
        const eventsData = await eventsRes.json()
        const bookingsData = await bookingsRes.json()
        const paymentsData = await paymentsRes.json()

        setStats(statsData)
        setUpcomingEvents(eventsData?.slice(0, 5) || [])
        setRecentBookings(bookingsData?.slice(0, 5) || [])
        setRecentPayments(paymentsData?.slice(0, 5) || [])
      } catch (err) {
        console.error('Dashboard error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/4" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-6">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            Welcome {session?.user?.name?.split(' ')[0] || 'User'}
          </h1>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card><CardContent>Total Events: {stats?.totalEvents || 0}</CardContent></Card>
          <Card><CardContent>Members: {stats?.totalMembers || 0}</CardContent></Card>
          <Card><CardContent>Bookings: {stats?.totalBookings || 0}</CardContent></Card>
          <Card><CardContent>Revenue: {formatCurrency(stats?.totalRevenue || 0)}</CardContent></Card>
        </div>

        {/* PAYMENTS TABLE */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>

          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Member</th>
                  <th>Event</th>
                  <th>Amount</th>
                  <th>Method</th>
                </tr>
              </thead>

              <tbody>
                {recentPayments.map((payment) => (
                  <tr key={payment.id} className="border-b">

                    <td>{formatDate(payment.paymentDate)}</td>

                    <td>
                      {payment.booking?.member?.user?.name || 'Unknown'}
                    </td>

                    <td>
                      {payment.booking?.event?.title ||
                        payment.event?.title ||
                        'No Event'}
                    </td>

                    <td>{formatCurrency(payment.amount)}</td>

                    <td>
                      <Badge variant="info">
                        {payment.paymentMethod?.replace('_', ' ') || 'N/A'}
                      </Badge>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  )
}
