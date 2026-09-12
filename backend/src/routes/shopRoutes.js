const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');
const { evaluateAchievements } = require('../services/achievementService');

router.use(authMiddleware);

// GET /shop - List all shop catalog items with user ownership status
router.get('/', (req, res) => {
  try {
    const items = db.prepare(`
      SELECT i.*, 
        CASE WHEN inv.id IS NOT NULL THEN 1 ELSE 0 END as is_purchased,
        CASE WHEN inv.is_equipped = 1 THEN 1 ELSE 0 END as is_equipped
      FROM items i
      LEFT JOIN inventory inv ON inv.item_id = i.id AND inv.user_id = ?
      ORDER BY 
        CASE i.category 
          WHEN 'gear' THEN 1 
          WHEN 'avatar' THEN 2 
          WHEN 'theme' THEN 3 
          WHEN 'title' THEN 4 
          ELSE 5 
        END, 
        i.price ASC
    `).all(req.userId);

    const character = db.prepare('SELECT gold FROM characters WHERE user_id = ?').get(req.userId);

    res.json({
      items,
      userGold: character ? character.gold : 0
    });
  } catch (err) {
    console.error('Shop fetch error:', err);
    res.status(500).json({ error: 'Failed to retrieve shop items.' });
  }
});

// POST /shop/purchase - Buy an item with Gold
router.post('/purchase', (req, res) => {
  try {
    const { itemId } = req.body;
    if (!itemId) {
      return res.status(400).json({ error: 'Item ID is required.' });
    }

    const item = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found in shop.' });
    }

    const character = db.prepare('SELECT * FROM characters WHERE user_id = ?').get(req.userId);
    if (!character) {
      return res.status(404).json({ error: 'Character not found.' });
    }

    // Check duplicate purchase
    const existing = db.prepare('SELECT id FROM inventory WHERE user_id = ? AND item_id = ?').get(req.userId, itemId);
    if (existing) {
      return res.status(400).json({ error: 'You already own this item!' });
    }

    // Validate gold balance server-side
    if (character.gold < item.price) {
      return res.status(400).json({ error: 'Not enough Gold. Complete more quests to earn Gold!' });
    }

    const newGold = character.gold - item.price;

    db.exec('BEGIN TRANSACTION;');
    try {
      // 1. Deduct gold
      db.prepare('UPDATE characters SET gold = ? WHERE id = ?').run(newGold, character.id);

      // 2. Insert into inventory
      db.prepare(`
        INSERT INTO inventory (user_id, item_id, is_equipped)
        VALUES (?, ?, 0)
      `).run(req.userId, itemId);

      // 3. Log activity
      db.prepare(`
        INSERT INTO activity_history (user_id, action_type, title, category, xp_change, gold_change, details)
        VALUES (?, 'item_purchased', ?, 'SHOP', 0, ?, ?)
      `).run(req.userId, `Purchased ${item.name}`, -item.price, `Acquired ${item.rarity} ${item.category}`);

      db.exec('COMMIT;');
    } catch (txErr) {
      db.exec('ROLLBACK;');
      throw txErr;
    }

    // Evaluate potential achievements
    const newAchievements = evaluateAchievements(req.userId);

    res.json({
      success: true,
      message: `Successfully acquired ${item.name}! Added to your inventory.`,
      item,
      newGold,
      newAchievements
    });
  } catch (err) {
    console.error('Purchase error:', err);
    res.status(500).json({ error: 'Transaction failed.' });
  }
});

module.exports = router;
