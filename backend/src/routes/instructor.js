const express = require('express');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');
const { 
  Instructor, 
  Trainee, 
  Project, 
  ProjectProgress, 
  Document, 
  Notification, 
  ProgressReview,
  Admin 
} = require('../models');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { uploadProjectCompletion, uploadSingleDocument } = require('../middleware/upload');
const { 
  traineeSchemas, 
  projectSchemas, 
  progressSchemas, 
  instructorSchemas,
  validate 
} = require('../utils/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendProjectCompletionEmail } = require('../utils/emailUtils');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(requireRole(['instructor']));

// Get instructor dashboard statistics
router.get('/dashboard', asyncHandler(async (req, res) => {
  const [
    totalTrainees,
    activeTrainees,
    completedTrainees,
    totalProjects,
    activeProjects,
    completedProjects,
    pendingApprovals
  ] = await Promise.all([
    Trainee.count({ where: { instructor_id: req.user.id } }),
    Trainee.count({ where: { instructor_id: req.user.id, status: 'active' } }),
    Trainee.count({ where: { instructor_id: req.user.id, status: 'completed' } }),
    Project.count({ 
      include: [{ model: Trainee, as: 'trainee', where: { instructor_id: req.user.id } }]
    }),
    Project.count({ 
      where: { status: { [Op.in]: ['assigned', 'in_progress'] } },
      include: [{ model: Trainee, as: 'trainee', where: { instructor_id: req.user.id } }]
    }),
    Project.count({ 
      where: { status: 'completed' },
      include: [{ model: Trainee, as: 'trainee', where: { instructor_id: req.user.id } }]
    }),
    Trainee.count({ where: { instructor_id: req.user.id, status: 'pending_approval' } })
  ]);

  // Get recent activities (notifications)
  const recentActivities = await Notification.findAll({
    where: {
      recipient_type: 'instructor',
      recipient_id: req.user.id
    },
    order: [['created_at', 'DESC']],
    limit: 10
  });

  // Get upcoming project deadlines
  const upcomingDeadlines = await Project.findAll({
    where: {
      due_date: {
        [Op.gte]: new Date(),
        [Op.lte]: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
      },
      status: { [Op.ne]: 'completed' }
    },
    include: [{ 
      model: Trainee, 
      as: 'trainee', 
      where: { instructor_id: req.user.id },
      attributes: ['id', 'name']
    }],
    order: [['due_date', 'ASC']],
    limit: 5
  });

  res.json({
    success: true,
    data: {
      overview: {
        totalTrainees,
        activeTrainees,
        completedTrainees,
        totalProjects,
        activeProjects,
        completedProjects,
        pendingApprovals
      },
      recentActivities,
      upcomingDeadlines
    }
  });
}));

// Get instructor's trainees
router.get('/trainees', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, search } = req.query;
  const offset = (page - 1) * limit;

  const whereClause = { instructor_id: req.user.id };
  if (status) {
    whereClause.status = status;
  }
  if (search) {
    whereClause[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { institution_name: { [Op.like]: `%${search}%` } }
    ];
  }

  const { rows: trainees, count } = await Trainee.findAndCountAll({
    where: whereClause,
    include: [
      { 
        model: Project, 
        as: 'projects',
        attributes: ['id', 'project_name', 'status', 'start_date', 'end_date', 'performance_rating']
      }
    ],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    success: true,
    data: {
      trainees,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        total: count,
        hasNext: count > offset + parseInt(limit),
        hasPrev: page > 1
      }
    }
  });
}));

// Create new trainee
router.post('/trainees', validate(traineeSchemas.create), asyncHandler(async (req, res) => {
  const traineeData = {
    ...req.body,
    instructor_id: req.user.id,
    status: 'pending_approval'
  };

  const trainee = await Trainee.create(traineeData);

  // Create notification for all admins
  const admins = await Admin.findAll({ attributes: ['id'] });
  const notifications = admins.map(admin => ({
    recipient_id: admin.id,
    recipient_type: 'admin',
    sender_id: req.user.id,
    sender_type: 'instructor',
    message: `New trainee "${trainee.name}" created by ${req.user.name} requires approval`,
    type: 'trainee_created'
  }));

  await Notification.bulkCreate(notifications);

  res.status(201).json({
    success: true,
    message: 'Trainee created successfully and sent for approval',
    data: trainee
  });
}));

