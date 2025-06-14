import React, { useState, useEffect } from 'react'
import { Plus, Edit, Eye, CheckCircle, Clock, Star, Upload, FileText } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { Badge } from '../../components/ui/Badge'
import { Textarea } from '../../components/ui/Textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs'
import DataTable from '../../components/shared/DataTable'
import FileUpload from '../../components/shared/FileUpload'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { instructorAPI } from '../../services/api'

function ProjectsList() {
  const [projects, setProjects] = useState([])
  const [trainees, setTrainees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    trainee_id: '',
    expected_duration: '',
    requirements: ''
  })
  const [completionData, setCompletionData] = useState({
    performance_rating: '',
    project_report: null,
    attendance_document: null
  })
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    fetchProjects()
    fetchTrainees()
  }, [])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const response = await instructorAPI.getProjects()
      setProjects(response.data)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTrainees = async () => {
    try {
      const response = await instructorAPI.getTrainees()
      // Only include approved trainees for project assignment
      setTrainees(response.data.filter(trainee => trainee.status === 'approved'))
    } catch (error) {
      console.error('Failed to fetch trainees:', error)
    }
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await instructorAPI.createProject(formData)
      setShowCreateModal(false)
      resetForm()
      fetchProjects()
    } catch (error) {
      console.error('Failed to create project:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditProject = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await instructorAPI.updateProject(selectedProject.id, formData)
      setShowEditModal(false)
      setSelectedProject(null)
      resetForm()
      fetchProjects()
    } catch (error) {
      console.error('Failed to update project:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCompleteProject = async () => {
    if (!completionData.performance_rating || !completionData.project_report || !completionData.attendance_document) {
      alert('All fields are required to complete the project')
      return
    }

    setSubmitting(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('performance_rating', completionData.performance_rating)
      formDataToSend.append('project_report', completionData.project_report)
      formDataToSend.append('attendance_document', completionData.attendance_document)

      await instructorAPI.completeProject(selectedProject.id, formDataToSend)
      setShowCompletionModal(false)
      setSelectedProject(null)
      setCompletionData({
        performance_rating: '',
        project_report: null,
        attendance_document: null
      })
      fetchProjects()
    } catch (error) {
      console.error('Failed to complete project:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      trainee_id: '',
      expected_duration: '',
      requirements: ''
    })
  }

  const openEditModal = (project) => {
    setSelectedProject(project)
    setFormData({
      title: project.title,
      description: project.description,
      trainee_id: project.trainee_id,
      expected_duration: project.expected_duration,
      requirements: project.requirements
    })
    setShowEditModal(true)
  }

  const openDetailsModal = (project) => {
    setSelectedProject(project)
    setShowDetailsModal(true)
  }

  const openCompletionModal = (project) => {
    setSelectedProject(project)
    setShowCompletionModal(true)
  }

  const updateProjectStatus = async (projectId, status) => {
    setSubmitting(true)
    try {
      await instructorAPI.updateProject(projectId, { status })
      fetchProjects()
    } catch (error) {
      console.error('Failed to update project status:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned':
        return 'warning'
      case 'in_progress':
        return 'default'
      case 'completed':
        return 'success'
      default:
        return 'secondary'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'assigned':
        return <Clock className="h-4 w-4" />
      case 'in_progress':
        return <FileText className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const filteredProjects = projects.filter(project => {
    if (activeTab === 'all') return true
    return project.status === activeTab
  })

  const columns = [
    {
      key: 'title',
      label: 'Project Title',
      render: (project) => (
        <div className="font-medium">{project.title}</div>
      )
    },
    {
      key: 'trainee_name',
      label: 'Trainee',
      render: (project) => (
        <div className="text-muted-foreground">{project.trainee_name}</div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (project) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(project.status)}
          <Badge variant={getStatusColor(project.status)}>
            {project.status.replace('_', ' ')}
          </Badge>
        </div>
      )
    },
    {
      key: 'start_date',
      label: 'Start Date',
      render: (project) => (
        <div className="text-sm">
          {project.start_date 
            ? new Date(project.start_date).toLocaleDateString()
            : 'Not started'
          }
        </div>
      )
    },
    {
      key: 'expected_duration',
      label: 'Duration',
      render: (project) => (
        <div className="text-sm">{project.expected_duration}</div>
      )
    },
    {
      key: 'performance_rating',
      label: 'Rating',
      render: (project) => (
        <div>
          {project.performance_rating ? (
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>{project.performance_rating}/10</span>
            </div>
          ) : (
            <span className="text-muted-foreground">N/A</span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (project) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              openDetailsModal(project)
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {project.status !== 'completed' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                openEditModal(project)
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {project.status === 'in_progress' && (
            <Button
              variant="ghost"
              size="icon"
              className="text-green-600 hover:text-green-700"
              onClick={(e) => {
                e.stopPropagation()
                openCompletionModal(project)
              }}
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    }
  ]

  const assignedCount = projects.filter(p => p.status === 'assigned').length
  const inProgressCount = projects.filter(p => p.status === 'in_progress').length
  const completedCount = projects.filter(p => p.status === 'completed').length

  if (loading) {
    return <LoadingSpinner />
  }

  const ProjectForm = ({ onSubmit }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Project Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="trainee_id">Assign to Trainee *</Label>
        <Select
          value={formData.trainee_id}
          onValueChange={(value) => setFormData({ ...formData, trainee_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a trainee" />
          </SelectTrigger>
          <SelectContent>
            {trainees.map((trainee) => (
              <SelectItem key={trainee.id} value={trainee.id.toString()}>
                {trainee.name} - {trainee.institution}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expected_duration">Expected Duration *</Label>
        <Input
          id="expected_duration"
          value={formData.expected_duration}
          onChange={(e) => setFormData({ ...formData, expected_duration: e.target.value })}
          placeholder="e.g., 3 months, 6 weeks"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Project Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="requirements">Requirements & Objectives</Label>
        <Textarea
          id="requirements"
          value={formData.requirements}
          onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
          rows={3}
          placeholder="List project requirements, learning objectives, and expected outcomes..."
        />
      </div>
    </form>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects Management</h1>
          <p className="text-muted-foreground">
            Create and manage training projects for your trainees.
          </p>
        </div>
        
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Assign a new training project to a trainee. The start date will be automatically set when created.
              </DialogDescription>
            </DialogHeader>
            <ProjectForm onSubmit={handleCreateProject} />
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
                onClick={handleCreateProject}
                disabled={submitting}
              >
                {submitting ? 'Creating...' : 'Create Project'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedCount}</div>
            <p className="text-xs text-muted-foreground">
              Ready to start
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressCount}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
            <p className="text-xs text-muted-foreground">
              Successfully finished
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projects Table with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Training Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({projects.length})</TabsTrigger>
              <TabsTrigger value="assigned">Assigned ({assignedCount})</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress ({inProgressCount})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedCount})</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-6">
              <DataTable
                data={filteredProjects}
                columns={columns}
                searchPlaceholder="Search projects by title, trainee, or status..."
                emptyMessage={`No ${activeTab === 'all' ? '' : activeTab} projects found.`}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update project information and requirements.
            </DialogDescription>
          </DialogHeader>
          <ProjectForm onSubmit={handleEditProject} />
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
              onClick={handleEditProject}
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedProject?.title}
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-6">
              {/* Project Overview */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Project Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Project Title</Label>
                    <p className="mt-1 font-medium">{selectedProject.title}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Assigned Trainee</Label>
                    <p className="mt-1">{selectedProject.trainee_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <p className="mt-1">
                      <Badge variant={getStatusColor(selectedProject.status)}>
                        {selectedProject.status.replace('_', ' ')}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Expected Duration</Label>
                    <p className="mt-1">{selectedProject.expected_duration}</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Timeline</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Start Date</Label>
                    <p className="mt-1">
                      {selectedProject.start_date 
                        ? new Date(selectedProject.start_date).toLocaleDateString()
                        : 'Not started yet'
                      }
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">End Date</Label>
                    <p className="mt-1">
                      {selectedProject.end_date 
                        ? new Date(selectedProject.end_date).toLocaleDateString()
                        : 'Not completed yet'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <div className="p-4 bg-muted rounded-md">
                  <p className="whitespace-pre-wrap">{selectedProject.description}</p>
                </div>
              </div>

              {/* Requirements */}
              {selectedProject.requirements && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Requirements & Objectives</h3>
                  <div className="p-4 bg-muted rounded-md">
                    <p className="whitespace-pre-wrap">{selectedProject.requirements}</p>
                  </div>
                </div>
              )}

              {/* Performance Rating */}
              {selectedProject.performance_rating && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Performance Evaluation</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <span className="text-lg font-medium">{selectedProject.performance_rating}/10</span>
                    </div>
                    <Badge variant="success">Completed</Badge>
                  </div>
                </div>
              )}
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
            {selectedProject?.status === 'assigned' && (
              <Button
                type="button"
                onClick={() => updateProjectStatus(selectedProject.id, 'in_progress')}
                disabled={submitting}
              >
                Start Project
              </Button>
            )}
            {selectedProject?.status === 'in_progress' && (
              <Button
                type="button"
                onClick={() => {
                  setShowDetailsModal(false)
                  openCompletionModal(selectedProject)
                }}
              >
                Complete Project
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Project Completion Modal */}
      <Dialog open={showCompletionModal} onOpenChange={setShowCompletionModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Complete Project</DialogTitle>
            <DialogDescription>
              Mark this project as completed by providing required documentation and performance rating.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Performance Rating */}
            <div className="space-y-2">
              <Label htmlFor="performance_rating">Performance Rating (1-10) *</Label>
              <Select
                value={completionData.performance_rating}
                onValueChange={(value) => setCompletionData({ ...completionData, performance_rating: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Rate trainee performance" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(10)].map((_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1} - {i + 1 <= 3 ? 'Poor' : i + 1 <= 6 ? 'Average' : i + 1 <= 8 ? 'Good' : 'Excellent'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Project Report Upload */}
            <div className="space-y-2">
              <Label>Project Report Upload *</Label>
              <FileUpload
                accept=".pdf,.doc,.docx"
                maxSize={10 * 1024 * 1024}
                onFileSelect={(file) => setCompletionData({ ...completionData, project_report: file })}
                placeholder="Upload project report (PDF or DOC)"
              />
            </div>

            {/* Attendance Document Upload */}
            <div className="space-y-2">
              <Label>Attendance Document Upload *</Label>
              <FileUpload
                accept=".pdf,.jpg,.jpeg,.png"
                maxSize={10 * 1024 * 1024}
                onFileSelect={(file) => setCompletionData({ ...completionData, attendance_document: file })}
                placeholder="Upload attendance record (PDF or Image)"
              />
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> Once completed, this project cannot be modified. An email will be automatically sent to the Training and HRD department with all project details and documents.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCompletionModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCompleteProject}
              disabled={submitting || !completionData.performance_rating || !completionData.project_report || !completionData.attendance_document}
            >
              {submitting ? 'Completing...' : 'Complete Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProjectsList
