#!/bin/bash

# Instructo Setup Script
echo "🚀 Setting up Instructo - Trainee Management System"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL v8.0 or higher."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Setup Backend
echo ""
echo "📦 Setting up Backend..."
cd backend

# Install dependencies
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Please create .env file with your configuration."
    echo "📝 Refer to the README.md for environment variable setup."
    exit 1
fi

# Create database (you'll need to enter MySQL root password)
echo ""
echo "🗄️  Creating database..."
echo "Please enter your MySQL root password when prompted:"
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS instructo_db;"

if [ $? -ne 0 ]; then
    echo "❌ Failed to create database. Please check your MySQL configuration."
    exit 1
fi

# Run database seeding
echo ""
echo "🌱 Seeding database with initial data..."
npm run seed

if [ $? -ne 0 ]; then
    echo "❌ Failed to seed database. Please check your database configuration."
    exit 1
fi

echo "✅ Backend setup completed"

# Setup Frontend
echo ""
echo "🎨 Setting up Frontend..."
cd ../frontend

# Install dependencies
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

echo "✅ Frontend setup completed"

# Final instructions
echo ""
echo "🎉 Setup completed successfully!"
echo "================================"
echo ""
echo "🔐 Default Admin Credentials:"
echo "   Email: aasthasrivastava777@gmail.com"
echo "   Password: ja.nvi0125"
echo ""
echo "🚀 To start the application:"
echo ""
echo "   1. Start Backend (Terminal 1):"
echo "      cd backend && npm run dev"
echo ""
echo "   2. Start Frontend (Terminal 2):"
echo "      cd frontend && npm run dev"
echo ""
echo "   3. Access the application:"
echo "      Frontend: http://localhost:3000"
echo "      Backend API: http://localhost:5000"
echo ""
echo "📚 For more information, check README.md"
echo ""
echo "Happy coding! 🎊"
