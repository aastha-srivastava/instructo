import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { Label } from '@/components/ui/Label';
import { Plus, Search, Edit, Trash2, Mail, Phone } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { Instructor } from '@/types';
import { toast } from '@/hooks/use-toast';

export const AdminInstructors: React.FC = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [filteredInstructors, setFilteredInstructors] = useState<Instructor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    role: '',
    employee_id: ''
  });

  useEffect(() => {
    fetchInstructors();
  }, []);
  useEffect(() => {
    const filtered = instructors.filter(instructor =>
      instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInstructors(filtered);
  }, [instructors, searchTerm]);  const fetchInstructors = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getInstructors({ limit: 100 });
      
      // Handle the backend response structure correctly
      if (response.data && response.data.success) {
        setInstructors(response.data.data.instructors || []);
      } else {
        throw new Error('Invalid response format');
      }    } catch (error: any) {
      console.error('Failed to fetch instructors:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load instructors. Please try again.",
        variant: "destructive",
      });
      setInstructors([]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim() || !formData.email.trim() || !formData.department.trim() || !formData.role.trim() || !formData.employee_id.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      if (editingInstructor) {
        await adminAPI.updateInstructor(editingInstructor.id, formData);
        toast({
          title: "Success",
          description: "Instructor updated successfully",
        });
      } else {
        await adminAPI.createInstructor(formData);
        toast({
          title: "Success",
          description: "Instructor created successfully",
        });
      }
      
      await fetchInstructors();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Failed to save instructor:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save instructor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this instructor? This action cannot be undone.')) return;

    try {
      setIsLoading(true);
      await adminAPI.deleteInstructor(id);
      toast({
        title: "Success",
        description: "Instructor deleted successfully",
      });
      await fetchInstructors();
    } catch (error: any) {
      console.error('Failed to delete instructor:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete instructor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };const handleEdit = (instructor: Instructor) => {
    setEditingInstructor(instructor);
    setFormData({
      name: instructor.name,
      email: instructor.email,
      phone: instructor.phone || '',
      department: instructor.department,
      role: instructor.role,
      employee_id: instructor.employee_id
    });
    setIsDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingInstructor(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      department: '',
      role: '',
      employee_id: ''
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading && instructors.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Instructors</h1>
          <p className="text-muted-foreground">
            Manage your training instructors
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Instructor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>
                {editingInstructor ? 'Edit Instructor' : 'Add New Instructor'}
              </DialogTitle>
              <DialogDescription>
                {editingInstructor 
                  ? 'Update instructor information' 
                  : 'Create a new instructor account'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => handleChange('role', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee_id">Employee ID</Label>
                  <Input
                    id="employee_id"
                    value={formData.employee_id}
                    onChange={(e) => handleChange('employee_id', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {editingInstructor ? 'Update' : 'Create'}
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
              placeholder="Search instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Instructors Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Instructors ({filteredInstructors.length})</CardTitle>
          <CardDescription>
            List of all registered instructors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInstructors.map((instructor) => (
                <TableRow key={instructor.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{instructor.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ID: {instructor.id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="mr-1 h-3 w-3" />
                        {instructor.email}
                      </div>
                      {instructor.phone && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="mr-1 h-3 w-3" />
                          {instructor.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {instructor.department}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(instructor)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(instructor.id)}
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
