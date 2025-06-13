const express = require('express');
const { Admin, Instructor } = require('../models');
const { generateToken, generateOTP } = require('../utils/tokenUtils');
const { sendOTPEmail } = require('../utils/emailUtils');
const { authSchemas, validate } = require('../utils/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// In-memory OTP storage (in production, use Redis or database)
// TODO: Replace with Redis for production deployment
const otpStore = new Map();

// Clean up expired OTPs periodically
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (data.expiresAt < now) {
      otpStore.delete(email);
    }
  }
}, 60000); // Clean up every minute

// Login with password
router.post('/login', validate(authSchemas.login), asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Password is required'
    });
  }

  let user;
  if (role === 'admin') {
    user = await Admin.findOne({ where: { email } });
  } else if (role === 'instructor') {
    user = await Instructor.findOne({ 
      where: { email },
      include: [{ model: Admin, as: 'creator', attributes: ['name'] }]
    });
  }

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: role
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: user.toJSON(),
      role
    }
  });
}));

// Send OTP to email
router.post('/send-otp', validate(authSchemas.sendOTP), asyncHandler(async (req, res) => {
  const { email, role } = req.body;

  let user;
  if (role === 'admin') {
    user = await Admin.findOne({ where: { email } });
  } else if (role === 'instructor') {
    user = await Instructor.findOne({ where: { email } });
  }

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const otp = generateOTP();
  const expiresAt = Date.now() + (parseInt(process.env.OTP_EXPIRES_IN) || 300000); // 5 minutes

  // Store OTP (in production, use Redis or database)
  otpStore.set(email, {
    otp,
    expiresAt,
    role,
    userId: user.id
  });

  // Send OTP email
  const emailSent = await sendOTPEmail(email, otp, user.name);

  if (!emailSent) {
    return res.status(500).json({
      success: false,
      message: 'Failed to send OTP email'
    });
  }

  res.json({
    success: true,
    message: 'OTP sent to your email address'
  });
}));

// Verify OTP and login
router.post('/verify-otp', validate(authSchemas.verifyOTP), asyncHandler(async (req, res) => {
  const { email, otp, role } = req.body;

  const storedOTP = otpStore.get(email);

  if (!storedOTP) {
    return res.status(400).json({
      success: false,
      message: 'OTP not found or expired'
    });
  }

  if (storedOTP.expiresAt < Date.now()) {
    otpStore.delete(email);
    return res.status(400).json({
      success: false,
      message: 'OTP has expired'
    });
  }

  if (storedOTP.otp !== otp || storedOTP.role !== role) {
    return res.status(400).json({
      success: false,
      message: 'Invalid OTP'
    });
  }

  // Get user data
  let user;
  if (role === 'admin') {
    user = await Admin.findByPk(storedOTP.userId);
  } else if (role === 'instructor') {
    user = await Instructor.findByPk(storedOTP.userId, {
      include: [{ model: Admin, as: 'creator', attributes: ['name'] }]
    });
  }

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Clear OTP
  otpStore.delete(email);

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: role
  });

  res.json({
    success: true,
    message: 'OTP verified successfully',
    data: {
      token,
      user: user.toJSON(),
      role
    }
  });
}));

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// Forgot password
router.post('/forgot-password', validate(authSchemas.forgotPassword), asyncHandler(async (req, res) => {
  const { email, role } = req.body;

  let user;
  if (role === 'admin') {
    user = await Admin.findOne({ where: { email } });
  } else if (role === 'instructor') {
    user = await Instructor.findOne({ where: { email } });
  }

  if (!user) {
    // Don't reveal if user exists or not for security
    return res.json({
      success: true,
      message: 'If an account with this email exists, password reset instructions have been sent.'
    });
  }

  const otp = generateOTP();
  const expiresAt = Date.now() + (parseInt(process.env.OTP_EXPIRES_IN) || 300000); // 5 minutes

  // Store OTP for password reset (in production, use Redis or database)
  otpStore.set(`reset_${email}`, {
    otp,
    expiresAt,
    role,
    userId: user.id,
    isPasswordReset: true
  });

  // Send password reset OTP email
  const emailSent = await sendOTPEmail(email, otp, user.name, 'Password Reset');

  if (!emailSent) {
    return res.status(500).json({
      success: false,
      message: 'Failed to send password reset email'
    });
  }

  res.json({
    success: true,
    message: 'If an account with this email exists, password reset instructions have been sent.'
  });
}));

module.exports = router;
