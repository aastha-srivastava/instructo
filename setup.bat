@echo off
echo 🚀 Setting up Instructo - Trainee Management System
echo ==================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js v16 or higher.
    pause
    exit /b 1
)

REM Check if MySQL is installed
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ MySQL is not installed. Please install MySQL v8.0 or higher.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Setup Backend
echo.
echo 📦 Setting up Backend...
cd backend

REM Install dependencies
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo ⚠️  .env file not found. Please create .env file with your configuration.
    echo 📝 Refer to the README.md for environment variable setup.
    pause
    exit /b 1
)

REM Create database
echo.
echo 🗄️  Creating database...
echo Please enter your MySQL root password when prompted:
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS instructo_db;"

if %errorlevel% neq 0 (
    echo ❌ Failed to create database. Please check your MySQL configuration.
    pause
    exit /b 1
)

REM Run database seeding
echo.
echo 🌱 Seeding database with initial data...
npm run seed

if %errorlevel% neq 0 (
    echo ❌ Failed to seed database. Please check your database configuration.
    pause
    exit /b 1
)

echo ✅ Backend setup completed

REM Setup Frontend
echo.
echo 🎨 Setting up Frontend...
cd ..\frontend

REM Install dependencies
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

echo ✅ Frontend setup completed

REM Final instructions
echo.
echo 🎉 Setup completed successfully!
echo ================================
echo.
echo 🔐 Default Admin Credentials:
echo    Email: aasthasrivastava777@gmail.com
echo    Password: ja.nvi0125
echo.
echo 🚀 To start the application:
echo.
echo    1. Start Backend (Terminal 1):
echo       cd backend && npm run dev
echo.
echo    2. Start Frontend (Terminal 2):
echo       cd frontend && npm run dev
echo.
echo    3. Access the application:
echo       Frontend: http://localhost:3000
echo       Backend API: http://localhost:5000
echo.
echo 📚 For more information, check README.md
echo.
echo Happy coding! 🎊
pause
