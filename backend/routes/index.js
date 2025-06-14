const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Import models
const {
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
} = require('../models');

// Import middleware
const { authenticateToken, authorizeAdmin, authorizeInstructor, authorizeAdminOrInstructor } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { uploadProjectCompletion, uploadMonthlyAttendance, uploadDocument, handleUploadError } = require('../middleware/upload');

// Import utilities
const {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  generateOTP,
  generateOTPExpiry,
  generateRandomPassword,
  formatDate,
  formatDateTime,
  getCurrentMonth,
  calculateDuration,
  successResponse,
  errorResponse,
  getPaginationParams,
  getPaginationMeta,
} = require('../utils/helpers');

const {
  sendOTPEmail,
  sendWelcomeAdminEmail,
  sendWelcomeInstructorEmail,
  sendTraineeApprovedEmail,
  sendTraineeRejectedEmail,
  sendProjectCompletionEmail,
  sendMonthlyUploadReminder,
} = require('../utils/email');

const router = express.Router();

// ==============================================
// AUTHENTICATION ROUTES
// ==============================================

// POST /api/auth/login - User login
router.post('/auth/login', validate(schemas.login), async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    let user;
    if (userType === 'admin') {
      user = await Admin.findOne({ where: { email, is_active: true } });
    } else {
      user = await Instructor.findOne({ where: { email, is_active: true } });
    }

    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    if (password) {
      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return errorResponse(res, 'Invalid credentials', 401);
      }

      // Update last login
      user.last_login = new Date();
      await user.save();

      const accessToken = generateAccessToken(user, userType);
      const refreshToken = generateRefreshToken(user, userType);

      return successResponse(res, {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          userType,
        },
        accessToken,
        refreshToken,
      }, 'Login successful');
    }

    return errorResponse(res, 'Password required', 400);
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Login failed');
  }
});

// POST /api/auth/send-otp - Send OTP to email
router.post('/auth/send-otp', validate(schemas.sendOTP), async (req, res) => {
  try {
    const { email, userType } = req.body;

    let user;
    if (userType === 'admin') {
      user = await Admin.findOne({ where: { email, is_active: true } });
    } else {
      user = await Instructor.findOne({ where: { email, is_active: true } });
    }

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Generate OTP
    const otpCode = generateOTP();
    const expiresAt = generateOTPExpiry();

    // Delete existing OTPs for this email
    await OTP.destroy({ where: { email, user_type: userType } });

    // Create new OTP
    await OTP.create({
      email,
      otp_code: otpCode,
      user_type: userType,
      expires_at: expiresAt,
    });

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otpCode, user.name);
    
    if (!emailResult.success) {
      return errorResponse(res, 'Failed to send OTP email');
    }

    return successResponse(res, null, 'OTP sent successfully');
  } catch (error) {
    console.error('Send OTP error:', error);
    return errorResponse(res, 'Failed to send OTP');
  }
});

// POST /api/auth/verify-otp - Verify OTP
router.post('/auth/verify-otp', validate(schemas.verifyOTP), async (req, res) => {
  try {
    const { email, otp, userType } = req.body;

    const otpRecord = await OTP.findOne({
      where: {
        email,
        otp_code: otp,
        user_type: userType,
        is_used: false,
        expires_at: { [Op.gt]: new Date() },
      },
    });

    if (!otpRecord) {
      return errorResponse(res, 'Invalid or expired OTP', 400);
    }

    // Mark OTP as used
    otpRecord.is_used = true;
    await otpRecord.save();

    let user;
    if (userType === 'admin') {
      user = await Admin.findOne({ where: { email, is_active: true } });
    } else {
      user = await Instructor.findOne({ where: { email, is_active: true } });
    }

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Update last login
    user.last_login = new Date();
    await user.save();

    const accessToken = generateAccessToken(user, userType);
    const refreshToken = generateRefreshToken(user, userType);

    return successResponse(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType,
      },
      accessToken,
      refreshToken,
    }, 'OTP verified successfully');
  } catch (error) {
    console.error('Verify OTP error:', error);
    return errorResponse(res, 'OTP verification failed');
  }
});

// POST /api/auth/logout - User logout
router.post('/auth/logout', authenticateToken, (req, res) => {
  return successResponse(res, null, 'Logout successful');
});

// POST /api/auth/refresh - Refresh JWT token
router.post('/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, 'Refresh token required', 401);
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    let user;
    if (decoded.userType === 'admin') {
      user = await Admin.findByPk(decoded.id);
    } else {
      user = await Instructor.findByPk(decoded.id);
    }

    if (!user || !user.is_active) {
      return errorResponse(res, 'Invalid refresh token', 401);
    }

    const newAccessToken = generateAccessToken(user, decoded.userType);

    return successResponse(res, { accessToken: newAccessToken }, 'Token refreshed');
  } catch (error) {
    return errorResponse(res, 'Invalid refresh token', 401);
  }
});

// ==============================================
// ADMIN ROUTES
// ==============================================

// GET /api/admin/dashboard - Dashboard statistics
router.get('/admin/dashboard', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const totalAdmins = await Admin.count({ where: { is_active: true } });
    const totalInstructors = await Instructor.count({ where: { is_active: true } });
    const totalTrainees = await Trainee.count();
    const pendingApprovals = await Trainee.count({ where: { status: 'pending' } });
    const activeProjects = await Project.count({ where: { status: ['in_progress', 'assigned'] } });
    const completedProjects = await Project.count({ where: { status: 'completed' } });

    // Recent activity
    const recentTrainees = await Trainee.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [{ model: Instructor, as: 'Instructor', attributes: ['name'] }],
    });

    // Training completion rates
    const trainingStats = await Project.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['status'],
    });

    return successResponse(res, {
      overview: {
        totalAdmins,
        totalInstructors,
        totalTrainees,
        pendingApprovals,
        activeProjects,
        completedProjects,
      },
      recentActivity: recentTrainees,
      trainingStats,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return errorResponse(res, 'Failed to fetch dashboard data');
  }
});

// GET /api/admin/admins - List all admins
router.get('/admin/admins', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { page, limit, offset } = getPaginationParams(req);
    const { search } = req.query;

    let whereClause = {};
    if (search) {
      whereClause = {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { title: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    const { count, rows } = await Admin.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [{ model: Admin, as: 'Creator', attributes: ['name'] }],
    });

    const meta = getPaginationMeta(count, page, limit);

    return successResponse(res, { admins: rows, meta });
  } catch (error) {
    console.error('List admins error:', error);
    return errorResponse(res, 'Failed to fetch admins');
  }
});

// POST /api/admin/admins - Create new admin
router.post('/admin/admins', authenticateToken, authorizeAdmin, validate(schemas.createAdmin), async (req, res) => {
  try {
    const { name, email, phone, title, department, password } = req.body;

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
      return errorResponse(res, 'Email already exists', 400);
    }

    const hashedPassword = await hashPassword(password);

    const admin = await Admin.create({
      name,
      email,
      phone,
      title,
      department,
      password: hashedPassword,
      created_by: req.user.id,
    });

    // Send welcome email
    await sendWelcomeAdminEmail(email, name, password);

    // Create notification
    await Notification.create({
      type: 'system_announcement',
      title: 'New Admin Created',
      message: `Admin ${name} has been created successfully`,
      recipient_id: req.user.id,
      recipient_type: 'admin',
    });

    const { password: _, ...adminData } = admin.toJSON();
    return successResponse(res, adminData, 'Admin created successfully', 201);
  } catch (error) {
    console.error('Create admin error:', error);
    return errorResponse(res, 'Failed to create admin');
  }
});

// PUT /api/admin/admins/:id - Update admin
router.put('/admin/admins/:id', authenticateToken, authorizeAdmin, validate(schemas.updateAdmin), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const admin = await Admin.findByPk(id);
    if (!admin) {
      return errorResponse(res, 'Admin not found', 404);
    }

    await admin.update(updateData);

    const { password: _, ...adminData } = admin.toJSON();
    return successResponse(res, adminData, 'Admin updated successfully');
  } catch (error) {
    console.error('Update admin error:', error);
    return errorResponse(res, 'Failed to update admin');
  }
});

// DELETE /api/admin/admins/:id - Delete admin (soft delete)
router.delete('/admin/admins/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return errorResponse(res, 'Cannot delete your own account', 400);
    }

    const admin = await Admin.findByPk(id);
    if (!admin) {
      return errorResponse(res, 'Admin not found', 404);
    }

    await admin.update({ is_active: false });

    return successResponse(res, null, 'Admin deleted successfully');
  } catch (error) {
    console.error('Delete admin error:', error);
    return errorResponse(res, 'Failed to delete admin');
  }
});

// GET /api/admin/instructors - List all instructors
router.get('/admin/instructors', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { page, limit, offset } = getPaginationParams(req);
    const { search, department } = req.query;

    let whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { role: { [Op.like]: `%${search}%` } },
      ];
    }
    if (department) {
      whereClause.department = department;
    }

    const { count, rows } = await Instructor.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        { model: Admin, as: 'CreatedBy', attributes: ['name'] },
        { model: Trainee, attributes: ['id'] },
      ],
    });

    // Add trainee count to each instructor
    const instructorsWithCount = rows.map(instructor => ({
      ...instructor.toJSON(),
      traineeCount: instructor.Trainees ? instructor.Trainees.length : 0,
    }));

    const meta = getPaginationMeta(count, page, limit);

    return successResponse(res, { instructors: instructorsWithCount, meta });
  } catch (error) {
    console.error('List instructors error:', error);
    return errorResponse(res, 'Failed to fetch instructors');
  }
});

