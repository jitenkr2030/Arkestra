'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import AppLayout from '@/components/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { DataTable } from '@/components/ui/DataTable'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { Calendar, Ticket, DollarSign, Clock } from 'lucide-react'

interface Booking {
  id: string
  status: string
  paymentStatus: string
  paymentAmount: number
  createdAt: string
  event: {
    id: string
    title: string
    startTime: string
    endTime: string
    location: string
    eventType: string
  }
  payments: { id: string; amount: number; paymentDate: string }[]
}

export default function MyBookingsPage() {
  const { data: session } = useSession()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      // Get members for current user
      const membersRes = await fetch('/api/members')
      const membersData = await membersRes.json()
      const currentMember = membersData.find(
        (m: { user: { id: string } }) => m.user.id === session?.user?.id
      )

      if (currentMember) {
        const res = await fetch(`/api/bookings?memberId=${currentMember.id}`)
        const data = await res.json()
        setBookings(data)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculatePaymentReceived = (booking: Booking) => {
    return booking.payments.reduce((sum, p) => sum + p.amount, 0)
  }

  const columns = [
    {
      key: 'event',
      header: 'Event',
      render: (item: Booking) => (
        <div>
          <p className="font-medium text-slate-900">{item.event.title}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {item.event.eventType} • {item.event.location || 'TBD'}
          </p>
        </div>
      ),
    },
    {
      key: 'dateTime',
      header: 'Date & Time',
      render: (item: Booking) => (
        <div>
          <p className="text-slate-900">{formatDate(item.event.startTime)}</p>
          <p className="text-xs text-slate-500">
            {formatTime(item.event.startTime)} - {formatTime(item.event.endTime)}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Booking) => (
        <Badge
          variant={
            item.status === 'CONFIRMED' ? 'success' : item.status === 'PENDING' ? 'warning' : 'default'
          }
        >
          {item.status}
        </Badge>
      ),
    },
    {
      key: 'payment',
      header: 'Payment',
      render: (item: Booking) => {
        const received = calculatePaymentReceived(item)
        return (
          <div>
            <Badge
              variant={
                item.paymentStatus === 'PAID'
                  ? 'success'
                  : item.paymentStatus === 'PARTIAL'
                  ? 'warning'
                  : 'danger'
              }
            >
              {item.paymentStatus}
            </Badge>
            <p className="text-xs text-slate-500 mt-1">
              {formatCurrency(received)} / {formatCurrency(item.paymentAmount)}
            </p>
          </div>
        )
      },
    },
  ]

  const upcomingBookings = bookings.filter(
    (b) => new Date(b.event.startTime) > new Date() && b.status !== 'CANCELLED'
  )
  const pastBookings = bookings.filter(
    (b) => new Date(b.event.startTime) <= new Date() || b.status === 'CANCELLED'
  )

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
          <p className="text-slate-500 mt-1">View your event bookings and payment history</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Bookings</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{bookings.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50">
                  <Ticket className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Upcoming</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{upcomingBookings.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50">
                  <Calendar className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Earned</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">
                    {formatCurrency(
                      bookings.reduce((sum, b) => sum + calculatePaymentReceived(b), 0)
                    )}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50">
                  <DollarSign className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Bookings */}
        {upcomingBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Upcoming Bookings</h2>
            <DataTable
              data={upcomingBookings}
              columns={columns}
              keyExtractor={(item) => item.id}
              loading={loading}
              emptyMessage="No upcoming bookings"
            />
          </div>
        )}

        {/* Past Bookings */}
        {pastBookings.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Past Bookings</h2>
            <DataTable
              data={pastBookings}
              columns={columns}
              keyExtractor={(item) => item.id}
              loading={loading}
              emptyMessage="No past bookings"
            />
          </div>
        )}

        {bookings.length === 0 && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">You have no bookings yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}