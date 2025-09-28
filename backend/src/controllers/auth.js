import jwt from 'jsonwebtoken';
import { User, Tenant } from '../models/index.js';
import { validateLoginInput } from '../utils/validation.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '24h';

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
      tenant_id: user.tenant_id
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
};

// Login controller
export const login = async (req, res) => {
  try {
    console.log('Login request body:', req.body);

    // Validate input
    const { error } = validateLoginInput(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
    }

    const { email, password } = req.body;

    // Find user with tenant information
    const user = await User.findOne({ email: email.toLowerCase() })
      .populate('tenant_id', 'slug name subscription_plan');

    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    console.log('Password check:', isValidPassword);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return user info and token
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        tenant_id: user.tenant_id._id,
        tenant_slug: user.tenant_id.slug,
        tenant_name: user.tenant_id.name,
        subscription_plan: user.tenant_id.subscription_plan
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Login failed due to server error'
    });
  }
};

// Logout controller (client-side token removal)
export const logout = async (req, res) => {
  try {
    res.json({
      message: 'Logout successful',
      note: 'Please remove the token from client storage'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Logout failed'
    });
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    // User info is already available in req.user from auth middleware
    res.json({
      user: req.user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get user profile'
    });
  }
};

// Verify token endpoint
export const verifyToken = async (req, res) => {
  try {
    // If we reach here, token is valid (checked by auth middleware)
    res.json({
      valid: true,
      user: req.user
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Token verification failed'
    });
  }
};

export default {
  login,
  logout,
  getProfile,
  verifyToken
};