import { STORAGE_KEYS } from './constants.js';

class Storage {
  static get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  }
  
  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  }
  
  static remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  }
  
  static clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
}

// Specific storage utilities
export const tokenStorage = {
  get: () => Storage.get(STORAGE_KEYS.AUTH_TOKEN),
  set: (token) => Storage.set(STORAGE_KEYS.AUTH_TOKEN, token),
  remove: () => Storage.remove(STORAGE_KEYS.AUTH_TOKEN)
};

export const preferencesStorage = {
  get: () => Storage.get(STORAGE_KEYS.USER_PREFERENCES, {}),
  set: (preferences) => Storage.set(STORAGE_KEYS.USER_PREFERENCES, preferences),
  update: (updates) => {
    const current = preferencesStorage.get();
    return preferencesStorage.set({ ...current, ...updates });
  }
};

export const themeStorage = {
  get: () => Storage.get(STORAGE_KEYS.THEME, THEMES.SYSTEM),
  set: (theme) => Storage.set(STORAGE_KEYS.THEME, theme)
};

export default Storage;