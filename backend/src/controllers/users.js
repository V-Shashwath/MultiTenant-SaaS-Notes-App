import bcrypt from 'bcryptjs';
import { User, Tenant } from '../models/index.js';
import { validateUserInviteInput } from '../utils/validation.js';
import mongoose from 'mongoose';

// Invite a new user (Admin only)
export const inviteUser = async (req, res) => {
  try {
    // Validate input
    const { error } = validateUserInviteInput(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
    }

    const { email, role = 'member' } = req.body;
    const { tenant_id } = req.user;

    // Check if user already exists in this tenant
    const existingUser = await User.findOne({ 
      tenant_id, 
      email: email.toLowerCase() 
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists',
        message: 'A user with this email already exists in your tenant'
      });
    }

    // For demo purposes, create user with default password "password"
    // In production, this would send an invitation email
    const passwordHash = await bcrypt.hash('password', 10);

    const newUser = await User.create({
      tenant_id,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      role
    });

    // Return user info without password
    const userResponse = {
      id: newUser._id,
      email: newUser.email,
      role: newUser.role,
      tenant_id: newUser.tenant_id,
      created_at: newUser.created_at
    };

    res.status(201).json({
      message: 'User invited successfully',
      user: userResponse,
      note: 'For demo purposes, the user password is set to "password"'
    });

  } catch (error) {
    console.error('Invite user error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to invite user'
    });
  }
};

// Get all users in the current tenant (Admin only)
export const getTenantUsers = async (req, res) => {
  try {
    const { tenant_id } = req.user;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Get users with pagination
    const users = await User.find({ tenant_id })
      .select('-password_hash') // Exclude password hash
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await User.countDocuments({ tenant_id });

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get tenant users error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve users'
    });
  }
};

// Update user role (Admin only)
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const { tenant_id, id: currentUserId } = req.user;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Please provide a valid user ID'
      });
    }

    // Validate role
    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({
        error: 'Invalid role',
        message: 'Role must be either admin or member'
      });
    }

    // Can't change your own role
    if (userId === currentUserId.toString()) {
      return res.status(400).json({
        error: 'Cannot modify own role',
        message: 'You cannot change your own role'
      });
    }

    // Update user role (only if user belongs to same tenant)
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, tenant_id },
      { role, updated_at: new Date() },
      { new: true }
    ).select('-password_hash');

    if (!updatedUser) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The specified user does not exist in your tenant'
      });
    }

    res.json({
      message: 'User role updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update user role'
    });
  }
};

// Remove user from tenant (Admin only)
export const removeUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { tenant_id, id: currentUserId } = req.user;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Please provide a valid user ID'
      });
    }

    // Can't remove yourself
    if (userId === currentUserId.toString()) {
      return res.status(400).json({
        error: 'Cannot remove yourself',
        message: 'You cannot remove your own account'
      });
    }

    // Remove user (only if user belongs to same tenant)
    const removedUser = await User.findOneAndDelete({ 
      _id: userId, 
      tenant_id 
    });

    if (!removedUser) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The specified user does not exist in your tenant'
      });
    }

    res.json({
      message: 'User removed successfully',
      removed_user_id: userId
    });

  } catch (error) {
    console.error('Remove user error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to remove user'
    });
  }
};

export default {
  inviteUser,
  getTenantUsers,
  updateUserRole,
  removeUser
};