import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  tenant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 200
  },
  content: {
    type: String,
    default: '',
    maxlength: 10000
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false
});

// Compound indexes for better query performance
noteSchema.index({ tenant_id: 1, created_at: -1 });
noteSchema.index({ tenant_id: 1, user_id: 1 });
noteSchema.index({ tenant_id: 1, title: 'text', content: 'text' });

export const Note = mongoose.model('Note', noteSchema);
