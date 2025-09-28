// Simple health check endpoint
export const healthCheck = (req, res) => {
  res.json({ status: 'ok' });
};

// Detailed health check with system information
export const detailedHealthCheck = (req, res) => {
  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
    },
    services: {
      database: 'connected',
      api: 'operational'
    }
  };
  
  res.json(healthCheck);
};

export default {
  healthCheck,
  detailedHealthCheck
};