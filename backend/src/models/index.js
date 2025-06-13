const Admin = require('./Admin');
const Instructor = require('./Instructor');
const Trainee = require('./Trainee');
const Project = require('./Project');
const ProjectProgress = require('./ProjectProgress');
const Document = require('./Document');
const Notification = require('./Notification');
const ProgressReview = require('./ProgressReview');

// Define associations

// Admin associations
Admin.hasMany(Instructor, { foreignKey: 'created_by', as: 'createdInstructors' });

// Instructor associations
Instructor.belongsTo(Admin, { foreignKey: 'created_by', as: 'creator' });
Instructor.hasMany(Trainee, { foreignKey: 'instructor_id', as: 'trainees' });
Instructor.hasMany(Document, { foreignKey: 'uploaded_by', as: 'uploadedDocuments' });
Instructor.hasMany(ProgressReview, { foreignKey: 'shared_by', as: 'sharedReviews' });

// Trainee associations
Trainee.belongsTo(Instructor, { foreignKey: 'instructor_id', as: 'instructor' });
Trainee.hasMany(Project, { foreignKey: 'trainee_id', as: 'projects' });
Trainee.hasMany(Document, { foreignKey: 'trainee_id', as: 'documents' });
Trainee.hasMany(ProgressReview, { foreignKey: 'trainee_id', as: 'progressReviews' });

// Project associations
Project.belongsTo(Trainee, { foreignKey: 'trainee_id', as: 'trainee' });
Project.hasMany(ProjectProgress, { foreignKey: 'project_id', as: 'progress' });
Project.hasMany(Document, { foreignKey: 'project_id', as: 'documents' });

// ProjectProgress associations
ProjectProgress.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// Document associations
Document.belongsTo(Trainee, { foreignKey: 'trainee_id', as: 'trainee' });
Document.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
Document.belongsTo(Instructor, { foreignKey: 'uploaded_by', as: 'uploader' });

// ProgressReview associations
ProgressReview.belongsTo(Trainee, { foreignKey: 'trainee_id', as: 'trainee' });
ProgressReview.belongsTo(Instructor, { foreignKey: 'shared_by', as: 'sharedBy' });
ProgressReview.belongsTo(Admin, { foreignKey: 'reviewed_by', as: 'reviewedBy' });

module.exports = {
  Admin,
  Instructor,
  Trainee,
  Project,
  ProjectProgress,
  Document,
  Notification,
  ProgressReview
};
