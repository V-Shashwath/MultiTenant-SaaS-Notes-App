import { Tenant, User, Note } from '../models/index.js';
import mongoose from 'mongoose';

// Upgrade tenant subscription
export const upgradeTenant = async (req, res) => {
  try {
    const { slug } = req.params;
    const { tenant_id, role, tenant_slug } = req.user;

    // Ensure the user is trying to upgrade their own tenant
    if (tenant_slug !== slug) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only upgrade your own tenant subscription'
      });
    }

    // Check if tenant exists
    const tenant = await Tenant.findById(tenant_id);

    if (!tenant || tenant.slug !== slug) {
      return res.status(404).json({
        error: 'Tenant not found',
        message: 'The specified tenant does not exist'
      });
    }

    // Check if already on pro plan
    if (tenant.subscription_plan === 'pro') {
      return res.status(400).json({
        error: 'Already upgraded',
        message: 'This tenant is already on the Pro plan'
      });
    }

    // Upgrade to pro plan
    await Tenant.findByIdAndUpdate(
      tenant_id,
      { 
        subscription_plan: 'pro',
        updated_at: new Date()
      }
    );

    // Fetch updated tenant info
    const updatedTenant = await Tenant.findById(tenant_id);

    res.json({
      message: 'Tenant upgraded to Pro plan successfully',
      tenant: {
        id: updatedTenant._id,
        slug: updatedTenant.slug,
        name: updatedTenant.name,
        subscription_plan: updatedTenant.subscription_plan,
        updated_at: updatedTenant.updated_at
      }
    });

  } catch (error) {
    console.error('Upgrade tenant error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to upgrade tenant subscription'
    });
  }
};

// Get tenant information
export const getTenantInfo = async (req, res) => {
  try {
    const { slug } = req.params;
    const { tenant_id, tenant_slug } = req.user;

    // Ensure the user is accessing their own tenant info
    if (tenant_slug !== slug) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only access your own tenant information'
      });
    }

    const tenant = await Tenant.findById(tenant_id);

    if (!tenant || tenant.slug !== slug) {
      return res.status(404).json({
        error: 'Tenant not found',
        message: 'The specified tenant does not exist'
      });
    }

    // Get user count for this tenant
    const userCount = await User.countDocuments({ tenant_id });

    // Get note count for this tenant
    const noteCount = await Note.countDocuments({ tenant_id });

    res.json({
      tenant: {
        id: tenant._id,
        slug: tenant.slug,
        name: tenant.name,
        subscription_plan: tenant.subscription_plan,
        created_at: tenant.created_at,
        updated_at: tenant.updated_at,
        stats: {
          user_count: userCount,
          note_count: noteCount,
          note_limit: tenant.subscription_plan === 'free' ? 3 : null
        }
      }
    });

  } catch (error) {
    console.error('Get tenant info error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve tenant information'
    });
  }
};

// Get tenant usage statistics (Admin only)
export const getTenantStats = async (req, res) => {
  try {
    const { tenant_id } = req.user;

    // Get comprehensive stats using aggregation
    const userStats = await User.aggregate([
      { $match: { tenant_id: new mongoose.Types.ObjectId(tenant_id) } },
      {
        $group: {
          _id: null,
          total_users: { $sum: 1 },
          admin_users: {
            $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
          },
          member_users: {
            $sum: { $cond: [{ $eq: ['$role', 'member'] }, 1, 0] }
          }
        }
      }
    ]);

    const noteStats = await Note.aggregate([
      { $match: { tenant_id: new mongoose.Types.ObjectId(tenant_id) } },
      {
        $group: {
          _id: null,
          total_notes: { $sum: 1 },
          notes_today: {
            $sum: {
              $cond: [
                {
                  $gte: [
                    '$created_at',
                    new Date(new Date().setHours(0, 0, 0, 0))
                  ]
                },
                1,
                0
              ]
            }
          },
          notes_this_week: {
            $sum: {
              $cond: [
                {
                  $gte: [
                    '$created_at',
                    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  ]
                },
                1,
                0
              ]
            }
          },
          notes_this_month: {
            $sum: {
              $cond: [
                {
                  $gte: [
                    '$created_at',
                    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Get recent notes
    const recentNotes = await Note.find({ tenant_id })
      .populate('user_id', 'email')
      .sort({ created_at: -1 })
      .limit(5)
      .select('_id title created_at user_id');

    const stats = {
      total_users: userStats[0]?.total_users || 0,
      admin_users: userStats[0]?.admin_users || 0,
      member_users: userStats[0]?.member_users || 0,
      total_notes: noteStats[0]?.total_notes || 0,
      notes_today: noteStats[0]?.notes_today || 0,
      notes_this_week: noteStats[0]?.notes_this_week || 0,
      notes_this_month: noteStats[0]?.notes_this_month || 0
    };

    const formattedRecentNotes = recentNotes.map(note => ({
      id: note._id,
      title: note.title,
      created_at: note.created_at,
      created_by: note.user_id?.email || 'Unknown'
    }));

    res.json({
      stats,
      recent_notes: formattedRecentNotes
    });

  } catch (error) {
    console.error('Get tenant stats error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve tenant statistics'
    });
  }
};

export default {
  upgradeTenant,
  getTenantInfo,
  getTenantStats
};