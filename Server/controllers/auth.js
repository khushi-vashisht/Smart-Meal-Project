import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '1h';

const validateRegistrationInput = (firstName, lastName, email, password, confirmPassword) => {
  const errors = [];

  if (!firstName?.trim()) errors.push('First name is required');
  if (!lastName?.trim()) errors.push('Last name is required');
  if (!email?.trim()) errors.push('Email is required');
  if (!password) errors.push('Password is required');
  if (password !== confirmPassword) errors.push('Passwords do not match');
  if (password?.length < 6) errors.push('Password must be at least 6 characters');

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) errors.push('Invalid email format');

  return errors;
};

/* REGISTER USER */
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    // Validate environment variables
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({
        error: 'Server configuration error',
        details: 'Authentication service is not properly configured'
      });
    }

    // Validate input
    const validationErrors = validateRegistrationInput(
      firstName,
      lastName,
      email,
      password,
      confirmPassword
    );

    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        error: 'Email already registered',
        details: 'Please use a different email or try logging in'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: passwordHash,
    });

    const savedUser = await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: savedUser._id },
      process.env.JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    // Prepare user response (excluding sensitive data)
    const userResponse = {
      _id: savedUser._id,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      email: savedUser.email,
    };

    res.status(201).json({
      token,
      user: userResponse,
      message: 'Registration successful'
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      error: 'Internal server error',
      details: 'Unable to complete registration. Please try again later.'
    });
  }
};

/* LOGIN USER */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ msg: "User doesn't exist" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
    });

    // Create user object without password
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };

    res.status(200).json({ token, user: userResponse });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Internal Server error" });
  }
};