// Update trainee
router.put('/trainees/:id', validate(traineeSchemas.update), asyncHandler(async (req, res) => {
  const trainee = await Trainee.findOne({
    where: { 
      id: req.params.id,
      instructor_id: req.user.id
    }
  });

  if (!trainee) {
    return res.status(404).json({
      success: false,
      message: 'Trainee not found'
    });
  }

  if (trainee.status === 'approved' || trainee.status === 'rejected') {
    return res.status(400).json({
      success: false,
      message: 'Cannot update trainee after approval/rejection'
    });
  }

  await trainee.update(req.body);

  res.json({
    success: true,
    message: 'Trainee updated successfully',
    data: trainee
  });
}));

// Get trainee details
router.get('/trainees/:id', asyncHandler(async (req, res) => {
  const trainee = await Trainee.findOne({
    where: { 
      id: req.params.id,
      instructor_id: req.user.id
    },
    include: [
      { 
        model: Project, 
        as: 'projects',
        include: [
          { model: ProjectProgress, as: 'progress', order: [['date', 'DESC']] },
          { model: Document, as: 'documents' }
        ]
      },
      { model: Document, as: 'documents' }
    ]
  });

  if (!trainee) {
    return res.status(404).json({
      success: false,
      message: 'Trainee not found'
    });
  }

  res.json({
    success: true,
    data: trainee
  });
}));

// Get instructor's projects
router.get('/projects', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, trainee_id } = req.query;
  const offset = (page - 1) * limit;

  const whereClause = {};
  if (status) {
    whereClause.status = status;
  }

  const includeClause = {
    model: Trainee,
    as: 'trainee',
    where: { instructor_id: req.user.id },
    attributes: ['id', 'name', 'institution_name']
  };

  if (trainee_id) {
    includeClause.where.id = trainee_id;
  }

  const { rows: projects, count } = await Project.findAndCountAll({
    where: whereClause,
    include: [includeClause],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    success: true,
    data: {
      projects,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        total: count,
        hasNext: count > offset + parseInt(limit),
        hasPrev: page > 1
      }
    }
  });
}));

// Create new project
router.post('/projects', validate(projectSchemas.create), asyncHandler(async (req, res) => {
  // Verify trainee belongs to instructor
  const trainee = await Trainee.findOne({
    where: { 
      id: req.body.trainee_id,
      instructor_id: req.user.id,
      status: 'approved'
    }
  });

  if (!trainee) {
    return res.status(404).json({
      success: false,
      message: 'Trainee not found or not approved'
    });
  }

  const project = await Project.create({
    ...req.body,
    start_date: new Date() // Auto-set start date when project is created
  });

  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: project
  });
}));

// Update project
router.put('/projects/:id', validate(projectSchemas.update), asyncHandler(async (req, res) => {
  const project = await Project.findOne({
    where: { id: req.params.id },
    include: [{ 
      model: Trainee, 
      as: 'trainee', 
      where: { instructor_id: req.user.id } 
    }]
  });

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  if (project.status === 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Cannot update completed project'
    });
  }

  await project.update(req.body);

  res.json({
    success: true,
    message: 'Project updated successfully',
    data: project
  });
}));

