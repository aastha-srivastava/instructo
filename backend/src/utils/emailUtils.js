const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send OTP email
const sendOTPEmail = async (email, otp, name) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Instructo System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Login OTP - Instructo',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Login Verification</h2>
          <p>Dear ${name},</p>
          <p>Your OTP for login verification is:</p>
          <div style="font-size: 24px; font-weight: bold; color: #007bff; text-align: center; margin: 20px 0; padding: 15px; border: 2px solid #007bff; border-radius: 5px;">
            ${otp}
          </div>
          <p><strong>This OTP will expire in 5 minutes.</strong></p>
          <p>If you didn't request this login, please ignore this email.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated email from Instructo Trainee Management System.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
};

// Send project completion notification to departments
const sendProjectCompletionEmail = async (traineeData, projectData, documents) => {
  try {
    const transporter = createTransporter();
    
    const recipients = [
      process.env.TRAINING_DEPT_EMAIL,
      process.env.HRD_DEPT_EMAIL
    ].filter(Boolean);

    if (recipients.length === 0) {
      console.warn('No department email addresses configured');
      return false;
    }

    const attachments = [];
    
    // Add project report attachment
    if (documents.project_report) {
      attachments.push({
        filename: `Project_Report_${traineeData.name}.${documents.project_report.split('.').pop()}`,
        path: documents.project_report
      });
    }
    
    // Add attendance document attachment
    if (documents.attendance_document) {
      attachments.push({
        filename: `Attendance_Record_${traineeData.name}.${documents.attendance_document.split('.').pop()}`,
        path: documents.attendance_document
      });
    }

    const mailOptions = {
      from: `"Instructo System" <${process.env.EMAIL_USER}>`,
      to: recipients,
      subject: `Project Completion - ${traineeData.name} | ${projectData.project_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            Project Completion Notification
          </h2>
          
          <h3 style="color: #007bff;">Trainee Information</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Name:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${traineeData.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Institution:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${traineeData.institution_name || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Mobile:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${traineeData.mobile}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Instructor:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${traineeData.instructor?.name || 'N/A'}</td>
            </tr>
          </table>

          <h3 style="color: #007bff;">Project Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Project Name:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${projectData.project_name}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Start Date:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${projectData.start_date}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Completion Date:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${projectData.end_date}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Duration:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${projectData.duration || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Performance Rating:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${projectData.performance_rating}/10</td>
            </tr>
          </table>

          <div style="background-color: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: #0066cc; margin-top: 0;">Attached Documents:</h4>
            <ul>
              ${documents.project_report ? '<li>Project Report</li>' : ''}
              ${documents.attendance_document ? '<li>Attendance Record</li>' : ''}
            </ul>
          </div>

          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated notification from Instructo Trainee Management System.<br>
            Generated on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
          </p>
        </div>
      `,
      attachments: attachments
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending project completion email:', error);
    return false;
  }
};

// Send trainee approval notification
const sendTraineeApprovalEmail = async (instructorEmail, instructorName, traineeName, status, comments = '') => {
  try {
    const transporter = createTransporter();
    
    const statusText = status === 'approved' ? 'Approved' : 'Rejected';
    const statusColor = status === 'approved' ? '#28a745' : '#dc3545';

    const mailOptions = {
      from: `"Instructo System" <${process.env.EMAIL_USER}>`,
      to: instructorEmail,
      subject: `Trainee ${statusText} - ${traineeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Trainee Application ${statusText}</h2>
          <p>Dear ${instructorName},</p>
          
          <div style="background-color: ${status === 'approved' ? '#d4edda' : '#f8d7da'}; 
                      border: 1px solid ${status === 'approved' ? '#c3e6cb' : '#f5c6cb'}; 
                      color: ${statusColor}; 
                      padding: 15px; 
                      border-radius: 5px; 
                      margin: 20px 0;">
            <h3 style="margin-top: 0;">Trainee "${traineeName}" has been ${statusText.toLowerCase()}</h3>
          </div>
          
          ${comments ? `
            <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
              <h4 style="color: #007bff; margin-top: 0;">Comments:</h4>
              <p>${comments}</p>
            </div>
          ` : ''}
          
          <p>Please log in to your dashboard to view the updated status.</p>
          
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated notification from Instructo Trainee Management System.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending trainee approval email:', error);
    return false;
  }
};

module.exports = {
  sendOTPEmail,
  sendProjectCompletionEmail,
  sendTraineeApprovalEmail
};
