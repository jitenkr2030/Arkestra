'use client'

import { useEffect, useState } from 'react'
import AppLayout from '@/components/AppLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { DataTable } from '@/components/ui/DataTable'
import { Plus, Building2, Mail, Phone, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

interface Client {
  id: string
  company: string
  contactPerson: string
  phone: string
  address: string
  notes: string
  user: {
    id: string
    name: string
    email: string
  }
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    contactPerson: '',
    phone: '',
    address: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients')
      const data = await res.json()
      setClients(data)
    } catch (error) {
      console.error('Error fetching clients:', error)
      toast.error('Failed to fetch clients')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (selectedClient) {
        const res = await fetch(`/api/clients/${selectedClient.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        if (!res.ok) throw new Error('Failed to update client')
        toast.success('Client updated')
      } else {
        // Create user first
        const userRes = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: 'password123',
            role: 'CLIENT',
          }),
        })
        if (!userRes.ok) throw new Error('Failed to create user')
        const userData = await userRes.json()

        // Create client
        const clientRes = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userData.id,
            ...formData,
          }),
        })
        if (!clientRes.ok) throw new Error('Failed to create client')
        toast.success('Client added')
      }

      setModalOpen(false)
      resetForm()
      fetchClients()
    } catch (error) {
      toast.error('Failed to save client')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (client: Client) => {
    setSelectedClient(client)
    setFormData({
      name: client.user.name,
      email: client.user.email,
      company: client.company || '',
      contactPerson: client.contactPerson || '',
      phone: client.phone || '',
      address: client.address || '',
      notes: client.notes || '',
    })
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return

    try {
      const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete client')
      toast.success('Client deleted')
      fetchClients()
    } catch (error) {
      toast.error('Failed to delete client')
    }
  }

  const resetForm = () => {
    setSelectedClient(null)
    setFormData({
      name: '',
      email: '',
      company: '',
      contactPerson: '',
      phone: '',
      address: '',
      notes: '',
    })
  }

  const columns = [
    {
      key: 'company',
      header: 'Company',
      render: (item: Client) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <p className="font-medium text-slate-900">{item.company || 'N/A'}</p>
            {item.contactPerson && (
              <p className="text-sm text-slate-500">{item.contactPerson}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'user',
      header: 'Contact',
      render: (item: Client) => (
        <div>
          <p className="text-slate-900">{item.user.name}</p>
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
            <Mail className="w-3 h-3" />
            {item.user.email}
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (item: Client) =>
        item.phone ? (
          <div className="flex items-center gap-1 text-slate-600">
            <Phone className="w-4 h-4" />
            {item.phone}
          </div>
        ) : (
          <span className="text-slate-400">-</span>
        ),
    },
    {
      key: 'address',
      header: 'Address',
      render: (item: Client) =>
        item.address ? (
          <div className="flex items-center gap-1 text-slate-600 max-w-xs truncate">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            {item.address}
          </div>
        ) : (
          <span className="text-slate-400">-</span>
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-32',
      render: (item: Client) => (
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
            <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
            <p className="text-slate-500 mt-1">Manage client relationships and contacts</p>
          </div>
          <Button onClick={() => { resetForm(); setModalOpen(true) }}>
            <Plus className="w-4 h-4" />
            Add Client
          </Button>
        </div>

        <DataTable
          data={clients}
          columns={columns}
          keyExtractor={(item) => item.id}
          loading={loading}
          emptyMessage="No clients found"
        />

        <Modal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); resetForm() }}
          title={selectedClient ? 'Edit Client' : 'Add New Client'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {!selectedClient && (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Contact Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Smith"
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@company.com"
                  required
                />
              </div>
            )}

            <Input
              label="Company Name"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="Company Inc."
            />

            <Input
              label="Contact Person"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              placeholder="Contact person name"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
              <Input
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Business St"
              />
            </div>

            <Textarea
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this client..."
              rows={3}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => { setModalOpen(false); resetForm() }}>
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                {selectedClient ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  )
}