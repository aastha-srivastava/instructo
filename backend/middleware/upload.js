const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Create storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath;
    
    switch (file.fieldname) {
      case 'projectReport':
        uploadPath = path.join(process.env.UPLOAD_DIR || 'uploads', 'project-reports');
        break;
      case 'attendanceDocument':
        uploadPath = path.join(process.env.UPLOAD_DIR || 'uploads', 'attendance');
        break;
      case 'monthlyAttendance':
        uploadPath = path.join(process.env.UPLOAD_DIR || 'uploads', 'monthly-attendance');
        break;
      default:
        uploadPath = path.join(process.env.UPLOAD_DIR || 'uploads', 'documents');
    }
    
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const traineeId = req.body.trainee_id || 'unknown';
    const projectId = req.body.project_id || 'unknown';
    
    let fileName;
    switch (file.fieldname) {
      case 'projectReport':
        fileName = `${traineeId}_${projectId}_report_${timestamp}${path.extname(file.originalname)}`;
        break;
      case 'attendanceDocument':
        fileName = `${traineeId}_${projectId}_attendance_${timestamp}${path.extname(file.originalname)}`;
        break;
      case 'monthlyAttendance':
        const month = req.body.upload_month || new Date().toISOString().slice(0, 7);
        fileName = `${traineeId}_monthly_${month}_${timestamp}${path.extname(file.originalname)}`;
        break;
      default:
        fileName = `${traineeId}_document_${timestamp}${path.extname(file.originalname)}`;
    }
    
    cb(null, fileName);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    projectReport: ['.pdf', '.docx', '.doc'],
    attendanceDocument: ['.pdf', '.jpg', '.jpeg', '.png'],
    monthlyAttendance: ['.pdf', '.jpg', '.jpeg', '.png'],
    document: ['.pdf', '.docx', '.doc', '.jpg', '.jpeg', '.png']
  };

  const fileExtension = path.extname(file.originalname).toLowerCase();
  const fieldAllowedTypes = allowedTypes[file.fieldname] || allowedTypes.document;

  if (fieldAllowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for ${file.fieldname}. Allowed types: ${fieldAllowedTypes.join(', ')}`), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
  },
});

// Middleware for project completion with required files
const uploadProjectCompletion = upload.fields([
  { name: 'projectReport', maxCount: 1 },
  { name: 'attendanceDocument', maxCount: 1 }
]);

// Middleware for monthly attendance upload
const uploadMonthlyAttendance = upload.single('monthlyAttendance');

// Middleware for general document upload
const uploadDocument = upload.single('document');

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 10MB.',
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field.',
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'File upload error: ' + error.message,
        });
    }
  }
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'File upload error: ' + error.message,
    });
  }
  
  next();
};

module.exports = {
  uploadProjectCompletion,
  uploadMonthlyAttendance,
  uploadDocument,
  handleUploadError,
};
