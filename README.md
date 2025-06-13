# Instructo - Trainee Management System

**A comprehensive web-based trainee management system that streamlines the end-to-end training process within an organization.**

## 🚀 Features

### User Management
- **Admin Panel**: Create and manage admins, instructors, and approve trainee applications
- **Instructor Dashboard**: Manage trainees, projects, and track progress
- **Role-based Access Control**: Secure authentication with JWT and OTP support

### Trainee Management
- Complete trainee lifecycle management from application to completion
- Guardian and reference person details tracking
- Status-based workflow (Pending → Approved → Active → Completed)

### Project Management
- Assign projects to trainees with deadlines
- Real-time progress tracking with daily updates
- Project completion with mandatory document uploads
- Performance rating system (1-10 scale)

### Document Management
- File upload for project reports and attendance records
- Monthly attendance tracking
- Organized document storage with project linking
- Automatic email notifications to Training and HRD departments

### Workflow Automation
- Admin approval workflow for new trainees
- Automatic email generation on project completion
- Progress sharing between instructors and admins
- Real-time notifications system

## 🛠 Technology Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **MySQL** with **Sequelize ORM** - Database
- **JWT** authentication with **OTP** support
- **Multer** for file uploads
- **Nodemailer** for email notifications
- **Joi** for input validation

### Frontend
- **Vite** + **React** + **TypeScript** - Modern development stack
- **Tailwind CSS** + **shadcn/ui** - Styling and components
- **React Query** - Data fetching and state management
- **React Router** - Navigation
- **React Hook Form** - Form handling
- **Zustand** - Client state management

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **MySQL** (v8.0 or higher)
- **npm** or **yarn**

## ⚙ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd instructo
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials and email settings

# Create MySQL database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS instructo_db;"

# Seed the database (creates tables and sample data)
npm run seed

# Start the backend server
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/health

## 🔐 Default Credentials

After running the seeder:

### Admin Account
- **Email**: aasthasrivastava777@gmail.com
- **Password**: ja.nvi0125

### Sample Instructor Accounts
- **Email**: rajesh.kumar@company.com, **Password**: instructor123
- **Email**: meera.sharma@company.com, **Password**: instructor456
- **Email**: amit.verma@company.com, **Password**: instructor789

## 📁 Project Structure

```
instructo/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── middleware/     # Authentication, validation, upload
│   │   ├── models/         # Sequelize models
│   │   ├── routes/         # API routes
│   │   ├── seeders/        # Database seeders
│   │   ├── utils/          # Utility functions
│   │   └── server.js       # Express server
│   ├── uploads/            # File storage
│   ├── .env                # Environment variables
│   └── package.json
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth, Theme)
│   │   ├── layouts/        # Layout components
│   │   ├── lib/           # API client, utilities
│   │   ├── pages/         # Page components
│   │   ├── types/         # TypeScript type definitions
│   │   └── App.tsx        # Main app component
│   ├── public/            # Static assets
│   └── package.json
│
└── README.md              # This file
```

## 🔧 Configuration

### Environment Variables (.env)

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=instructo_db
DB_USER=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=24h

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Department Emails
TRAINING_DEPT_EMAIL=training@company.com
HRD_DEPT_EMAIL=hrd@company.com

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png
```

### Email Setup (Gmail)

1. Enable 2-factor authentication on your Gmail account
2. Generate an "App Password" for the application
3. Use this app password in the `EMAIL_PASS` environment variable

## 🔄 Workflows

### Trainee Creation Workflow
1. **Instructor** creates trainee with complete details
2. **System** generates notification to admin
3. **Admin** reviews and approves/rejects
4. **System** notifies instructor of decision
5. **Approved trainees** can be assigned projects

### Project Completion Workflow
1. **Instructor** assigns project to trainee
2. **System** auto-sets start date
3. **Instructor** tracks daily progress
4. **Project completion** requires:
   - Performance rating (1-10)
   - Project report upload (PDF/DOCX)
   - Attendance document upload (PDF/Image)
5. **System** automatically emails Training and HRD departments

## 📊 Database Schema

### Core Models
- **Admins** - System administrators
- **Instructors** - Training instructors
- **Trainees** - Students in training programs
- **Projects** - Assigned training projects
- **ProjectProgress** - Daily progress tracking
- **Documents** - File uploads and management
- **Notifications** - System notifications
- **ProgressReviews** - Admin review system

## 🚦 API Endpoints

### Authentication
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP login

### Admin Routes
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/instructors` - Manage instructors
- `GET /api/admin/trainees/pending` - Pending approvals
- `PUT /api/admin/trainees/:id/approve` - Approve/reject trainee

### Instructor Routes
- `GET /api/instructor/dashboard` - Dashboard statistics
- `POST /api/instructor/trainees` - Create trainee
- `POST /api/instructor/projects` - Create project
- `PUT /api/instructor/projects/:id/complete` - Complete project
- `POST /api/instructor/documents/upload` - Upload documents

## 🎨 UI Features

### Design System
- **Dark/Light mode** toggle
- **Responsive design** for all screen sizes
- **Modern UI** with shadcn/ui components
- **Consistent theme** across all pages

### Key Components
- **Interactive dashboards** with statistics
- **Data tables** with search and filtering
- **File upload** with drag-and-drop
- **Real-time notifications**
- **Form validation** and error handling

## 🔒 Security Features

- **JWT token** authentication
- **Password hashing** with bcrypt
- **OTP verification** for enhanced security
- **Rate limiting** on API endpoints
- **Input validation** and sanitization
- **File upload** restrictions and validation
- **CORS** configuration for cross-origin requests

## 📧 Email Notifications

The system automatically sends emails for:
- **OTP verification** during login
- **Trainee approval/rejection** notifications
- **Project completion** notifications to departments
- **Progress review** notifications

## 📱 Responsive Design

- **Mobile-first** approach
- **Tablet optimization**
- **Desktop enhancements**
- **Touch-friendly** interface elements

## 🔧 Development Scripts

### Backend
```bash
npm run dev          # Start development server
npm run start        # Start production server
npm run seed         # Seed database with sample data
npm test            # Run tests
```

### Frontend
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
```

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Set up HTTPS
- [ ] Configure process manager (PM2)
- [ ] Set up file backup strategy
- [ ] Configure email settings
- [ ] Test all workflows

### Docker Deployment (Optional)
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists

**Email Not Sending**
- Verify Gmail app password
- Check firewall settings
- Confirm SMTP configuration

**File Upload Issues**
- Check file size limits
- Verify upload directory permissions
- Confirm allowed file types

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for efficient trainee management**
