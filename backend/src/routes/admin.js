const express = require('express');
const { Op } = require('sequelize');
const { 
  Admin, 
  Instructor, 
  Trainee, 
  Project,
  ProjectProgress,
  ProgressReview,
  Notification 
} = require('../models');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { 
  adminSchemas, 
  instructorSchemas, 
  traineeSchemas,
  validate 
} = require('../utils/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(requireRole(['admin']));

// Dashboard - Get admin dashboard statistics
router.get('/dashboard', asyncHandler(async (req, res) => {
  const [
    totalAdmins,
    totalInstructors,
    totalTrainees,
    pendingApprovals,
    activeTrainees,
    completedTrainees,
    totalProjects,
    completedProjects,
    pendingReviews
  ] = await Promise.all([
    Admin.count(),
    Instructor.count(),
    Trainee.count(),
    Trainee.count({ where: { status: 'pending_approval' } }),
    Trainee.count({ where: { status: 'active' } }),
    Trainee.count({ where: { status: 'completed' } }),
    Project.count(),
    Project.count({ where: { status: 'completed' } }),
    ProgressReview.count({ where: { status: 'in_review' } })
  ]);

  // Get recent activities (latest notifications)
  const recentActivities = await Notification.findAll({
    where: { recipient_id: req.user.id, recipient_type: 'admin' },
    limit: 10,
    order: [['created_at', 'DESC']]
  });

  // Get training completion rates by department
  const departmentStats = await Instructor.findAll({
    attributes: ['department'],
    include: [{
      model: Trainee,
      as: 'trainees',
      attributes: ['status']
    }]
  });

  const departmentWiseStats = {};
  departmentStats.forEach(instructor => {
    const dept = instructor.department;
    if (!departmentWiseStats[dept]) {
      departmentWiseStats[dept] = { total: 0, completed: 0 };
    }
    instructor.trainees.forEach(trainee => {
      departmentWiseStats[dept].total++;
      if (trainee.status === 'completed') {
        departmentWiseStats[dept].completed++;
      }
    });
  });

  res.json({
    success: true,
    data: {
      stats: {
        totalAdmins,
        totalInstructors,
        totalTrainees,
        pendingApprovals,
        activeTrainees,
        completedTrainees,
        totalProjects,
        completedProjects,
        pendingReviews
      },
      recentActivities,
      departmentWiseStats
    }
  });
}));

// Admins Management
// Get all admins
router.get('/admins', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, department } = req.query;
  const offset = (page - 1) * limit;

  const whereClause = {};
  if (search) {
    whereClause[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
      { title: { [Op.iLike]: `%${search}%` } }
    ];
  }

  const { rows: admins, count } = await Admin.findAndCountAll({
    where: whereClause,
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
    attributes: { exclude: ['password'] }
  });

  res.json({
    success: true,
    data: {
      admins,
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

// Create new admin
router.post('/admins', validate(adminSchemas.create), asyncHandler(async (req, res) => {
  const { name, email, password, phone, date_of_birth, title } = req.body;

  // Check if admin already exists
  const existingAdmin = await Admin.findOne({ where: { email } });
  if (existingAdmin) {
    return res.status(400).json({
      success: false,
      message: 'Admin with this email already exists'
    });
  }

  const admin = await Admin.create({
    name,
    email,
    password,
    phone,
    date_of_birth,
    title
  });

  res.status(201).json({
    success: true,
    message: 'Admin created successfully',
    data: admin.toJSON()
  });
}));

// Update admin
router.put('/admins/:id', validate(adminSchemas.update), asyncHandler(async (req, res) => {
  const { name, email, phone, date_of_birth, title } = req.body;
  const adminId = req.params.id;

  const admin = await Admin.findByPk(adminId);
  if (!admin) {
    return res.status(404).json({
      success: false,
      message: 'Admin not found'
    });
  }

  // Check if email is already taken by another admin
  if (email && email !== admin.email) {
    const existingAdmin = await Admin.findOne({ 
      where: { email, id: { [Op.ne]: adminId } } 
    });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Email is already taken'
      });
    }
  }

  await admin.update({ name, email, phone, date_of_birth, title });

  res.json({
    success: true,
    message: 'Admin updated successfully',
    data: admin.toJSON()
  });
}));

// Delete admin
router.delete('/admins/:id', asyncHandler(async (req, res) => {
  const adminId = req.params.id;

  // Prevent self-deletion
  if (parseInt(adminId) === req.user.id) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete your own account'
    });
  }

  const admin = await Admin.findByPk(adminId);
  if (!admin) {
    return res.status(404).json({
      success: false,
      message: 'Admin not found'
    });
  }

  // Check if admin has created any instructors
  const createdInstructors = await Instructor.count({ where: { created_by: adminId } });
  if (createdInstructors > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete admin who has created ${createdInstructors} instructor(s)`
    });
  }

  await admin.destroy();

  res.json({
    success: true,
    message: 'Admin deleted successfully'
  });
}));

// Instructors Management
// Get all instructors
router.get('/instructors', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, department, role } = req.query;
  const offset = (page - 1) * limit;

  const whereClause = {};
  if (search) {
    whereClause[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } }
    ];
  }
  if (department) {
    whereClause.department = { [Op.iLike]: `%${department}%` };
  }
  if (role) {
    whereClause.role = { [Op.iLike]: `%${role}%` };
  }

  const { rows: instructors, count } = await Instructor.findAndCountAll({
    where: whereClause,
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
    attributes: { exclude: ['password'] },
    include: [
      { 
        model: Admin, 
        as: 'creator', 
        attributes: ['name'] 
      },
      {
        model: Trainee,
        as: 'trainees',
        attributes: ['id', 'name', 'status']
      }
    ]
  });

  // Add trainee count to each instructor
  const instructorsWithCount = instructors.map(instructor => ({
    ...instructor.toJSON(),
    traineeCount: instructor.trainees.length
  }));

  res.json({
    success: true,
    data: {
      instructors: instructorsWithCount,
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

// Create new instructor
router.post('/instructors', validate(instructorSchemas.create), asyncHandler(async (req, res) => {
  const { name, email, password, phone, date_of_birth, department, role } = req.body;

  // Check if instructor already exists
  const existingInstructor = await Instructor.findOne({ where: { email } });
  if (existingInstructor) {
    return res.status(400).json({
      success: false,
      message: 'Instructor with this email already exists'
    });
  }

  const instructor = await Instructor.create({
    name,
    email,
    password,
    phone,
    date_of_birth,
    department,
    role,
    created_by: req.user.id
  });

  res.status(201).json({
    success: true,
    message: 'Instructor created successfully',
    data: instructor.toJSON()
  });
}));

// Update instructor
router.put('/instructors/:id', validate(instructorSchemas.update), asyncHandler(async (req, res) => {
  const { name, email, phone, date_of_birth, department, role } = req.body;
  const instructorId = req.params.id;

  const instructor = await Instructor.findByPk(instructorId);
  if (!instructor) {
    return res.status(404).json({
      success: false,
      message: 'Instructor not found'
    });
  }

  // Check if email is already taken by another instructor
  if (email && email !== instructor.email) {
    const existingInstructor = await Instructor.findOne({ 
      where: { email, id: { [Op.ne]: instructorId } } 
    });
    if (existingInstructor) {
      return res.status(400).json({
        success: false,
        message: 'Email is already taken'
      });
    }
  }

  await instructor.update({ name, email, phone, date_of_birth, department, role });

  res.json({
    success: true,
    message: 'Instructor updated successfully',
    data: instructor.toJSON()
  });
}));

// Get instructor details
router.get('/instructors/:id', asyncHandler(async (req, res) => {
  const instructor = await Instructor.findByPk(req.params.id, {
    attributes: { exclude: ['password'] },
    include: [
      { 
        model: Admin, 
        as: 'creator', 
        attributes: ['name', 'email'] 
      },
      {
        model: Trainee,
        as: 'trainees',
        include: [{
          model: Project,
          as: 'projects',
          attributes: ['id', 'project_name', 'status', 'start_date', 'end_date']
        }]
      }
    ]
  });

  if (!instructor) {
    return res.status(404).json({
      success: false,
      message: 'Instructor not found'
    });
  }

  res.json({
    success: true,
    data: instructor
  });
}));

// Trainees Management  
// Get pending approval trainees
router.get('/trainees/pending', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const { rows: trainees, count } = await Trainee.findAndCountAll({
    where: { status: 'pending_approval' },
    order: [['created_at', 'ASC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
    include: [{
      model: Instructor,
      as: 'instructor',
      attributes: ['name', 'email', 'department']
    }]
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

// Get all trainees
router.get('/trainees', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, status, instructor_id } = req.query;
  const offset = (page - 1) * limit;

  const whereClause = {};
  if (search) {
    whereClause[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { institution_name: { [Op.iLike]: `%${search}%` } }
    ];
  }
  if (status) {
    whereClause.status = status;
  }
  if (instructor_id) {
    whereClause.instructor_id = instructor_id;
  }

  const { rows: trainees, count } = await Trainee.findAndCountAll({
    where: whereClause,
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
    include: [{
      model: Instructor,
      as: 'instructor',
      attributes: ['name', 'email', 'department']
    }]
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

// Approve trainee
router.put('/trainees/:id/approve', asyncHandler(async (req, res) => {
  const { comments } = req.body;
  const traineeId = req.params.id;

  const trainee = await Trainee.findByPk(traineeId, {
    include: [{
      model: Instructor,
      as: 'instructor',
      attributes: ['name', 'email']
    }]
  });

  if (!trainee) {
    return res.status(404).json({
      success: false,
      message: 'Trainee not found'
    });
  }

  if (trainee.status !== 'pending_approval') {
    return res.status(400).json({
      success: false,
      message: 'Trainee is not pending approval'
    });
  }

  await trainee.update({ status: 'approved' });

  // Create notification for instructor
  await Notification.create({
    recipient_id: trainee.instructor_id,
    recipient_type: 'instructor',
    sender_id: req.user.id,
    sender_type: 'admin',
    message: `Trainee "${trainee.name}" has been approved${comments ? '. Comments: ' + comments : ''}`,
    type: 'general'
  });

  res.json({
    success: true,
    message: 'Trainee approved successfully',
    data: trainee.toJSON()
  });
}));

// Reject trainee
router.put('/trainees/:id/reject', asyncHandler(async (req, res) => {
  const { comments } = req.body;
  const traineeId = req.params.id;

  const trainee = await Trainee.findByPk(traineeId, {
    include: [{
      model: Instructor,
      as: 'instructor',
      attributes: ['name', 'email']
    }]
  });

  if (!trainee) {
    return res.status(404).json({
      success: false,
      message: 'Trainee not found'
    });
  }

  if (trainee.status !== 'pending_approval') {
    return res.status(400).json({
      success: false,
      message: 'Trainee is not pending approval'
    });
  }

  await trainee.update({ status: 'rejected' });

  // Create notification for instructor
  await Notification.create({
    recipient_id: trainee.instructor_id,
    recipient_type: 'instructor',
    sender_id: req.user.id,
    sender_type: 'admin',
    message: `Trainee "${trainee.name}" has been rejected${comments ? '. Reason: ' + comments : ''}`,
    type: 'general'
  });

  res.json({
    success: true,
    message: 'Trainee rejected successfully',
    data: trainee.toJSON()
  });
}));

// Get trainee details
router.get('/trainees/:id', asyncHandler(async (req, res) => {
  const trainee = await Trainee.findByPk(req.params.id, {
    include: [
      {
        model: Instructor,
        as: 'instructor',
        attributes: ['name', 'email', 'department', 'role']
      },
      {
        model: Project,
        as: 'projects',
        include: [{
          model: ProjectProgress,
          as: 'progress',
          order: [['date', 'DESC']]
        }]
      }
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

// Progress Reviews Management
// Get all progress reviews
router.get('/progress-reviews', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status = 'all' } = req.query;
  const offset = (page - 1) * limit;

  const whereClause = {};
  if (status !== 'all') {
    whereClause.status = status;
  }

  const { rows: reviews, count } = await ProgressReview.findAndCountAll({
    where: whereClause,
    order: [['shared_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
    include: [
      {
        model: Trainee,
        as: 'trainee',
        attributes: ['name', 'institution_name'],
        include: [{
          model: Project,
          as: 'projects',
          attributes: ['project_name', 'status', 'performance_rating']
        }]
      },
      {
        model: Instructor,
        as: 'sharedBy',
        attributes: ['name', 'email', 'department']
      },
      {
        model: Admin,
        as: 'reviewedBy',
        attributes: ['name', 'email']
      }
    ]
  });

  res.json({
    success: true,
    data: {
      reviews,
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

// Mark progress review as completed
router.put('/progress-reviews/:id', asyncHandler(async (req, res) => {
  const reviewId = req.params.id;

  const review = await ProgressReview.findByPk(reviewId, {
    include: [
      {
        model: Trainee,
        as: 'trainee',
        attributes: ['name']
      },
      {
        model: Instructor,
        as: 'sharedBy',
        attributes: ['name', 'id']
      }
    ]
  });

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Progress review not found'
    });
  }

  if (review.status === 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Progress review is already completed'
    });
  }

  await review.update({
    status: 'completed',
    reviewed_by: req.user.id,
    reviewed_at: new Date()
  });

  // Create notification for instructor
  await Notification.create({
    recipient_id: review.sharedBy.id,
    recipient_type: 'instructor',
    sender_id: req.user.id,
    sender_type: 'admin',
    message: `Progress review for "${review.trainee.name}" has been completed`,
    type: 'general'
  });

  res.json({
    success: true,
    message: 'Progress review marked as completed',
    data: review.toJSON()
  });
}));

module.exports = router;
    whereClause[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } }
    ];
  }

  const { rows: admins, count } = await Admin.findAndCountAll({
    where: whereClause,
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
    attributes: { exclude: ['password'] }
  });

  res.json({
    success: true,
    data: {
      admins,
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

// Create new admin
router.post('/admins', validate(adminSchemas.create), asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if admin already exists
  const existingAdmin = await Admin.findOne({ where: { email } });
  if (existingAdmin) {
    return res.status(400).json({
      success: false,
      message: 'Admin with this email already exists'
    });
  }

  const admin = await Admin.create({
    name,
    email,
    password,
    created_by: req.user.id
  });

  // Send notification
  await Notification.create({
    recipient_id: admin.id,
    recipient_type: 'admin',
    sender_id: req.user.id,
    sender_type: 'admin',
    message: `Welcome! Your admin account has been created.`,
    type: 'account'
  });

  res.status(201).json({
    success: true,
    message: 'Admin created successfully',
    data: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      created_at: admin.created_at
    }
  });
}));

// Update admin
router.put('/admins/:id', validate(adminSchemas.update), asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const adminId = req.params.id;

  const admin = await Admin.findByPk(adminId);
  if (!admin) {
    return res.status(404).json({
      success: false,
      message: 'Admin not found'
    });
  }

  // Check if email is already taken by another admin
  if (email && email !== admin.email) {
    const existingAdmin = await Admin.findOne({ 
      where: { email, id: { [Op.ne]: adminId } } 
    });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Email is already taken'
      });
    }
  }

  await admin.update({ name, email });

  res.json({
    success: true,
    message: 'Admin updated successfully',
    data: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      updated_at: admin.updated_at
    }
  });
}));

// Delete admin
router.delete('/admins/:id', asyncHandler(async (req, res) => {
  const adminId = req.params.id;

  // Prevent admin from deleting themselves
  if (adminId === req.user.id) {
    return res.status(400).json({
      success: false,
      message: 'You cannot delete your own account'
    });
  }

  const admin = await Admin.findByPk(adminId);
  if (!admin) {
    return res.status(404).json({
      success: false,
      message: 'Admin not found'
    });
  }

  await admin.destroy();

  res.json({
    success: true,
    message: 'Admin deleted successfully'
  });
}));

// Instructors Management
// Get all instructors
router.get('/instructors', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, department } = req.query;
  const offset = (page - 1) * limit;

  const whereClause = {};
  if (search) {
    whereClause[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
      { employee_id: { [Op.iLike]: `%${search}%` } }
    ];
  }
  if (department) {
    whereClause.department = department;
  }

  const { rows: instructors, count } = await Instructor.findAndCountAll({
    where: whereClause,
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
    attributes: { exclude: ['password'] },
    include: [
      { model: Admin, as: 'creator', attributes: ['name'] }
    ]
  });

  res.json({
    success: true,
    data: {
      instructors,
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

// Create new instructor
router.post('/instructors', validate(instructorSchemas.create), asyncHandler(async (req, res) => {
  const { name, email, employee_id, department, phone } = req.body;

  // Check if instructor already exists
  const existingInstructor = await Instructor.findOne({ 
    where: {
      [Op.or]: [{ email }, { employee_id }]
    }
  });
  
  if (existingInstructor) {
    return res.status(400).json({
      success: false,
      message: 'Instructor with this email or employee ID already exists'
    });
  }

  const instructor = await Instructor.create({
    name,
    email,
    employee_id,
    department,
    phone,
    created_by: req.user.id
  });

  // Send notification
  await Notification.create({
    recipient_id: instructor.id,
    recipient_type: 'instructor',
    sender_id: req.user.id,
    sender_type: 'admin',
    message: `Welcome! Your instructor account has been created. Use your email to login.`,
    type: 'account'
  });

  res.status(201).json({
    success: true,
    message: 'Instructor created successfully',
    data: {
      id: instructor.id,
      name: instructor.name,
      email: instructor.email,
      employee_id: instructor.employee_id,
      department: instructor.department,
      created_at: instructor.created_at
    }
  });
}));

// Update instructor
router.put('/instructors/:id', validate(instructorSchemas.update), asyncHandler(async (req, res) => {
  const { name, email, employee_id, department, phone, status } = req.body;
  const instructorId = req.params.id;

  const instructor = await Instructor.findByPk(instructorId);
  if (!instructor) {
    return res.status(404).json({
      success: false,
      message: 'Instructor not found'
    });
  }

  // Check if email or employee_id is already taken
  if ((email && email !== instructor.email) || (employee_id && employee_id !== instructor.employee_id)) {
    const existingInstructor = await Instructor.findOne({ 
      where: {
        [Op.and]: [
          { id: { [Op.ne]: instructorId } },
          {
            [Op.or]: [
              email && email !== instructor.email ? { email } : null,
              employee_id && employee_id !== instructor.employee_id ? { employee_id } : null
            ].filter(Boolean)
          }
        ]
      }
    });
    
    if (existingInstructor) {
      return res.status(400).json({
        success: false,
        message: 'Email or Employee ID is already taken'
      });
    }
  }

  await instructor.update({ name, email, employee_id, department, phone, status });

  res.json({
    success: true,
    message: 'Instructor updated successfully',
    data: {
      id: instructor.id,
      name: instructor.name,
      email: instructor.email,
      employee_id: instructor.employee_id,
      department: instructor.department,
      status: instructor.status,
      updated_at: instructor.updated_at
    }
  });
}));

// Get instructor details
router.get('/instructors/:id', asyncHandler(async (req, res) => {
  const instructor = await Instructor.findByPk(req.params.id, {
    attributes: { exclude: ['password'] },
    include: [
      { model: Admin, as: 'creator', attributes: ['name'] },
      { 
        model: Trainee, 
        as: 'trainees',
        attributes: ['id', 'name', 'status', 'created_at'],
        separate: true,
        order: [['created_at', 'DESC']]
      }
    ]
  });

  if (!instructor) {
    return res.status(404).json({
      success: false,
      message: 'Instructor not found'
    });
  }

  res.json({
    success: true,
    data: instructor
  });
}));

// Delete instructor
router.delete('/instructors/:id', asyncHandler(async (req, res) => {
  const instructorId = req.params.id;

  const instructor = await Instructor.findByPk(instructorId, {
    include: [
      { model: Trainee, as: 'trainees', attributes: ['id', 'name'] }
    ]
  });

  if (!instructor) {
    return res.status(404).json({
      success: false,
      message: 'Instructor not found'
    });
  }

  // Check if instructor has active trainees
  const activeTrainees = instructor.trainees?.filter(trainee => trainee.status === 'active') || [];
  if (activeTrainees.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete instructor. They have ${activeTrainees.length} active trainee(s). Please reassign or complete their training first.`
    });
  }

  await instructor.destroy();

  res.json({
    success: true,
    message: 'Instructor deleted successfully'
  });
}));

// Trainees Management
// Get pending trainees
router.get('/trainees/pending', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const { rows: trainees, count } = await Trainee.findAndCountAll({
    where: { status: 'pending' },
    order: [['created_at', 'ASC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
    include: [
      { model: Instructor, as: 'instructor', attributes: ['name', 'department'] }
    ]
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

// Approve trainee
router.put('/trainees/:id/approve', asyncHandler(async (req, res) => {
  const { status, comments } = req.body;
  const traineeId = req.params.id;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Status must be either approved or rejected'
    });
  }

  const trainee = await Trainee.findByPk(traineeId, {
    include: [{ model: Instructor, as: 'instructor', attributes: ['id', 'name'] }]
  });

  if (!trainee) {
    return res.status(404).json({
      success: false,
      message: 'Trainee not found'
    });
  }

  if (trainee.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Trainee has already been processed'
    });
  }

  await trainee.update({
    status: status === 'approved' ? 'active' : 'rejected',
    approval_comments: comments,
    approved_by: req.user.id,
    approved_at: new Date()
  });

  // Send notification to instructor
  await Notification.create({
    recipient_id: trainee.instructor.id,
    recipient_type: 'instructor',
    sender_id: req.user.id,
    sender_type: 'admin',
    message: `Trainee ${trainee.name} has been ${status}. ${comments ? 'Comments: ' + comments : ''}`,
    type: 'trainee_approval'
  });

  res.json({
    success: true,
    message: `Trainee ${status} successfully`,
    data: trainee
  });
}));

