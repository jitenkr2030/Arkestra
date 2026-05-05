'use client'

import { useEffect, useState } from 'react'
import AppLayout from '@/components/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { Plus, Calendar, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface Member {
  id: string
  user: { name: string }
  instrument: string
}

interface Availability {
  id: string
  date: string
  status: string
  reason: string
  member: Member
}

interface AvailabilityFormData {
  memberId: string
  date: string
  status: string
  reason: string
}

export default function AvailabilityPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [availability, setAvailability] = useState<Availability[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [filter, setFilter] = useState({ memberId: '', status: '' })
  const [formData, setFormData] = useState<AvailabilityFormData>({
    memberId: '',
    date: '',
    status: 'AVAILABLE',
    reason: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [filter])

  const fetchData = async () => {
    try {
      const params = new URLSearchParams()
      if (filter.memberId) params.append('memberId', filter.memberId)
      if (filter.status) params.append('status', filter.status)

      const [membersRes, availabilityRes] = await Promise.all([
        fetch('/api/members'),
        fetch(`/api/availability?${params.toString()}`),
      ])

      const [membersData, availabilityData] = await Promise.all([
        membersRes.json(),
        availabilityRes.json(),
      ])

      setMembers(membersData)
      setAvailability(availabilityData)

      if (membersData.length > 0 && !formData.memberId) {
        setFormData((prev) => ({ ...prev, memberId: membersData[0].id }))
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
      const res = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Failed to save availability')

      toast.success('Availability updated')
      setModalOpen(false)
      resetForm()
      fetchData()
    } catch (error) {
      toast.error('Failed to save availability')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this availability entry?')) return

    try {
      const res = await fetch(`/api/availability/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Availability deleted')
      fetchData()
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  const resetForm = () => {
    setFormData({
      memberId: members[0]?.id || '',
      date: '',
      status: 'AVAILABLE',
      reason: '',
    })
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'success'
      case 'UNAVAILABLE':
        return 'danger'
      case 'TENTATIVE':
        return 'warning'
      default:
        return 'default'
    }
  }

  const columns = [
    {
      key: 'member',
      header: 'Member',
      render: (item: Availability) => (
        <div>
          <p className="font-medium text-slate-900">{item.member.user.name}</p>
          <p className="text-xs text-slate-500">{item.member.instrument}</p>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (item: Availability) => (
        <span className="text-slate-900">{formatDate(item.date)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Availability) => (
        <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (item: Availability) => (
        <span className="text-slate-600">{item.reason || '-'}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-24',
      render: (item: Availability) => (
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
            <h1 className="text-2xl font-bold text-slate-900">Member Availability</h1>
            <p className="text-slate-500 mt-1">Track and manage member availability schedules</p>
          </div>
          <Button onClick={() => { resetForm(); setModalOpen(true) }}>
            <Plus className="w-4 h-4" />
            Set Availability
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <Select
                value={filter.memberId}
                onChange={(e) => setFilter({ ...filter, memberId: e.target.value })}
                className="w-48"
              >
                <option value="">All Members</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.user.name}
                  </option>
                ))}
              </Select>
              <Select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                className="w-40"
              >
                <option value="">All Status</option>
                <option value="AVAILABLE">Available</option>
                <option value="UNAVAILABLE">Unavailable</option>
                <option value="TENTATIVE">Tentative</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="flex gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-sm text-slate-600">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-slate-600">Unavailable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-sm text-slate-600">Tentative</span>
          </div>
        </div>

        <DataTable
          data={availability}
          columns={columns}
          keyExtractor={(item) => item.id}
          loading={loading}
          emptyMessage="No availability records found"
        />

        <Modal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); resetForm() }}
          title="Set Availability"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />

            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="AVAILABLE">Available</option>
              <option value="UNAVAILABLE">Unavailable</option>
              <option value="TENTATIVE">Tentative</option>
            </Select>

            <Input
              label="Reason (Optional)"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Reason for availability status"
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => { setModalOpen(false); resetForm() }}>
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                Save
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  )
}

// Import DataTable and Modal
import { DataTable } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'