// POST /api/admin/instructors - Create instructor
router.post('/admin/instructors', authenticateToken, authorizeAdmin, validate(schemas.createInstructor), async (req, res) => {
  try {
    const { name, email, phone, department, role, specialization, password } = req.body;

    // Check if email already exists
    const existingInstructor = await Instructor.findOne({ where: { email } });
    if (existingInstructor) {
      return errorResponse(res, 'Email already exists', 400);
    }

    const hashedPassword = await hashPassword(password);

    const instructor = await Instructor.create({
      name,
      email,
      phone,
      department,
      role,
      specialization,
      password: hashedPassword,
      created_by: req.user.id,
    });

    // Send welcome email
    await sendWelcomeInstructorEmail(email, name, password);

    // Create notification
    await Notification.create({
      type: 'system_announcement',
      title: 'New Instructor Created',
      message: `Instructor ${name} has been created successfully`,
      recipient_id: req.user.id,
      recipient_type: 'admin',
    });

    const { password: _, ...instructorData } = instructor.toJSON();
    return successResponse(res, instructorData, 'Instructor created successfully', 201);
  } catch (error) {
    console.error('Create instructor error:', error);
    return errorResponse(res, 'Failed to create instructor');
  }
});

// PUT /api/admin/instructors/:id - Update instructor
router.put('/admin/instructors/:id', authenticateToken, authorizeAdmin, validate(schemas.updateInstructor), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const instructor = await Instructor.findByPk(id);
    if (!instructor) {
      return errorResponse(res, 'Instructor not found', 404);
    }

    await instructor.update(updateData);

    const { password: _, ...instructorData } = instructor.toJSON();
    return successResponse(res, instructorData, 'Instructor updated successfully');
  } catch (error) {
    console.error('Update instructor error:', error);
    return errorResponse(res, 'Failed to update instructor');
  }
});

// GET /api/admin/trainees/pending - Pending approval trainees
router.get('/admin/trainees/pending', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { page, limit, offset } = getPaginationParams(req);

    const { count, rows } = await Trainee.findAndCountAll({
      where: { status: 'pending' },
      limit,
      offset,
      order: [['created_at', 'ASC']],
      include: [{ model: Instructor, as: 'Instructor', attributes: ['name', 'email', 'department'] }],
    });

    const meta = getPaginationMeta(count, page, limit);

    return successResponse(res, { trainees: rows, meta });
  } catch (error) {
    console.error('Pending trainees error:', error);
    return errorResponse(res, 'Failed to fetch pending trainees');
  }
});

