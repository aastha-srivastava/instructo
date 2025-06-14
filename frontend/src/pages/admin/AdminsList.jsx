import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { Badge } from '../../components/ui/Badge'
import DataTable from '../../components/shared/DataTable'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { adminAPI } from '../../services/api'

function AdminsList() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    title: '',
    department: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getAdmins()
      setAdmins(response.data)
    } catch (error) {
      console.error('Failed to fetch admins:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAdmin = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await adminAPI.createAdmin(formData)
      setShowCreateModal(false)
      setFormData({ name: '', email: '', phone: '', title: '', department: '' })
      fetchAdmins()
    } catch (error) {
      console.error('Failed to create admin:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditAdmin = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await adminAPI.updateAdmin(selectedAdmin.id, formData)
      setShowEditModal(false)
      setSelectedAdmin(null)
      setFormData({ name: '', email: '', phone: '', title: '', department: '' })
      fetchAdmins()
    } catch (error) {
      console.error('Failed to update admin:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteAdmin = async () => {
    setSubmitting(true)
    try {
      await adminAPI.deleteAdmin(selectedAdmin.id)
      setShowDeleteModal(false)
      setSelectedAdmin(null)
      fetchAdmins()
    } catch (error) {
      console.error('Failed to delete admin:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const openEditModal = (admin) => {
    setSelectedAdmin(admin)
    setFormData({
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      title: admin.title,
      department: admin.department
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (admin) => {
    setSelectedAdmin(admin)
    setShowDeleteModal(true)
  }

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (admin) => (
        <div className="font-medium">{admin.name}</div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      render: (admin) => (
        <div className="text-muted-foreground">{admin.email}</div>
      )
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (admin) => (
        <div>{admin.phone || 'N/A'}</div>
      )
    },
    {
      key: 'title',
      label: 'Title',
      render: (admin) => (
        <Badge variant="secondary">{admin.title}</Badge>
      )
    },
    {
      key: 'department',
      label: 'Department',
      render: (admin) => (
        <div>{admin.department}</div>
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (admin) => (
        <div className="text-sm text-muted-foreground">
          {new Date(admin.created_at).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (admin) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              openEditModal(admin)
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              openDeleteModal(admin)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  if (loading) {
    return <LoadingSpinner />
  }

  const AdminForm = ({ onSubmit, title, description }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">Job Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Input
          id="department"
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          required
        />
      </div>
    </form>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admins Management</h1>
          <p className="text-muted-foreground">
            Manage system administrators and their permissions.
          </p>
        </div>
        
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Admin</DialogTitle>
              <DialogDescription>
                Add a new administrator to the system.
              </DialogDescription>
            </DialogHeader>
            <AdminForm onSubmit={handleCreateAdmin} />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleCreateAdmin}
                disabled={submitting}
              >
                {submitting ? 'Creating...' : 'Create Admin'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Admins Table */}
      <Card>
        <CardHeader>
          <CardTitle>System Administrators ({admins.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={admins}
            columns={columns}
            searchPlaceholder="Search admins by name, email, or department..."
            emptyMessage="No administrators found."
          />
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Admin</DialogTitle>
            <DialogDescription>
              Update administrator information.
            </DialogDescription>
          </DialogHeader>
          <AdminForm onSubmit={handleEditAdmin} />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleEditAdmin}
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update Admin'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Admin</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedAdmin?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteAdmin}
              disabled={submitting}
            >
              {submitting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminsList
