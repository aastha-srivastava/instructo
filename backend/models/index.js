const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'admins',
      key: 'id',
    },
  },
}, {
  tableName: 'admins',
  indexes: [
    {
      unique: true,
      fields: ['email'],
    },
  ],
});

const Instructor = sequelize.define('Instructor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  specialization: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'admins',
      key: 'id',
    },
  },
}, {
  tableName: 'instructors',
  indexes: [
    {
      unique: true,
      fields: ['email'],
    },
  ],
});

const Trainee = sequelize.define('Trainee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },
  institution: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  course: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  year_of_study: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  emergency_contact: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },
  guardian_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  guardian_phone: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },
  guardian_relation: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  reference_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  reference_phone: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },
  reference_designation: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  joining_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  completion_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  instructor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'instructors',
      key: 'id',
    },
  },
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'admins',
      key: 'id',
    },
  },
  approval_comments: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'trainees',
  indexes: [
    {
      fields: ['status'],
    },
    {
      fields: ['instructor_id'],
    },
  ],
});

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  expected_duration_days: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('assigned', 'in_progress', 'completed'),
    defaultValue: 'assigned',
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  performance_rating: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: true,
    validate: {
      min: 1,
      max: 10,
    },
  },
  project_report_path: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  attendance_document_path: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  trainee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'trainees',
      key: 'id',
    },
  },
  instructor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'instructors',
      key: 'id',
    },
  },
  completion_email_sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'projects',
  indexes: [
    {
      fields: ['status'],
    },
    {
      fields: ['trainee_id'],
    },
    {
      fields: ['instructor_id'],
    },
  ],
});

const ProjectProgress = sequelize.define('ProjectProgress', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id',
    },
  },
  progress_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  progress_description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  percentage_completed: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 100,
    },
  },
  instructor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'instructors',
      key: 'id',
    },
  },
}, {
  tableName: 'project_progress',
});

const ProgressReview = sequelize.define('ProgressReview', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  trainee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'trainees',
      key: 'id',
    },
  },
  instructor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'instructors',
      key: 'id',
    },
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id',
    },
  },
  progress_summary: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_review', 'completed'),
    defaultValue: 'pending',
  },
  reviewed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'admins',
      key: 'id',
    },
  },
  review_comments: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  shared_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  reviewed_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'progress_reviews',
});

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  original_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  mime_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  document_type: {
    type: DataTypes.ENUM('project_report', 'attendance', 'monthly_attendance', 'other'),
    allowNull: false,
  },
  trainee_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'trainees',
      key: 'id',
    },
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'projects',
      key: 'id',
    },
  },
  instructor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'instructors',
      key: 'id',
    },
  },
  upload_month: {
    type: DataTypes.STRING(7), // YYYY-MM format
    allowNull: true,
  },
}, {
  tableName: 'documents',
  indexes: [
    {
      fields: ['document_type'],
    },
    {
      fields: ['trainee_id'],
    },
    {
      fields: ['project_id'],
    },
    {
      fields: ['upload_month'],
    },
  ],
});

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  type: {
    type: DataTypes.ENUM(
      'trainee_creation_request',
      'trainee_approved',
      'trainee_rejected',
      'progress_shared',
      'progress_reviewed',
      'monthly_upload_reminder',
      'project_completion',
      'system_announcement'
    ),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  recipient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  recipient_type: {
    type: DataTypes.ENUM('admin', 'instructor'),
    allowNull: false,
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  related_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  related_type: {
    type: DataTypes.ENUM('trainee', 'project', 'progress_review'),
    allowNull: true,
  },
}, {
  tableName: 'notifications',
  indexes: [
    {
      fields: ['recipient_id', 'recipient_type'],
    },
    {
      fields: ['is_read'],
    },
  ],
});

const OTP = sequelize.define('OTP', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  otp_code: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  user_type: {
    type: DataTypes.ENUM('admin', 'instructor'),
    allowNull: false,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  is_used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'otps',
  indexes: [
    {
      fields: ['email', 'user_type'],
    },
    {
      fields: ['expires_at'],
    },
  ],
});

// Define Associations
Admin.hasMany(Admin, { foreignKey: 'created_by', as: 'CreatedAdmins' });
Admin.belongsTo(Admin, { foreignKey: 'created_by', as: 'Creator' });

Admin.hasMany(Instructor, { foreignKey: 'created_by' });
Instructor.belongsTo(Admin, { foreignKey: 'created_by', as: 'CreatedBy' });

Admin.hasMany(Trainee, { foreignKey: 'approved_by' });
Trainee.belongsTo(Admin, { foreignKey: 'approved_by', as: 'ApprovedBy' });

Instructor.hasMany(Trainee, { foreignKey: 'instructor_id' });
Trainee.belongsTo(Instructor, { foreignKey: 'instructor_id', as: 'Instructor' });

Trainee.hasMany(Project, { foreignKey: 'trainee_id' });
Project.belongsTo(Trainee, { foreignKey: 'trainee_id', as: 'Trainee' });

Instructor.hasMany(Project, { foreignKey: 'instructor_id' });
Project.belongsTo(Instructor, { foreignKey: 'instructor_id', as: 'Instructor' });

Project.hasMany(ProjectProgress, { foreignKey: 'project_id' });
ProjectProgress.belongsTo(Project, { foreignKey: 'project_id', as: 'Project' });

Instructor.hasMany(ProjectProgress, { foreignKey: 'instructor_id' });
ProjectProgress.belongsTo(Instructor, { foreignKey: 'instructor_id', as: 'Instructor' });

Trainee.hasMany(ProgressReview, { foreignKey: 'trainee_id' });
ProgressReview.belongsTo(Trainee, { foreignKey: 'trainee_id', as: 'Trainee' });

Instructor.hasMany(ProgressReview, { foreignKey: 'instructor_id' });
ProgressReview.belongsTo(Instructor, { foreignKey: 'instructor_id', as: 'Instructor' });

Project.hasMany(ProgressReview, { foreignKey: 'project_id' });
ProgressReview.belongsTo(Project, { foreignKey: 'project_id', as: 'Project' });

Admin.hasMany(ProgressReview, { foreignKey: 'reviewed_by' });
ProgressReview.belongsTo(Admin, { foreignKey: 'reviewed_by', as: 'ReviewedBy' });

Trainee.hasMany(Document, { foreignKey: 'trainee_id' });
Document.belongsTo(Trainee, { foreignKey: 'trainee_id', as: 'Trainee' });

Project.hasMany(Document, { foreignKey: 'project_id' });
Document.belongsTo(Project, { foreignKey: 'project_id', as: 'Project' });

Instructor.hasMany(Document, { foreignKey: 'instructor_id' });
Document.belongsTo(Instructor, { foreignKey: 'instructor_id', as: 'Instructor' });

module.exports = {
  Admin,
  Instructor,
  Trainee,
  Project,
  ProjectProgress,
  ProgressReview,
  Document,
  Notification,
  OTP,
  sequelize,
};
