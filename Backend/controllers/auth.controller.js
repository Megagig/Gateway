import { User } from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { generateVerificationToken } from '../utils/generateVerificationCode.js';
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';
import { sendVerificationEmail, sendWelcomeEmail } from '../mailtrap/emails.js';

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

export const login = async (req, res) => {};

export const logout = async (req, res) => {
  res.send('Logout route');
};
