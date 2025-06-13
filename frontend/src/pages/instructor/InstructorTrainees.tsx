import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Dialog } from '@/components/ui/Dialog';
import { 
  Users, 
  Search, 
  Phone, 
  Calendar,
  Edit,
  Eye,
  MoreHorizontal,
  UserPlus
} from 'lucide-react';
import { instructorAPI } from '@/lib/api';
import type { Trainee, TraineeFormData, PaginatedResponse } from '@/types';
import { toast } from '@/hooks/use-toast';

export const InstructorTrainees: React.FC = () => {
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Form state for new trainee
  const [formData, setFormData] = useState<TraineeFormData>({
    name: '',
    institution_name: '',
    degree: '',
    mobile: '',
    joining_date: '',
    expected_completion_date: '',
    local_guardian_name: '',
    local_guardian_phone: '',
    local_guardian_email: '',
    reference_person_name: '',
    reference_person_phone: '',
    reference_person_email: '',
  });

  const fetchTrainees = async (page = 1) => {
    try {
      setLoading(true);
      const response = await instructorAPI.getTrainees({
        page,
        limit: 10,
        search: searchTerm || undefined,
        status: statusFilter || undefined,
      });
      
      const data = response.data as PaginatedResponse<Trainee>;
      setTrainees(data.data.items);
      setPagination(data.data.pagination);
    } catch (error) {
      console.error('Error fetching trainees:', error);
      toast({
        title: "Error",
        description: "Failed to load trainees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainees();
  }, [searchTerm, statusFilter]);

  const handleAddTrainee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await instructorAPI.createTrainee(formData);
      toast({
        title: "Success",
        description: "Trainee added successfully",
      });
      setShowAddDialog(false);
      setFormData({
        name: '',
        institution_name: '',
        degree: '',
        mobile: '',
        joining_date: '',
        expected_completion_date: '',
        local_guardian_name: '',
        local_guardian_phone: '',
        local_guardian_email: '',
        reference_person_name: '',
        reference_person_phone: '',
        reference_person_email: '',
      });
      fetchTrainees();
    } catch (error) {
      console.error('Error adding trainee:', error);
      toast({
        title: "Error",
        description: "Failed to add trainee",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Trainees</h1>
          <p className="text-muted-foreground">
            Manage and track your assigned trainees
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add Trainee
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
                  placeholder="Search by name, mobile, or institution..."
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
                <option value="pending_approval">Pending Approval</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trainees List */}
      <Card>
        <CardHeader>
          <CardTitle>Trainees ({pagination.total})</CardTitle>
          <CardDescription>
            All your assigned trainees and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading trainees...</div>
          ) : trainees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No trainees found. {searchTerm || statusFilter ? 'Try adjusting your filters.' : 'Add your first trainee to get started.'}
            </div>
          ) : (
            <div className="space-y-4">
              {trainees.map((trainee) => (
                <div key={trainee.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{trainee.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trainee.status)}`}>
                          {formatStatus(trainee.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        {trainee.institution_name && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{trainee.institution_name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{trainee.mobile}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Joined: {new Date(trainee.joining_date).toLocaleDateString()}</span>
                        </div>
                        {trainee.degree && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{trainee.degree}</span>
                          </div>
                        )}
                        {trainee.expected_completion_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Expected: {new Date(trainee.expected_completion_date).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{trainee.projects?.length || 0} projects</span>
                        </div>
                      </div>
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
                    onClick={() => fetchTrainees(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2 text-sm">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => fetchTrainees(pagination.currentPage + 1)}
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

      {/* Add Trainee Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Add New Trainee</h2>
            
            <form onSubmit={handleAddTrainee} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="mobile">Mobile Number *</Label>
                  <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="institution_name">Institution Name</Label>
                  <Input
                    id="institution_name"
                    value={formData.institution_name}
                    onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="degree">Degree/Course</Label>
                  <Input
                    id="degree"
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="joining_date">Joining Date *</Label>
                  <Input
                    id="joining_date"
                    type="date"
                    value={formData.joining_date}
                    onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="expected_completion_date">Expected Completion Date</Label>
                  <Input
                    id="expected_completion_date"
                    type="date"
                    value={formData.expected_completion_date}
                    onChange={(e) => setFormData({ ...formData, expected_completion_date: e.target.value })}
                  />
                </div>
              </div>

              <h3 className="text-lg font-medium mt-6 mb-4">Local Guardian Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="local_guardian_name">Guardian Name</Label>
                  <Input
                    id="local_guardian_name"
                    value={formData.local_guardian_name}
                    onChange={(e) => setFormData({ ...formData, local_guardian_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="local_guardian_phone">Guardian Phone</Label>
                  <Input
                    id="local_guardian_phone"
                    value={formData.local_guardian_phone}
                    onChange={(e) => setFormData({ ...formData, local_guardian_phone: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="local_guardian_email">Guardian Email</Label>
                  <Input
                    id="local_guardian_email"
                    type="email"
                    value={formData.local_guardian_email}
                    onChange={(e) => setFormData({ ...formData, local_guardian_email: e.target.value })}
                  />
                </div>
              </div>

              <h3 className="text-lg font-medium mt-6 mb-4">Reference Person Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reference_person_name">Reference Name</Label>
                  <Input
                    id="reference_person_name"
                    value={formData.reference_person_name}
                    onChange={(e) => setFormData({ ...formData, reference_person_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="reference_person_phone">Reference Phone</Label>
                  <Input
                    id="reference_person_phone"
                    value={formData.reference_person_phone}
                    onChange={(e) => setFormData({ ...formData, reference_person_phone: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="reference_person_email">Reference Email</Label>
                  <Input
                    id="reference_person_email"
                    type="email"
                    value={formData.reference_person_email}
                    onChange={(e) => setFormData({ ...formData, reference_person_email: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Add Trainee
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
