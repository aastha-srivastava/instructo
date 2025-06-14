import React, { useState, useEffect } from 'react'
import { Check, X, Eye, Clock, UserCheck, AlertCircle } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/Dialog'
import { Badge } from '../../components/ui/Badge'
import { Label } from '../../components/ui/Label'
import { Textarea } from '../../components/ui/Textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs'
import DataTable from '../../components/shared/DataTable'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { adminAPI } from '../../services/api'

function TraineeApproval() {
  const [trainees, setTrainees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [selectedTrainee, setSelectedTrainee] = useState(null)
  const [approvalAction, setApprovalAction] = useState('approved') // 'approved' or 'rejected'
  const [comments, setComments] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('pending')

  useEffect(() => {
    fetchPendingTrainees()
  }, [])

  const fetchPendingTrainees = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getPendingTrainees()
      setTrainees(response.data)
    } catch (error) {
      console.error('Failed to fetch pending trainees:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async () => {
    setSubmitting(true)
    try {
      await adminAPI.approveTrainee(selectedTrainee.id, approvalAction, comments)
      setShowApprovalModal(false)
      setSelectedTrainee(null)
      setComments('')
      fetchPendingTrainees()
    } catch (error) {
      console.error('Failed to process approval:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const openDetailsModal = (trainee) => {
    setSelectedTrainee(trainee)
    setShowDetailsModal(true)
  }

  const openApprovalModal = (trainee, action) => {
    setSelectedTrainee(trainee)
    setApprovalAction(action)
    setShowApprovalModal(true)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'approved':
        return 'success'
      case 'rejected':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const filteredTrainees = trainees.filter(trainee => {
    if (activeTab === 'all') return true
    return trainee.status === activeTab
  })

  const columns = [
    {
      key: 'name',
      label: 'Trainee Name',
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
      key: 'instructor_name',
      label: 'Instructor',
      render: (trainee) => (
        <div>{trainee.instructor_name}</div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (trainee) => (
        <Badge variant={getStatusColor(trainee.status)}>
          {trainee.status}
        </Badge>
      )
    },
    {
      key: 'created_at',
      label: 'Submitted',
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
          {trainee.status === 'pending' && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="text-green-600 hover:text-green-700"
                onClick={(e) => {
                  e.stopPropagation()
                  openApprovalModal(trainee, 'approved')
                }}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation()
                  openApprovalModal(trainee, 'rejected')
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      )
    }
  ]

  const pendingCount = trainees.filter(t => t.status === 'pending').length
  const approvedCount = trainees.filter(t => t.status === 'approved').length
  const rejectedCount = trainees.filter(t => t.status === 'rejected').length

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trainee Approvals</h1>
        <p className="text-muted-foreground">
          Review and approve trainee applications submitted by instructors.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trainees Table with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Trainee Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({trainees.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-6">
              <DataTable
                data={filteredTrainees}
                columns={columns}
                searchPlaceholder="Search trainees by name, institution, or instructor..."
                emptyMessage={`No ${activeTab === 'all' ? '' : activeTab} trainees found.`}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Trainee Details</DialogTitle>
            <DialogDescription>
              Complete information for trainee application
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
                    <p className="mt-1">{selectedTrainee.year_of_study}</p>
                  </div>
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

              {/* Training Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Training Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Assigned Instructor</Label>
                    <p className="mt-1">{selectedTrainee.instructor_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <p className="mt-1">
                      <Badge variant={getStatusColor(selectedTrainee.status)}>
                        {selectedTrainee.status}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Application Date</Label>
                    <p className="mt-1">{new Date(selectedTrainee.created_at).toLocaleDateString()}</p>
                  </div>
                  {selectedTrainee.approved_at && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Approved Date</Label>
                      <p className="mt-1">{new Date(selectedTrainee.approved_at).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
                {selectedTrainee.admin_comments && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium text-muted-foreground">Admin Comments</Label>
                    <p className="mt-1 p-3 bg-muted rounded-md">{selectedTrainee.admin_comments}</p>
                  </div>
                )}
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
            {selectedTrainee?.status === 'pending' && (
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    setShowDetailsModal(false)
                    openApprovalModal(selectedTrainee, 'rejected')
                  }}
                >
                  Reject
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowDetailsModal(false)
                    openApprovalModal(selectedTrainee, 'approved')
                  }}
                >
                  Approve
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Modal */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approved' ? 'Approve' : 'Reject'} Trainee
            </DialogTitle>
            <DialogDescription>
              {approvalAction === 'approved' 
                ? `Are you sure you want to approve ${selectedTrainee?.name}?`
                : `Are you sure you want to reject ${selectedTrainee?.name}?`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="comments">Comments (Optional)</Label>
              <Textarea
                id="comments"
                placeholder={
                  approvalAction === 'approved' 
                    ? "Add any notes about the approval..."
                    : "Please provide a reason for rejection..."
                }
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowApprovalModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={approvalAction === 'approved' ? 'default' : 'destructive'}
              onClick={handleApproval}
              disabled={submitting}
            >
              {submitting 
                ? (approvalAction === 'approved' ? 'Approving...' : 'Rejecting...')
                : (approvalAction === 'approved' ? 'Approve' : 'Reject')
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TraineeApproval
