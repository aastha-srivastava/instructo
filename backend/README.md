# Instructo Backend

This is the backend service for Instructo - Trainee Management System.

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update database credentials and other configuration

3. Set up the database:
```bash
# Create the database (if not exists)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS instructo_db;"

# Run database migrations and seeding
npm run seed
```

4. Start the development server:
```bash
npm run dev
```

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm run seed` - Seed database with initial data
- `npm test` - Run tests

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/logout` - Logout

### Admin Routes
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/admins` - List admins
- `POST /api/admin/admins` - Create admin
- `PUT /api/admin/admins/:id` - Update admin
- `DELETE /api/admin/admins/:id` - Delete admin
- `GET /api/admin/instructors` - List instructors
- `POST /api/admin/instructors` - Create instructor
- `PUT /api/admin/instructors/:id` - Update instructor
- `GET /api/admin/trainees/pending` - Pending trainee approvals
- `PUT /api/admin/trainees/:id/approve` - Approve/reject trainee
- `GET /api/admin/progress-reviews` - List progress reviews
- `PUT /api/admin/progress-reviews/:id` - Mark review as completed

### Instructor Routes
- `GET /api/instructor/dashboard` - Dashboard statistics
- `GET /api/instructor/trainees` - List trainees
- `POST /api/instructor/trainees` - Create trainee
- `PUT /api/instructor/trainees/:id` - Update trainee
- `GET /api/instructor/projects` - List projects
- `POST /api/instructor/projects` - Create project
- `PUT /api/instructor/projects/:id` - Update project
- `PUT /api/instructor/projects/:id/complete` - Complete project with uploads
- `POST /api/instructor/progress` - Update project progress
- `POST /api/instructor/documents/upload` - Upload document
- `GET /api/instructor/documents` - List documents
- `POST /api/instructor/attendance/upload` - Upload attendance
- `GET /api/instructor/monthly-status` - Monthly upload status
- `POST /api/instructor/share-progress` - Share progress with admin

### Notification Routes
- `GET /api/notifications` - List notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `POST /api/notifications` - Create notification
- `DELETE /api/notifications/:id` - Delete notification

## File Upload

The system supports file uploads for:
- Project reports (PDF, DOCX)
- Attendance documents (PDF, Images)
- Other documents

Files are stored in the `uploads/` directory with organized folder structure.

## Email Configuration

Configure SMTP settings in `.env` file:
- Gmail SMTP is pre-configured
- Update `EMAIL_USER` and `EMAIL_PASS` with your credentials
- Use App Password for Gmail

## Default Credentials

After seeding, use these credentials:
- **Admin**: aasthasrivastava777@gmail.com / ja.nvi0125
- **Instructor**: Check console output after seeding

## Database Schema

The system uses MySQL with the following main tables:
- `admins` - Admin users
- `instructors` - Instructor users  
- `trainees` - Trainee records
- `projects` - Project assignments
- `project_progress` - Daily progress tracking
- `documents` - File uploads
- `notifications` - System notifications
- `progress_reviews` - Progress sharing with admins

## Security Features

- JWT token authentication
- Password hashing (bcrypt)
- Rate limiting
- Input validation (Joi)
- File upload restrictions
- CORS configuration

## Deployment

For production deployment:
1. Set `NODE_ENV=production`  
2. Configure production database
3. Set up HTTPS
4. Configure process manager (PM2)
5. Set up file backup strategy
