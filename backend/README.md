# Instructo - Trainee Management System Backend

A comprehensive web-based Trainee Management System that streamlines the end-to-end training process within NHPC. This backend provides secure, role-based APIs for Admins and Instructors to manage trainees, projects, and training workflows.

## 🚀 Features

### Admin Features
- **Dashboard**: Complete overview with statistics and recent activity
- **Admin Management**: Create, update, and manage admin accounts
- **Instructor Management**: Create and manage instructor accounts
- **Trainee Approval**: Review and approve/reject trainee applications
- **Progress Reviews**: Review progress shared by instructors
- **System Notifications**: Comprehensive notification system

### Instructor Features
- **Dashboard**: Personalized dashboard with trainee and project overview
- **Trainee Management**: Create, update, and manage trainee profiles
- **Project Management**: Create, assign, and track project progress
- **Project Completion**: Complete projects with required documentation
- **Document Management**: Upload and manage project-related documents
- **Monthly Records**: Upload monthly attendance records
- **Progress Sharing**: Share trainee progress with admin for review

### Shared Features
- **Authentication**: JWT-based authentication with OTP support
- **Profile Management**: Update personal information and security settings
- **Notifications**: Real-time notification system
- **File Management**: Secure file upload and download
- **Search & Pagination**: Advanced search and pagination across all modules

## 🛠 Technology Stack

- **Backend**: Node.js + Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **File Upload**: Multer for handling file uploads
- **Email Service**: Nodemailer for email notifications
- **Security**: Helmet, CORS, Rate limiting
- **Validation**: Joi for input validation

## 📁 Project Structure

```
instructo/
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   ├── auth.js              # Authentication middleware
│   ├── validation.js        # Input validation middleware
│   └── upload.js            # File upload middleware
├── models/
│   └── index.js             # Sequelize models
├── routes/
│   └── index.js             # All API routes
├── seeders/
│   └── initialSeed.js       # Initial data seeding
├── utils/
│   ├── helpers.js           # Utility functions
│   └── email.js             # Email service
├── uploads/                 # File upload directory
├── .env                     # Environment variables
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies and scripts
└── server.js               # Main server file
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd instructo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   - Copy `.env.example` to `.env`
   - Update the database credentials and other configurations

4. **Setup MySQL Database**
   ```sql
   CREATE DATABASE instructo_db;
   ```

5. **Run database migrations and seeding**
   ```bash
   npm run seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## 🔧 Environment Variables

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=instructo_db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Training Department Emails
TRAINING_DEPT_EMAIL=training@nhpc.com
HRD_DEPT_EMAIL=hrd@nhpc.com

# Application Configuration
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

### Admin Endpoints

- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/admins` - List all admins
- `POST /api/admin/admins` - Create new admin
- `PUT /api/admin/admins/:id` - Update admin
- `DELETE /api/admin/admins/:id` - Delete admin
- `GET /api/admin/instructors` - List all instructors
- `POST /api/admin/instructors` - Create instructor
- `PUT /api/admin/instructors/:id` - Update instructor
- `GET /api/admin/trainees/pending` - Pending approval trainees
- `PUT /api/admin/trainees/:id/approve` - Approve/reject trainee
- `GET /api/admin/progress-reviews` - List progress reviews
- `PUT /api/admin/progress-reviews/:id` - Mark progress as reviewed

### Instructor Endpoints

- `GET /api/instructor/dashboard` - Dashboard statistics
- `GET /api/instructor/trainees` - List instructor's trainees
- `POST /api/instructor/trainees` - Create new trainee
- `PUT /api/instructor/trainees/:id` - Update trainee
- `GET /api/instructor/projects` - List projects
- `POST /api/instructor/projects` - Create project
- `PUT /api/instructor/projects/:id` - Update project
- `PUT /api/instructor/projects/:id/complete` - Complete project with uploads
- `POST /api/instructor/progress` - Update project progress
- `POST /api/instructor/documents/upload` - Upload document
- `GET /api/instructor/documents` - List documents
- `POST /api/instructor/attendance/upload` - Upload monthly attendance
- `GET /api/instructor/monthly-status` - Get monthly upload status
- `POST /api/instructor/share-progress` - Share progress with admin

### Shared Endpoints

- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `GET /api/file/:id` - Download/view file

## 🔐 Default Login Credentials

After running the seed script, you can use these credentials:

### Admin Accounts
- **System Administrator**
  - Email: `admin@nhpc.com`
  - Password: `admin123`

- **Training Head**
  - Email: `training.head@nhpc.com`
  - Password: `training123`

- **HR Manager**
  - Email: `hr.manager@nhpc.com`
  - Password: `hr123`

### Instructor Accounts
- **Dr. Rajesh Kumar** (Electrical Engineering)
  - Email: `rajesh.kumar@nhpc.com`
  - Password: `instructor123`

- **Ms. Priya Sharma** (Mechanical Engineering)
  - Email: `priya.sharma@nhpc.com`
  - Password: `instructor123`

- **Mr. Amit Singh** (Civil Engineering)
  - Email: `amit.singh@nhpc.com`
  - Password: `instructor123`

- **Dr. Sunita Gupta** (Environmental Engineering)
  - Email: `sunita.gupta@nhpc.com`
  - Password: `instructor123`

## 📊 Database Schema

### Key Models

- **Admin**: System administrators with full access
- **Instructor**: Training instructors who manage trainees
- **Trainee**: Students undergoing training (no login access)
- **Project**: Training projects assigned to trainees
- **ProjectProgress**: Daily progress tracking for projects
- **ProgressReview**: Progress shared with admin for review
- **Document**: File uploads and document management
- **Notification**: System notifications
- **OTP**: One-time passwords for authentication

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **OTP Verification**: Email-based OTP for additional security
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive input validation with Joi
- **File Upload Security**: File type and size validation
- **CORS Protection**: Cross-origin resource sharing protection
- **Helmet Security**: Security headers with Helmet.js

## 📤 File Upload Specifications

### Supported File Types
- **Project Reports**: PDF, DOCX
- **Attendance Records**: PDF, JPG, PNG, JPEG
- **General Documents**: PDF, DOCX, DOC, JPG, PNG

### File Size Limits
- Maximum file size: 10MB per file
- Storage: Local file system with organized folder structure

### Upload Organization
```
uploads/
├── project-reports/         # Project completion reports
├── attendance/             # Attendance documents
├── monthly-attendance/     # Monthly attendance records
└── documents/             # General documents
```

## 📧 Email Integration

### Email Types
- **OTP Verification**: Login OTP codes
- **Welcome Emails**: New account creation
- **Trainee Status**: Approval/rejection notifications
- **Project Completion**: Automatic emails to Training & HRD
- **Monthly Reminders**: Attendance upload reminders

### Email Templates
All emails use responsive HTML templates with NHPC branding and consistent styling.

## 🔧 Development Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run database seeding
npm run seed

# Run tests (when implemented)
npm test
```

## 🚀 Deployment Considerations

### Production Setup
1. **Environment Variables**: Update all production values
2. **Database**: Set up production MySQL database
3. **Email Service**: Configure production SMTP settings
4. **File Storage**: Consider cloud storage for production
5. **Security**: Enable HTTPS and update CORS settings
6. **Monitoring**: Add logging and monitoring solutions

### Performance Optimization
- Database indexing for frequently queried fields
- API response caching where appropriate
- File upload optimization with streaming
- Database connection pooling

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation for endpoint details

## 🔮 Future Enhancements

- **Real-time Notifications**: WebSocket integration
- **Advanced Analytics**: Detailed reporting and analytics
- **Mobile API**: Enhanced mobile app support
- **Cloud Storage**: Integration with cloud storage services
- **Advanced Search**: Full-text search capabilities
- **Audit Logging**: Comprehensive audit trail
- **Multi-language Support**: Internationalization