// PUT /api/admin/trainees/:id/approve - Approve trainee
router.put('/admin/trainees/:id/approve', authenticateToken, authorizeAdmin, validate(schemas.approveTrainee), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approval_comments } = req.body;

    const trainee = await Trainee.findByPk(id, {
      include: [{ model: Instructor, as: 'Instructor', attributes: ['name', 'email'] }],
    });

    if (!trainee) {
      return errorResponse(res, 'Trainee not found', 404);
    }

    if (trainee.status !== 'pending') {
      return errorResponse(res, 'Trainee already processed', 400);
    }

    await trainee.update({
      status,
      approved_by: req.user.id,
      approval_comments,
      joining_date: status === 'approved' ? new Date() : null,
    });

    // Send notification to instructor
    await Notification.create({
      type: status === 'approved' ? 'trainee_approved' : 'trainee_rejected',
      title: `Trainee ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `Trainee ${trainee.name} has been ${status}`,
      recipient_id: trainee.instructor_id,
      recipient_type: 'instructor',
      related_id: trainee.id,
      related_type: 'trainee',
    });

    // Send email to instructor
    if (status === 'approved') {
      await sendTraineeApprovedEmail(
        trainee.Instructor.email,
        trainee.name,
        trainee.Instructor.name,
        approval_comments
      );
    } else {
      await sendTraineeRejectedEmail(
        trainee.Instructor.email,
        trainee.name,
        trainee.Instructor.name,
        approval_comments
      );
    }

    return successResponse(res, trainee, `Trainee ${status} successfully`);
  } catch (error) {
    console.error('Approve trainee error:', error);
    return errorResponse(res, 'Failed to process trainee approval');
  }
});

// GET /api/admin/progress-reviews - List progress reviews
router.get('/admin/progress-reviews', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { page, limit, offset } = getPaginationParams(req);
    const { status } = req.query;

    let whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await ProgressReview.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['shared_date', 'DESC']],
      include: [
        { model: Trainee, as: 'Trainee', attributes: ['name', 'email', 'institution'] },
        { model: Instructor, as: 'Instructor', attributes: ['name', 'email', 'department'] },
        { model: Project, as: 'Project', attributes: ['title', 'status'] },
        { model: Admin, as: 'ReviewedBy', attributes: ['name'] },
      ],
    });

    const meta = getPaginationMeta(count, page, limit);

    return successResponse(res, { progressReviews: rows, meta });
  } catch (error) {
    console.error('Progress reviews error:', error);
    return errorResponse(res, 'Failed to fetch progress reviews');
  }
});

// PUT /api/admin/progress-reviews/:id - Mark progress review as reviewed
router.put('/admin/progress-reviews/:id', authenticateToken, authorizeAdmin, validate(schemas.reviewProgress), async (req, res) => {
  try {
    const { id } = req.params;
    const { review_comments } = req.body;

    const progressReview = await ProgressReview.findByPk(id, {
      include: [{ model: Instructor, as: 'Instructor', attributes: ['name', 'email'] }],
    });

    if (!progressReview) {
      return errorResponse(res, 'Progress review not found', 404);
    }

    await progressReview.update({
      status: 'completed',
      reviewed_by: req.user.id,
      review_comments,
      reviewed_date: new Date(),
    });

    // Send notification to instructor
    await Notification.create({
      type: 'progress_reviewed',
      title: 'Progress Review Completed',
      message: 'Your shared progress has been reviewed by admin',
      recipient_id: progressReview.instructor_id,
      recipient_type: 'instructor',
      related_id: progressReview.id,
      related_type: 'progress_review',
    });

    return successResponse(res, progressReview, 'Progress review completed');
  } catch (error) {
    console.error('Review progress error:', error);
    return errorResponse(res, 'Failed to review progress');
  }
});

// ==============================================
// INSTRUCTOR ROUTES
// ==============================================

// GET /api/instructor/dashboard - Dashboard statistics
router.get('/instructor/dashboard', authenticateToken, authorizeInstructor, async (req, res) => {
  try {
    const instructorId = req.user.id;

    const totalTrainees = await Trainee.count({ where: { instructor_id: instructorId } });
    const activeTrainees = await Trainee.count({ 
      where: { instructor_id: instructorId, status: 'approved' } 
    });
    const pendingApproval = await Trainee.count({ 
      where: { instructor_id: instructorId, status: 'pending' } 
    });

    const totalProjects = await Project.count({ where: { instructor_id: instructorId } });
    const activeProjects = await Project.count({ 
      where: { instructor_id: instructorId, status: ['assigned', 'in_progress'] } 
    });
    const completedProjects = await Project.count({ 
      where: { instructor_id: instructorId, status: 'completed' } 
    });

    // Recent activity
    const recentProjects = await Project.findAll({
      where: { instructor_id: instructorId },
      limit: 5,
      order: [['updated_at', 'DESC']],
      include: [{ model: Trainee, as: 'Trainee', attributes: ['name'] }],
    });

    // Upcoming deadlines (projects expected to complete soon)
    const upcomingDeadlines = await Project.findAll({
      where: {
        instructor_id: instructorId,
        status: ['assigned', 'in_progress'],
        start_date: { [Op.not]: null },
      },
      include: [{ model: Trainee, as: 'Trainee', attributes: ['name'] }],
      order: [['start_date', 'ASC']],
      limit: 5,
    });

    return successResponse(res, {
      overview: {
        totalTrainees,
        activeTrainees,
        pendingApproval,
        totalProjects,
        activeProjects,
        completedProjects,
      },
      recentActivity: recentProjects,
      upcomingDeadlines,
    });
  } catch (error) {
    console.error('Instructor dashboard error:', error);
    return errorResponse(res, 'Failed to fetch dashboard data');
  }
});

// GET /api/instructor/trainees - List instructor's trainees
router.get('/instructor/trainees', authenticateToken, authorizeInstructor, async (req, res) => {
  try {
    const { page, limit, offset } = getPaginationParams(req);
    const { search, status } = req.query;
    const instructorId = req.user.id;

    let whereClause = { instructor_id: instructorId };
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { institution: { [Op.like]: `%${search}%` } },
      ];
    }
    
    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await Trainee.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        { model: Project, attributes: ['id', 'title', 'status'] },
        { model: Admin, as: 'ApprovedBy', attributes: ['name'] },
      ],
    });

    const meta = getPaginationMeta(count, page, limit);

    return successResponse(res, { trainees: rows, meta });
  } catch (error) {
    console.error('List trainees error:', error);
    return errorResponse(res, 'Failed to fetch trainees');
  }
});

// POST /api/instructor/trainees - Create new trainee
router.post('/instructor/trainees', authenticateToken, authorizeInstructor, validate(schemas.createTrainee), async (req, res) => {
  try {
    const traineeData = {
      ...req.body,
      instructor_id: req.user.id,
    };

    // Check if email already exists
    const existingTrainee = await Trainee.findOne({ where: { email: traineeData.email } });
    if (existingTrainee) {
      return errorResponse(res, 'Email already exists', 400);
    }

    const trainee = await Trainee.create(traineeData);

    // Create notification for admin
    await Notification.create({
      type: 'trainee_creation_request',
      title: 'New Trainee Registration',
      message: `New trainee ${trainee.name} has been registered and pending approval`,
      recipient_id: 1, // Admin with ID 1, you might want to make this dynamic
      recipient_type: 'admin',
      related_id: trainee.id,
      related_type: 'trainee',
    });

    return successResponse(res, trainee, 'Trainee created successfully. Pending admin approval.', 201);
  } catch (error) {
    console.error('Create trainee error:', error);
    return errorResponse(res, 'Failed to create trainee');
  }
});

// PUT /api/instructor/trainees/:id - Update trainee
router.put('/instructor/trainees/:id', authenticateToken, authorizeInstructor, validate(schemas.updateTrainee), async (req, res) => {
  try {
    const { id } = req.params;
    const instructorId = req.user.id;

    const trainee = await Trainee.findOne({
      where: { id, instructor_id: instructorId },
    });

    if (!trainee) {
      return errorResponse(res, 'Trainee not found', 404);
    }

    // Only allow updates if trainee is pending or approved
    if (trainee.status === 'rejected') {
      return errorResponse(res, 'Cannot update rejected trainee', 400);
    }

    await trainee.update(req.body);

    return successResponse(res, trainee, 'Trainee updated successfully');
  } catch (error) {
    console.error('Update trainee error:', error);
    return errorResponse(res, 'Failed to update trainee');
  }
});

// GET /api/instructor/projects - List projects
router.get('/instructor/projects', authenticateToken, authorizeInstructor, async (req, res) => {
  try {
    const { page, limit, offset } = getPaginationParams(req);
    const { status, trainee_id } = req.query;
    const instructorId = req.user.id;

    let whereClause = { instructor_id: instructorId };
    
    if (status) {
      whereClause.status = status;
    }
    
    if (trainee_id) {
      whereClause.trainee_id = trainee_id;
    }

    const { count, rows } = await Project.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        { model: Trainee, as: 'Trainee', attributes: ['name', 'email', 'institution'] },
        { model: ProjectProgress, attributes: ['progress_date', 'percentage_completed'] },
      ],
    });

    const meta = getPaginationMeta(count, page, limit);

    return successResponse(res, { projects: rows, meta });
  } catch (error) {
    console.error('List projects error:', error);
    return errorResponse(res, 'Failed to fetch projects');
  }
});

// POST /api/instructor/projects - Create project (auto-sets start_date)
router.post('/instructor/projects', authenticateToken, authorizeInstructor, validate(schemas.createProject), async (req, res) => {
  try {
    const { trainee_id, title, description, expected_duration_days } = req.body;
    const instructorId = req.user.id;

    // Check if trainee belongs to this instructor and is approved
    const trainee = await Trainee.findOne({
      where: { 
        id: trainee_id, 
        instructor_id: instructorId, 
        status: 'approved' 
      },
    });

    if (!trainee) {
      return errorResponse(res, 'Approved trainee not found', 404);
    }

    const project = await Project.create({
      title,
      description,
      expected_duration_days,
      trainee_id,
      instructor_id: instructorId,
      start_date: new Date(), // Auto-set start date
      status: 'assigned',
    });

    const projectWithTrainee = await Project.findByPk(project.id, {
      include: [{ model: Trainee, as: 'Trainee', attributes: ['name', 'email'] }],
    });

    return successResponse(res, projectWithTrainee, 'Project created successfully', 201);
  } catch (error) {
    console.error('Create project error:', error);
    return errorResponse(res, 'Failed to create project');
  }
});

// PUT /api/instructor/projects/:id - Update project
router.put('/instructor/projects/:id', authenticateToken, authorizeInstructor, validate(schemas.updateProject), async (req, res) => {
  try {
    const { id } = req.params;
    const instructorId = req.user.id;

    const project = await Project.findOne({
      where: { id, instructor_id: instructorId },
    });

    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }

    // Don't allow updates to completed projects
    if (project.status === 'completed') {
      return errorResponse(res, 'Cannot update completed project', 400);
    }

    await project.update(req.body);

    return successResponse(res, project, 'Project updated successfully');
  } catch (error) {
    console.error('Update project error:', error);
    return errorResponse(res, 'Failed to update project');
  }
});

// PUT /api/instructor/projects/:id/complete - Mark project complete with required uploads
router.put('/instructor/projects/:id/complete', 
  authenticateToken, 
  authorizeInstructor, 
  uploadProjectCompletion,
  handleUploadError,
  validate(schemas.completeProject),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { performance_rating } = req.body;
      const instructorId = req.user.id;

      const project = await Project.findOne({
        where: { id, instructor_id: instructorId },
        include: [
          { model: Trainee, as: 'Trainee' },
          { model: Instructor, as: 'Instructor' },
        ],
      });

      if (!project) {
        return errorResponse(res, 'Project not found', 404);
      }

      if (project.status === 'completed') {
        return errorResponse(res, 'Project already completed', 400);
      }

      // Check if required files are uploaded
      if (!req.files || !req.files.projectReport || !req.files.attendanceDocument) {
        return errorResponse(res, 'Both project report and attendance document are required', 400);
      }

      const projectReportPath = req.files.projectReport[0].path;
      const attendanceDocumentPath = req.files.attendanceDocument[0].path;

      // Update project
      await project.update({
        status: 'completed',
        end_date: new Date(),
        performance_rating,
        project_report_path: projectReportPath,
        attendance_document_path: attendanceDocumentPath,
      });

      // Store documents in the documents table
      await Document.create({
        file_name: req.files.projectReport[0].filename,
        original_name: req.files.projectReport[0].originalname,
        file_path: projectReportPath,
        file_size: req.files.projectReport[0].size,
        mime_type: req.files.projectReport[0].mimetype,
        document_type: 'project_report',
        trainee_id: project.trainee_id,
        project_id: project.id,
        instructor_id: instructorId,
      });

      await Document.create({
        file_name: req.files.attendanceDocument[0].filename,
        original_name: req.files.attendanceDocument[0].originalname,
        file_path: attendanceDocumentPath,
        file_size: req.files.attendanceDocument[0].size,
        mime_type: req.files.attendanceDocument[0].mimetype,
        document_type: 'attendance',
        trainee_id: project.trainee_id,
        project_id: project.id,
        instructor_id: instructorId,
      });

      // Calculate project duration
      const duration = calculateDuration(project.start_date, new Date());

      // Send email to training and HRD departments
      const traineeData = {
        name: project.Trainee.name,
        email: project.Trainee.email,
        institution: project.Trainee.institution,
        course: project.Trainee.course,
      };

      const projectData = {
        title: project.title,
        duration,
        start_date: formatDate(project.start_date),
        end_date: formatDate(new Date()),
        performance_rating,
      };

      const instructorData = {
        name: project.Instructor.name,
        email: project.Instructor.email,
        department: project.Instructor.department,
      };

      const attachments = [
        {
          filename: req.files.projectReport[0].originalname,
          path: projectReportPath,
        },
        {
          filename: req.files.attendanceDocument[0].originalname,
          path: attendanceDocumentPath,
        },
      ];

      await sendProjectCompletionEmail(traineeData, projectData, instructorData, attachments);

      // Mark email as sent
      await project.update({ completion_email_sent: true });

      // Create notification
      await Notification.create({
        type: 'project_completion',
        title: 'Project Completed',
        message: `Project "${project.title}" has been completed successfully`,
        recipient_id: instructorId,
        recipient_type: 'instructor',
        related_id: project.id,
        related_type: 'project',
      });

      return successResponse(res, project, 'Project completed successfully');
    } catch (error) {
      console.error('Complete project error:', error);
      return errorResponse(res, 'Failed to complete project');
    }
  }
);

// POST /api/instructor/progress - Update project progress
router.post('/instructor/progress', authenticateToken, authorizeInstructor, validate(schemas.addProgress), async (req, res) => {
  try {
    const { project_id, progress_description, percentage_completed } = req.body;
    const instructorId = req.user.id;

    // Check if project belongs to this instructor
    const project = await Project.findOne({
      where: { id: project_id, instructor_id: instructorId },
    });

    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }

    if (project.status === 'completed') {
      return errorResponse(res, 'Cannot update progress for completed project', 400);
    }

    const progress = await ProjectProgress.create({
      project_id,
      progress_description,
      percentage_completed,
      instructor_id: instructorId,
    });

    // Update project status to in_progress if it was assigned
    if (project.status === 'assigned') {
      await project.update({ status: 'in_progress' });
    }

    return successResponse(res, progress, 'Progress updated successfully', 201);
  } catch (error) {
    console.error('Add progress error:', error);
    return errorResponse(res, 'Failed to update progress');
  }
});

// POST /api/instructor/documents/upload - Upload document
router.post('/instructor/documents/upload', 
  authenticateToken, 
  authorizeInstructor, 
  uploadDocument,
  handleUploadError,
  async (req, res) => {
    try {
      const { trainee_id, project_id, document_type } = req.body;
      const instructorId = req.user.id;

      if (!req.file) {
        return errorResponse(res, 'No file uploaded', 400);
      }

      // Verify trainee belongs to instructor
      if (trainee_id) {
        const trainee = await Trainee.findOne({
          where: { id: trainee_id, instructor_id: instructorId },
        });
        if (!trainee) {
          return errorResponse(res, 'Trainee not found', 404);
        }
      }

      // Verify project belongs to instructor
      if (project_id) {
        const project = await Project.findOne({
          where: { id: project_id, instructor_id: instructorId },
        });
        if (!project) {
          return errorResponse(res, 'Project not found', 404);
        }
      }

      const document = await Document.create({
        file_name: req.file.filename,
        original_name: req.file.originalname,
        file_path: req.file.path,
        file_size: req.file.size,
        mime_type: req.file.mimetype,
        document_type: document_type || 'other',
        trainee_id: trainee_id || null,
        project_id: project_id || null,
        instructor_id: instructorId,
      });

      return successResponse(res, document, 'Document uploaded successfully', 201);
    } catch (error) {
      console.error('Upload document error:', error);
      return errorResponse(res, 'Failed to upload document');
    }
  }
);

// GET /api/instructor/documents - List documents
router.get('/instructor/documents', authenticateToken, authorizeInstructor, async (req, res) => {
  try {
    const { page, limit, offset } = getPaginationParams(req);
    const { document_type, trainee_id, project_id } = req.query;
    const instructorId = req.user.id;

    let whereClause = { instructor_id: instructorId };
    
    if (document_type) {
      whereClause.document_type = document_type;
    }
    
    if (trainee_id) {
      whereClause.trainee_id = trainee_id;
    }
    
    if (project_id) {
      whereClause.project_id = project_id;
    }

    const { count, rows } = await Document.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        { model: Trainee, as: 'Trainee', attributes: ['name'] },
        { model: Project, as: 'Project', attributes: ['title'] },
      ],
    });

    const meta = getPaginationMeta(count, page, limit);

    return successResponse(res, { documents: rows, meta });
  } catch (error) {
    console.error('List documents error:', error);
    return errorResponse(res, 'Failed to fetch documents');
  }
});

// POST /api/instructor/attendance/upload - Upload attendance for specific trainee/project
router.post('/instructor/attendance/upload', 
  authenticateToken, 
  authorizeInstructor, 
  uploadMonthlyAttendance,
  handleUploadError,
  async (req, res) => {
    try {
      const { trainee_id, project_id, upload_month } = req.body;
      const instructorId = req.user.id;

      if (!req.file) {
        return errorResponse(res, 'No file uploaded', 400);
      }

      // Verify trainee belongs to instructor
      const trainee = await Trainee.findOne({
        where: { id: trainee_id, instructor_id: instructorId },
      });
      if (!trainee) {
        return errorResponse(res, 'Trainee not found', 404);
      }

      // Verify project if provided
      if (project_id) {
        const project = await Project.findOne({
          where: { id: project_id, instructor_id: instructorId, trainee_id },
        });
        if (!project) {
          return errorResponse(res, 'Project not found', 404);
        }
      }

      const currentMonth = upload_month || getCurrentMonth();

      // Check if attendance already uploaded for this month
      const existingAttendance = await Document.findOne({
        where: {
          trainee_id,
          project_id: project_id || null,
          document_type: 'monthly_attendance',
          upload_month: currentMonth,
          instructor_id: instructorId,
        },
      });

      if (existingAttendance) {
        return errorResponse(res, 'Attendance already uploaded for this month', 400);
      }

      const document = await Document.create({
        file_name: req.file.filename,
        original_name: req.file.originalname,
        file_path: req.file.path,
        file_size: req.file.size,
        mime_type: req.file.mimetype,
        document_type: 'monthly_attendance',
        trainee_id,
        project_id: project_id || null,
        instructor_id: instructorId,
        upload_month: currentMonth,
      });

      return successResponse(res, document, 'Monthly attendance uploaded successfully', 201);
    } catch (error) {
      console.error('Upload attendance error:', error);
      return errorResponse(res, 'Failed to upload attendance');
    }
  }
);

// GET /api/instructor/monthly-status - Get monthly upload status for all trainees
router.get('/instructor/monthly-status', authenticateToken, authorizeInstructor, async (req, res) => {
  try {
    const { month } = req.query;
    const instructorId = req.user.id;
    const targetMonth = month || getCurrentMonth();

    // Get all approved trainees for this instructor
    const trainees = await Trainee.findAll({
      where: { 
        instructor_id: instructorId, 
        status: 'approved' 
      },
      include: [
        { 
          model: Project, 
          attributes: ['id', 'title', 'status'],
          where: { status: ['assigned', 'in_progress', 'completed'] },
          required: false,
        },
      ],
    });

    // Get attendance records for the target month
    const attendanceRecords = await Document.findAll({
      where: {
        instructor_id: instructorId,
        document_type: 'monthly_attendance',
        upload_month: targetMonth,
      },
    });

    // Create status map
    const statusMap = {};
    attendanceRecords.forEach(record => {
      const key = `${record.trainee_id}_${record.project_id || 'no_project'}`;
      statusMap[key] = record;
    });

    // Build response data
    const traineeStatus = trainees.map(trainee => ({
      trainee: {
        id: trainee.id,
        name: trainee.name,
        email: trainee.email,
      },
      projects: trainee.Projects ? trainee.Projects.map(project => ({
        id: project.id,
        title: project.title,
        status: project.status,
        attendance_uploaded: !!statusMap[`${trainee.id}_${project.id}`],
        upload_date: statusMap[`${trainee.id}_${project.id}`]?.created_at || null,
      })) : [],
      has_pending_uploads: trainee.Projects ? 
        trainee.Projects.some(project => !statusMap[`${trainee.id}_${project.id}`]) : 
        false,
    }));

    const summary = {
      total_trainees: trainees.length,
      completed_uploads: traineeStatus.filter(t => !t.has_pending_uploads).length,
      pending_uploads: traineeStatus.filter(t => t.has_pending_uploads).length,
      target_month: targetMonth,
    };

    return successResponse(res, { summary, traineeStatus });
  } catch (error) {
    console.error('Monthly status error:', error);
    return errorResponse(res, 'Failed to fetch monthly status');
  }
});

// POST /api/instructor/share-progress - Share progress with admin
router.post('/instructor/share-progress', authenticateToken, authorizeInstructor, validate(schemas.shareProgress), async (req, res) => {
  try {
    const { trainee_id, project_id, progress_summary } = req.body;
    const instructorId = req.user.id;

    // Verify trainee and project belong to instructor
    const project = await Project.findOne({
      where: { 
        id: project_id, 
        trainee_id, 
        instructor_id: instructorId 
      },
      include: [{ model: Trainee, as: 'Trainee', attributes: ['name'] }],
    });

    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }

    const progressReview = await ProgressReview.create({
      trainee_id,
      instructor_id: instructorId,
      project_id,
      progress_summary,
      status: 'pending',
    });

    // Create notification for admin
    await Notification.create({
      type: 'progress_shared',
      title: 'Progress Shared for Review',
      message: `${req.user.name} has shared progress for trainee ${project.Trainee.name}`,
      recipient_id: 1, // Admin - make this dynamic based on your needs
      recipient_type: 'admin',
      related_id: progressReview.id,
      related_type: 'progress_review',
    });

    return successResponse(res, progressReview, 'Progress shared successfully', 201);
  } catch (error) {
    console.error('Share progress error:', error);
    return errorResponse(res, 'Failed to share progress');
  }
});

// ==============================================
// NOTIFICATION ROUTES
// ==============================================

// GET /api/notifications - Get user notifications
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const { page, limit, offset } = getPaginationParams(req);
    const { is_read } = req.query;

    let whereClause = {
      recipient_id: req.user.id,
      recipient_type: req.user.userType,
    };

    if (is_read !== undefined) {
      whereClause.is_read = is_read === 'true';
    }

    const { count, rows } = await Notification.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    const unreadCount = await Notification.count({
      where: {
        recipient_id: req.user.id,
        recipient_type: req.user.userType,
        is_read: false,
      },
    });

    const meta = getPaginationMeta(count, page, limit);

    return successResponse(res, { 
      notifications: rows, 
      meta, 
      unreadCount 
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return errorResponse(res, 'Failed to fetch notifications');
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      where: {
        id,
        recipient_id: req.user.id,
        recipient_type: req.user.userType,
      },
    });

    if (!notification) {
      return errorResponse(res, 'Notification not found', 404);
    }

    await notification.update({ is_read: true });

    return successResponse(res, notification, 'Notification marked as read');
  } catch (error) {
    console.error('Mark notification read error:', error);
    return errorResponse(res, 'Failed to mark notification as read');
  }
});

// POST /api/notifications - Create notification (system use)
router.post('/notifications', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { type, title, message, recipient_id, recipient_type, related_id, related_type } = req.body;

    const notification = await Notification.create({
      type,
      title,
      message,
      recipient_id,
      recipient_type,
      related_id,
      related_type,
    });

    return successResponse(res, notification, 'Notification created successfully', 201);
  } catch (error) {
    console.error('Create notification error:', error);
    return errorResponse(res, 'Failed to create notification');
  }
});

// ==============================================
// SHARED ROUTES
// ==============================================

// GET /api/profile - Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    let user;
    if (req.user.userType === 'admin') {
      user = await Admin.findByPk(req.user.id, {
        attributes: { exclude: ['password'] },
      });
    } else {
      user = await Instructor.findByPk(req.user.id, {
        attributes: { exclude: ['password'] },
      });
    }

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, { ...user.toJSON(), userType: req.user.userType });
  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse(res, 'Failed to fetch profile');
  }
});

// PUT /api/profile - Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { password, ...updateData } = req.body;

    let user;
    if (req.user.userType === 'admin') {
      user = await Admin.findByPk(req.user.id);
    } else {
      user = await Instructor.findByPk(req.user.id);
    }

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Update password if provided
    if (password) {
      updateData.password = await hashPassword(password);
    }

    await user.update(updateData);

    const { password: _, ...userData } = user.toJSON();
    return successResponse(res, { ...userData, userType: req.user.userType }, 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse(res, 'Failed to update profile');
  }
});

// GET /api/file/:id - Download/view file
router.get('/file/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findByPk(id);
    if (!document) {
      return errorResponse(res, 'File not found', 404);
    }

    // Check permissions
    if (req.user.userType === 'instructor' && document.instructor_id !== req.user.id) {
      return errorResponse(res, 'Access denied', 403);
    }

    // Check if file exists
    if (!fs.existsSync(document.file_path)) {
      return errorResponse(res, 'File not found on server', 404);
    }

    res.setHeader('Content-Type', document.mime_type);
    res.setHeader('Content-Disposition', `inline; filename="${document.original_name}"`);
    
    const fileStream = fs.createReadStream(document.file_path);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download file error:', error);
    return errorResponse(res, 'Failed to download file');
  }
});

module.exports = router;
