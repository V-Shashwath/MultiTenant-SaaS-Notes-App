import { USER_ROLES } from './constants.js';

export const hasRole = (user, role) => {
  if (!user || !user.role) return false;
  return user.role === role;
};

export const isAdmin = (user) => {
  return hasRole(user, USER_ROLES.ADMIN);
};

export const isMember = (user) => {
  return hasRole(user, USER_ROLES.MEMBER);
};

export const canUpgradeTenant = (user) => {
  return isAdmin(user);
};

export const canViewTenantStats = (user) => {
  return isAdmin(user);
};

export const canManageUsers = (user) => {
  return isAdmin(user);
};

export const canCreateNote = (user, noteCount = 0) => {
  if (!user) return false;
  
  // Pro users can always create notes
  if (user.subscription_plan === 'pro') return true;
  
  // Free users are limited to 3 notes
  return noteCount < 3;
};

export const canEditNote = (user, note) => {
  if (!user || !note) return false;
  
  // Users can edit their own notes or admins can edit any note in their tenant
  return note.user_id === user.id || isAdmin(user);
};

export const canDeleteNote = (user, note) => {
  if (!user || !note) return false;
  
  // Same permissions as editing
  return canEditNote(user, note);
};
