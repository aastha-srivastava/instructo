import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Select } from '../../components/ui/Select';
import { Dialog } from '../../components/ui/Dialog';
import { Badge } from '../../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import DataTable from '../../components/shared/DataTable';
import FileUpload from '../../components/shared/FileUpload';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Calendar, 
  Upload, 
  Download, 
  Eye, 
  Search, 
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  AlertCircle,
  Edit3,
  Trash2,
  Plus
} from 'lucide-react';

const MonthlyRecords = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [trainees, setTrainees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('monthly');

  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Form states
  const [uploadForm, setUploadForm] = useState({
    month: new Date().toISOString().slice(0, 7),
    file: null,
    description: ''
  });
  const [editForm, setEditForm] = useState({
    status: '',
    comments: '',
    approvedBy: '',
    approvalDate: ''
  });

  const statusOptions = [
    { value: 'pending', label: 'Pending Review', color: 'yellow' },
    { value: 'approved', label: 'Approved', color: 'green' },
    { value: 'rejected', label: 'Rejected', color: 'red' },
    { value: 'revision', label: 'Needs Revision', color: 'orange' }
  ];

  useEffect(() => {
    fetchRecords();
    fetchTrainees();
  }, [selectedMonth]);

  const fetchRecords = async () => {
    try {
      const response = await api.get('/instructor/monthly-records', {
        params: { month: selectedMonth }
      });
      setRecords(response.data);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
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

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('month', uploadForm.month);
      formData.append('description', uploadForm.description);
      formData.append('file', uploadForm.file);

      await api.post('/instructor/monthly-records', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setShowUploadModal(false);
      setUploadForm({
        month: new Date().toISOString().slice(0, 7),
        file: null,
        description: ''
      });
      fetchRecords();
    } catch (error) {
      console.error('Error uploading record:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.put(`/instructor/monthly-records/${selectedRecord.id}`, editForm);
      setShowEditModal(false);
      setEditForm({ status: '', comments: '', approvedBy: '', approvalDate: '' });
      setSelectedRecord(null);
      fetchRecords();
    } catch (error) {
      console.error('Error updating record:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    
    setLoading(true);
    try {
      await api.delete(`/instructor/monthly-records/${recordId}`);
      fetchRecords();
    } catch (error) {
      console.error('Error deleting record:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (record) => {
    try {
      const response = await api.get(`/instructor/monthly-records/${record.id}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_${record.month}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading record:', error);
    }
  };

  const handleView = (record) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  const handleEditClick = (record) => {
    setSelectedRecord(record);
    setEditForm({
      status: record.status,
      comments: record.comments || '',
      approvedBy: record.approvedBy || '',
      approvalDate: record.approvalDate || ''
    });
    setShowEditModal(true);
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.month.includes(searchTerm);
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusConfig = statusOptions.find(s => s.value === status);
    return statusConfig ? (
      <Badge variant={statusConfig.color === 'green' ? 'default' : 'secondary'}>
        {statusConfig.label}
      </Badge>
    ) : status;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'revision':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const recordColumns = [
    {
      key: 'month',
      header: 'Month',
      render: (record) => (
        <div className="flex items-center space-x-3">
          <Calendar className="h-5 w-5 text-gray-500" />
          <div>
            <div className="font-medium text-gray-900">
              {new Date(record.month + '-01').toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long' 
              })}
            </div>
            <div className="text-sm text-gray-500">{record.month}</div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (record) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(record.status)}
          {getStatusBadge(record.status)}
        </div>
      )
    },
    {
      key: 'totalTrainees',
      header: 'Total Trainees',
      render: (record) => (
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-gray-500" />
          <span>{record.totalTrainees || 0}</span>
        </div>
      )
    },
    {
      key: 'attendanceRate',
      header: 'Attendance Rate',
      render: (record) => {
        const rate = record.attendanceRate || 0;
        return (
          <div className="flex items-center space-x-2">
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${rate >= 80 ? 'bg-green-600' : rate >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}
                style={{ width: `${rate}%` }}
              />
            </div>
            <span className="text-sm">{rate}%</span>
          </div>
        );
      }
    },
    {
      key: 'submittedDate',
      header: 'Submitted',
      render: (record) => record.submittedDate ? 
        new Date(record.submittedDate).toLocaleDateString() : '-'
    },
    {
      key: 'approvedBy',
      header: 'Approved By',
      render: (record) => record.approvedBy || '-'
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (record) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(record)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDownload(record)}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditClick(record)}
          >
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(record.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const getMonthlyStats = () => {
    const currentMonth = records.filter(r => r.month === selectedMonth);
    const total = currentMonth.length;
    const approved = currentMonth.filter(r => r.status === 'approved').length;
    const pending = currentMonth.filter(r => r.status === 'pending').length;
    const rejected = currentMonth.filter(r => r.status === 'rejected').length;
    
    return { total, approved, pending, rejected };
  };

  const stats = getMonthlyStats();

  if (loading && records.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monthly Records</h1>
          <p className="text-gray-600">Manage monthly attendance records and submissions</p>
        </div>
        <Button onClick={() => setShowUploadModal(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Monthly Record
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Records</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-400" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-400" />
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <div>
              <Label htmlFor="month-select">Month</Label>
              <Input
                id="month-select"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-40"
              />
            </div>
            <div>
              <Label htmlFor="status-select">Status</Label>
              <Select
                id="status-select"
                value={selectedStatus}
                onChange={(value) => setSelectedStatus(value)}
              >
                <option value="all">All Status</option>
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Records Table */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="monthly">Monthly View</TabsTrigger>
            <TabsTrigger value="yearly">Yearly Overview</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="monthly" className="space-y-4">
            <DataTable
              data={filteredRecords}
              columns={recordColumns}
              searchable={false}
              loading={loading}
            />
          </TabsContent>
          
          <TabsContent value="yearly" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {records.reduce((acc, record) => {
                const year = record.month.split('-')[0];
                if (!acc[year]) acc[year] = [];
                acc[year].push(record);
                return acc;
              }, {}).map(([year, yearRecords]) => (
                <Card key={year} className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{year}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Records:</span>
                      <span className="font-medium">{yearRecords.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Approved:</span>
                      <span className="font-medium text-green-600">
                        {yearRecords.filter(r => r.status === 'approved').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending:</span>
                      <span className="font-medium text-yellow-600">
                        {yearRecords.filter(r => r.status === 'pending').length}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="statistics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Submission Timeline</h3>
                <div className="space-y-3">
                  {records.slice(0, 6).map(record => (
                    <div key={record.id} className="flex items-center justify-between">
                      <span className="text-sm">{record.month}</span>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(record.status)}
                        <span className="text-sm">{record.submittedDate ? 
                          new Date(record.submittedDate).toLocaleDateString() : 'Not submitted'
                        }</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Attendance Trends</h3>
                <div className="space-y-3">
                  {records.slice(0, 6).map(record => (
                    <div key={record.id} className="flex items-center justify-between">
                      <span className="text-sm">{record.month}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${(record.attendanceRate || 0) >= 80 ? 'bg-green-600' : (record.attendanceRate || 0) >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}
                            style={{ width: `${record.attendanceRate || 0}%` }}
                          />
                        </div>
                        <span className="text-sm">{record.attendanceRate || 0}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Upload Monthly Record</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <Label htmlFor="upload-month">Month</Label>
              <Input
                id="upload-month"
                type="month"
                value={uploadForm.month}
                onChange={(e) => setUploadForm(prev => ({ ...prev, month: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="upload-description">Description</Label>
              <Input
                id="upload-description"
                value={uploadForm.description}
                onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the record..."
              />
            </div>
            <div>
              <Label>Attendance File</Label>
              <FileUpload
                onFilesSelected={(files) => setUploadForm(prev => ({ ...prev, file: files[0] }))}
                acceptedTypes={['.xlsx', '.xls', '.csv']}
                maxSize={5 * 1024 * 1024} // 5MB
                single={true}
              />
              <p className="text-sm text-gray-500 mt-1">
                Upload Excel or CSV file containing attendance data
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowUploadModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !uploadForm.file}>
                {loading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* View Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Record Details</h2>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Month</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedRecord.month + '-01').toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}
                  </p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedRecord.status)}
                    {getStatusBadge(selectedRecord.status)}
                  </div>
                </div>
                <div>
                  <Label>Total Trainees</Label>
                  <p className="text-sm text-gray-600">{selectedRecord.totalTrainees || 0}</p>
                </div>
                <div>
                  <Label>Attendance Rate</Label>
                  <p className="text-sm text-gray-600">{selectedRecord.attendanceRate || 0}%</p>
                </div>
                <div>
                  <Label>Submitted Date</Label>
                  <p className="text-sm text-gray-600">
                    {selectedRecord.submittedDate ? 
                      new Date(selectedRecord.submittedDate).toLocaleDateString() : 'Not submitted'
                    }
                  </p>
                </div>
                <div>
                  <Label>Approved By</Label>
                  <p className="text-sm text-gray-600">{selectedRecord.approvedBy || 'Not approved'}</p>
                </div>
              </div>
              {selectedRecord.description && (
                <div>
                  <Label>Description</Label>
                  <p className="text-sm text-gray-600">{selectedRecord.description}</p>
                </div>
              )}
              {selectedRecord.comments && (
                <div>
                  <Label>Comments</Label>
                  <p className="text-sm text-gray-600">{selectedRecord.comments}</p>
                </div>
              )}
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => handleDownload(selectedRecord)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button onClick={() => setShowViewModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Edit Record</h2>
          {selectedRecord && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <Label>Month</Label>
                <p className="text-sm text-gray-600 mb-2">
                  {new Date(selectedRecord.month + '-01').toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </p>
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  id="edit-status"
                  value={editForm.status}
                  onChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-comments">Comments</Label>
                <Input
                  id="edit-comments"
                  value={editForm.comments}
                  onChange={(e) => setEditForm(prev => ({ ...prev, comments: e.target.value }))}
                  placeholder="Add comments..."
                />
              </div>
              <div>
                <Label htmlFor="edit-approved-by">Approved By</Label>
                <Input
                  id="edit-approved-by"
                  value={editForm.approvedBy}
                  onChange={(e) => setEditForm(prev => ({ ...prev, approvedBy: e.target.value }))}
                  placeholder="Approver name..."
                />
              </div>
              <div>
                <Label htmlFor="edit-approval-date">Approval Date</Label>
                <Input
                  id="edit-approval-date"
                  type="date"
                  value={editForm.approvalDate}
                  onChange={(e) => setEditForm(prev => ({ ...prev, approvalDate: e.target.value }))}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default MonthlyRecords;
