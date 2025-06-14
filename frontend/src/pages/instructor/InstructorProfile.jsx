import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  Shield,
  Key,
  Bell,
  Save,
  Edit3,
  Eye,
  EyeOff,
  Download,
  Upload,
  Clock,
  CheckCircle,
  Activity
} from 'lucide-react';

const InstructorProfile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [personalForm, setPersonalForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    emergencyContact: '',
    emergencyPhone: ''
  });

  const [professionalForm, setProfessionalForm] = useState({
    employeeId: '',
    department: '',
    designation: '',
    joinDate: '',
    qualification: '',
    experience: '',
    specialization: '',
    certifications: '',
    skills: '',
    bio: ''
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preferencesForm, setPreferencesForm] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    weeklyReports: true,
    monthlyReports: true,
    taskReminders: true,
    theme: 'light',
    language: 'en',
    timezone: 'UTC'
  });

  const [profileStats, setProfileStats] = useState({});
  const [activityLog, setActivityLog] = useState([]);

  useEffect(() => {
    fetchProfile();
    fetchProfileStats();
    fetchActivityLog();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/instructor/profile');
      const profile = response.data;
      
      setPersonalForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
        emergencyContact: profile.emergencyContact || '',
        emergencyPhone: profile.emergencyPhone || ''
      });

      setProfessionalForm({
        employeeId: profile.employeeId || '',
        department: profile.department || '',
        designation: profile.designation || '',
        joinDate: profile.joinDate ? profile.joinDate.split('T')[0] : '',
        qualification: profile.qualification || '',
        experience: profile.experience || '',
        specialization: profile.specialization || '',
        certifications: profile.certifications || '',
        skills: profile.skills || '',
        bio: profile.bio || ''
      });

      setPreferencesForm({
        emailNotifications: profile.emailNotifications ?? true,
        smsNotifications: profile.smsNotifications ?? false,
        pushNotifications: profile.pushNotifications ?? true,
        weeklyReports: profile.weeklyReports ?? true,
        monthlyReports: profile.monthlyReports ?? true,
        taskReminders: profile.taskReminders ?? true,
        theme: profile.theme || 'light',
        language: profile.language || 'en',
        timezone: profile.timezone || 'UTC'
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchProfileStats = async () => {
    try {
      const response = await api.get('/instructor/profile/stats');
      setProfileStats(response.data);
    } catch (error) {
      console.error('Error fetching profile stats:', error);
    }
  };

  const fetchActivityLog = async () => {
    try {
      const response = await api.get('/instructor/profile/activity');
      setActivityLog(response.data);
    } catch (error) {
      console.error('Error fetching activity log:', error);
    }
  };

  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.put('/instructor/profile/personal', personalForm);
      updateUser(response.data);
    } catch (error) {
      console.error('Error updating personal info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfessionalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.put('/instructor/profile/professional', professionalForm);
    } catch (error) {
      console.error('Error updating professional info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      await api.put('/instructor/profile/security', {
        currentPassword: securityForm.currentPassword,
        newPassword: securityForm.newPassword
      });
      
      setSecurityForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      alert('Password updated successfully');
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Error updating password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.put('/instructor/profile/preferences', preferencesForm);
    } catch (error) {
      console.error('Error updating preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await api.get('/instructor/profile/export', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'profile_data.json');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>
        <Button onClick={handleExportData} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Profile Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Trainees</p>
              <p className="text-2xl font-bold">{profileStats.activeTrainees || 0}</p>
            </div>
            <User className="h-8 w-8 text-gray-400" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Projects</p>
              <p className="text-2xl font-bold">{profileStats.completedProjects || 0}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-gray-400" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Documents Uploaded</p>
              <p className="text-2xl font-bold">{profileStats.documentsUploaded || 0}</p>
            </div>
            <Upload className="h-8 w-8 text-gray-400" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Years Experience</p>
              <p className="text-2xl font-bold">{professionalForm.experience || 0}</p>
            </div>
            <Briefcase className="h-8 w-8 text-gray-400" />
          </div>
        </Card>
      </div>

      {/* Profile Tabs */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="personal">Personal Information</TabsTrigger>
            <TabsTrigger value="professional">Professional Details</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="space-y-6">
            <form onSubmit={handlePersonalSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={personalForm.firstName}
                    onChange={(e) => setPersonalForm(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={personalForm.lastName}
                    onChange={(e) => setPersonalForm(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={personalForm.email}
                    onChange={(e) => setPersonalForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={personalForm.phone}
                    onChange={(e) => setPersonalForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={personalForm.dateOfBirth}
                    onChange={(e) => setPersonalForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    value={personalForm.emergencyContact}
                    onChange={(e) => setPersonalForm(prev => ({ ...prev, emergencyContact: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                  <Input
                    id="emergencyPhone"
                    value={personalForm.emergencyPhone}
                    onChange={(e) => setPersonalForm(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={personalForm.address}
                  onChange={(e) => setPersonalForm(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? <LoadingSpinner /> : <Save className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Professional Details Tab */}
          <TabsContent value="professional" className="space-y-6">
            <form onSubmit={handleProfessionalSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input
                    id="employeeId"
                    value={professionalForm.employeeId}
                    onChange={(e) => setProfessionalForm(prev => ({ ...prev, employeeId: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={professionalForm.department}
                    onChange={(e) => setProfessionalForm(prev => ({ ...prev, department: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    value={professionalForm.designation}
                    onChange={(e) => setProfessionalForm(prev => ({ ...prev, designation: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="joinDate">Join Date</Label>
                  <Input
                    id="joinDate"
                    type="date"
                    value={professionalForm.joinDate}
                    onChange={(e) => setProfessionalForm(prev => ({ ...prev, joinDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="qualification">Qualification</Label>
                  <Input
                    id="qualification"
                    value={professionalForm.qualification}
                    onChange={(e) => setProfessionalForm(prev => ({ ...prev, qualification: e.target.value }))}
                    placeholder="e.g., M.Tech, MBA, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Experience (Years)</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={professionalForm.experience}
                    onChange={(e) => setProfessionalForm(prev => ({ ...prev, experience: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  value={professionalForm.specialization}
                  onChange={(e) => setProfessionalForm(prev => ({ ...prev, specialization: e.target.value }))}
                  placeholder="e.g., Software Development, Data Science"
                />
              </div>
              <div>
                <Label htmlFor="certifications">Certifications</Label>
                <Textarea
                  id="certifications"
                  value={professionalForm.certifications}
                  onChange={(e) => setProfessionalForm(prev => ({ ...prev, certifications: e.target.value }))}
                  rows={3}
                  placeholder="List your certifications..."
                />
              </div>
              <div>
                <Label htmlFor="skills">Skills</Label>
                <Textarea
                  id="skills"
                  value={professionalForm.skills}
                  onChange={(e) => setProfessionalForm(prev => ({ ...prev, skills: e.target.value }))}
                  rows={3}
                  placeholder="List your technical and soft skills..."
                />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={professionalForm.bio}
                  onChange={(e) => setProfessionalForm(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  placeholder="Brief professional bio..."
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? <LoadingSpinner /> : <Save className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="space-y-6">
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Change Password</h3>
                <form onSubmit={handleSecuritySubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={securityForm.currentPassword}
                        onChange={(e) => setSecurityForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={securityForm.newPassword}
                        onChange={(e) => setSecurityForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={securityForm.confirmPassword}
                        onChange={(e) => setSecurityForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                      {loading ? <LoadingSpinner /> : <Key className="h-4 w-4 mr-2" />}
                      Update Password
                    </Button>
                  </div>
                </form>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-4">Security Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">Add an extra layer of security</p>
                    </div>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Login Notifications</p>
                      <p className="text-sm text-gray-600">Get notified of new login attempts</p>
                    </div>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <form onSubmit={handlePreferencesSubmit} className="space-y-6">
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive notifications via email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferencesForm.emailNotifications}
                      onChange={(e) => setPreferencesForm(prev => ({ 
                        ...prev, 
                        emailNotifications: e.target.checked 
                      }))}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferencesForm.smsNotifications}
                      onChange={(e) => setPreferencesForm(prev => ({ 
                        ...prev, 
                        smsNotifications: e.target.checked 
                      }))}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-gray-600">Receive browser notifications</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferencesForm.pushNotifications}
                      onChange={(e) => setPreferencesForm(prev => ({ 
                        ...prev, 
                        pushNotifications: e.target.checked 
                      }))}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-4">Reports</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Weekly Reports</p>
                      <p className="text-sm text-gray-600">Receive weekly summary reports</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferencesForm.weeklyReports}
                      onChange={(e) => setPreferencesForm(prev => ({ 
                        ...prev, 
                        weeklyReports: e.target.checked 
                      }))}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Monthly Reports</p>
                      <p className="text-sm text-gray-600">Receive monthly summary reports</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferencesForm.monthlyReports}
                      onChange={(e) => setPreferencesForm(prev => ({ 
                        ...prev, 
                        monthlyReports: e.target.checked 
                      }))}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-4">System Preferences</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select
                      id="language"
                      value={preferencesForm.language}
                      onChange={(value) => setPreferencesForm(prev => ({ ...prev, language: value }))}
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      id="timezone"
                      value={preferencesForm.timezone}
                      onChange={(value) => setPreferencesForm(prev => ({ ...prev, timezone: value }))}
                    >
                      <option value="UTC">UTC</option>
                      <option value="Asia/Kolkata">Asia/Kolkata</option>
                    </Select>
                  </div>
                </div>
              </Card>

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? <LoadingSpinner /> : <Save className="h-4 w-4 mr-2" />}
                  Save Preferences
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Activity Log Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Recent Activity</h3>
              {activityLog.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activityLog.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <Clock className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.description}</p>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(activity.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default InstructorProfile;
