import { Note, User } from '../models/index.js';
import { validateNoteInput } from '../utils/validation.js';
import mongoose from 'mongoose';

// Create a new note
export const createNote = async (req, res) => {
  try {
    // Validate input
    const { error } = validateNoteInput(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
    }

    const { title, content } = req.body;
    const { tenant_id, id: user_id, subscription_plan } = req.user;

    // Check subscription limits for free plan
    if (subscription_plan === 'free') {
      const noteCount = await Note.countDocuments({ tenant_id });

      if (noteCount >= 3) {
        return res.status(403).json({
          error: 'Subscription limit reached',
          message: 'Free plan is limited to 3 notes. Please upgrade to Pro for unlimited notes.',
          limit_reached: true
        });
      }
    }

    // Create the note
    const note = await Note.create({
      tenant_id,
      user_id,
      title,
      content: content || ''
    });

    res.status(201).json({
      message: 'Note created successfully',
      note
    });

  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create note'
    });
  }
};

// Get all notes for the current tenant
export const getNotes = async (req, res) => {
  try {
    const { tenant_id } = req.user;
    const { page = 1, limit = 50 } = req.query;

    const skip = (page - 1) * limit;

    // Get notes with pagination and populate user info
    const notes = await Note.find({ tenant_id })
      .populate('user_id', 'email', 'User')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Note.countDocuments({ tenant_id });

    // Format notes to include created_by_email
    const formattedNotes = notes.map(note => ({
      id: note._id,
      title: note.title,
      content: note.content,
      created_at: note.created_at,
      updated_at: note.updated_at,
      created_by_email: note.user_id?.email || 'Unknown'
    }));

    res.json({
      notes: formattedNotes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve notes'
    });
  }
};

// Get a specific note
export const getNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenant_id } = req.user;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Please provide a valid note ID'
      });
    }

    const note = await Note.findOne({ _id: id, tenant_id })
      .populate('user_id', 'email', 'User');

    if (!note) {
      return res.status(404).json({
        error: 'Note not found',
        message: 'The requested note does not exist or you do not have access to it'
      });
    }

    const formattedNote = {
      id: note._id,
      title: note.title,
      content: note.content,
      created_at: note.created_at,
      updated_at: note.updated_at,
      created_by_email: note.user_id?.email || 'Unknown'
    };

    res.json({ note: formattedNote });

  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve note'
    });
  }
};

// Update a note
export const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenant_id } = req.user;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Please provide a valid note ID'
      });
    }

    // Validate input
    const { error } = validateNoteInput(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
    }

    const { title, content } = req.body;

    // Update the note (only if it belongs to the tenant)
    const updatedNote = await Note.findOneAndUpdate(
      { _id: id, tenant_id },
      { 
        title, 
        content: content || '',
        updated_at: new Date()
      },
      { new: true }
    ).populate('user_id', 'email', 'User');

    if (!updatedNote) {
      return res.status(404).json({
        error: 'Note not found',
        message: 'The requested note does not exist or you do not have access to it'
      });
    }

    const formattedNote = {
      id: updatedNote._id,
      title: updatedNote.title,
      content: updatedNote.content,
      created_at: updatedNote.created_at,
      updated_at: updatedNote.updated_at,
      created_by_email: updatedNote.user_id?.email || 'Unknown'
    };

    res.json({
      message: 'Note updated successfully',
      note: formattedNote
    });

  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update note'
    });
  }
};

// Delete a note
export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenant_id } = req.user;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Please provide a valid note ID'
      });
    }

    // Delete the note (only if it belongs to the tenant)
    const deletedNote = await Note.findOneAndDelete({ _id: id, tenant_id });

    if (!deletedNote) {
      return res.status(404).json({
        error: 'Note not found',
        message: 'The requested note does not exist or you do not have access to it'
      });
    }

    res.json({
      message: 'Note deleted successfully',
      deleted_note_id: id
    });

  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete note'
    });
  }
};

export default {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote
};