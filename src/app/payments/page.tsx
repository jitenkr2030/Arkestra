'use client'

import { useEffect, useState } from 'react'
import AppLayout from '@/components/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { DataTable } from '@/components/ui/DataTable'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, DollarSign, CreditCard, Banknote, Receipt } from 'lucide-react'
import toast from 'react-hot-toast'

interface Booking {
  id: string
  paymentAmount: number
  member: { user: { name: string } }
  event: { title: string }
}

interface Payment {
  id: string
  amount: number
  paymentDate: string
  paymentMethod: string
  reference: string
  notes: string
  booking: Booking
}

interface PaymentFormData {
  bookingId: string
  amount: string
  paymentDate: string
  paymentMethod: string
  reference: string
  notes: string
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState<PaymentFormData>({
    bookingId: '',
    amount: '',
    paymentDate: new Date().toISOString().slice(0, 10),
    paymentMethod: 'CASH',
    reference: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [paymentsRes, bookingsRes] = await Promise.all([
        fetch('/api/payments'),
        fetch('/api/bookings'),
      ])

      const [paymentsData, bookingsData] = await Promise.all([
        paymentsRes.json(),
        bookingsRes.json(),
      ])

      setPayments(paymentsData)
      setBookings(bookingsData)

      if (bookingsData.length > 0 && !formData.bookingId) {
        setFormData((prev) => ({ ...prev, bookingId: bookingsData[0].id }))
      }
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
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      })

      if (!res.ok) throw new Error('Failed to record payment')

      toast.success('Payment recorded successfully')
      setModalOpen(false)
      resetForm()
      fetchData()
    } catch (error) {
      toast.error('Failed to record payment')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment?')) return

    try {
      const res = await fetch(`/api/payments/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete payment')
      toast.success('Payment deleted')
      fetchData()
    } catch (error) {
      toast.error('Failed to delete payment')
    }
  }

  const resetForm = () => {
    setFormData({
      bookingId: bookings[0]?.id || '',
      amount: '',
      paymentDate: new Date().toISOString().slice(0, 10),
      paymentMethod: 'CASH',
      reference: '',
      notes: '',
    })
  }

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'BANK_TRANSFER':
        return <Banknote className="w-4 h-4" />
      case 'CARD':
        return <CreditCard className="w-4 h-4" />
      default:
        return <DollarSign className="w-4 h-4" />
    }
  }

  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0)

  const columns = [
    {
      key: 'paymentDate',
      header: 'Date',
      render: (item: Payment) => (
        <span className="text-slate-900">{formatDate(item.paymentDate)}</span>
      ),
    },
    {
      key: 'member',
      header: 'Member',
      render: (item: Payment) => (
        <div>
          <p className="text-slate-900">{item.booking.member.user.name}</p>
          <p className="text-xs text-slate-500">{item.booking.event.title}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (item: Payment) => (
        <span className="font-semibold text-emerald-600">{formatCurrency(item.amount)}</span>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Method',
      render: (item: Payment) => (
        <Badge variant="info" className="flex items-center gap-1 w-fit">
          {getPaymentIcon(item.paymentMethod)}
          {item.paymentMethod.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'reference',
      header: 'Reference',
      render: (item: Payment) => (
        <span className="text-slate-600 font-mono text-sm">{item.reference || '-'}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-24',
      render: (item: Payment) => (
        <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)}>
          Delete
        </Button>
      ),
    },
  ]

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
            <p className="text-slate-500 mt-1">Track and manage member payments</p>
          </div>
          <Button onClick={() => { resetForm(); setModalOpen(true) }}>
            <Plus className="w-4 h-4" />
            Record Payment
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Payments</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {formatCurrency(totalPayments)}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50">
                  <DollarSign className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Number of Transactions</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{payments.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50">
                  <Receipt className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Average Payment</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {formatCurrency(payments.length > 0 ? totalPayments / payments.length : 0)}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50">
                  <CreditCard className="w-6 h-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DataTable
          data={payments}
          columns={columns}
          keyExtractor={(item) => item.id}
          loading={loading}
          emptyMessage="No payments recorded yet"
        />

        <Modal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); resetForm() }}
          title="Record New Payment"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Booking"
              value={formData.bookingId}
              onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
              required
            >
              {bookings.map((booking) => (
                <option key={booking.id} value={booking.id}>
                  {booking.member.user.name} - {booking.event.title} (Due: {formatCurrency(booking.paymentAmount)})
                </option>
              ))}
            </Select>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
              />
              <Input
                label="Payment Date"
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                required
              />
            </div>

            <Select
              label="Payment Method"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            >
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CARD">Card</option>
              <option value="OTHER">Other</option>
            </Select>

            <Input
              label="Reference/Transaction ID"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              placeholder="TRF-2026-001"
            />

            <Input
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => { setModalOpen(false); resetForm() }}>
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                Record Payment
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  )
}