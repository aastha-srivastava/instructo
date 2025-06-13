const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = path.join(__dirname, '../../uploads');
    
    // Create subdirectories based on file type
    if (file.fieldname === 'project_report') {
      uploadPath = path.join(uploadPath, 'project_reports');
    } else if (file.fieldname === 'attendance_document') {
      uploadPath = path.join(uploadPath, 'attendance_records');
    } else {
      uploadPath = path.join(uploadPath, 'documents');
    }
    
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extension);
    
    // Create a structured filename
    const filename = `${basename}_${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES.split(',');
  const fileExtension = path.extname(file.originalname).toLowerCase().slice(1);
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`File type .${fileExtension} is not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 5 // Maximum 5 files at once
  },
  fileFilter: fileFilter
});

// Middleware for project completion (requires both project report and attendance document)
const uploadProjectCompletion = upload.fields([
  { name: 'project_report', maxCount: 1 },
  { name: 'attendance_document', maxCount: 1 }
]);

// Middleware for single document upload
const uploadSingleDocument = upload.single('document');

// Middleware for multiple documents
const uploadMultipleDocuments = upload.array('documents', 5);

module.exports = {
  upload,
  uploadProjectCompletion,
  uploadSingleDocument,
  uploadMultipleDocuments
};
