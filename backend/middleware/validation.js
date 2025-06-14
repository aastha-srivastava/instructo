const Joi = require('joi');

const validationSchemas = {
  // Authentication schemas
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6),
    userType: Joi.string().valid('admin', 'instructor').required(),
  }),

  sendOTP: Joi.object({
    email: Joi.string().email().required(),
    userType: Joi.string().valid('admin', 'instructor').required(),
  }),

  verifyOTP: Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
    userType: Joi.string().valid('admin', 'instructor').required(),
  }),

  // Admin schemas
  createAdmin: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
    title: Joi.string().min(2).max(100).required(),
    department: Joi.string().max(100).optional(),
    password: Joi.string().min(6).required(),
  }),

  updateAdmin: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
    title: Joi.string().min(2).max(100).optional(),
    department: Joi.string().max(100).optional(),
    is_active: Joi.boolean().optional(),
  }),

  // Instructor schemas
  createInstructor: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
    department: Joi.string().min(2).max(100).required(),
    role: Joi.string().min(2).max(100).required(),
    specialization: Joi.string().max(200).optional(),
    password: Joi.string().min(6).required(),
  }),

  updateInstructor: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
    department: Joi.string().min(2).max(100).optional(),
    role: Joi.string().min(2).max(100).optional(),
    specialization: Joi.string().max(200).optional(),
    is_active: Joi.boolean().optional(),
  }),

  // Trainee schemas
  createTrainee: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
    institution: Joi.string().min(2).max(200).required(),
    course: Joi.string().min(2).max(100).required(),
    year_of_study: Joi.number().integer().min(1).max(10).required(),
    address: Joi.string().min(10).required(),
    emergency_contact: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
    guardian_name: Joi.string().min(2).max(100).required(),
    guardian_phone: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
    guardian_relation: Joi.string().min(2).max(50).required(),
    reference_name: Joi.string().min(2).max(100).required(),
    reference_phone: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
    reference_designation: Joi.string().min(2).max(100).required(),
  }),

  updateTrainee: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
    institution: Joi.string().min(2).max(200).optional(),
    course: Joi.string().min(2).max(100).optional(),
    year_of_study: Joi.number().integer().min(1).max(10).optional(),
    address: Joi.string().min(10).optional(),
    emergency_contact: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
    guardian_name: Joi.string().min(2).max(100).optional(),
    guardian_phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
    guardian_relation: Joi.string().min(2).max(50).optional(),
    reference_name: Joi.string().min(2).max(100).optional(),
    reference_phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
    reference_designation: Joi.string().min(2).max(100).optional(),
  }),

  approveTrainee: Joi.object({
    status: Joi.string().valid('approved', 'rejected').required(),
    approval_comments: Joi.string().max(500).optional(),
  }),

  // Project schemas
  createProject: Joi.object({
    title: Joi.string().min(5).max(200).required(),
    description: Joi.string().min(10).required(),
    expected_duration_days: Joi.number().integer().min(1).max(365).required(),
    trainee_id: Joi.number().integer().required(),
  }),

  updateProject: Joi.object({
    title: Joi.string().min(5).max(200).optional(),
    description: Joi.string().min(10).optional(),
    expected_duration_days: Joi.number().integer().min(1).max(365).optional(),
    status: Joi.string().valid('assigned', 'in_progress', 'completed').optional(),
  }),

  completeProject: Joi.object({
    performance_rating: Joi.number().min(1).max(10).required(),
  }),

  // Progress schemas
  addProgress: Joi.object({
    project_id: Joi.number().integer().required(),
    progress_description: Joi.string().min(10).required(),
    percentage_completed: Joi.number().integer().min(0).max(100).required(),
  }),

  shareProgress: Joi.object({
    trainee_id: Joi.number().integer().required(),
    project_id: Joi.number().integer().required(),
    progress_summary: Joi.string().min(20).required(),
  }),

  reviewProgress: Joi.object({
    review_comments: Joi.string().max(1000).optional(),
  }),
};

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorMessage,
      });
    }
    
    next();
  };
};

module.exports = {
  validate,
  schemas: validationSchemas,
};
