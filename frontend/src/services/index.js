import { authService } from './authService.js';
import { notesService } from './notesService.js';
import { tenantsService } from './tenantsService.js';
import { healthService } from './healthService.js';
import { userService } from './userService.js';
import { uploadService } from './uploadService.js';
import api from './api.js';

export {
  authService,
  notesService,
  tenantsService,
  healthService,
  userService,
  uploadService,
  api,
};

export default {
  auth: authService,
  notes: notesService,
  tenants: tenantsService,
  health: healthService,
  user: userService,
  upload: uploadService,
  api,
};
