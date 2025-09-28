import Joi from 'joi';

// Login validation schema
const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .min(1)
    .required()
    .messages({
      'string.min': 'Password cannot be empty',
      'any.required': 'Password is required'
    })
});

// Note validation schema
const noteSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(200)
    .required()
    .messages({
      'string.min': 'Title cannot be empty',
      'string.max': 'Title cannot exceed 200 characters',
      'any.required': 'Title is required'
    }),
  content: Joi.string()
    .allow('')
    .max(10000)
    .optional()
    .messages({
      'string.max': 'Content cannot exceed 10,000 characters'
    })
});

// User invite validation schema
const userInviteSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  role: Joi.string()
    .valid('admin', 'member')
    .default('member')
    .messages({
      'any.only': 'Role must be either admin or member'
    })
});

// User role update validation schema
const userRoleUpdateSchema = Joi.object({
  role: Joi.string()
    .valid('admin', 'member')
    .required()
    .messages({
      'any.only': 'Role must be either admin or member',
      'any.required': 'Role is required'
    })
});

// Tenant validation schema
const tenantSchema = Joi.object({
  slug: Joi.string()
    .alphanum()
    .lowercase()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.alphanum': 'Tenant slug can only contain alphanumeric characters',
      'string.lowercase': 'Tenant slug must be lowercase',
      'string.min': 'Tenant slug must be at least 2 characters long',
      'string.max': 'Tenant slug cannot exceed 50 characters',
      'any.required': 'Tenant slug is required'
    }),
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Tenant name must be at least 2 characters long',
      'string.max': 'Tenant name cannot exceed 100 characters',
      'any.required': 'Tenant name is required'
    }),
  subscription_plan: Joi.string()
    .valid('free', 'pro')
    .default('free')
    .messages({
      'any.only': 'Subscription plan must be either free or pro'
    })
});

// Pagination validation schema
const paginationSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    })
});

// Validation helper functions
export const validateLoginInput = (data) => {
  return loginSchema.validate(data);
};

export const validateNoteInput = (data) => {
  return noteSchema.validate(data);
};

export const validateUserInput = (data) => {
  return userSchema.validate(data);
};

export const validateUserInviteInput = (data) => {
  return userInviteSchema.validate(data);
};

export const validateUserRoleUpdate = (data) => {
  return userRoleUpdateSchema.validate(data);
};

export const validateTenantInput = (data) => {
  return tenantSchema.validate(data);
};

export const validatePaginationInput = (data) => {
  return paginationSchema.validate(data);
};

// Generic validation middleware
export const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message,
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    req.body = value;
    next();
  };
};

// Query parameters validation middleware
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query);
    
    if (error) {
      return res.status(400).json({
        error: 'Query Validation Error',
        message: error.details[0].message,
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    req.query = value;
    next();
  };
};

// Sanitization helpers
export const sanitizeEmail = (email) => {
  return email ? email.toLowerCase().trim() : '';
};

export const sanitizeString = (str) => {
  return str ? str.trim() : '';
};

export const sanitizeHtml = (str) => {
  if (!str) return '';
  
  // Basic HTML sanitization - remove potentially harmful tags
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

export default {
  validateLoginInput,
  validateNoteInput,
  validateUserInput,
  validateTenantInput,
  validatePaginationInput,
  validateBody,
  validateQuery,
  sanitizeEmail,
  sanitizeString,
  sanitizeHtml
};