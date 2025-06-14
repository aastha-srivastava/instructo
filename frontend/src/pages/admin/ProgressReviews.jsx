import React, { useState, useEffect } from 'react'
import { Eye, CheckCircle, Clock, FileText, User } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/Dialog'
import { Badge } from '../../components/ui/Badge'
import { Label } from '../../components/ui/Label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs'
import DataTable from '../../components/shared/DataTable'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { adminAPI } from '../../services/api'

function ProgressReviews() {
  const [progressReviews, setProgressReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedReview, setSelectedReview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('pending')

  useEffect(() => {
    fetchProgressReviews()
  }, [])

  const fetchProgressReviews = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getProgressReviews()
      setProgressReviews(response.data)
    } catch (error) {
      console.error('Failed to fetch progress reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkReviewed = async (reviewId) => {
    setSubmitting(true)
    try {
      await adminAPI.markProgressReviewed(reviewId)
      setShowDetailsModal(false)
      setSelectedReview(null)
      fetchProgressReviews()
    } catch (error) {
      console.error('Failed to mark progress as reviewed:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const openDetailsModal = (review) => {
    setSelectedReview(review)
    setShowDetailsModal(true)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'reviewed':
        return 'success'
      case 'in_review':
        return 'default'
      default:
        return 'secondary'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'reviewed':
        return <CheckCircle className="h-4 w-4" />
      case 'in_review':
        return <FileText className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const filteredReviews = progressReviews.filter(review => {
    if (activeTab === 'all') return true
    return review.status === activeTab
  })

  const columns = [
    {
      key: 'trainee_name',
      label: 'Trainee',
      render: (review) => (
        <div className="font-medium">{review.trainee_name}</div>
      )
    },
    {
      key: 'instructor_name',
      label: 'Instructor',
      render: (review) => (
        <div className="text-muted-foreground">{review.instructor_name}</div>
      )
    },
    {
      key: 'project_title',
      label: 'Project',
      render: (review) => (
        <div>{review.project_title}</div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (review) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(review.status)}
          <Badge variant={getStatusColor(review.status)}>
            {review.status.replace('_', ' ')}
          </Badge>
        </div>
      )
    },
    {
      key: 'shared_at',
      label: 'Shared Date',
      render: (review) => (
        <div className="text-sm text-muted-foreground">
          {new Date(review.shared_at).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'reviewed_at',
      label: 'Reviewed Date',
      render: (review) => (
        <div className="text-sm text-muted-foreground">
          {review.reviewed_at 
            ? new Date(review.reviewed_at).toLocaleDateString() 
            : 'Not reviewed'
          }
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (review) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              openDetailsModal(review)
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {review.status === 'pending' && (
            <Button
              variant="ghost"
              size="icon"
              className="text-green-600 hover:text-green-700"
              onClick={(e) => {
                e.stopPropagation()
                handleMarkReviewed(review.id)
              }}
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    }
  ]

  const pendingCount = progressReviews.filter(r => r.status === 'pending').length
  const reviewedCount = progressReviews.filter(r => r.status === 'reviewed').length
  const inReviewCount = progressReviews.filter(r => r.status === 'in_review').length

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Progress Reviews</h1>
        <p className="text-muted-foreground">
          Review trainee progress reports shared by instructors.
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
              Awaiting review
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Review</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inReviewCount}</div>
            <p className="text-xs text-muted-foreground">
              Currently reviewing
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{reviewedCount}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Reviews Table with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Review Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({progressReviews.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
              <TabsTrigger value="in_review">In Review ({inReviewCount})</TabsTrigger>
              <TabsTrigger value="reviewed">Completed ({reviewedCount})</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-6">
              <DataTable
                data={filteredReviews}
                columns={columns}
                searchPlaceholder="Search by trainee, instructor, or project..."
                emptyMessage={`No ${activeTab === 'all' ? '' : activeTab} progress reviews found.`}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Progress Review Details</DialogTitle>
            <DialogDescription>
              Complete progress report for review
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-6">
              {/* Header Information */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Trainee</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{selectedReview.trainee_name}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Project Title</Label>
                    <p className="mt-1 font-medium">{selectedReview.project_title}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Institution</Label>
                    <p className="mt-1">{selectedReview.trainee_institution}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Instructor</Label>
                    <p className="mt-1 font-medium">{selectedReview.instructor_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(selectedReview.status)}
                      <Badge variant={getStatusColor(selectedReview.status)}>
                        {selectedReview.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Shared Date</Label>
                    <p className="mt-1">{new Date(selectedReview.shared_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Project Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Start Date</Label>
                    <p className="mt-1">{new Date(selectedReview.project_start_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Expected End Date</Label>
                    <p className="mt-1">
                      {selectedReview.project_end_date 
                        ? new Date(selectedReview.project_end_date).toLocaleDateString()
                        : 'Ongoing'
                      }
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Project Status</Label>
                    <p className="mt-1">
                      <Badge variant="outline">{selectedReview.project_status}</Badge>
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Performance Rating</Label>
                    <p className="mt-1">
                      {selectedReview.performance_rating 
                        ? `${selectedReview.performance_rating}/10`
                        : 'Not rated'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Description */}
              {selectedReview.progress_description && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Progress Description</h3>
                  <div className="p-4 bg-muted rounded-md">
                    <p className="whitespace-pre-wrap">{selectedReview.progress_description}</p>
                  </div>
                </div>
              )}

              {/* Achievements */}
              {selectedReview.achievements && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Key Achievements</h3>
                  <div className="p-4 bg-muted rounded-md">
                    <p className="whitespace-pre-wrap">{selectedReview.achievements}</p>
                  </div>
                </div>
              )}

              {/* Challenges */}
              {selectedReview.challenges && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Challenges Faced</h3>
                  <div className="p-4 bg-muted rounded-md">
                    <p className="whitespace-pre-wrap">{selectedReview.challenges}</p>
                  </div>
                </div>
              )}

              {/* Documents */}
              {selectedReview.documents && selectedReview.documents.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Supporting Documents</h3>
                  <div className="space-y-2">
                    {selectedReview.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{doc.name}</span>
                        </div>
                        <Button variant="outline" size="sm">
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Review Timeline */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Review Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="text-sm">
                      <span className="font-medium">Progress shared</span>
                      <span className="text-muted-foreground ml-2">
                        {new Date(selectedReview.shared_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {selectedReview.reviewed_at && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="text-sm">
                        <span className="font-medium">Review completed</span>
                        <span className="text-muted-foreground ml-2">
                          {new Date(selectedReview.reviewed_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
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
            {selectedReview?.status === 'pending' && (
              <Button
                type="button"
                onClick={() => handleMarkReviewed(selectedReview.id)}
                disabled={submitting}
              >
                {submitting ? 'Marking as Reviewed...' : 'Mark as Reviewed'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProgressReviews
