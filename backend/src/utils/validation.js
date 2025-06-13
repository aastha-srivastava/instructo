const Joi = require('joi');

// Authentication validation schemas
const authSchemas = {
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).optional().messages({
      'string.min': 'Password must be at least 6 characters long'
    }),
    role: Joi.string().valid('admin', 'instructor').required().messages({
      'any.only': 'Role must be either admin or instructor',
      'any.required': 'Role is required'
    })
  }),

  sendOTP: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    role: Joi.string().valid('admin', 'instructor').required().messages({
      'any.only': 'Role must be either admin or instructor',
      'any.required': 'Role is required'
    })
  }),

  verifyOTP: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    otp: Joi.string().length(6).pattern(/^[0-9]+$/).required().messages({
      'string.length': 'OTP must be exactly 6 digits',
      'string.pattern.base': 'OTP must contain only numbers',
      'any.required': 'OTP is required'
    }),
    role: Joi.string().valid('admin', 'instructor').required().messages({
      'any.only': 'Role must be either admin or instructor',
      'any.required': 'Role is required'
    })
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    role: Joi.string().valid('admin', 'instructor').required().messages({
      'any.only': 'Role must be either admin or instructor',
      'any.required': 'Role is required'
    })
  })
};

// Admin validation schemas
const adminSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).max(100).required().messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 100 characters',
      'any.required': 'Password is required'
    })
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100).optional().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters'
    }),
    email: Joi.string().email().optional().messages({
      'string.email': 'Please provide a valid email address'
    })
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100).optional().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters'
    }),
    email: Joi.string().email().optional().messages({
      'string.email': 'Please provide a valid email address'
    })
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': 'Current password is required'
    }),
    newPassword: Joi.string().min(6).max(100).required().messages({
      'string.min': 'New password must be at least 6 characters long',
      'string.max': 'New password cannot exceed 100 characters',
      'any.required': 'New password is required'
    })
  })
};

// Instructor validation schemas
const instructorSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    employee_id: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Employee ID must be at least 2 characters long',
      'string.max': 'Employee ID cannot exceed 50 characters',
      'any.required': 'Employee ID is required'
    }),
    department: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Department must be at least 2 characters long',
      'string.max': 'Department cannot exceed 100 characters',
      'any.required': 'Department is required'
    }),
    phone: Joi.string().min(10).max(15).optional().messages({
      'string.min': 'Phone number must be at least 10 characters long',
      'string.max': 'Phone number cannot exceed 15 characters'
    })
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100).optional().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters'
    }),
    email: Joi.string().email().optional().messages({
      'string.email': 'Please provide a valid email address'
    }),
    employee_id: Joi.string().min(2).max(50).optional().messages({
      'string.min': 'Employee ID must be at least 2 characters long',
      'string.max': 'Employee ID cannot exceed 50 characters'
    }),
    department: Joi.string().min(2).max(100).optional().messages({
      'string.min': 'Department must be at least 2 characters long',
      'string.max': 'Department cannot exceed 100 characters'
    }),
    phone: Joi.string().min(10).max(15).optional().messages({
      'string.min': 'Phone number must be at least 10 characters long',
      'string.max': 'Phone number cannot exceed 15 characters'
    }),
    status: Joi.string().valid('active', 'inactive', 'suspended').optional().messages({
      'any.only': 'Status must be active, inactive, or suspended'
    })
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': 'Current password is required'
    }),
    newPassword: Joi.string().min(6).max(100).required().messages({
      'string.min': 'New password must be at least 6 characters long',
      'string.max': 'New password cannot exceed 100 characters',
      'any.required': 'New password is required'
    })
  })
};

// Trainee validation schemas
const traineeSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    phone: Joi.string().min(10).max(15).optional().messages({
      'string.min': 'Phone number must be at least 10 characters long',
      'string.max': 'Phone number cannot exceed 15 characters'
    }),
    address: Joi.string().max(500).optional().messages({
      'string.max': 'Address cannot exceed 500 characters'
    }),
    qualification: Joi.string().max(200).optional().messages({
      'string.max': 'Qualification cannot exceed 200 characters'
    }),
    experience: Joi.string().max(500).optional().messages({
      'string.max': 'Experience cannot exceed 500 characters'
    }),
    training_domain: Joi.string().max(100).optional().messages({
      'string.max': 'Training domain cannot exceed 100 characters'
    }),
    expected_duration: Joi.number().integer().min(1).max(365).optional().messages({
      'number.base': 'Expected duration must be a number',
      'number.integer': 'Expected duration must be a whole number',
      'number.min': 'Expected duration must be at least 1 day',
      'number.max': 'Expected duration cannot exceed 365 days'
    }),
    start_date: Joi.date().optional().messages({
      'date.base': 'Start date must be a valid date'
    }),
    remarks: Joi.string().max(1000).optional().messages({
      'string.max': 'Remarks cannot exceed 1000 characters'
    })
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100).optional().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters'
    }),
    email: Joi.string().email().optional().messages({
      'string.email': 'Please provide a valid email address'
    }),
    phone: Joi.string().min(10).max(15).optional().messages({
      'string.min': 'Phone number must be at least 10 characters long',
      'string.max': 'Phone number cannot exceed 15 characters'
    }),
    address: Joi.string().max(500).optional().messages({
      'string.max': 'Address cannot exceed 500 characters'
    }),
    qualification: Joi.string().max(200).optional().messages({
      'string.max': 'Qualification cannot exceed 200 characters'
    }),
    experience: Joi.string().max(500).optional().messages({
      'string.max': 'Experience cannot exceed 500 characters'
    }),
    training_domain: Joi.string().max(100).optional().messages({
      'string.max': 'Training domain cannot exceed 100 characters'
    }),
    expected_duration: Joi.number().integer().min(1).max(365).optional().messages({
      'number.base': 'Expected duration must be a number',
      'number.integer': 'Expected duration must be a whole number',
      'number.min': 'Expected duration must be at least 1 day',
      'number.max': 'Expected duration cannot exceed 365 days'
    }),
    start_date: Joi.date().optional().messages({
      'date.base': 'Start date must be a valid date'
    }),
    status: Joi.string().valid('pending', 'active', 'completed', 'suspended', 'rejected').optional().messages({
      'any.only': 'Status must be pending, active, completed, suspended, or rejected'
    }),
    remarks: Joi.string().max(1000).optional().messages({
      'string.max': 'Remarks cannot exceed 1000 characters'
    })
  })
};

