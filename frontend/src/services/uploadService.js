import api from './api.js';

export const uploadService = {
  // Upload file/attachment (if implemented)
  uploadFile: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },
  
  // Delete uploaded file
  deleteFile: (fileId) =>
    api.delete(`/upload/${fileId}`),
  
  // Get file information
  getFileInfo: (fileId) =>
    api.get(`/upload/${fileId}`),
};