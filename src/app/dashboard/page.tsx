'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import AppLayout from '@/components/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDate, formatTime, getEventStatusColor } from '@/lib/utils'
import {
  Calendar,
  Users,
  Ticket,
  Music,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

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
  member: { user: { name: string } }
  event: { title: string; startTime: string }
}

interface Payment {
  id: string
  amount: number
  paymentDate: string
  paymentMethod: string
  booking: { member: { user: { name: string } } }
  event: { title: string }
}

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
        const [statsRes, eventsRes, bookingsRes, paymentsRes] = await Promise.all([
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
        setUpcomingEvents(eventsData.slice(0, 5))
        setRecentBookings(bookingsData.slice(0, 5))
        setRecentPayments(paymentsData.slice(0, 5))
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6 lg:p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  const statCards = [
    {
      title: 'Upcoming Events',
      value: stats?.upcomingEvents || 0,
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Members',
      value: stats?.totalMembers || 0,
      icon: Users,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Pending Bookings',
      value: stats?.pendingBookings || 0,
      icon: Ticket,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: DollarSign,
      color: 'text-primary-500',
      bgColor: 'bg-primary-50',
    },
  ]

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {session?.user?.name?.split(' ')[0]}
          </h1>
          <p className="text-slate-500 mt-1">Here&apos;s what&apos;s happening with your orchestra</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary-500" />
                  Upcoming Events
                </CardTitle>
                <a href="/events" className="text-sm text-primary-500 hover:text-primary-600">
                  View all
                </a>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No upcoming events</p>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary-50 flex flex-col items-center justify-center">
                        <span className="text-xs text-primary-600 font-medium">
                          {new Date(event.startTime).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-lg font-bold text-primary-700">
                          {new Date(event.startTime).getDate()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{event.title}</p>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {formatTime(event.startTime)} • {event.location || 'TBD'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant={
                              event.status === 'CONFIRMED'
                                ? 'success'
                                : event.status === 'SCHEDULED'
                                ? 'info'
                                : 'default'
                            }
                          >
                            {event.status}
                          </Badge>
                          <span className="text-xs text-slate-400">
                            {event._count.bookings} booking{event._count.bookings !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-emerald-500" />
                  Recent Bookings
                </CardTitle>
                <a href="/bookings" className="text-sm text-primary-500 hover:text-primary-600">
                  View all
                </a>
              </div>
            </CardHeader>
            <CardContent>
              {recentBookings.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No recent bookings</p>
              ) : (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{booking.member.user.name}</p>
                        <p className="text-sm text-slate-500 mt-0.5">{booking.event.title}</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            booking.status === 'CONFIRMED'
                              ? 'success'
                              : booking.status === 'PENDING'
                              ? 'warning'
                              : 'default'
                          }
                        >
                          {booking.status}
                        </Badge>
                        <p className="text-sm font-medium text-slate-900 mt-1">
                          {formatCurrency(booking.paymentAmount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-amber-500" />
                  Recent Payments
                </CardTitle>
                <a href="/payments" className="text-sm text-primary-500 hover:text-primary-600">
                  View all
                </a>
              </div>
            </CardHeader>
            <CardContent>
              {recentPayments.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No recent payments</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">
                          Member
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">
                          Event
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">
                          Amount
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">
                          Method
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPayments.map((payment) => (
                        <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 text-sm text-slate-600">
                            {formatDate(payment.paymentDate)}
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-900">
                            {payment.booking.member.user.name}
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600">
                            {payment.event.title}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-slate-900">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="info">{payment.paymentMethod.replace('_', ' ')}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-500" />
                Quick Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-900">{stats?.totalEvents || 0}</p>
                  <p className="text-sm text-slate-500">Total Events</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <Music className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-900">{stats?.totalBookings || 0}</p>
                  <p className="text-sm text-slate-500">Total Bookings</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-900">{stats?.totalClients || 0}</p>
                  <p className="text-sm text-slate-500">Total Clients</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(stats?.pendingRevenue || 0)}
                  </p>
                  <p className="text-sm text-slate-500">Pending Payments</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}