// Project validation schemas
const projectSchemas = {
  create: Joi.object({
    trainee_id: Joi.string().uuid().required().messages({
      'string.guid': 'Trainee ID must be a valid UUID',
      'any.required': 'Trainee ID is required'
    }),
    title: Joi.string().min(3).max(200).required().messages({
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title cannot exceed 200 characters',
      'any.required': 'Title is required'
    }),
    description: Joi.string().max(2000).optional().messages({
      'string.max': 'Description cannot exceed 2000 characters'
    }),
    technology_stack: Joi.string().max(500).optional().messages({
      'string.max': 'Technology stack cannot exceed 500 characters'
    }),
    start_date: Joi.date().required().messages({
      'date.base': 'Start date must be a valid date',
      'any.required': 'Start date is required'
    }),
    expected_end_date: Joi.date().greater(Joi.ref('start_date')).required().messages({
      'date.base': 'Expected end date must be a valid date',
      'date.greater': 'Expected end date must be after start date',
      'any.required': 'Expected end date is required'
    }),
    priority: Joi.string().valid('low', 'medium', 'high').optional().messages({
      'any.only': 'Priority must be low, medium, or high'
    }),
    requirements: Joi.string().max(2000).optional().messages({
      'string.max': 'Requirements cannot exceed 2000 characters'
    })
  }),

  update: Joi.object({
    title: Joi.string().min(3).max(200).optional().messages({
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title cannot exceed 200 characters'
    }),
    description: Joi.string().max(2000).optional().messages({
      'string.max': 'Description cannot exceed 2000 characters'
    }),
    technology_stack: Joi.string().max(500).optional().messages({
      'string.max': 'Technology stack cannot exceed 500 characters'
    }),
    start_date: Joi.date().optional().messages({
      'date.base': 'Start date must be a valid date'
    }),
    expected_end_date: Joi.date().optional().messages({
      'date.base': 'Expected end date must be a valid date'
    }),
    actual_end_date: Joi.date().optional().messages({
      'date.base': 'Actual end date must be a valid date'
    }),
    status: Joi.string().valid('pending', 'in_progress', 'completed', 'on_hold', 'cancelled').optional().messages({
      'any.only': 'Status must be pending, in_progress, completed, on_hold, or cancelled'
    }),
    priority: Joi.string().valid('low', 'medium', 'high').optional().messages({
      'any.only': 'Priority must be low, medium, or high'
    }),
    requirements: Joi.string().max(2000).optional().messages({
      'string.max': 'Requirements cannot exceed 2000 characters'
    }),
    final_remarks: Joi.string().max(1000).optional().messages({
      'string.max': 'Final remarks cannot exceed 1000 characters'
    })
  })
};

// Progress validation schemas
const progressSchemas = {
  create: Joi.object({
    trainee_id: Joi.string().uuid().required().messages({
      'string.guid': 'Trainee ID must be a valid UUID',
      'any.required': 'Trainee ID is required'
    }),
    project_id: Joi.string().uuid().optional().messages({
      'string.guid': 'Project ID must be a valid UUID'
    }),
    date: Joi.date().required().messages({
      'date.base': 'Date must be a valid date',
      'any.required': 'Date is required'
    }),
    description: Joi.string().min(10).max(2000).required().messages({
      'string.min': 'Description must be at least 10 characters long',
      'string.max': 'Description cannot exceed 2000 characters',
      'any.required': 'Description is required'
    }),
    completion_percentage: Joi.number().min(0).max(100).optional().messages({
      'number.base': 'Completion percentage must be a number',
      'number.min': 'Completion percentage cannot be less than 0',
      'number.max': 'Completion percentage cannot be more than 100'
    }),
    challenges_faced: Joi.string().max(1000).optional().messages({
      'string.max': 'Challenges faced cannot exceed 1000 characters'
    }),
    next_steps: Joi.string().max(1000).optional().messages({
      'string.max': 'Next steps cannot exceed 1000 characters'
    })
  })
};

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    next();
  };
};

module.exports = {
  authSchemas,
  adminSchemas,
  instructorSchemas,
  traineeSchemas,
  projectSchemas,
  progressSchemas,
  validate
};
