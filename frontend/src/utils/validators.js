import { VALIDATION_RULES } from './constants.js';

export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!VALIDATION_RULES.EMAIL_REGEX.test(email)) return 'Invalid email format';
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
};

export const validateNoteTitle = (title) => {
  if (!title || !title.trim()) return 'Title is required';
  if (title.length > VALIDATION_RULES.NOTE_TITLE_MAX_LENGTH) {
    return `Title cannot exceed ${VALIDATION_RULES.NOTE_TITLE_MAX_LENGTH} characters`;
  }
  return null;
};

export const validateNoteContent = (content) => {
  if (content && content.length > VALIDATION_RULES.NOTE_CONTENT_MAX_LENGTH) {
    return `Content cannot exceed ${VALIDATION_RULES.NOTE_CONTENT_MAX_LENGTH} characters`;
  }
  return null;
};

export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = data[field];
    
    if (rule.required && (!value || !value.toString().trim())) {
      errors[field] = `${field} is required`;
      return;
    }
    
    if (rule.validator && value) {
      const error = rule.validator(value);
      if (error) errors[field] = error;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
