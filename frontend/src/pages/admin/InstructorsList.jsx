import React, { useState, useEffect } from 'react'
import { Plus, Edit, Eye, Users } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { Badge } from '../../components/ui/Badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select'
import DataTable from '../../components/shared/DataTable'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { adminAPI } from '../../services/api'

function InstructorsList() {
  const [instructors, setInstructors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedInstructor, setSelectedInstructor] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    role: '',
    specialization: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const departments = [
    'Training and Development',
    'Human Resources',
    'Technical Training',
    'Safety Training',
    'Operations Training',
    'Management Development'
  ]

  const roles = [
    'Senior Instructor',
    'Lead Trainer',
    'Training Coordinator',
    'Subject Matter Expert',
    'Training Specialist'
  ]

  useEffect(() => {
    fetchInstructors()
  }, [])

  const fetchInstructors = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getInstructors()
      setInstructors(response.data)
    } catch (error) {
      console.error('Failed to fetch instructors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateInstructor = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await adminAPI.createInstructor(formData)
      setShowCreateModal(false)
      resetForm()
      fetchInstructors()
    } catch (error) {
      console.error('Failed to create instructor:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditInstructor = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await adminAPI.updateInstructor(selectedInstructor.id, formData)
      setShowEditModal(false)
      setSelectedInstructor(null)
      resetForm()
      fetchInstructors()
    } catch (error) {
      console.error('Failed to update instructor:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      department: '',
      role: '',
      specialization: ''
    })
  }

  const openEditModal = (instructor) => {
    setSelectedInstructor(instructor)
    setFormData({
      name: instructor.name,
      email: instructor.email,
      phone: instructor.phone,
      department: instructor.department,
      role: instructor.role,
      specialization: instructor.specialization
    })
    setShowEditModal(true)
  }

  const openDetailsModal = (instructor) => {
    setSelectedInstructor(instructor)
    setShowDetailsModal(true)
  }

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (instructor) => (
        <div className="font-medium">{instructor.name}</div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      render: (instructor) => (
        <div className="text-muted-foreground">{instructor.email}</div>
      )
    },
    {
      key: 'department',
      label: 'Department',
      render: (instructor) => (
        <Badge variant="outline">{instructor.department}</Badge>
      )
    },
    {
      key: 'role',
      label: 'Role',
      render: (instructor) => (
        <Badge variant="secondary">{instructor.role}</Badge>
      )
    },
    {
      key: 'trainees_count',
      label: 'Trainees',
      render: (instructor) => (
        <div className="flex items-center space-x-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{instructor.trainees_count || 0}</span>
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'Joined',
      render: (instructor) => (
        <div className="text-sm text-muted-foreground">
          {new Date(instructor.created_at).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (instructor) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              openDetailsModal(instructor)
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              openEditModal(instructor)
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  const filterOptions = [
    {
      value: 'training_development',
      label: 'Training & Development',
      filter: (instructor) => instructor.department === 'Training and Development'
    },
    {
      value: 'hr',
      label: 'Human Resources',
      filter: (instructor) => instructor.department === 'Human Resources'
    },
    {
      value: 'technical',
      label: 'Technical Training',
      filter: (instructor) => instructor.department === 'Technical Training'
    }
  ]

  if (loading) {
    return <LoadingSpinner />
  }

  const InstructorForm = ({ onSubmit }) => (
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
          <Label htmlFor="department">Department</Label>
          <Select
            value={formData.department}
            onValueChange={(value) => setFormData({ ...formData, department: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select
            value={formData.role}
            onValueChange={(value) => setFormData({ ...formData, role: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="specialization">Specialization</Label>
          <Input
            id="specialization"
            value={formData.specialization}
            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
            placeholder="e.g., Safety Protocols, Technical Systems"
          />
        </div>
      </div>
    </form>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Instructors Management</h1>
          <p className="text-muted-foreground">
            Manage training instructors and their assignments.
          </p>
        </div>
        
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Instructor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Instructor</DialogTitle>
              <DialogDescription>
                Add a new instructor to the training system.
              </DialogDescription>
            </DialogHeader>
            <InstructorForm onSubmit={handleCreateInstructor} />
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
                onClick={handleCreateInstructor}
                disabled={submitting}
              >
                {submitting ? 'Creating...' : 'Create Instructor'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Instructors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Training Instructors ({instructors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={instructors}
            columns={columns}
            searchPlaceholder="Search instructors by name, email, or department..."
            filterable={true}
            filterOptions={filterOptions}
            emptyMessage="No instructors found."
          />
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Instructor</DialogTitle>
            <DialogDescription>
              Update instructor information.
            </DialogDescription>
          </DialogHeader>
          <InstructorForm onSubmit={handleEditInstructor} />
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
              onClick={handleEditInstructor}
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update Instructor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Instructor Details</DialogTitle>
            <DialogDescription>
              Complete profile information for {selectedInstructor?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedInstructor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                  <p className="mt-1">{selectedInstructor.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="mt-1">{selectedInstructor.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                  <p className="mt-1">{selectedInstructor.phone || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                  <p className="mt-1">
                    <Badge variant="outline">{selectedInstructor.department}</Badge>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                  <p className="mt-1">
                    <Badge variant="secondary">{selectedInstructor.role}</Badge>
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Specialization</Label>
                  <p className="mt-1">{selectedInstructor.specialization || 'N/A'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Assigned Trainees</Label>
                  <p className="mt-1">{selectedInstructor.trainees_count || 0}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Joined Date</Label>
                  <p className="mt-1">{new Date(selectedInstructor.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDetailsModal(false)}
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowDetailsModal(false)
                openEditModal(selectedInstructor)
              }}
            >
              Edit Instructor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default InstructorsList
