import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Select } from '../../components/ui/Select';
import { Dialog } from '../../components/ui/Dialog';
import { Badge } from '../../components/ui/Badge';
import { Textarea } from '../../components/ui/Textarea';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  FileText,
  BarChart3,
  Plus,
  Edit3,
  Eye,
  Share2
} from 'lucide-react';

const ProgressTracker = () => {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState([]);
  const [projects, setProjects] = useState([]);
  const [trainees, setTrainees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedTrainee, setSelectedTrainee] = useState('all');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    projectId: '',
    traineeId: '',
    title: '',
    description: '',
    targetDate: '',
    priority: 'medium',
    category: 'development'
  });
  const [updateForm, setUpdateForm] = useState({
    status: '',
    progress: 0,
    notes: '',
    completedDate: ''
  });

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'green' },
    { value: 'medium', label: 'Medium', color: 'yellow' },
    { value: 'high', label: 'High', color: 'orange' },
    { value: 'critical', label: 'Critical', color: 'red' }
  ];

  const statusOptions = [
    { value: 'not_started', label: 'Not Started', color: 'gray' },
    { value: 'in_progress', label: 'In Progress', color: 'blue' },
    { value: 'review', label: 'Under Review', color: 'yellow' },
    { value: 'completed', label: 'Completed', color: 'green' },
    { value: 'blocked', label: 'Blocked', color: 'red' }
  ];

  const categoryOptions = [
    { value: 'development', label: 'Development' },
    { value: 'testing', label: 'Testing' },
    { value: 'documentation', label: 'Documentation' },
    { value: 'presentation', label: 'Presentation' },
    { value: 'research', label: 'Research' },
    { value: 'deployment', label: 'Deployment' }
  ];

  useEffect(() => {
    fetchMilestones();
    fetchProjects();
    fetchTrainees();
  }, [selectedProject, selectedTrainee]);

  const fetchMilestones = async () => {
    try {
      const response = await api.get('/instructor/progress-tracker/milestones', {
        params: { 
          projectId: selectedProject !== 'all' ? selectedProject : undefined,
          traineeId: selectedTrainee !== 'all' ? selectedTrainee : undefined
        }
      });
      setMilestones(response.data);
    } catch (error) {
      console.error('Error fetching milestones:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/instructor/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchTrainees = async () => {
    try {
      const response = await api.get('/instructor/trainees');
      setTrainees(response.data);
    } catch (error) {
      console.error('Error fetching trainees:', error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.post('/instructor/progress-tracker/milestones', createForm);
      setShowCreateModal(false);
      setCreateForm({
        projectId: '',
        traineeId: '',
        title: '',
        description: '',
        targetDate: '',
        priority: 'medium',
        category: 'development'
      });
      fetchMilestones();
    } catch (error) {
      console.error('Error creating milestone:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.put(`/instructor/progress-tracker/milestones/${selectedMilestone.id}`, updateForm);
      setShowUpdateModal(false);
      setUpdateForm({ status: '', progress: 0, notes: '', completedDate: '' });
      setSelectedMilestone(null);
      fetchMilestones();
    } catch (error) {
      console.error('Error updating milestone:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClick = (milestone) => {
    setSelectedMilestone(milestone);
    setUpdateForm({
      status: milestone.status,
      progress: milestone.progress || 0,
      notes: milestone.notes || '',
      completedDate: milestone.completedDate ? milestone.completedDate.split('T')[0] : ''
    });
    setShowUpdateModal(true);
  };

  const handleDetailsClick = (milestone) => {
    setSelectedMilestone(milestone);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = statusOptions.find(s => s.value === status);
    return statusConfig ? (
      <Badge variant={statusConfig.color === 'green' ? 'default' : 'secondary'}>
        {statusConfig.label}
      </Badge>
    ) : status;
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = priorityOptions.find(p => p.value === priority);
    return priorityConfig ? (
      <Badge variant={priorityConfig.color === 'green' ? 'default' : 'secondary'}>
        {priorityConfig.label}
      </Badge>
    ) : priority;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'blocked':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const getProgressStats = () => {
    const total = milestones.length;
    const completed = milestones.filter(m => m.status === 'completed').length;
    const inProgress = milestones.filter(m => m.status === 'in_progress').length;
    const blocked = milestones.filter(m => m.status === 'blocked').length;
    
    return { total, completed, inProgress, blocked };
  };

  const stats = getProgressStats();

  if (loading && milestones.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Progress Tracker</h1>
          <p className="text-gray-600">Track project milestones and trainee progress</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Milestone
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Milestones</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Target className="h-8 w-8 text-gray-400" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-400" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Blocked</p>
              <p className="text-2xl font-bold text-red-600">{stats.blocked}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <div>
            <Label htmlFor="project-filter">Project</Label>
            <Select
              id="project-filter"
              value={selectedProject}
              onChange={(value) => setSelectedProject(value)}
            >
              <option value="all">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.title}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="trainee-filter">Trainee</Label>
            <Select
              id="trainee-filter"
              value={selectedTrainee}
              onChange={(value) => setSelectedTrainee(value)}
            >
              <option value="all">All Trainees</option>
              {trainees.map(trainee => (
                <option key={trainee.id} value={trainee.id}>{trainee.name}</option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* Milestones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {milestones.map(milestone => (
          <Card key={milestone.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                {getStatusIcon(milestone.status)}
                <h3 className="font-semibold text-gray-900">{milestone.title}</h3>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDetailsClick(milestone)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUpdateClick(milestone)}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{milestone.description}</p>
            
            <div className="flex items-center justify-between mb-3">
              {getStatusBadge(milestone.status)}
              {getPriorityBadge(milestone.priority)}
            </div>
            
            {milestone.progress !== undefined && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{milestone.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${milestone.progress}%` }}
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex items-center justify-between">
                <span>Project:</span>
                <span>{milestone.project?.title || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Trainee:</span>
                <span>{milestone.trainee?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Target Date:</span>
                <span>{milestone.targetDate ? new Date(milestone.targetDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              {milestone.completedDate && (
                <div className="flex items-center justify-between">
                  <span>Completed:</span>
                  <span>{new Date(milestone.completedDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {milestones.length === 0 && (
        <Card className="p-8">
          <div className="text-center text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No milestones found</p>
            <p className="text-sm">Create your first milestone to start tracking progress</p>
          </div>
        </Card>
      )}

      {/* Create Milestone Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Create Milestone</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-project">Project</Label>
                <Select
                  id="create-project"
                  value={createForm.projectId}
                  onChange={(value) => setCreateForm(prev => ({ ...prev, projectId: value }))}
                  required
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.title}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="create-trainee">Trainee</Label>
                <Select
                  id="create-trainee"
                  value={createForm.traineeId}
                  onChange={(value) => setCreateForm(prev => ({ ...prev, traineeId: value }))}
                  required
                >
                  <option value="">Select Trainee</option>
                  {trainees.map(trainee => (
                    <option key={trainee.id} value={trainee.id}>{trainee.name}</option>
                  ))}
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="create-title">Title</Label>
              <Input
                id="create-title"
                value={createForm.title}
                onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="create-description">Description</Label>
              <Textarea
                id="create-description"
                value={createForm.description}
                onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="create-target-date">Target Date</Label>
                <Input
                  id="create-target-date"
                  type="date"
                  value={createForm.targetDate}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, targetDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="create-priority">Priority</Label>
                <Select
                  id="create-priority"
                  value={createForm.priority}
                  onChange={(value) => setCreateForm(prev => ({ ...prev, priority: value }))}
                >
                  {priorityOptions.map(priority => (
                    <option key={priority.value} value={priority.value}>{priority.label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="create-category">Category</Label>
                <Select
                  id="create-category"
                  value={createForm.category}
                  onChange={(value) => setCreateForm(prev => ({ ...prev, category: value }))}
                >
                  {categoryOptions.map(category => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Milestone'}
              </Button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Update Progress Modal */}
      <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Update Progress</h2>
          {selectedMilestone && (
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="font-medium">{selectedMilestone.title}</p>
              <p className="text-sm text-gray-600">{selectedMilestone.description}</p>
            </div>
          )}
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="update-status">Status</Label>
                <Select
                  id="update-status"
                  value={updateForm.status}
                  onChange={(value) => setUpdateForm(prev => ({ ...prev, status: value }))}
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="update-progress">Progress (%)</Label>
                <Input
                  id="update-progress"
                  type="number"
                  min="0"
                  max="100"
                  value={updateForm.progress}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="update-notes">Notes</Label>
              <Textarea
                id="update-notes"
                value={updateForm.notes}
                onChange={(e) => setUpdateForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                placeholder="Add progress notes..."
              />
            </div>
            {updateForm.status === 'completed' && (
              <div>
                <Label htmlFor="update-completed-date">Completed Date</Label>
                <Input
                  id="update-completed-date"
                  type="date"
                  value={updateForm.completedDate}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, completedDate: e.target.value }))}
                />
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowUpdateModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Progress'}
              </Button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Milestone Details</h2>
          {selectedMilestone && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedMilestone.title}</h3>
                <p className="text-gray-600">{selectedMilestone.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedMilestone.status)}
                    {getStatusBadge(selectedMilestone.status)}
                  </div>
                </div>
                <div>
                  <Label>Priority</Label>
                  {getPriorityBadge(selectedMilestone.priority)}
                </div>
                <div>
                  <Label>Progress</Label>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${selectedMilestone.progress || 0}%` }}
                      />
                    </div>
                    <span className="text-sm">{selectedMilestone.progress || 0}%</span>
                  </div>
                </div>
                <div>
                  <Label>Category</Label>
                  <p className="text-sm text-gray-600 capitalize">{selectedMilestone.category}</p>
                </div>
                <div>
                  <Label>Project</Label>
                  <p className="text-sm text-gray-600">{selectedMilestone.project?.title || 'N/A'}</p>
                </div>
                <div>
                  <Label>Trainee</Label>
                  <p className="text-sm text-gray-600">{selectedMilestone.trainee?.name || 'N/A'}</p>
                </div>
                <div>
                  <Label>Target Date</Label>
                  <p className="text-sm text-gray-600">
                    {selectedMilestone.targetDate ? new Date(selectedMilestone.targetDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label>Created</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedMilestone.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {selectedMilestone.notes && (
                <div>
                  <Label>Notes</Label>
                  <p className="text-sm text-gray-600">{selectedMilestone.notes}</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => handleUpdateClick(selectedMilestone)}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Update Progress
                </Button>
                <Button onClick={() => setShowDetailsModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default ProgressTracker;
