import React, { useState } from 'react';
import { Calendar, Users, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import type { AttendanceRecord } from '../../types';

const AttendanceTracker: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords] = useState<AttendanceRecord[]>([
    {
      id: '1',
      traineeId: '1',
      date: '2024-12-05',
      status: 'present',
      checkInTime: '09:15',
      notes: ''
    },
    {
      id: '2',
      traineeId: '2',
      date: '2024-12-05',
      status: 'late',
      checkInTime: '09:35',
      notes: 'Traffic delay'
    },
    {
      id: '3',
      traineeId: '3',
      date: '2024-12-05',
      status: 'absent',
      notes: 'Sick leave'
    },
    {
      id: '4',
      traineeId: '4',
      date: '2024-12-05',
      status: 'present',
      checkInTime: '08:55'
    }
  ]);

  const trainees = [
    { id: '1', name: 'Alex Chen', course: 'Full Stack Development' },
    { id: '2', name: 'Maria Garcia', course: 'Data Science' },
    { id: '3', name: 'John Smith', course: 'UI/UX Design' },
    { id: '4', name: 'Sarah Johnson', course: 'Mobile Development' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'late':
        return <Clock className="w-5 h-5 text-amber-600" />;
      default:
        return <XCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const todayRecords = attendanceRecords.filter(record => record.date === selectedDate);
  const presentCount = todayRecords.filter(record => record.status === 'present').length;
  const lateCount = todayRecords.filter(record => record.status === 'late').length;
  const absentCount = todayRecords.filter(record => record.status === 'absent').length;
  const attendanceRate = todayRecords.length > 0 ? ((presentCount + lateCount) / todayRecords.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Tracker</h1>
          <p className="text-gray-600">Track and manage trainee attendance</p>
        </div>
        <div className="flex space-x-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{todayRecords.length}</p>
              <p className="text-sm text-gray-600">Total Trainees</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{presentCount}</p>
              <p className="text-sm text-gray-600">Present</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{lateCount}</p>
              <p className="text-sm text-gray-600">Late</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-3 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{absentCount}</p>
              <p className="text-sm text-gray-600">Absent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Rate */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Attendance Rate</h3>
          <span className="text-2xl font-bold text-blue-600">{attendanceRate.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${attendanceRate}%` }}
          />
        </div>
      </div>

      {/* Attendance List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Attendance for {new Date(selectedDate).toLocaleDateString()}
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {trainees.map((trainee) => {
              const record = todayRecords.find(r => r.traineeId === trainee.id);
              const status = record?.status || 'not-recorded';
              
              return (
                <div key={trainee.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-600 p-2 rounded-full">
                      <span className="text-white font-semibold text-sm">
                        {trainee.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{trainee.name}</h4>
                      <p className="text-sm text-gray-600">{trainee.course}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {record?.checkInTime && (
                      <span className="text-sm text-gray-600">Check-in: {record.checkInTime}</span>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                        {status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
                        onClick={() => {/* Mark as present */}}
                      >
                        Present
                      </button>
                      <button
                        className="px-3 py-1 bg-amber-100 text-amber-700 rounded text-sm hover:bg-amber-200 transition-colors"
                        onClick={() => {/* Mark as late */}}
                      >
                        Late
                      </button>
                      <button
                        className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
                        onClick={() => {/* Mark as absent */}}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracker;