const jwt = require('jsonwebtoken');
const { Admin, Instructor } = require('../models');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let user;
    if (decoded.role === 'admin') {
      user = await Admin.findByPk(decoded.id);
    } else if (decoded.role === 'instructor') {
      user = await Instructor.findByPk(decoded.id);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    req.user = user;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Insufficient permissions'
      });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole
};