// Get all trainees
router.get('/trainees', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, search, instructor_id } = req.query;
  const offset = (page - 1) * limit;

  const whereClause = {};
  if (status) {
    whereClause.status = status;
  }
  if (search) {
    whereClause[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } }
    ];
  }
  if (instructor_id) {
    whereClause.instructor_id = instructor_id;
  }

  const { rows: trainees, count } = await Trainee.findAndCountAll({
    where: whereClause,
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
    include: [
      { model: Instructor, as: 'instructor', attributes: ['name', 'department'] }
    ]
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

// Create new trainee (Admin can create trainees for instructors)
router.post('/trainees', validate(traineeSchemas.create), asyncHandler(async (req, res) => {
  const traineeData = { ...req.body };
  
  // Admin creates trainee in 'active' status by default
  traineeData.status = 'active';
  traineeData.approved_by = req.user.id;
  traineeData.approved_at = new Date();
  
  const trainee = await Trainee.create(traineeData);
  
  // Send notification to instructor
  if (trainee.instructor_id) {
    await Notification.create({
      recipient_id: trainee.instructor_id,
      recipient_type: 'instructor',
      sender_id: req.user.id,
      sender_type: 'admin',
      message: `New trainee ${trainee.name} has been assigned to you`,
      type: 'trainee_assignment'
    });
  }

  res.status(201).json({
    success: true,
    message: 'Trainee created successfully',
    data: trainee
  });
}));

// Update trainee
router.put('/trainees/:id', validate(traineeSchemas.update), asyncHandler(async (req, res) => {
  const traineeId = req.params.id;
  const updateData = req.body;

  const trainee = await Trainee.findByPk(traineeId, {
    include: [{ model: Instructor, as: 'instructor', attributes: ['id'] }]
  });

  if (!trainee) {
    return res.status(404).json({
      success: false,
      message: 'Trainee not found'
    });
  }

  await trainee.update(updateData);

  // Send notification to instructor if trainee was updated
  if (trainee.instructor && trainee.instructor.id) {
    await Notification.create({
      recipient_id: trainee.instructor.id,
      recipient_type: 'instructor',
      sender_id: req.user.id,
      sender_type: 'admin',
      message: `Trainee ${trainee.name} details have been updated`,
      type: 'trainee_update'
    });
  }

  res.json({
    success: true,
    message: 'Trainee updated successfully',
    data: trainee
  });
}));

// Delete trainee
router.delete('/trainees/:id', asyncHandler(async (req, res) => {
  const traineeId = req.params.id;

  const trainee = await Trainee.findByPk(traineeId, {
    include: [{ model: Instructor, as: 'instructor', attributes: ['id'] }]
  });

  if (!trainee) {
    return res.status(404).json({
      success: false,
      message: 'Trainee not found'
    });
  }

  // Send notification to instructor before deletion
  if (trainee.instructor && trainee.instructor.id) {
    await Notification.create({
      recipient_id: trainee.instructor.id,
      recipient_type: 'instructor',
      sender_id: req.user.id,
      sender_type: 'admin',
      message: `Trainee ${trainee.name} has been removed from your training list`,
      type: 'trainee_removal'
    });
  }

  await trainee.destroy();

  res.json({
    success: true,
    message: 'Trainee deleted successfully'
  });
}));

// Progress Reviews Management
// Get progress reviews
router.get('/progress-reviews', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const offset = (page - 1) * limit;

  const whereClause = {};
  if (status) {
    whereClause.status = status;
  }

  const { rows: reviews, count } = await ProgressReview.findAndCountAll({
    where: whereClause,
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
    include: [
      { 
        model: Trainee, 
        as: 'trainee', 
        attributes: ['name'],
        include: [
          { model: Instructor, as: 'instructor', attributes: ['name'] }
        ]
      }
    ]
  });

  res.json({
    success: true,
    data: {
      reviews,
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

// Mark progress review as completed
router.put('/progress-reviews/:id', asyncHandler(async (req, res) => {
  const reviewId = req.params.id;

  const review = await ProgressReview.findByPk(reviewId, {
    include: [
      { 
        model: Trainee, 
        as: 'trainee',
        include: [{ model: Instructor, as: 'instructor', attributes: ['id'] }]
      }
    ]
  });

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Progress review not found'
    });
  }

  await review.update({
    status: 'completed',
    reviewed_by: req.user.id,
    reviewed_at: new Date()
  });

  // Send notification to instructor
  await Notification.create({
    recipient_id: review.trainee.instructor.id,
    recipient_type: 'instructor',
    sender_id: req.user.id,
    sender_type: 'admin',
    message: `Progress review for ${review.trainee.name} has been completed`,
    type: 'progress_review'
  });

  res.json({
    success: true,
    message: 'Progress review marked as completed',
    data: review
  });
}));

// Profile Management
// Get admin profile
router.get('/profile', asyncHandler(async (req, res) => {
  const admin = await Admin.findByPk(req.user.id, {
    attributes: { exclude: ['password'] }
  });

  if (!admin) {
    return res.status(404).json({
      success: false,
      message: 'Admin not found'
    });
  }

  res.json({
    success: true,
    data: admin
  });
}));

// Update admin profile
router.put('/profile', validate(adminSchemas.updateProfile), asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  const admin = await Admin.findByPk(req.user.id);
  if (!admin) {
    return res.status(404).json({
      success: false,
      message: 'Admin not found'
    });
  }

  // Check if email is already taken by another admin
  if (email && email !== admin.email) {
    const existingAdmin = await Admin.findOne({ 
      where: { email, id: { [Op.ne]: req.user.id } } 
    });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Email is already taken'
      });
    }
  }

  await admin.update({ name, email });

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      updated_at: admin.updated_at
    }
  });
}));

// Change password
router.put('/change-password', validate(adminSchemas.changePassword), asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const admin = await Admin.findByPk(req.user.id);
  if (!admin) {
    return res.status(404).json({
      success: false,
      message: 'Admin not found'
    });
  }

  // Verify current password
  const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  await admin.update({ password: newPassword });

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

module.exports = router;
