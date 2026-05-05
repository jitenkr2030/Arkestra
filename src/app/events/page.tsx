'use client'

import { useEffect, useState } from 'react'
import AppLayout from '@/components/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { DataTable } from '@/components/ui/DataTable'
import { formatDate, formatTime, getEventStatusColor } from '@/lib/utils'
import { Plus, Music, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

interface Orchestra {
  id: string
  name: string
  description: string
  contactEmail: string
  contactPhone: string
  _count: { events: number }
}

interface EventFormData {
  orchestraId: string
  title: string
  description: string
  eventType: string
  location: string
  startTime: string
  endTime: string
  status: string
  notes: string
}

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [orchestras, setOrchestras] = useState<Orchestra[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<unknown>(null)
  const [formData, setFormData] = useState<EventFormData>({
    orchestraId: '',
    title: '',
    description: '',
    eventType: 'CONCERT',
    location: '',
    startTime: '',
    endTime: '',
    status: 'SCHEDULED',
    notes: '',
  })
  const [filter, setFilter] = useState({ status: '', eventType: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [filter])

  const fetchData = async () => {
    try {
      const params = new URLSearchParams()
      if (filter.status) params.append('status', filter.status)
      if (filter.eventType) params.append('eventType', filter.eventType)

      const [eventsRes, orchestrasRes] = await Promise.all([
        fetch(`/api/events?${params.toString()}`),
        fetch('/api/orchestras'),
      ])

      const eventsData = await eventsRes.json()
      const orchestrasData = await orchestrasRes.json()

      setEvents(eventsData)
      setOrchestras(orchestrasData)

      if (orchestrasData.length > 0 && !formData.orchestraId) {
        setFormData((prev) => ({ ...prev, orchestraId: orchestrasData[0].id }))
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
      const url = selectedEvent
        ? `/api/events/${(selectedEvent as { id: string }).id}`
        : '/api/events'
      const method = selectedEvent ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Failed to save event')

      toast.success(selectedEvent ? 'Event updated' : 'Event created')
      setModalOpen(false)
      resetForm()
      fetchData()
    } catch (error) {
      toast.error('Failed to save event')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (event: unknown) => {
    const e = event as {
      id: string
      orchestraId: string
      title: string
      description: string
      eventType: string
      location: string
      startTime: string
      endTime: string
      status: string
      notes: string
    }
    setSelectedEvent(e)
    setFormData({
      orchestraId: e.orchestraId,
      title: e.title,
      description: e.description || '',
      eventType: e.eventType,
      location: e.location || '',
      startTime: e.startTime.slice(0, 16),
      endTime: e.endTime.slice(0, 16),
      status: e.status,
      notes: e.notes || '',
    })
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete event')
      toast.success('Event deleted')
      fetchData()
    } catch (error) {
      toast.error('Failed to delete event')
    }
  }

  const resetForm = () => {
    setSelectedEvent(null)
    setFormData({
      orchestraId: orchestras[0]?.id || '',
      title: '',
      description: '',
      eventType: 'CONCERT',
      location: '',
      startTime: '',
      endTime: '',
      status: 'SCHEDULED',
      notes: '',
    })
  }

  const columns = [
    {
      key: 'title',
      header: 'Event',
      render: (item: unknown) => {
        const e = item as { title: string; eventType: string }
        return (
          <div>
            <p className="font-medium text-slate-900">{e.title}</p>
            <p className="text-xs text-slate-500 mt-0.5">{e.eventType}</p>
          </div>
        )
      },
    },
    {
      key: 'startTime',
      header: 'Date & Time',
      render: (item: unknown) => {
        const e = item as { startTime: string; endTime: string }
        return (
          <div>
            <p className="text-slate-900">{formatDate(e.startTime)}</p>
            <p className="text-xs text-slate-500">
              {formatTime(e.startTime)} - {formatTime(e.endTime)}
            </p>
          </div>
        )
      },
    },
    {
      key: 'location',
      header: 'Location',
      render: (item: unknown) => {
        const e = item as { location: string }
        return <span className="text-slate-600">{e.location || 'TBD'}</span>
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: unknown) => {
        const e = item as { status: string }
        const variant = e.status === 'CONFIRMED' ? 'success' : e.status === 'CANCELLED' ? 'danger' : 'info'
        return <Badge variant={variant}>{e.status}</Badge>
      },
    },
    {
      key: '_count',
      header: 'Bookings',
      render: (item: unknown) => {
        const e = item as { _count: { bookings: number } }
        return <span className="text-slate-600">{e._count.bookings}</span>
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-32',
      render: (item: unknown) => {
        const e = item as { id: string }
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
              Edit
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleDelete(e.id)}>
              Delete
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Events</h1>
            <p className="text-slate-500 mt-1">Manage your orchestra events</p>
          </div>
          <Button onClick={() => { resetForm(); setModalOpen(true) }}>
            <Plus className="w-4 h-4" />
            Add Event
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
                <option value="SCHEDULED">Scheduled</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="COMPLETED">Completed</option>
              </Select>
              <Select
                value={filter.eventType}
                onChange={(e) => setFilter({ ...filter, eventType: e.target.value })}
                className="w-40"
              >
                <option value="">All Types</option>
                <option value="CONCERT">Concert</option>
                <option value="REHEARSAL">Rehearsal</option>
                <option value="PERFORMANCE">Performance</option>
                <option value="OTHER">Other</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        <DataTable
          data={events}
          columns={columns}
          keyExtractor={(item: unknown) => (item as { id: string }).id}
          loading={loading}
          emptyMessage="No events found"
        />

        {/* Create/Edit Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); resetForm() }}
          title={selectedEvent ? 'Edit Event' : 'Create Event'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Orchestra"
              value={formData.orchestraId}
              onChange={(e) => setFormData({ ...formData, orchestraId: e.target.value })}
              required
            >
              {orchestras.map((orchestra) => (
                <option key={orchestra.id} value={orchestra.id}>
                  {orchestra.name}
                </option>
              ))}
            </Select>

            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Event title"
              required
            />

            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Event description"
              rows={3}
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Event Type"
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
              >
                <option value="CONCERT">Concert</option>
                <option value="REHEARSAL">Rehearsal</option>
                <option value="PERFORMANCE">Performance</option>
                <option value="OTHER">Other</option>
              </Select>
              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="COMPLETED">Completed</option>
              </Select>
            </div>

            <Input
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Event location"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Time"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
              <Input
                label="End Time"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>

            <Textarea
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes"
              rows={2}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => { setModalOpen(false); resetForm() }}>
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                {selectedEvent ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  )
}