import api from './api.js';

export const notesService = {
  // Get all notes with pagination
  getAllNotes: (page = 1, limit = 50) => 
    api.get(`/notes?page=${page}&limit=${limit}`),
  
  // Get a specific note by ID
  getNote: (id) => 
    api.get(`/notes/${id}`),
  
  // Create a new note
  createNote: (noteData) => 
    api.post('/notes', noteData),
  
  // Update an existing note
  updateNote: (id, noteData) => 
    api.put(`/notes/${id}`, noteData),
  
  // Delete a note
  deleteNote: (id) => 
    api.delete(`/notes/${id}`),
  
  // Search notes (if implemented)
  searchNotes: (query, page = 1, limit = 20) =>
    api.get(`/notes/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`),
};
