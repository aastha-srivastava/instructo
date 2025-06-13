import React, { useState } from 'react';
import { Plus, Calendar, Users, Clock, FileText, CheckCircle } from 'lucide-react';
import type { Project } from '../../types';

const ProjectManagement: React.FC = () => {
  const [projects] = useState<Project[]>([
    {
      id: 'proj1',
      title: 'E-commerce Web Application',
      description: 'Build a full-stack e-commerce platform with React and Node.js',
      dueDate: '2024-12-15',
      status: 'in-progress',
      assignedTo: ['1', '2'],
      createdDate: '2024-11-01',
      tasks: [
        { id: 'task1', title: 'Setup React project', description: 'Initialize and configure React app', completed: true, dueDate: '2024-11-05', assignedTo: '1' },
        { id: 'task2', title: 'Design database schema', description: 'Create database design for products and users', completed: true, dueDate: '2024-11-08', assignedTo: '2' },
        { id: 'task3', title: 'Implement authentication', description: 'Add user login and registration', completed: false, dueDate: '2024-11-20', assignedTo: '1' }
      ]
    },
    {
      id: 'proj2',
      title: 'Data Analysis Dashboard',
      description: 'Create interactive dashboard for sales data visualization',
      dueDate: '2024-12-20',
      status: 'not-started',
      assignedTo: ['3'],
      createdDate: '2024-11-10',
      tasks: []
    },
    {
      id: 'proj3',
      title: 'Mobile App UI Design',
      description: 'Design user interface for fitness tracking mobile application',
      dueDate: '2024-12-10',
      status: 'completed',
      assignedTo: ['4'],
      createdDate: '2024-10-15',
      tasks: [
        { id: 'task4', title: 'User research', description: 'Conduct user interviews and surveys', completed: true, dueDate: '2024-10-25', assignedTo: '4' },
        { id: 'task5', title: 'Wireframes', description: 'Create low-fidelity wireframes', completed: true, dueDate: '2024-11-01', assignedTo: '4' }
      ]
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'not-started': return 'bg-gray-100 text-gray-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
          <p className="text-gray-600">Create and manage training projects for your trainees</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project) => {
          const daysUntilDue = getDaysUntilDue(project.dueDate);
          const completedTasks = project.tasks.filter(task => task.completed).length;
          const totalTasks = project.tasks.length;
          const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

          return (
            <div
              key={project.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedProject(project)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{project.title}</h3>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                    {project.status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                  </div>
                  <span className={`font-medium ${daysUntilDue < 0 ? 'text-red-600' : daysUntilDue <= 7 ? 'text-amber-600' : 'text-green-600'}`}>
                    {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` : `${daysUntilDue} days left`}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{project.assignedTo.length} trainees assigned</span>
                </div>

                {totalTasks > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm text-gray-600">{completedTasks}/{totalTasks} tasks</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  Created {new Date(project.createdDate).toLocaleDateString()}
                </span>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedProject.title}</h2>
                  <span className={`inline-block px-3 py-1 mt-2 text-sm font-medium rounded-full ${getStatusColor(selectedProject.status)}`}>
                    {selectedProject.status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedProject.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Due Date</h4>
                    <p className="text-gray-600">{new Date(selectedProject.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Assigned Trainees</h4>
                    <p className="text-gray-600">{selectedProject.assignedTo.length} trainees</p>
                  </div>
                </div>

                {selectedProject.tasks.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Tasks</h3>
                    <div className="space-y-3">
                      {selectedProject.tasks.map((task) => (
                        <div key={task.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="mt-1">
                            {task.completed ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <Clock className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                              {task.title}
                            </h4>
                            <p className="text-sm text-gray-600">{task.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Project</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Title</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter project title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter project description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Trainees</label>
                    <select
                      multiple
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="1">Alex Chen</option>
                      <option value="2">Maria Garcia</option>
                      <option value="3">John Smith</option>
                      <option value="4">Sarah Johnson</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;