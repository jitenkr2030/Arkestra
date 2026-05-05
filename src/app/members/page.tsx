'use client'

import { useEffect, useState } from 'react'
import AppLayout from '@/components/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { DataTable } from '@/components/ui/DataTable'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Users, Mail, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import bcrypt from 'bcryptjs'

interface Member {
  id: string
  instrument: string
  position: string
  hourlyRate: number
  bio: string
  emergencyContact: string
  emergencyPhone: string
  user: {
    id: string
    name: string
    email: string
  }
  _count: { bookings: number }
}

interface UserFormData {
  name: string
  email: string
  password: string
  instrument: string
  position: string
  hourlyRate: string
  bio: string
  emergencyContact: string
  emergencyPhone: string
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    instrument: '',
    position: '',
    hourlyRate: '',
    bio: '',
    emergencyContact: '',
    emergencyPhone: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/members')
      const data = await res.json()
      setMembers(data)
    } catch (error) {
      console.error('Error fetching members:', error)
      toast.error('Failed to fetch members')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (selectedMember) {
        // Update member
        const res = await fetch(`/api/members/${selectedMember.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instrument: formData.instrument,
            position: formData.position,
            hourlyRate: parseFloat(formData.hourlyRate) || 0,
            bio: formData.bio,
            emergencyContact: formData.emergencyContact,
            emergencyPhone: formData.emergencyPhone,
          }),
        })

        if (!res.ok) throw new Error('Failed to update member')
        toast.success('Member updated')
      } else {
        // Create user first
        const hashedPassword = await bcrypt.hash(formData.password, 10)
        const userRes = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: hashedPassword,
            role: 'MEMBER',
          }),
        })

        if (!userRes.ok) throw new Error('Failed to create user')
        const userData = await userRes.json()

        // Create member
        const memberRes = await fetch('/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userData.id,
            instrument: formData.instrument,
            position: formData.position,
            hourlyRate: parseFloat(formData.hourlyRate) || 0,
            bio: formData.bio,
            emergencyContact: formData.emergencyContact,
            emergencyPhone: formData.emergencyPhone,
          }),
        })

        if (!memberRes.ok) throw new Error('Failed to create member')
        toast.success('Member created')
      }

      setModalOpen(false)
      resetForm()
      fetchMembers()
    } catch (error) {
      toast.error('Failed to save member')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (member: Member) => {
    setSelectedMember(member)
    setFormData({
      name: member.user.name,
      email: member.user.email,
      password: '',
      instrument: member.instrument,
      position: member.position || '',
      hourlyRate: member.hourlyRate.toString(),
      bio: member.bio || '',
      emergencyContact: member.emergencyContact || '',
      emergencyPhone: member.emergencyPhone || '',
    })
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return

    try {
      const res = await fetch(`/api/members/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete member')
      toast.success('Member deleted')
      fetchMembers()
    } catch (error) {
      toast.error('Failed to delete member')
    }
  }

  const resetForm = () => {
    setSelectedMember(null)
    setFormData({
      name: '',
      email: '',
      password: '',
      instrument: '',
      position: '',
      hourlyRate: '',
      bio: '',
      emergencyContact: '',
      emergencyPhone: '',
    })
  }

  const columns = [
    {
      key: 'user',
      header: 'Member',
      render: (item: Member) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-600 font-semibold">
              {item.user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-slate-900">{item.user.name}</p>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {item.user.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'instrument',
      header: 'Instrument',
      render: (item: Member) => (
        <div>
          <Badge variant="info">{item.instrument}</Badge>
          {item.position && (
            <p className="text-xs text-slate-500 mt-1">{item.position}</p>
          )}
        </div>
      ),
    },
    {
      key: 'hourlyRate',
      header: 'Hourly Rate',
      render: (item: Member) => (
        <span className="text-slate-900">{formatCurrency(item.hourlyRate)}</span>
      ),
    },
    {
      key: '_count',
      header: 'Bookings',
      render: (item: Member) => (
        <span className="text-slate-600">{item._count.bookings}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-32',
      render: (item: Member) => (
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
            <h1 className="text-2xl font-bold text-slate-900">Members</h1>
            <p className="text-slate-500 mt-1">Manage orchestra members and their profiles</p>
          </div>
          <Button onClick={() => { resetForm(); setModalOpen(true) }}>
            <Plus className="w-4 h-4" />
            Add Member
          </Button>
        </div>

        <DataTable
          data={members}
          columns={columns}
          keyExtractor={(item) => item.id}
          loading={loading}
          emptyMessage="No members found"
        />

        {/* Create/Edit Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); resetForm() }}
          title={selectedMember ? 'Edit Member' : 'Add New Member'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {!selectedMember && (
              <>
                <Input
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password"
                  required={!selectedMember}
                  helperText="Minimum 6 characters"
                />
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Instrument"
                value={formData.instrument}
                onChange={(e) => setFormData({ ...formData, instrument: e.target.value })}
                placeholder="Violin"
                required
              />
              <Input
                label="Position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="First Violinist"
              />
            </div>

            <Input
              label="Hourly Rate"
              type="number"
              step="0.01"
              value={formData.hourlyRate}
              onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
              placeholder="75.00"
            />

            <Textarea
              label="Bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Member biography..."
              rows={3}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Emergency Contact"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                placeholder="Jane Doe"
              />
              <Input
                label="Emergency Phone"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => { setModalOpen(false); resetForm() }}>
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                {selectedMember ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  )
}