import React, { useState, useEffect } from 'react'
import { Plus, Edit, Eye, UserCheck, Clock, AlertCircle } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { Badge } from '../../components/ui/Badge'
import { Textarea } from '../../components/ui/Textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs'
import DataTable from '../../components/shared/DataTable'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { instructorAPI } from '../../services/api'

function TraineesList() {
  const [trainees, setTrainees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedTrainee, setSelectedTrainee] = useState(null)
  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    email: '',
    phone: '',
    institution: '',
    department: '',
    year_of_study: '',
    
    // Guardian Information
    guardian_name: '',
    guardian_phone: '',
    guardian_address: '',
    
    // Reference Information
    reference_name: '',
    reference_phone: '',
    reference_address: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    fetchTrainees()
  }, [])

  const fetchTrainees = async () => {
    setLoading(true)
    try {
      const response = await instructorAPI.getTrainees()
      setTrainees(response.data)
    } catch (error) {
      console.error('Failed to fetch trainees:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTrainee = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await instructorAPI.createTrainee(formData)
      setShowCreateModal(false)
      resetForm()
      fetchTrainees()
    } catch (error) {
      console.error('Failed to create trainee:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditTrainee = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await instructorAPI.updateTrainee(selectedTrainee.id, formData)
      setShowEditModal(false)
      setSelectedTrainee(null)
      resetForm()
      fetchTrainees()
    } catch (error) {
      console.error('Failed to update trainee:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      institution: '',
      department: '',
      year_of_study: '',
      guardian_name: '',
      guardian_phone: '',
      guardian_address: '',
      reference_name: '',
      reference_phone: '',
      reference_address: ''
    })
  }

  const openEditModal = (trainee) => {
    setSelectedTrainee(trainee)
    setFormData({
      name: trainee.name,
      email: trainee.email,
      phone: trainee.phone,
      institution: trainee.institution,
      department: trainee.department,
      year_of_study: trainee.year_of_study,
      guardian_name: trainee.guardian_name,
      guardian_phone: trainee.guardian_phone,
      guardian_address: trainee.guardian_address,
      reference_name: trainee.reference_name,
      reference_phone: trainee.reference_phone,
      reference_address: trainee.reference_address
    })
    setShowEditModal(true)
  }

  const openDetailsModal = (trainee) => {
    setSelectedTrainee(trainee)
    setShowDetailsModal(true)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'approved':
        return 'success'
      case 'rejected':
        return 'destructive'
      case 'active':
        return 'default'
      case 'completed':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'approved':
      case 'active':
        return <UserCheck className="h-4 w-4" />
      case 'rejected':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const filteredTrainees = trainees.filter(trainee => {
    if (activeTab === 'all') return true
    return trainee.status === activeTab
  })

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (trainee) => (
        <div className="font-medium">{trainee.name}</div>
      )
    },
    {
      key: 'institution',
      label: 'Institution',
      render: (trainee) => (
        <div className="text-muted-foreground">{trainee.institution}</div>
      )
    },
    {
      key: 'department',
      label: 'Department',
      render: (trainee) => (
        <div>{trainee.department}</div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (trainee) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(trainee.status)}
          <Badge variant={getStatusColor(trainee.status)}>
            {trainee.status}
          </Badge>
        </div>
      )
    },
    {
      key: 'projects_count',
      label: 'Projects',
      render: (trainee) => (
        <div className="text-center">{trainee.projects_count || 0}</div>
      )
    },
    {
      key: 'created_at',
      label: 'Joined',
      render: (trainee) => (
        <div className="text-sm text-muted-foreground">
          {new Date(trainee.created_at).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (trainee) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              openDetailsModal(trainee)
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {trainee.status === 'approved' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                openEditModal(trainee)
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    }
  ]

  const pendingCount = trainees.filter(t => t.status === 'pending').length
  const approvedCount = trainees.filter(t => t.status === 'approved' || t.status === 'active').length
  const completedCount = trainees.filter(t => t.status === 'completed').length

  if (loading) {
    return <LoadingSpinner />
  }

  const TraineeForm = ({ onSubmit }) => (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Personal Information */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="institution">Institution *</Label>
            <Input
              id="institution"
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department *</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="year_of_study">Year of Study</Label>
            <Input
              id="year_of_study"
              value={formData.year_of_study}
              onChange={(e) => setFormData({ ...formData, year_of_study: e.target.value })}
              placeholder="e.g., 3rd Year, Final Year"
            />
          </div>
        </div>
      </div>

      {/* Guardian Information */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Guardian Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="guardian_name">Guardian Name *</Label>
            <Input
              id="guardian_name"
              value={formData.guardian_name}
              onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guardian_phone">Guardian Phone *</Label>
            <Input
              id="guardian_phone"
              value={formData.guardian_phone}
              onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="guardian_address">Guardian Address *</Label>
            <Textarea
              id="guardian_address"
              value={formData.guardian_address}
              onChange={(e) => setFormData({ ...formData, guardian_address: e.target.value })}
              required
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Reference Information */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Reference Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reference_name">Reference Name *</Label>
            <Input
              id="reference_name"
              value={formData.reference_name}
              onChange={(e) => setFormData({ ...formData, reference_name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reference_phone">Reference Phone *</Label>
            <Input
              id="reference_phone"
              value={formData.reference_phone}
              onChange={(e) => setFormData({ ...formData, reference_phone: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="reference_address">Reference Address *</Label>
            <Textarea
              id="reference_address"
              value={formData.reference_address}
              onChange={(e) => setFormData({ ...formData, reference_address: e.target.value })}
              required
              rows={3}
            />
          </div>
        </div>
      </div>
    </form>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trainees Management</h1>
          <p className="text-muted-foreground">
            Manage your assigned trainees and their progress.
          </p>
        </div>
        
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Trainee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Trainee</DialogTitle>
              <DialogDescription>
                Create a new trainee record. This will be sent to admin for approval.
              </DialogDescription>
            </DialogHeader>
            <TraineeForm onSubmit={handleCreateTrainee} />
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
                onClick={handleCreateTrainee}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit for Approval'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting admin approval
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trainees</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{completedCount}</div>
            <p className="text-xs text-muted-foreground">
              Training completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trainees Table with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>My Trainees</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All ({trainees.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedCount})</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-6">
              <DataTable
                data={filteredTrainees}
                columns={columns}
                searchPlaceholder="Search trainees by name, institution, or department..."
                emptyMessage={`No ${activeTab === 'all' ? '' : activeTab} trainees found.`}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Trainee</DialogTitle>
            <DialogDescription>
              Update trainee information.
            </DialogDescription>
          </DialogHeader>
          <TraineeForm onSubmit={handleEditTrainee} />
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
              onClick={handleEditTrainee}
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update Trainee'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Trainee Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedTrainee?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedTrainee && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                    <p className="mt-1">{selectedTrainee.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="mt-1">{selectedTrainee.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                    <p className="mt-1">{selectedTrainee.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Institution</Label>
                    <p className="mt-1">{selectedTrainee.institution}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                    <p className="mt-1">{selectedTrainee.department}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Year of Study</Label>
                    <p className="mt-1">{selectedTrainee.year_of_study || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Status and Progress */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Training Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Current Status</Label>
                    <p className="mt-1">
                      <Badge variant={getStatusColor(selectedTrainee.status)}>
                        {selectedTrainee.status}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Projects Count</Label>
                    <p className="mt-1">{selectedTrainee.projects_count || 0}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Joined Date</Label>
                    <p className="mt-1">{new Date(selectedTrainee.created_at).toLocaleDateString()}</p>
                  </div>
                  {selectedTrainee.approved_at && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Approved Date</Label>
                      <p className="mt-1">{new Date(selectedTrainee.approved_at).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Guardian Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Guardian Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Guardian Name</Label>
                    <p className="mt-1">{selectedTrainee.guardian_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Guardian Phone</Label>
                    <p className="mt-1">{selectedTrainee.guardian_phone}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-muted-foreground">Guardian Address</Label>
                    <p className="mt-1">{selectedTrainee.guardian_address}</p>
                  </div>
                </div>
              </div>

              {/* Reference Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Reference Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Reference Name</Label>
                    <p className="mt-1">{selectedTrainee.reference_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Reference Phone</Label>
                    <p className="mt-1">{selectedTrainee.reference_phone}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-muted-foreground">Reference Address</Label>
                    <p className="mt-1">{selectedTrainee.reference_address}</p>
                  </div>
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
            {selectedTrainee?.status === 'approved' && (
              <Button
                type="button"
                onClick={() => {
                  setShowDetailsModal(false)
                  openEditModal(selectedTrainee)
                }}
              >
                Edit Trainee
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TraineesList
