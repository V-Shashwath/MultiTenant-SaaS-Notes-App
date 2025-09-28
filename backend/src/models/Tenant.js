import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  subscription_plan: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false
});

// Add index for better performance
tenantSchema.index({ slug: 1 });

export const Tenant = mongoose.model('Tenant', tenantSchema);