// Complete project with mandatory uploads
router.put('/projects/:id/complete', uploadProjectCompletion, asyncHandler(async (req, res) => {
  const project = await Project.findOne({
    where: { id: req.params.id },
    include: [{ 
      model: Trainee, 
      as: 'trainee', 
      where: { instructor_id: req.user.id },
      include: [{ model: Instructor, as: 'instructor', attributes: ['name', 'email'] }]
    }]
  });

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  if (project.status === 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Project is already completed'
    });
  }

  // Validate required uploads
  if (!req.files || !req.files.project_report || !req.files.attendance_document) {
    return res.status(400).json({
      success: false,
      message: 'Both project report and attendance document are required'
    });
  }

  // Validate performance rating
  const { performance_rating } = req.body;
  if (!performance_rating || performance_rating < 1 || performance_rating > 10) {
    return res.status(400).json({
      success: false,
      message: 'Performance rating (1-10) is required'
    });
  }

  const projectReportPath = req.files.project_report[0].path;
  const attendanceDocumentPath = req.files.attendance_document[0].path;

  // Update project
  await project.update({
    status: 'completed',
    end_date: new Date(),
    performance_rating: parseInt(performance_rating),
    project_report_path: projectReportPath,
    attendance_document_path: attendanceDocumentPath
  });

  // Create document records
  await Document.bulkCreate([
    {
      trainee_id: project.trainee_id,
      project_id: project.id,
      document_name: req.files.project_report[0].originalname,
      document_type: 'project_report',
      file_path: projectReportPath,
      uploaded_by: req.user.id
    },
    {
      trainee_id: project.trainee_id,
      project_id: project.id,
      document_name: req.files.attendance_document[0].originalname,
      document_type: 'attendance_record',
      file_path: attendanceDocumentPath,
      uploaded_by: req.user.id
    }
  ]);

  // Calculate project duration
  const startDate = new Date(project.start_date);
  const endDate = new Date();
  const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + ' days';

  // Send email to departments
  await sendProjectCompletionEmail(
    project.trainee,
    { ...project.toJSON(), duration },
    {
      project_report: projectReportPath,
      attendance_document: attendanceDocumentPath
    }
  );

  res.json({
    success: true,
    message: 'Project completed successfully and notifications sent',
    data: project
  });
}));

// Get project details
router.get('/projects/:id', asyncHandler(async (req, res) => {
  const project = await Project.findOne({
    where: { id: req.params.id },
    include: [
      { 
        model: Trainee, 
        as: 'trainee', 
        where: { instructor_id: req.user.id },
        attributes: ['id', 'name', 'institution_name', 'mobile']
      },
      { 
        model: ProjectProgress, 
        as: 'progress',
        order: [['date', 'DESC']]
      },
      { model: Document, as: 'documents' }
    ]
  });

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  res.json({
    success: true,
    data: project
  });
}));

// Update project progress
router.post('/progress', validate(progressSchemas.create), asyncHandler(async (req, res) => {
  // Verify project belongs to instructor
  const project = await Project.findOne({
    where: { id: req.body.project_id },
    include: [{ 
      model: Trainee, 
      as: 'trainee', 
      where: { instructor_id: req.user.id } 
    }]
  });

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  const progress = await ProjectProgress.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Progress updated successfully',
    data: progress
  });
}));

// Upload document
router.post('/documents/upload', uploadSingleDocument, asyncHandler(async (req, res) => {
  const { trainee_id, project_id, document_type = 'other' } = req.body;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  // Verify trainee belongs to instructor
  const trainee = await Trainee.findOne({
    where: { 
      id: trainee_id,
      instructor_id: req.user.id
    }
  });

  if (!trainee) {
    return res.status(404).json({
      success: false,
      message: 'Trainee not found'
    });
  }

  const document = await Document.create({
    trainee_id,
    project_id: project_id || null,
    document_name: req.file.originalname,
    document_type,
    file_path: req.file.path,
    uploaded_by: req.user.id
  });

  res.status(201).json({
    success: true,
    message: 'Document uploaded successfully',
    data: document
  });
}));

// Get documents
router.get('/documents', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, trainee_id, document_type } = req.query;
  const offset = (page - 1) * limit;

  const whereClause = { uploaded_by: req.user.id };
  if (document_type) {
    whereClause.document_type = document_type;
  }

  const includeClause = [
    { 
      model: Trainee, 
      as: 'trainee', 
      where: { instructor_id: req.user.id },
      attributes: ['id', 'name', 'institution_name']
    },
    { 
      model: Project, 
      as: 'project', 
      attributes: ['id', 'project_name'],
      required: false
    }
  ];

  if (trainee_id) {
    includeClause[0].where.id = trainee_id;
  }

  const { rows: documents, count } = await Document.findAndCountAll({
    where: whereClause,
    include: includeClause,
    order: [['uploaded_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    success: true,
    data: {
      documents,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        total: count,
        hasNext: count > offset + parseInt(limit),
        hasPrev: page > 1
      }
    }
  });
}));

