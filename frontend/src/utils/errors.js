export const getErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  // API error with response
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  // API error with status
  if (error.response?.status) {
    switch (error.response.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication required. Please login again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Request failed with status ${error.response.status}`;
    }
  }
  
  // Network error
  if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
    return 'Network error. Please check your connection.';
  }
  
  // Timeout error
  if (error.code === 'ECONNABORTED') {
    return 'Request timeout. Please try again.';
  }
  
  // Generic error with message
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

export const handleApiError = (error, defaultMessage = 'Operation failed') => {
  const message = getErrorMessage(error);
  console.error('API Error:', error);
  return message;
};
