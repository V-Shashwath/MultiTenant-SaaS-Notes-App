import { useState, useEffect } from 'react';
import { notesService } from '../services/authService';
import toast from 'react-hot-toast';

export const useNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });

  const loadNotes = async (page = 1, limit = 20) => {
    try {
      setLoading(true);
      const response = await notesService.getAllNotes(page, limit);
      setNotes(response.data.notes);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Load notes error:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (noteData) => {
    try {
      const response = await notesService.createNote(noteData);
      if (response.data.limit_reached) {
        toast.error('Note limit reached. Please upgrade to Pro for unlimited notes.');
        return { success: false, limitReached: true };
      }
      toast.success('Note created successfully');
      await loadNotes();
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create note';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const updateNote = async (id, noteData) => {
    try {
      await notesService.updateNote(id, noteData);
      toast.success('Note updated successfully');
      await loadNotes();
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update note';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const deleteNote = async (id) => {
    try {
      await notesService.deleteNote(id);
      toast.success('Note deleted successfully');
      await loadNotes();
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete note';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  return {
    notes,
    loading,
    pagination,
    loadNotes,
    createNote,
    updateNote,
    deleteNote,
    setPagination
  };
};