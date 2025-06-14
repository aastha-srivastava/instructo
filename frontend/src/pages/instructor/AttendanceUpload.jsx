import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Select } from '../../components/ui/Select';
import { Dialog } from '../../components/ui/Dialog';
import { Badge } from '../../components/ui/Badge';
import { Textarea } from '../../components/ui/Textarea';
import FileUpload from '../../components/shared/FileUpload';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Upload, 
  Calendar, 
  Users, 
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  FileText,
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2
} from 'lucide-react';

const AttendanceUpload = () => {
  const { user } = useAuth();
  const [uploads, setUploads] = useState([]);
  const [trainees, setTrainees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showBulkModal, setBulkModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUpload, setSelectedUpload] = useState(null);

  // Form states
  const [uploadForm, setUploadForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: 'daily',
    description: '',
    file: null
  });
  const [bulkForm, setBulkForm] = useState({
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    file: null,
    description: ''
  });

  const uploadTypes = [
    { value: 'daily', label: 'Daily Attendance' },
    { value: 'weekly', label: 'Weekly Summary' },
    { value: 'monthly', label: 'Monthly Report' },
    { value: 'custom', label: 'Custom Period' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'processing', label: 'Processing', color: 'blue' },
    { value: 'completed', label: 'Completed', color: 'green' },
    { value: 'failed', label: 'Failed', color: 'red' },
    { value: 'warning', label: 'Warning', color: 'orange' }
  ];

  useEffect(() => {
    fetchUploads();
    fetchTrainees();
  }, [selectedDate]);

  const fetchUploads = async () => {
    try {
      const response = await api.get('/instructor/attendance-uploads', {
        params: { date: selectedDate }
      });
      setUploads(response.data);
    } catch (error) {
      console.error('Error fetching uploads:', error);
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
      formData.append('date', uploadForm.date);
      formData.append('type', uploadForm.type);
      formData.append('description', uploadForm.description);
      formData.append('file', uploadForm.file);

      await api.post('/instructor/attendance-uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setShowUploadModal(false);
      setUploadForm({
        date: new Date().toISOString().slice(0, 10),
        type: 'daily',
        description: '',
        file: null
      });
      fetchUploads();
    } catch (error) {
      console.error('Error uploading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('startDate', bulkForm.startDate);
      formData.append('endDate', bulkForm.endDate);
      formData.append('description', bulkForm.description);
      formData.append('file', bulkForm.file);

      await api.post('/instructor/attendance-uploads/bulk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setBulkModal(false);
      setBulkForm({
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
        file: null,
        description: ''
      });
      fetchUploads();
    } catch (error) {
      console.error('Error bulk uploading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (uploadId) => {
    if (!window.confirm('Are you sure you want to delete this upload?')) return;
    
    setLoading(true);
    try {
      await api.delete(`/instructor/attendance-uploads/${uploadId}`);
      fetchUploads();
    } catch (error) {
      console.error('Error deleting upload:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/instructor/attendance-uploads/template', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendance_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading template:', error);
    }
  };

  const handleView = (upload) => {
    setSelectedUpload(upload);
    setShowViewModal(true);
  };

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
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const filteredUploads = uploads.filter(upload => {
    const matchesSearch = upload.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         upload.filename?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || upload.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getUploadStats = () => {
    const total = uploads.length;
    const completed = uploads.filter(u => u.status === 'completed').length;
    const pending = uploads.filter(u => u.status === 'pending').length;
    const failed = uploads.filter(u => u.status === 'failed').length;
    const processing = uploads.filter(u => u.status === 'processing').length;
    
    return { total, completed, pending, failed, processing };
  };

  const stats = getUploadStats();

  if (loading && uploads.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Upload</h1>
          <p className="text-gray-600">Upload and manage attendance records</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleDownloadTemplate}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <Button
            variant="outline"
            onClick={() => setBulkModal(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
          <Button onClick={() => setShowUploadModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Single Upload
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Uploads</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <FileText className="h-8 w-8 text-gray-400" />
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
              <p className="text-sm text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-400" />
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
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-400" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search uploads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <div>
              <Label htmlFor="date-select">Date</Label>
              <Input
                id="date-select"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select
                id="status-filter"
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

      {/* Uploads List */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Uploads</h2>
          {filteredUploads.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No uploads found</p>
              <p className="text-sm">Upload attendance files to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUploads.map(upload => (
                <div key={upload.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(upload.status)}
                      {getStatusBadge(upload.status)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {upload.filename || `${upload.type} - ${upload.date}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {upload.description || `Uploaded on ${new Date(upload.createdAt).toLocaleDateString()}`}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center space-x-4">
                        <span>Type: {uploadTypes.find(t => t.value === upload.type)?.label}</span>
                        <span>Date: {upload.date}</span>
                        {upload.recordsProcessed && (
                          <span>Records: {upload.recordsProcessed}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(upload)}
                    >
                      View Details
                    </Button>
                    {upload.status === 'failed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(upload.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Single Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Upload Attendance</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <Label htmlFor="upload-date">Date</Label>
              <Input
                id="upload-date"
                type="date"
                value={uploadForm.date}
                onChange={(e) => setUploadForm(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="upload-type">Type</Label>
              <Select
                id="upload-type"
                value={uploadForm.type}
                onChange={(value) => setUploadForm(prev => ({ ...prev, type: value }))}
              >
                {uploadTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="upload-description">Description</Label>
              <Textarea
                id="upload-description"
                value={uploadForm.description}
                onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the attendance data..."
                rows={3}
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
                Supported formats: Excel (.xlsx, .xls) or CSV (.csv)
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

      {/* Bulk Upload Modal */}
      <Dialog open={showBulkModal} onOpenChange={setBulkModal}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Bulk Upload Attendance</h2>
          <form onSubmit={handleBulkUpload} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bulk-start-date">Start Date</Label>
                <Input
                  id="bulk-start-date"
                  type="date"
                  value={bulkForm.startDate}
                  onChange={(e) => setBulkForm(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="bulk-end-date">End Date</Label>
                <Input
                  id="bulk-end-date"
                  type="date"
                  value={bulkForm.endDate}
                  onChange={(e) => setBulkForm(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bulk-description">Description</Label>
              <Textarea
                id="bulk-description"
                value={bulkForm.description}
                onChange={(e) => setBulkForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description for the bulk upload..."
                rows={3}
              />
            </div>
            <div>
              <Label>Bulk Attendance File</Label>
              <FileUpload
                onFilesSelected={(files) => setBulkForm(prev => ({ ...prev, file: files[0] }))}
                acceptedTypes={['.xlsx', '.xls', '.csv']}
                maxSize={10 * 1024 * 1024} // 10MB
                single={true}
              />
              <p className="text-sm text-gray-500 mt-1">
                Upload a file containing attendance data for multiple dates
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="font-medium text-blue-900 mb-2">Bulk Upload Format</h4>
              <p className="text-sm text-blue-700">
                The file should contain columns: Date, Trainee ID/Name, Status (Present/Absent), Time In, Time Out
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setBulkModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !bulkForm.file}>
                {loading ? 'Processing...' : 'Upload'}
              </Button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* View Details Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Upload Details</h2>
          {selectedUpload && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedUpload.status)}
                    {getStatusBadge(selectedUpload.status)}
                  </div>
                </div>
                <div>
                  <Label>Type</Label>
                  <p className="text-sm text-gray-600">
                    {uploadTypes.find(t => t.value === selectedUpload.type)?.label}
                  </p>
                </div>
                <div>
                  <Label>Date</Label>
                  <p className="text-sm text-gray-600">{selectedUpload.date}</p>
                </div>
                <div>
                  <Label>Uploaded</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedUpload.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label>File Name</Label>
                  <p className="text-sm text-gray-600">{selectedUpload.filename}</p>
                </div>
                <div>
                  <Label>Records Processed</Label>
                  <p className="text-sm text-gray-600">{selectedUpload.recordsProcessed || 0}</p>
                </div>
              </div>
              {selectedUpload.description && (
                <div>
                  <Label>Description</Label>
                  <p className="text-sm text-gray-600">{selectedUpload.description}</p>
                </div>
              )}
              {selectedUpload.errorMessage && (
                <div>
                  <Label>Error Message</Label>
                  <div className="bg-red-50 p-3 rounded-md">
                    <p className="text-sm text-red-700">{selectedUpload.errorMessage}</p>
                  </div>
                </div>
              )}
              {selectedUpload.warnings && selectedUpload.warnings.length > 0 && (
                <div>
                  <Label>Warnings</Label>
                  <div className="bg-yellow-50 p-3 rounded-md space-y-1">
                    {selectedUpload.warnings.map((warning, index) => (
                      <p key={index} className="text-sm text-yellow-700">{warning}</p>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end">
                <Button onClick={() => setShowViewModal(false)}>
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

export default AttendanceUpload;
