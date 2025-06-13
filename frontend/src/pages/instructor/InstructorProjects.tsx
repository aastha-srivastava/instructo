import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Dialog } from '@/components/ui/Dialog';
import { 
  FileText, 
  Plus, 
  Search, 
  Calendar,
  Edit,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  MoreHorizontal
} from 'lucide-react';
import { instructorAPI } from '@/lib/api';
import type { Project, Trainee, ProjectFormData, PaginatedResponse } from '@/types';
import { toast } from '@/hooks/use-toast';

export const InstructorProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [traineeFilter, setTraineeFilter] = useState<string>('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Form state for new project
  const [formData, setFormData] = useState<ProjectFormData>({
    trainee_id: '',
    project_name: '',
    description: '',
    due_date: '',
  });

  const fetchProjects = async (page = 1) => {
    try {
      setLoading(true);
      const response = await instructorAPI.getProjects({
        page,
        limit: 10,
        status: statusFilter || undefined,
        trainee_id: traineeFilter || undefined,
      });
      
      const data = response.data as PaginatedResponse<Project>;
      setProjects(data.data.items);
      setPagination(data.data.pagination);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainees = async () => {
    try {
      const response = await instructorAPI.getTrainees({
        status: 'active',
        limit: 100,
      });
      const data = response.data as PaginatedResponse<Trainee>;
      setTrainees(data.data.items);
    } catch (error) {
      console.error('Error fetching trainees:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchTrainees();
  }, [statusFilter, traineeFilter]);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await instructorAPI.createProject(formData);
      toast({
        title: "Success",
        description: "Project created successfully",
      });
      setShowAddDialog(false);
      setFormData({
        trainee_id: '',
        project_name: '',
        description: '',
        due_date: '',
      });
      fetchProjects();
    } catch (error) {
      console.error('Error adding project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'assigned':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'assigned':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getDaysUntilDue = (dueDate?: string) => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueDateColor = (dueDate?: string) => {
    const days = getDaysUntilDue(dueDate);
    if (days === null) return 'text-muted-foreground';
    if (days < 0) return 'text-red-600';
    if (days <= 2) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage trainee projects and track progress
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Project
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by project name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Label htmlFor="status">Status</Label>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <option value="">All Status</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </Select>
            </div>
            <div className="sm:w-48">
              <Label htmlFor="trainee">Trainee</Label>
              <Select
                value={traineeFilter}
                onValueChange={setTraineeFilter}
              >
                <option value="">All Trainees</option>
                {trainees.map((trainee) => (
                  <option key={trainee.id} value={trainee.id}>
                    {trainee.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      <Card>
        <CardHeader>
          <CardTitle>Projects ({pagination.total})</CardTitle>
          <CardDescription>
            All projects assigned to your trainees
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No projects found. {searchTerm || statusFilter || traineeFilter ? 'Try adjusting your filters.' : 'Create your first project to get started.'}
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(project.status)}
                        <h3 className="font-semibold text-lg">{project.project_name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {formatStatus(project.status)}
                        </span>
                      </div>
                      
                      {project.description && (
                        <p className="text-muted-foreground mb-3">{project.description}</p>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{project.trainee?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Started: {new Date(project.start_date || project.created_at).toLocaleDateString()}</span>
                        </div>
                        {project.due_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className={getDueDateColor(project.due_date)}>
                              Due: {new Date(project.due_date).toLocaleDateString()}
                              {(() => {
                                const days = getDaysUntilDue(project.due_date);
                                if (days === null) return '';
                                if (days < 0) return ' (Overdue)';
                                if (days === 0) return ' (Today)';
                                if (days === 1) return ' (Tomorrow)';
                                return ` (${days} days)`;
                              })()}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{project.progress?.length || 0} progress updates</span>
                        </div>
                      </div>
                      
                      {project.performance_rating && (
                        <div className="mt-2">
                          <span className="text-sm text-muted-foreground">
                            Performance Rating: {project.performance_rating}/10
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => fetchProjects(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2 text-sm">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => fetchProjects(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Project Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
            
            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <Label htmlFor="trainee_id">Trainee *</Label>
                <Select
                  value={formData.trainee_id}
                  onValueChange={(value) => setFormData({ ...formData, trainee_id: value })}
                  required
                >
                  <option value="">Select a trainee</option>
                  {trainees.map((trainee) => (
                    <option key={trainee.id} value={trainee.id}>
                      {trainee.name}
                    </option>
                  ))}
                </Select>
              </div>
              
              <div>
                <Label htmlFor="project_name">Project Name *</Label>
                <Input
                  id="project_name"
                  value={formData.project_name}
                  onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Project description..."
                />
              </div>
              
              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create Project
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
