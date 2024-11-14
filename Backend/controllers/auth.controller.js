import { User } from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import { generateVerificationToken } from '../utils/generateVerificationCode.js';
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';
import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from '../mailtrap/emails.js';

export const signup = async (req, res) => {
  // Extract values from request body
  const { email, password, name } = req.body;

  try {
    // Validate that all fields are provided
    if (!email || !password || !name) {
      throw new Error('All fields are required');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    //generate verification code

    const verificationToken = generateVerificationToken();

    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      name,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    // Save user to database
    await user.save();

    //Creating the JWT and Setting a Cookie
    generateTokenAndSetCookie(res, user._id);

    //send verification email
    await sendVerificationEmail(user.email, user.verificationToken);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body; // 1. Get the verification code from the request body

  try {
    // 2. Find the user by verification code and ensure the token is still valid
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    console.log('User:', user);

    if (!user) {
      // If no user is found or the token is expired, return an error
      return res.status(400).json({
        success: false,
        message: 'Invalid or Expired verification token',
      });
    }

    // 3. Update the user status to verified and remove the verification token fields
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    // Save the user updates to the database
    await user.save();

    // 4. Send a welcome email after verification
    await sendWelcomeEmail(user.email, user.name);

    // Send a success response
    res.status(200).json({
      success: true,
      message: 'Email verified successfully! Welcome email has been sent.',
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    //find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid credentials' });
    }

    //check if password is correct
    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid credentials' });
    }

    //Check if user is verified
    if (!user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: 'Email not verified' });
    }

    //Creating the JWT and Setting a Cookie
    generateTokenAndSetCookie(res, user._id);

    //Update last login date

    user.lastlogin = Date.now();

    //save the user
    await user.save();

    // Send a success response

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log('Error in Login:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  res.clearCookie('authToken');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const forgotPassword = async (req, res) => {
  // Extract email from request body
  const { email } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    // check if user exists
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'User not found' });
    }

    // Generate a reset token and expiration date
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    // Update the user with the reset token and expiration date
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;
    await user.save();
    // Send a reset password email with the reset token link to the user email address (use the sendResetPasswordEmail function) and return a success response
    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );

    res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully',
    });
  } catch (error) {
    console.log('Error in forgot password:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    // Extract the reset token and new password from the request param and  body
    const { token } = req.params;
    const { password } = req.body;

    // Find the user by reset token and ensure the token is still valid
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid or expired reset token' });
    }

    // Hash the new password and update the user's password
    const hashedPassword = await bcryptjs.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;

    // Save the user updates to the database
    await user.save();

    // Send a password reset success email
    await sendResetSuccessEmail(user.email);

    // Send a success response
    res
      .status(200)
      .json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.log('Error in resetPassword ', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
