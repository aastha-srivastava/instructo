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
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Search, 
  Filter, 
  Folder,
  Calendar,
  User,
  Share2,
  Trash2,
  Edit3,
  Plus
} from 'lucide-react';

const DocumentsPage = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [folders, setFolders] = useState([]);
  const [trainees, setTrainees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Form states
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    type: 'material',
    folderId: '',
    visibility: 'public',
    files: []
  });
  const [folderForm, setFolderForm] = useState({
    name: '',
    description: '',
    color: '#000000'
  });
  const [shareForm, setShareForm] = useState({
    traineeIds: [],
    message: '',
    expiryDate: ''
  });

  const documentTypes = [
    { value: 'material', label: 'Training Material' },
    { value: 'assignment', label: 'Assignment' },
    { value: 'resource', label: 'Resource' },
    { value: 'template', label: 'Template' },
    { value: 'guide', label: 'Guide' },
    { value: 'other', label: 'Other' }
  ];

  const visibilityOptions = [
    { value: 'public', label: 'All Trainees' },
    { value: 'private', label: 'Private' },
    { value: 'selected', label: 'Selected Trainees' }
  ];

  useEffect(() => {
    fetchDocuments();
    fetchFolders();
    fetchTrainees();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/instructor/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await api.get('/instructor/folders');
      setFolders(response.data);
    } catch (error) {
      console.error('Error fetching folders:', error);
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
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('type', uploadForm.type);
      formData.append('folderId', uploadForm.folderId);
      formData.append('visibility', uploadForm.visibility);
      
      uploadForm.files.forEach((file, index) => {
        formData.append(`files`, file);
      });

      await api.post('/instructor/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setShowUploadModal(false);
      setUploadForm({
        title: '',
        description: '',
        type: 'material',
        folderId: '',
        visibility: 'public',
        files: []
      });
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.post('/instructor/folders', folderForm);
      setShowFolderModal(false);
      setFolderForm({ name: '', description: '', color: '#000000' });
      fetchFolders();
    } catch (error) {
      console.error('Error creating folder:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.post(`/instructor/documents/${selectedDocument.id}/share`, shareForm);
      setShowShareModal(false);
      setShareForm({ traineeIds: [], message: '', expiryDate: '' });
      setSelectedDocument(null);
    } catch (error) {
      console.error('Error sharing document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    
    setLoading(true);
    try {
      await api.delete(`/instructor/documents/${documentId}`);
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (document) => {
    try {
      const response = await api.get(`/instructor/documents/${document.id}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const handlePreview = (document) => {
    setSelectedDocument(document);
    setShowPreviewModal(true);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFolder = selectedFolder === 'all' || doc.folderId === selectedFolder;
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'recent' && new Date(doc.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
                      (activeTab === 'shared' && doc.visibility !== 'private');
    
    return matchesSearch && matchesFolder && matchesType && matchesTab;
  });

  const documentColumns = [
    {
      key: 'title',
      header: 'Document',
      render: (document) => (
        <div className="flex items-center space-x-3">
          <FileText className="h-5 w-5 text-gray-500" />
          <div>
            <div className="font-medium text-gray-900">{document.title}</div>
            <div className="text-sm text-gray-500">{document.filename}</div>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (document) => (
        <Badge variant="outline">
          {documentTypes.find(t => t.value === document.type)?.label || document.type}
        </Badge>
      )
    },
    {
      key: 'folder',
      header: 'Folder',
      render: (document) => {
        const folder = folders.find(f => f.id === document.folderId);
        return folder ? (
          <div className="flex items-center space-x-2">
            <Folder className="h-4 w-4" style={{ color: folder.color }} />
            <span>{folder.name}</span>
          </div>
        ) : '-';
      }
    },
    {
      key: 'visibility',
      header: 'Visibility',
      render: (document) => (
        <Badge variant={document.visibility === 'public' ? 'default' : 'secondary'}>
          {document.visibility === 'public' ? 'Public' : 
           document.visibility === 'private' ? 'Private' : 'Selected'}
        </Badge>
      )
    },
    {
      key: 'size',
      header: 'Size',
      render: (document) => formatFileSize(document.size)
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (document) => new Date(document.createdAt).toLocaleDateString()
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (document) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePreview(document)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDownload(document)}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedDocument(document);
              setShowShareModal(true);
            }}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(document.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading && documents.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Manage training materials and resources</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setShowFolderModal(true)}
            variant="outline"
          >
            <Folder className="h-4 w-4 mr-2" />
            New Folder
          </Button>
          <Button onClick={() => setShowUploadModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Documents
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Documents</p>
              <p className="text-2xl font-bold">{documents.length}</p>
            </div>
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Folders</p>
              <p className="text-2xl font-bold">{folders.length}</p>
            </div>
            <Folder className="h-8 w-8 text-gray-400" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Shared</p>
              <p className="text-2xl font-bold">
                {documents.filter(d => d.visibility !== 'private').length}
              </p>
            </div>
            <Share2 className="h-8 w-8 text-gray-400" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Storage Used</p>
              <p className="text-2xl font-bold">
                {formatFileSize(documents.reduce((acc, doc) => acc + doc.size, 0))}
              </p>
            </div>
            <Upload className="h-8 w-8 text-gray-400" />
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
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select
              value={selectedFolder}
              onChange={(value) => setSelectedFolder(value)}
            >
              <option value="all">All Folders</option>
              {folders.map(folder => (
                <option key={folder.id} value={folder.id}>{folder.name}</option>
              ))}
            </Select>
            <Select
              value={selectedType}
              onChange={(value) => setSelectedType(value)}
            >
              <option value="all">All Types</option>
              {documentTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* Documents Table with Tabs */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="all">All Documents</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="shared">Shared</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-4">
            <DataTable
              data={filteredDocuments}
              columns={documentColumns}
              searchable={false}
              loading={loading}
            />
          </TabsContent>
        </Tabs>
      </Card>

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Upload Documents</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={uploadForm.title}
                onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={uploadForm.description}
                onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={uploadForm.type}
                  onChange={(value) => setUploadForm(prev => ({ ...prev, type: value }))}
                >
                  {documentTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="folder">Folder</Label>
                <Select
                  value={uploadForm.folderId}
                  onChange={(value) => setUploadForm(prev => ({ ...prev, folderId: value }))}
                >
                  <option value="">No Folder</option>
                  {folders.map(folder => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                  ))}
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={uploadForm.visibility}
                onChange={(value) => setUploadForm(prev => ({ ...prev, visibility: value }))}
              >
                {visibilityOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Files</Label>
              <FileUpload
                onFilesSelected={(files) => setUploadForm(prev => ({ ...prev, files }))}
                multiple={true}
                acceptedTypes={['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt', '.jpg', '.png']}
                maxSize={10 * 1024 * 1024} // 10MB
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowUploadModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || uploadForm.files.length === 0}>
                {loading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Create Folder Modal */}
      <Dialog open={showFolderModal} onOpenChange={setShowFolderModal}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Create Folder</h2>
          <form onSubmit={handleCreateFolder} className="space-y-4">
            <div>
              <Label htmlFor="folderName">Name</Label>
              <Input
                id="folderName"
                value={folderForm.name}
                onChange={(e) => setFolderForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="folderDescription">Description</Label>
              <Input
                id="folderDescription"
                value={folderForm.description}
                onChange={(e) => setFolderForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="folderColor">Color</Label>
              <input
                type="color"
                id="folderColor"
                value={folderForm.color}
                onChange={(e) => setFolderForm(prev => ({ ...prev, color: e.target.value }))}
                className="w-full h-10 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFolderModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Folder'}
              </Button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Share Document</h2>
          {selectedDocument && (
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="font-medium">{selectedDocument.title}</p>
              <p className="text-sm text-gray-600">{selectedDocument.filename}</p>
            </div>
          )}
          <form onSubmit={handleShare} className="space-y-4">
            <div>
              <Label>Select Trainees</Label>
              <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                {trainees.map(trainee => (
                  <label key={trainee.id} className="flex items-center space-x-2 p-1">
                    <input
                      type="checkbox"
                      checked={shareForm.traineeIds.includes(trainee.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setShareForm(prev => ({
                            ...prev,
                            traineeIds: [...prev.traineeIds, trainee.id]
                          }));
                        } else {
                          setShareForm(prev => ({
                            ...prev,
                            traineeIds: prev.traineeIds.filter(id => id !== trainee.id)
                          }));
                        }
                      }}
                    />
                    <span>{trainee.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="shareMessage">Message (Optional)</Label>
              <Input
                id="shareMessage"
                value={shareForm.message}
                onChange={(e) => setShareForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Add a message..."
              />
            </div>
            <div>
              <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
              <Input
                id="expiryDate"
                type="date"
                value={shareForm.expiryDate}
                onChange={(e) => setShareForm(prev => ({ ...prev, expiryDate: e.target.value }))}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowShareModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || shareForm.traineeIds.length === 0}>
                {loading ? 'Sharing...' : 'Share'}
              </Button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <div className="p-6 max-w-4xl w-full">
          <h2 className="text-lg font-semibold mb-4">Document Preview</h2>
          {selectedDocument && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{selectedDocument.title}</h3>
                  <p className="text-sm text-gray-600">{selectedDocument.filename}</p>
                </div>
                <Button onClick={() => handleDownload(selectedDocument)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              <div className="border border-gray-300 rounded-md p-4 min-h-96 bg-gray-50 flex items-center justify-center">
                {selectedDocument.type === 'image' ? (
                  <img 
                    src={`/api/instructor/documents/${selectedDocument.id}/preview`}
                    alt={selectedDocument.title}
                    className="max-w-full max-h-96 object-contain"
                  />
                ) : selectedDocument.type === 'pdf' ? (
                  <iframe
                    src={`/api/instructor/documents/${selectedDocument.id}/preview`}
                    className="w-full h-96"
                    title={selectedDocument.title}
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    <FileText className="h-16 w-16 mx-auto mb-4" />
                    <p>Preview not available for this file type</p>
                    <p className="text-sm">Click download to view the file</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default DocumentsPage;
