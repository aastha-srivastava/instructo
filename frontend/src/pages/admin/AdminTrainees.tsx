import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { Plus, Search, Edit, Trash2, Phone, User, CheckCircle, XCircle } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { Trainee, Instructor } from '@/types';
import { toast } from '@/hooks/use-toast';

export const AdminTrainees: React.FC = () => {
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [filteredTrainees, setFilteredTrainees] = useState<Trainee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTrainee, setEditingTrainee] = useState<Trainee | null>(null);  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    instructorId: '',
    institution_name: '',
    degree: '',
    joining_date: '',
    expected_completion_date: ''
  });

  useEffect(() => {
    fetchTrainees();
    fetchInstructors();
  }, []);
  useEffect(() => {
    const filtered = trainees.filter(trainee =>
      trainee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainee.mobile.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainee.institution_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainee.degree?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTrainees(filtered);
  }, [trainees, searchTerm]);  const fetchTrainees = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getTrainees({ limit: 100 });
      
      // Handle the backend response structure correctly
      if (response.data && response.data.success) {
        setTrainees(response.data.data.trainees || []);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Failed to fetch trainees:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load trainees. Please try again.",
        variant: "destructive",
      });
      setTrainees([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await adminAPI.getInstructors({ limit: 100 });
      
      // Handle the backend response structure correctly
      if (response.data && response.data.success) {
        setInstructors(response.data.data.instructors || []);
      } else {
        setInstructors([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch instructors:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load instructors for assignment.",
        variant: "destructive",
      });
      setInstructors([]);
    }
  };  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim() || !formData.mobile.trim() || !formData.joining_date) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Name, Mobile, Joining Date)",
        variant: "destructive",
      });
      return;
    }

    // Validate mobile number format (basic validation)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(formData.mobile.replace(/\D/g, ''))) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        instructor_id: formData.instructorId ? parseInt(formData.instructorId) : null
      };

      if (editingTrainee) {
        // Update trainee using proper API
        await adminAPI.updateTrainee(editingTrainee.id, payload);
        toast({
          title: "Success",
          description: "Trainee updated successfully",
        });
      } else {
        // Create new trainee using proper API
        await adminAPI.createTrainee(payload);
        toast({
          title: "Success",
          description: "Trainee created successfully",
        });
      }
      
      await fetchTrainees();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Failed to save trainee:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save trainee. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this trainee? This action cannot be undone and will also remove all associated projects and documents.')) return;

    try {
      setIsLoading(true);
      await adminAPI.deleteTrainee(id);
      toast({
        title: "Success",
        description: "Trainee deleted successfully",
      });
      await fetchTrainees();
    } catch (error: any) {
      console.error('Failed to delete trainee:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete trainee. They may have active projects.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };  const handleApproval = async (traineeId: string, status: 'approved' | 'rejected', comments?: string) => {
    try {
      setIsLoading(true);
      await adminAPI.approveTrainee(traineeId, { status, comments });
      toast({
        title: "Success",
        description: `Trainee ${status} successfully`,
      });
      await fetchTrainees();
    } catch (error: any) {
      console.error('Failed to approve/reject trainee:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to process trainee approval. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (trainee: Trainee) => {
    setEditingTrainee(trainee);
    setFormData({
      name: trainee.name,
      mobile: trainee.mobile || '',
      instructorId: trainee.instructor_id?.toString() || '',
      institution_name: trainee.institution_name || '',
      degree: trainee.degree || '',
      joining_date: trainee.joining_date.split('T')[0], // Format date for input
      expected_completion_date: trainee.expected_completion_date?.split('T')[0] || ''
    });
    setIsDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTrainee(null);
    setFormData({
      name: '',
      mobile: '',
      instructorId: '',
      institution_name: '',
      degree: '',
      joining_date: '',
      expected_completion_date: ''
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  const getInstructorName = (instructorId: string | null) => {
    if (!instructorId) return 'Not Assigned';
    const instructor = instructors.find(i => i.id === instructorId);
    return instructor ? instructor.name : 'Unknown';
  };

  if (isLoading && trainees.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trainees</h1>
          <p className="text-muted-foreground">
            Manage your training participants
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Trainee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>
                {editingTrainee ? 'Edit Trainee' : 'Add New Trainee'}
              </DialogTitle>
              <DialogDescription>
                {editingTrainee 
                  ? 'Update trainee information' 
                  : 'Create a new trainee account'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => handleChange('mobile', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="institution_name">Institution Name</Label>
                  <Input
                    id="institution_name"
                    value={formData.institution_name}
                    onChange={(e) => handleChange('institution_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructor">Instructor</Label>
                  <Select
                    value={formData.instructorId}
                    onValueChange={(value) => handleChange('instructorId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Instructor</SelectItem>
                      {instructors.map((instructor) => (
                        <SelectItem key={instructor.id} value={instructor.id.toString()}>
                          {instructor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="degree">Degree</Label>
                  <Input
                    id="degree"
                    value={formData.degree}
                    onChange={(e) => handleChange('degree', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="joining_date">Joining Date</Label>
                  <Input
                    id="joining_date"
                    type="date"
                    value={formData.joining_date}
                    onChange={(e) => handleChange('joining_date', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expected_completion_date">Expected Completion Date</Label>
                <Input
                  id="expected_completion_date"
                  type="date"
                  value={formData.expected_completion_date}
                  onChange={(e) => handleChange('expected_completion_date', e.target.value)}
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {editingTrainee ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search trainees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Trainees Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Trainees ({filteredTrainees.length})</CardTitle>
          <CardDescription>
            List of all registered trainees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Institution</TableHead>
                <TableHead>Degree</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrainees.map((trainee) => (
                <TableRow key={trainee.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{trainee.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ID: {trainee.id}
                      </div>
                    </div>
                  </TableCell>                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Phone className="mr-1 h-3 w-3" />
                        {trainee.mobile}
                      </div>
                      {trainee.local_guardian_phone && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="mr-1 h-3 w-3" />
                          Guardian: {trainee.local_guardian_phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {trainee.institution_name || 'Not specified'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {trainee.degree || 'Not specified'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      trainee.status === 'active' ? 'bg-green-100 text-green-800' :
                      trainee.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                      trainee.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                      trainee.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {trainee.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </TableCell>                  <TableCell>
                    <div className="flex items-center text-sm">
                      <User className="mr-1 h-3 w-3" />
                      {getInstructorName(trainee.instructor_id)}
                    </div>
                  </TableCell>                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {trainee.status === 'pending_approval' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApproval(trainee.id, 'approved')}
                            className="text-green-600 hover:text-green-800"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApproval(trainee.id, 'rejected')}
                            className="text-red-600 hover:text-red-800"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(trainee)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(trainee.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
