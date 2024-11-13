import { User } from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { generateVerificationToken } from '../utils/generateVerificationCode.js';
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';
import { sendVerificationEmail } from '../mailtrap/emails.js';

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
      verificationExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
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

export const login = async (req, res) => {};

export const logout = async (req, res) => {
  res.send('Logout route');
};
