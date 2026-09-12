const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db/database');
const seedDatabase = require('./db/seed');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS for frontend dev server
app.use(cors({
origin: [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://lifequest-rpg-kappa.vercel.app'
],
  credentials: true
}));

app.use(express.json());

// Run seed on startup if database is empty or missing demo user
try {
  seedDatabase();
} catch (e) {
  console.error('Initial seed notice:', e.message);
}

// Mount API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/quests', require('./routes/questRoutes'));
app.use('/api/character', require('./routes/characterRoutes'));
app.use('/api/shop', require('./routes/shopRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/achievements', require('./routes/achievementRoutes'));
app.use('/api/activity', require('./routes/activityRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'LIFEQUEST Core Game Server',
    timestamp: new Date().toISOString()
  });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal RPG Server Error',
    message: err.message || 'An unexpected error occurred.'
  });
});

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚔️  LIFEQUEST Core Game Server running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
