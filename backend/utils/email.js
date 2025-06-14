const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Email templates
const emailTemplates = {
  otpVerification: (otp, name) => ({
    subject: 'Instructo - OTP Verification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #000; color: #fff; padding: 20px; text-align: center;">
          <h1>NHPC Instructo</h1>
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2>OTP Verification</h2>
          <p>Hello ${name},</p>
          <p>Your OTP for login verification is:</p>
          <div style="background-color: #000; color: #fff; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this OTP, please ignore this email.</p>
        </div>
        <div style="background-color: #000; color: #fff; padding: 15px; text-align: center; font-size: 12px;">
          <p>&copy; 2025 NHPC. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  welcomeAdmin: (name, email, tempPassword) => ({
    subject: 'Welcome to Instructo - Admin Account Created',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #000; color: #fff; padding: 20px; text-align: center;">
          <h1>NHPC Instructo</h1>
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2>Welcome to Instructo!</h2>
          <p>Hello ${name},</p>
          <p>Your admin account has been created successfully.</p>
          <div style="background-color: #f0f0f0; padding: 15px; margin: 20px 0;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> ${tempPassword}</p>
          </div>
          <p style="color: #d32f2f;"><strong>Important:</strong> Please change your password after first login for security purposes.</p>
          <p>You can access the system at: <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}">${process.env.FRONTEND_URL || 'http://localhost:3000'}</a></p>
        </div>
        <div style="background-color: #000; color: #fff; padding: 15px; text-align: center; font-size: 12px;">
          <p>&copy; 2025 NHPC. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  welcomeInstructor: (name, email, tempPassword) => ({
    subject: 'Welcome to Instructo - Instructor Account Created',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #000; color: #fff; padding: 20px; text-align: center;">
          <h1>NHPC Instructo</h1>
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2>Welcome to Instructo!</h2>
          <p>Hello ${name},</p>
          <p>Your instructor account has been created successfully.</p>
          <div style="background-color: #f0f0f0; padding: 15px; margin: 20px 0;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> ${tempPassword}</p>
          </div>
          <p style="color: #d32f2f;"><strong>Important:</strong> Please change your password after first login for security purposes.</p>
          <p>You can access the system at: <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}">${process.env.FRONTEND_URL || 'http://localhost:3000'}</a></p>
        </div>
        <div style="background-color: #000; color: #fff; padding: 15px; text-align: center; font-size: 12px;">
          <p>&copy; 2025 NHPC. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  traineeApproved: (traineeName, instructorName, comments) => ({
    subject: 'Trainee Application Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #000; color: #fff; padding: 20px; text-align: center;">
          <h1>NHPC Instructo</h1>
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #4caf50;">Trainee Application Approved ✓</h2>
          <p>Hello ${instructorName},</p>
          <p>Good news! The trainee application for <strong>${traineeName}</strong> has been approved by the admin.</p>
          ${comments ? `<div style="background-color: #f0f0f0; padding: 15px; margin: 20px 0;">
            <p><strong>Admin Comments:</strong></p>
            <p>${comments}</p>
          </div>` : ''}
          <p>You can now assign projects and begin the training process.</p>
        </div>
        <div style="background-color: #000; color: #fff; padding: 15px; text-align: center; font-size: 12px;">
          <p>&copy; 2025 NHPC. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  traineeRejected: (traineeName, instructorName, comments) => ({
    subject: 'Trainee Application Rejected',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #000; color: #fff; padding: 20px; text-align: center;">
          <h1>NHPC Instructo</h1>
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #f44336;">Trainee Application Rejected</h2>
          <p>Hello ${instructorName},</p>
          <p>The trainee application for <strong>${traineeName}</strong> has been rejected by the admin.</p>
          ${comments ? `<div style="background-color: #f0f0f0; padding: 15px; margin: 20px 0;">
            <p><strong>Admin Comments:</strong></p>
            <p>${comments}</p>
          </div>` : ''}
          <p>Please review the feedback and make necessary adjustments for future applications.</p>
        </div>
        <div style="background-color: #000; color: #fff; padding: 15px; text-align: center; font-size: 12px;">
          <p>&copy; 2025 NHPC. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  projectCompletion: (traineeData, projectData, instructorData) => ({
    subject: `Project Completion - ${traineeData.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #000; color: #fff; padding: 20px; text-align: center;">
          <h1>NHPC Instructo</h1>
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #4caf50;">Project Completion Notification</h2>
          
          <div style="background-color: #fff; padding: 20px; margin: 20px 0; border-left: 4px solid #4caf50;">
            <h3>Trainee Information</h3>
            <p><strong>Name:</strong> ${traineeData.name}</p>
            <p><strong>Email:</strong> ${traineeData.email}</p>
            <p><strong>Institution:</strong> ${traineeData.institution}</p>
            <p><strong>Course:</strong> ${traineeData.course}</p>
          </div>

          <div style="background-color: #fff; padding: 20px; margin: 20px 0; border-left: 4px solid #2196f3;">
            <h3>Project Details</h3>
            <p><strong>Project Title:</strong> ${projectData.title}</p>
            <p><strong>Duration:</strong> ${projectData.duration} days</p>
            <p><strong>Start Date:</strong> ${projectData.start_date}</p>
            <p><strong>End Date:</strong> ${projectData.end_date}</p>
            <p><strong>Performance Rating:</strong> ${projectData.performance_rating}/10</p>
          </div>

          <div style="background-color: #fff; padding: 20px; margin: 20px 0; border-left: 4px solid #ff9800;">
            <h3>Instructor Information</h3>
            <p><strong>Name:</strong> ${instructorData.name}</p>
            <p><strong>Email:</strong> ${instructorData.email}</p>
            <p><strong>Department:</strong> ${instructorData.department}</p>
          </div>

          <p style="margin-top: 30px;">Please find the attached project report and attendance documents.</p>
        </div>
        <div style="background-color: #000; color: #fff; padding: 15px; text-align: center; font-size: 12px;">
          <p>&copy; 2025 NHPC. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  monthlyUploadReminder: (instructorName, pendingTrainees) => ({
    subject: 'Monthly Attendance Upload Reminder',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #000; color: #fff; padding: 20px; text-align: center;">
          <h1>NHPC Instructo</h1>
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #ff9800;">Monthly Attendance Upload Reminder</h2>
          <p>Hello ${instructorName},</p>
          <p>This is a reminder to upload monthly attendance documents for the following trainees:</p>
          <ul style="background-color: #fff; padding: 20px; margin: 20px 0;">
            ${pendingTrainees.map(trainee => `<li>${trainee}</li>`).join('')}
          </ul>
          <p>Please ensure all attendance documents are uploaded by the end of the month.</p>
          <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/monthly-records" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Upload Attendance</a></p>
        </div>
        <div style="background-color: #000; color: #fff; padding: 15px; text-align: center; font-size: 12px;">
          <p>&copy; 2025 NHPC. All rights reserved.</p>
        </div>
      </div>
    `,
  }),
};

// Send email function
const sendEmail = async (to, template, data = {}) => {
  try {
    const transporter = createTransporter();
    const emailContent = emailTemplates[template](data);
    
    const info = await transporter.sendMail({
      from: `"NHPC Instructo" <${process.env.EMAIL_USER}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject: emailContent.subject,
      html: emailContent.html,
      attachments: data.attachments || [],
    });

    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Send OTP email
const sendOTPEmail = async (to, otp, name) => {
  return await sendEmail(to, 'otpVerification', { otp, name });
};

// Send welcome emails
const sendWelcomeAdminEmail = async (to, name, tempPassword) => {
  return await sendEmail(to, 'welcomeAdmin', { name, email: to, tempPassword });
};

const sendWelcomeInstructorEmail = async (to, name, tempPassword) => {
  return await sendEmail(to, 'welcomeInstructor', { name, email: to, tempPassword });
};

// Send trainee status emails
const sendTraineeApprovedEmail = async (to, traineeName, instructorName, comments) => {
  return await sendEmail(to, 'traineeApproved', { traineeName, instructorName, comments });
};

const sendTraineeRejectedEmail = async (to, traineeName, instructorName, comments) => {
  return await sendEmail(to, 'traineeRejected', { traineeName, instructorName, comments });
};

// Send project completion email
const sendProjectCompletionEmail = async (traineeData, projectData, instructorData, attachments = []) => {
  const recipients = [
    process.env.TRAINING_DEPT_EMAIL,
    process.env.HRD_DEPT_EMAIL,
  ].filter(Boolean);

  return await sendEmail(recipients, 'projectCompletion', {
    traineeData,
    projectData,
    instructorData,
    attachments,
  });
};

// Send monthly upload reminder
const sendMonthlyUploadReminder = async (to, instructorName, pendingTrainees) => {
  return await sendEmail(to, 'monthlyUploadReminder', { instructorName, pendingTrainees });
};

module.exports = {
  sendEmail,
  sendOTPEmail,
  sendWelcomeAdminEmail,
  sendWelcomeInstructorEmail,
  sendTraineeApprovedEmail,
  sendTraineeRejectedEmail,
  sendProjectCompletionEmail,
  sendMonthlyUploadReminder,
};
