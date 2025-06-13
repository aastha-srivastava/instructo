import React, { useState } from 'react';
import { Upload, FileText, Download, Eye, Check, X, Clock } from 'lucide-react';
import type { ProjectReport } from '../../types';

const ReportManagement: React.FC = () => {
  const [reports] = useState<ProjectReport[]>([
    {
      id: '1',
      projectId: 'proj1',
      traineeId: '1',
      fileName: 'ecommerce-final-report.pdf',
      uploadDate: '2024-12-03',
      status: 'pending',
    },
    {
      id: '2',
      projectId: 'proj2',
      traineeId: '2',
      fileName: 'data-analysis-dashboard.pdf',
      uploadDate: '2024-12-02',
      status: 'reviewed',
      feedback: 'Good analysis but needs more detailed explanations on methodology.'
    },
    {
      id: '3',
      projectId: 'proj3',
      traineeId: '3',
      fileName: 'ui-design-portfolio.pdf',
      uploadDate: '2024-12-01',
      status: 'approved',
      feedback: 'Excellent work! Creative designs and well-documented process.'
    },
    {
      id: '4',
      projectId: 'proj1',
      traineeId: '4',
      fileName: 'mobile-app-prototype.pdf',
      uploadDate: '2024-11-30',
      status: 'rejected',
      feedback: 'Missing key functionality implementations. Please revise and resubmit.'
    }
  ]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ProjectReport | null>(null);

  const trainees = [
    { id: '1', name: 'Alex Chen' },
    { id: '2', name: 'Maria Garcia' },
    { id: '3', name: 'John Smith' },
    { id: '4', name: 'Sarah Johnson' }
  ];

  const projects = [
    { id: 'proj1', title: 'E-commerce Web Application' },
    { id: 'proj2', title: 'Data Analysis Dashboard' },
    { id: 'proj3', title: 'Mobile App UI Design' }
  ];

  const getTraineeName = (traineeId: string) => {
    return trainees.find(t => t.id === traineeId)?.name || 'Unknown';
  };

  const getProjectTitle = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.title || 'Unknown Project';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <X className="w-5 h-5 text-red-600" />;
      case 'reviewed':
        return <Eye className="w-5 h-5 text-blue-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingReports = reports.filter(r => r.status === 'pending').length;
  const approvedReports = reports.filter(r => r.status === 'approved').length;
  const rejectedReports = reports.filter(r => r.status === 'rejected').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report Management</h1>
          <p className="text-gray-600">Review and manage project reports from trainees</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Report</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingReports}</p>
              <p className="text-sm text-gray-600">Pending Review</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{approvedReports}</p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-3 rounded-lg">
              <X className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{rejectedReports}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
              <p className="text-sm text-gray-600">Total Reports</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {reports.map((report) => (
            <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{report.fileName}</h4>
                    <p className="text-sm text-gray-600">
                      {getTraineeName(report.traineeId)} • {getProjectTitle(report.projectId)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Uploaded on {new Date(report.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(report.status)}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                      {report.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                    {report.status === 'pending' && (
                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setShowReviewModal(true);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        Review
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {report.feedback && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Feedback:</span> {report.feedback}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Report</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trainee</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select trainee</option>
                    {trainees.map(trainee => (
                      <option key={trainee.id} value={trainee.id}>{trainee.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report File</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                    <input type="file" className="hidden" accept=".pdf,.doc,.docx" />
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Upload
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Review Report</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Trainee</p>
                    <p className="text-gray-900">{getTraineeName(selectedReport.traineeId)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Project</p>
                    <p className="text-gray-900">{getProjectTitle(selectedReport.projectId)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">File Name</p>
                  <p className="text-gray-900">{selectedReport.fileName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Feedback</label>
                  <textarea
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your feedback here..."
                    defaultValue={selectedReport.feedback}
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowReviewModal(false);
                      setSelectedReport(null);
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors">
                    Reject
                  </button>
                  <button className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportManagement;