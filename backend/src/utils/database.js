import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Tenant, User } from '../models/index.js';

// MongoDB connection
export const connectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/multi-tenant-notes';
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    console.log('Connected to MongoDB');
    
    // Initialize database with seed data
    await seedDatabase();
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Seed database with initial data
const seedDatabase = async () => {
  console.log('Seeding database...');

  let acmeTenant = await Tenant.findOne({ slug: 'acme' });
  if (!acmeTenant) {
    acmeTenant = await Tenant.create({
      slug: 'acme',
      name: 'Acme Corporation',
      subscription_plan: 'free'
    });
  }

  let globexTenant = await Tenant.findOne({ slug: 'globex' });
  if (!globexTenant) {
    globexTenant = await Tenant.create({
      slug: 'globex',
      name: 'Globex Corporation',
      subscription_plan: 'free'
    });
  }

  const users = [
  { tenant: acmeTenant, email: 'admin@acme.test', role: 'admin', password: 'password' },
  { tenant: acmeTenant, email: 'user@acme.test', role: 'member', password: 'password' },
  { tenant: globexTenant, email: 'admin@globex.test', role: 'admin', password: 'password' },
  { tenant: globexTenant, email: 'user@globex.test', role: 'member', password: 'password' }
];

for (const u of users) {
  const exists = await User.findOne({ email: u.email });
  if (!exists) {
    const user = new User({
      tenant_id: u.tenant._id,
      email: u.email,
      password_hash: u.password, // raw password; pre('save') will hash it
      role: u.role
    });
    await user.save(); // triggers pre('save') hook to hash password
  }
}

  console.log('Database seeded successfully');
};

// Initialize database connection (for backward compatibility)
export const initializeDatabase = connectDatabase;

// Database disconnect
export const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
};

// Get database connection status
export const getDatabaseStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  return {
    status: states[mongoose.connection.readyState] || 'unknown',
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name
  };
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});

export default { 
  connectDatabase, 
  initializeDatabase, 
  disconnectDatabase, 
  getDatabaseStatus 
};