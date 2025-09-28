export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  PRO: 'pro'
};

export const USER_ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member'
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    VERIFY: '/auth/verify'
  },
  NOTES: {
    BASE: '/notes',
    BY_ID: (id) => `/notes/${id}`,
    SEARCH: '/notes/search'
  },
  TENANTS: {
    BY_SLUG: (slug) => `/tenants/${slug}`,
    UPGRADE: (slug) => `/tenants/${slug}/upgrade`,
    STATS: (slug) => `/tenants/${slug}/stats`
  },
  HEALTH: '/health'
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme'
};

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

export const NOTE_LIMITS = {
  FREE_PLAN: 3,
  PRO_PLAN: null // unlimited
};

export const VALIDATION_RULES = {
  NOTE_TITLE_MAX_LENGTH: 200,
  NOTE_CONTENT_MAX_LENGTH: 10000,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};
