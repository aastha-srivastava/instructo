const jwt = require('jsonwebtoken');
const { Admin, Instructor } = require('../models');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let user;
    if (decoded.userType === 'admin') {
      user = await Admin.findByPk(decoded.id);
    } else if (decoded.userType === 'instructor') {
      user = await Instructor.findByPk(decoded.id);
    }

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found',
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      userType: decoded.userType,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }
    
    return res.status(403).json({
      success: false,
      message: 'Invalid token',
    });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      });
    }

    next();
  };
};

const authorizeAdmin = authorizeRoles('admin');
const authorizeInstructor = authorizeRoles('instructor');
const authorizeAdminOrInstructor = authorizeRoles('admin', 'instructor');

module.exports = {
  authenticateToken,
  authorizeRoles,
  authorizeAdmin,
  authorizeInstructor,
  authorizeAdminOrInstructor,
};
