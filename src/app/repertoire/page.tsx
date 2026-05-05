'use client'

import { useEffect, useState } from 'react'
import AppLayout from '@/components/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { DataTable } from '@/components/ui/DataTable'
import { formatDate } from '@/lib/utils'
import { Plus, FileMusic, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

interface Event {
  id: string
  title: string
  startTime: string
}

interface Repertoire {
  id: string
  title: string
  composer: string
  duration: number
  arrangement: string
  notes: string
  event: Event
}

interface RepertoireFormData {
  eventId: string
  title: string
  composer: string
  duration: string
  arrangement: string
  notes: string
}

export default function RepertoirePage() {
  const [repertoire, setRepertoire] = useState<Repertoire[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedRepertoire, setSelectedRepertoire] = useState<Repertoire | null>(null)
  const [filter, setFilter] = useState({ eventId: '' })
  const [formData, setFormData] = useState<RepertoireFormData>({
    eventId: '',
    title: '',
    composer: '',
    duration: '',
    arrangement: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [filter])

  const fetchData = async () => {
    try {
      const params = new URLSearchParams()
      if (filter.eventId) params.append('eventId', filter.eventId)

      const [repertoireRes, eventsRes] = await Promise.all([
        fetch(`/api/repertoire?${params.toString()}`),
        fetch('/api/events'),
      ])

      const [repertoireData, eventsData] = await Promise.all([
        repertoireRes.json(),
        eventsRes.json(),
      ])

      setRepertoire(repertoireData)
      setEvents(eventsData)

      if (eventsData.length > 0 && !formData.eventId) {
        setFormData((prev) => ({ ...prev, eventId: eventsData[0].id }))
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
      const url = selectedRepertoire
        ? `/api/repertoire/${selectedRepertoire.id}`
        : '/api/repertoire'
      const method = selectedRepertoire ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          duration: parseInt(formData.duration) || null,
        }),
      })

      if (!res.ok) throw new Error('Failed to save repertoire')

      toast.success(selectedRepertoire ? 'Repertoire updated' : 'Repertoire added')
      setModalOpen(false)
      resetForm()
      fetchData()
    } catch (error) {
      toast.error('Failed to save repertoire')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (item: Repertoire) => {
    setSelectedRepertoire(item)
    setFormData({
      eventId: item.event.id,
      title: item.title,
      composer: item.composer || '',
      duration: item.duration?.toString() || '',
      arrangement: item.arrangement || '',
      notes: item.notes || '',
    })
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this repertoire?')) return

    try {
      const res = await fetch(`/api/repertoire/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Repertoire deleted')
      fetchData()
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  const resetForm = () => {
    setSelectedRepertoire(null)
    setFormData({
      eventId: events[0]?.id || '',
      title: '',
      composer: '',
      duration: '',
      arrangement: '',
      notes: '',
    })
  }

  const columns = [
    {
      key: 'title',
      header: 'Composition',
      render: (item: Repertoire) => (
        <div>
          <p className="font-medium text-slate-900">{item.title}</p>
          {item.composer && <p className="text-sm text-slate-500">{item.composer}</p>}
        </div>
      ),
    },
    {
      key: 'event',
      header: 'Event',
      render: (item: Repertoire) => (
        <div>
          <p className="text-slate-900">{item.event.title}</p>
          <p className="text-xs text-slate-500">{formatDate(item.event.startTime)}</p>
        </div>
      ),
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (item: Repertoire) =>
        item.duration ? (
          <div className="flex items-center gap-1 text-slate-600">
            <Clock className="w-4 h-4" />
            {item.duration} min
          </div>
        ) : (
          <span className="text-slate-400">-</span>
        ),
    },
    {
      key: 'arrangement',
      header: 'Arrangement',
      render: (item: Repertoire) =>
        item.arrangement ? <Badge variant="info">{item.arrangement}</Badge> : <span className="text-slate-400">-</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-32',
      render: (item: Repertoire) => (
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
            <h1 className="text-2xl font-bold text-slate-900">Repertoire</h1>
            <p className="text-slate-500 mt-1">Manage event setlists and compositions</p>
          </div>
          <Button onClick={() => { resetForm(); setModalOpen(true) }}>
            <Plus className="w-4 h-4" />
            Add to Repertoire
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <Select
              value={filter.eventId}
              onChange={(e) => setFilter({ ...filter, eventId: e.target.value })}
              className="w-64"
            >
              <option value="">All Events</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </Select>
          </CardContent>
        </Card>

        <DataTable
          data={repertoire}
          columns={columns}
          keyExtractor={(item) => item.id}
          loading={loading}
          emptyMessage="No repertoire items found"
        />

        <Modal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); resetForm() }}
          title={selectedRepertoire ? 'Edit Repertoire' : 'Add Repertoire'}
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

            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Symphony No. 5"
              required
            />

            <Input
              label="Composer"
              value={formData.composer}
              onChange={(e) => setFormData({ ...formData, composer: e.target.value })}
              placeholder="Ludwig van Beethoven"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Duration (minutes)"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="30"
              />
              <Input
                label="Arrangement"
                value={formData.arrangement}
                onChange={(e) => setFormData({ ...formData, arrangement: e.target.value })}
                placeholder="Full Orchestra"
              />
            </div>

            <Textarea
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Performance notes..."
              rows={2}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => { setModalOpen(false); resetForm() }}>
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                {selectedRepertoire ? 'Update' : 'Add'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  )
}