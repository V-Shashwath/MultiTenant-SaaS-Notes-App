import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { notesService, tenantsService } from '../services';
import { 
  Plus, 
  FileText, 
  Edit3, 
  Trash2, 
  Search,
  Calendar,
  User,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import NoteModal from '../components/Notes/NoteModal';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import LimitReachedBanner from '../components/UI/LimitReachedBanner';
import UpgradePrompt from '../components/UI/UpgradePrompt';

const NotesPage = () => {
  const { user, subscriptionPlan, updateUser } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [deletingNote, setDeletingNote] = useState(null);
  const [upgrading, setUpgrading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });

  useEffect(() => {
    loadNotes();
  }, [pagination.page]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const response = await notesService.getAllNotes(pagination.page, 20);
      setNotes(response.data.notes);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Load notes error:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!user?.tenant_slug) return;
    
    try {
      setUpgrading(true);
      await tenantsService.upgradeTenant(user.tenant_slug);
      
      // Update user context
      updateUser({ subscription_plan: 'pro' });
      
      toast.success('Successfully upgraded to Pro plan!');
    } catch (error) {
      const message = error.response?.data?.message || 'Upgrade failed';
      toast.error(message);
    } finally {
      setUpgrading(false);
    }
  };

  const handleCreateNote = () => {
    // Check subscription limits
    if (subscriptionPlan === 'free' && notes.length >= 3) {
      toast.error('Free plan is limited to 3 notes. Please upgrade to Pro for unlimited notes.');
      return;
    }
    
    setEditingNote(null);
    setIsModalOpen(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleSaveNote = async (noteData) => {
    try {
      if (editingNote) {
        // Update existing note
        await notesService.updateNote(editingNote.id, noteData);
        toast.success('Note updated successfully');
      } else {
        // Create new note
        const response = await notesService.createNote(noteData);
        if (response.data.limit_reached) {
          toast.error('Note limit reached. Please upgrade to Pro for unlimited notes.');
          return;
        }
        toast.success('Note created successfully');
      }
      
      setIsModalOpen(false);
      await loadNotes();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save note';
      if (error.response?.data?.limit_reached) {
        toast.error('Note limit reached. Please upgrade to Pro for unlimited notes.');
      } else {
        toast.error(message);
      }
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await notesService.deleteNote(noteId);
      toast.success('Note deleted successfully');
      setDeletingNote(null);
      await loadNotes();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete note';
      toast.error(message);
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (note.content || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isFreePlan = subscriptionPlan === 'free';
  const isAtLimit = isFreePlan && notes.length >= 3;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Limit Reached Banner */}
      <LimitReachedBanner 
        onUpgrade={handleUpgrade}
        upgrading={upgrading}
        noteCount={notes.length}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
          <p className="text-gray-600 mt-1">
            Manage your notes and ideas
            {isFreePlan && (
              <span className="ml-2 text-sm">
                ({notes.length}/3 notes used)
              </span>
            )}
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search notes..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button
            onClick={handleCreateNote}
            disabled={isAtLimit}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-5 w-5" />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* Upgrade Prompt */}
      <UpgradePrompt 
        onUpgrade={handleUpgrade}
        upgrading={upgrading}
        noteCount={notes.length}
      />

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No notes found' : 'No notes yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'Create your first note to get started'}
          </p>
          {!searchTerm && !isAtLimit && (
            <button
              onClick={handleCreateNote}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              <span>Create Your First Note</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <div key={note.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {note.title}
                  </h3>
                  <div className="flex items-center space-x-1 ml-2">
                    <button
                      onClick={() => handleEditNote(note)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit note"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingNote(note)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {note.content || 'No content'}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(note.created_at).toLocaleDateString()}</span>
                  </div>
                  {note.created_by_email && (
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{note.created_by_email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="px-3 py-2 text-sm text-gray-700">
            Page {pagination.page} of {pagination.pages}
          </span>
          
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.pages}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Note Modal */}
      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNote}
        note={editingNote}
      />

      {/* Delete Confirmation */}
      {deletingNote && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeletingNote(null)}
          onConfirm={() => handleDeleteNote(deletingNote.id)}
          title="Delete Note"
          message={`Are you sure you want to delete "${deletingNote.title}"? This action cannot be undone.`}
          confirmText="Delete"
          confirmStyle="danger"
        />
      )}
    </div>
  );
};

export default NotesPage;