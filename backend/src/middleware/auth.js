import jwt from 'jsonwebtoken';
import { User, Tenant } from '../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Authentication middleware
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        message: 'Please provide a valid authentication token'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Fetch user with tenant information
    const user = await User.findById(decoded.userId)
      .populate('tenant_id', 'slug name subscription_plan');

    if (!user) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'User not found'
      });
    }

    // Add user info to request
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      tenant_id: user.tenant_id._id,
      tenant_slug: user.tenant_id.slug,
      tenant_name: user.tenant_id.name,
      subscription_plan: user.tenant_id.subscription_plan
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token is malformed or invalid'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Please login again'
      });
    }

    console.error('Authentication error:', error);
return res.status(500).json({
      error: 'Authentication failed',
      message: 'Internal server error'
    });
  }
};

// Role-based authorization middleware
export const requireRole = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please login to access this resource'
      });
    }

    const userRole = req.user.role;
    const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    if (!rolesArray.includes(userRole)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `This action requires one of the following roles: ${rolesArray.join(', ')}`
      });
    }

    next();
  };
};

// Admin only middleware
export const requireAdmin = requireRole('admin');

// Member or Admin middleware
export const requireMemberOrAdmin = requireRole(['member', 'admin']);

// Tenant isolation middleware - ensures user can only access their tenant's data
export const enforceTenantIsolation = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please login to access this resource'
    });
  }

  // Add tenant_id to request params for easy access in controllers
  req.tenant_id = req.user.tenant_id;
  next();
};

export default {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireMemberOrAdmin,
  enforceTenantIsolation
};