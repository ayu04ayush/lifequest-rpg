const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /activity - Chronological adventure activity history
router.get('/', (req, res) => {
  try {
    const activities = db.prepare(`
      SELECT * 
      FROM activity_history 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 100
    `).all(req.userId);

    res.json({ activities });
  } catch (err) {
    console.error('Activity history error:', err);
    res.status(500).json({ error: 'Failed to retrieve adventure log.' });
  }
});

module.exports = router;
