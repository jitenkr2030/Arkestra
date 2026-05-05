'use client'

import { useEffect, useState } from 'react'
import AppLayout from '@/components/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { DataTable } from '@/components/ui/DataTable'
import { formatCurrency, formatDate, getBookingStatusColor, getPaymentStatusColor } from '@/lib/utils'
import { Plus, Ticket } from 'lucide-react'
import toast from 'react-hot-toast'

interface Event {
  id: string
  title: string
  startTime: string
}

interface Member {
  id: string
  instrument: string
  user: { name: string }
}

interface Booking {
  id: string
  status: string
  paymentStatus: string
  paymentAmount: number
  notes: string
  createdAt: string
  event: Event
  member: Member
  payments: { id: string; amount: number; paymentDate: string }[]
}

interface BookingFormData {
  eventId: string
  memberId: string
  status: string
  paymentStatus: string
  paymentAmount: string
  notes: string
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [filter, setFilter] = useState({ status: '', paymentStatus: '' })
  const [formData, setFormData] = useState<BookingFormData>({
    eventId: '',
    memberId: '',
    status: 'PENDING',
    paymentStatus: 'UNPAID',
    paymentAmount: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [filter])

  const fetchData = async () => {
    try {
      const params = new URLSearchParams()
      if (filter.status) params.append('status', filter.status)
      if (filter.paymentStatus) params.append('paymentStatus', filter.paymentStatus)

      const [bookingsRes, eventsRes, membersRes] = await Promise.all([
        fetch(`/api/bookings?${params.toString()}`),
        fetch('/api/events'),
        fetch('/api/members'),
      ])

      const [bookingsData, eventsData, membersData] = await Promise.all([
        bookingsRes.json(),
        eventsRes.json(),
        membersRes.json(),
      ])

      setBookings(bookingsData)
      setEvents(eventsData)
      setMembers(membersData)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = selectedBooking
        ? `/api/bookings/${selectedBooking.id}`
        : '/api/bookings'
      const method = selectedBooking ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          paymentAmount: parseFloat(formData.paymentAmount) || 0,
        }),
      })

      if (!res.ok) throw new Error('Failed to save booking')

      toast.success(selectedBooking ? 'Booking updated' : 'Booking created')
      setModalOpen(false)
      resetForm()
      fetchData()
    } catch (error) {
      toast.error('Failed to save booking')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (booking: Booking) => {
    setSelectedBooking(booking)
    setFormData({
      eventId: booking.event.id,
      memberId: booking.member.id,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      paymentAmount: booking.paymentAmount.toString(),
      notes: booking.notes || '',
    })
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return

    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete booking')
      toast.success('Booking deleted')
      fetchData()
    } catch (error) {
      toast.error('Failed to delete booking')
    }
  }

  const resetForm = () => {
    setSelectedBooking(null)
    setFormData({
      eventId: events[0]?.id || '',
      memberId: members[0]?.id || '',
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      paymentAmount: '',
      notes: '',
    })
  }

  const calculatePaymentReceived = (booking: Booking) => {
    return booking.payments.reduce((sum, p) => sum + p.amount, 0)
  }

  const columns = [
    {
      key: 'member',
      header: 'Member',
      render: (item: Booking) => (
        <div>
          <p className="font-medium text-slate-900">{item.member.user.name}</p>
          <p className="text-xs text-slate-500">{item.member.instrument}</p>
        </div>
      ),
    },
    {
      key: 'event',
      header: 'Event',
      render: (item: Booking) => (
        <div>
          <p className="text-slate-900">{item.event.title}</p>
          <p className="text-xs text-slate-500">{formatDate(item.event.startTime)}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Booking Status',
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
    {
      key: 'createdAt',
      header: 'Created',
      render: (item: Booking) => (
        <span className="text-slate-600">{formatDate(item.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-32',
      render: (item: Booking) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
            Edit
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
            <p className="text-slate-500 mt-1">Manage member bookings for events</p>
          </div>
          <Button onClick={() => { resetForm(); setModalOpen(true) }}>
            <Plus className="w-4 h-4" />
            Add Booking
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <Select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                className="w-40"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="DECLINED">Declined</option>
                <option value="CANCELLED">Cancelled</option>
              </Select>
              <Select
                value={filter.paymentStatus}
                onChange={(e) => setFilter({ ...filter, paymentStatus: e.target.value })}
                className="w-40"
              >
                <option value="">All Payments</option>
                <option value="UNPAID">Unpaid</option>
                <option value="PARTIAL">Partial</option>
                <option value="PAID">Paid</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        <DataTable
          data={bookings}
          columns={columns}
          keyExtractor={(item) => item.id}
          loading={loading}
          emptyMessage="No bookings found"
        />

        {/* Create/Edit Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); resetForm() }}
          title={selectedBooking ? 'Edit Booking' : 'Create Booking'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Event"
              value={formData.eventId}
              onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
              required
            >
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title} - {formatDate(event.startTime)}
                </option>
              ))}
            </Select>

            <Select
              label="Member"
              value={formData.memberId}
              onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
              required
            >
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.user.name} - {member.instrument}
                </option>
              ))}
            </Select>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Booking Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="DECLINED">Declined</option>
                <option value="CANCELLED">Cancelled</option>
              </Select>
              <Select
                label="Payment Status"
                value={formData.paymentStatus}
                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
              >
                <option value="UNPAID">Unpaid</option>
                <option value="PARTIAL">Partial</option>
                <option value="PAID">Paid</option>
              </Select>
            </div>

            <Input
              label="Payment Amount"
              type="number"
              step="0.01"
              value={formData.paymentAmount}
              onChange={(e) => setFormData({ ...formData, paymentAmount: e.target.value })}
              placeholder="0.00"
            />

            <Textarea
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes"
              rows={3}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => { setModalOpen(false); resetForm() }}>
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                {selectedBooking ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  )
}

// Import Modal component
import { Modal } from '@/components/ui/Modal'
import { Textarea, Input } from '@/components/ui/Input'