// Upload attendance for specific trainee/project
router.post('/attendance/upload', uploadSingleDocument, asyncHandler(async (req, res) => {
  const { trainee_id, project_id } = req.body;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No attendance document uploaded'
    });
  }

  // Verify trainee belongs to instructor
  const trainee = await Trainee.findOne({
    where: { 
      id: trainee_id,
      instructor_id: req.user.id
    }
  });

  if (!trainee) {
    return res.status(404).json({
      success: false,
      message: 'Trainee not found'
    });
  }

  // Verify project if provided
  if (project_id) {
    const project = await Project.findOne({
      where: { 
        id: project_id,
        trainee_id: trainee_id
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found for this trainee'
      });
    }
  }

  const document = await Document.create({
    trainee_id,
    project_id: project_id || null,
    document_name: req.file.originalname,
    document_type: 'attendance_record',
    file_path: req.file.path,
    uploaded_by: req.user.id
  });

  res.status(201).json({
    success: true,
    message: 'Attendance document uploaded successfully',
    data: document
  });
}));

// Get monthly upload status for all trainees
router.get('/monthly-status', asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const currentDate = new Date();
  const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
  const targetYear = year ? parseInt(year) : currentDate.getFullYear();

  const startOfMonth = new Date(targetYear, targetMonth, 1);
  const endOfMonth = new Date(targetYear, targetMonth + 1, 0);

  const trainees = await Trainee.findAll({
    where: { 
      instructor_id: req.user.id,
      status: { [Op.in]: ['approved', 'active'] }
    },
    include: [
      {
        model: Document,
        as: 'documents',
        where: {
          document_type: 'attendance_record',
          uploaded_at: {
            [Op.between]: [startOfMonth, endOfMonth]
          }
        },
        required: false
      },
      {
        model: Project,
        as: 'projects',
        where: {
          status: { [Op.in]: ['assigned', 'in_progress', 'completed'] }
        },
        required: false
      }
    ]
  });

  const monthlyStatus = trainees.map(trainee => ({
    trainee_id: trainee.id,
    trainee_name: trainee.name,
    institution_name: trainee.institution_name,
    has_attendance_upload: trainee.documents.length > 0,
    active_projects: trainee.projects.filter(p => p.status !== 'completed').length,
    completed_projects: trainee.projects.filter(p => p.status === 'completed').length
  }));

  res.json({
    success: true,
    data: {
      month: targetMonth + 1,
      year: targetYear,
      trainees: monthlyStatus
    }
  });
}));

// Share progress with admin
router.post('/share-progress', asyncHandler(async (req, res) => {
  const { trainee_id } = req.body;

  // Verify trainee belongs to instructor
  const trainee = await Trainee.findOne({
    where: { 
      id: trainee_id,
      instructor_id: req.user.id
    }
  });

  if (!trainee) {
    return res.status(404).json({
      success: false,
      message: 'Trainee not found'
    });
  }

  // Create progress review record
  const progressReview = await ProgressReview.create({
    trainee_id,
    shared_by: req.user.id,
    status: 'in_review'
  });

  // Create notifications for all admins
  const admins = await Admin.findAll({ attributes: ['id'] });
  const notifications = admins.map(admin => ({
    recipient_id: admin.id,
    recipient_type: 'admin',
    sender_id: req.user.id,
    sender_type: 'instructor',
    message: `Progress shared for trainee "${trainee.name}" by ${req.user.name}`,
    type: 'progress_shared'
  }));

  await Notification.bulkCreate(notifications);

  res.json({
    success: true,
    message: 'Progress shared with admin successfully',
    data: progressReview
  });
}));

// Get instructor profile
router.get('/profile', (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
});

// Update instructor profile
router.put('/profile', validate(instructorSchemas.update), asyncHandler(async (req, res) => {
  await req.user.update(req.body);
  
  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: req.user
  });
}));

// Change password
router.put('/change-password', validate(instructorSchemas.changePassword), asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const isCurrentPasswordValid = await req.user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  await req.user.update({ password: newPassword });

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

module.exports = router;
