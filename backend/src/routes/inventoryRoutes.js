const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /inventory - List all owned items
router.get('/', (req, res) => {
  try {
    const items = db.prepare(`
      SELECT i.*, inv.id as inventory_id, inv.acquired_at, inv.is_equipped
      FROM inventory inv
      JOIN items i ON i.id = inv.item_id
      WHERE inv.user_id = ?
      ORDER BY inv.acquired_at DESC
    `).all(req.userId);

    const character = db.prepare('SELECT avatar, theme, title FROM characters WHERE user_id = ?').get(req.userId);

    res.json({
      inventory: items,
      equippedStats: character
    });
  } catch (err) {
    console.error('Inventory fetch error:', err);
    res.status(500).json({ error: 'Failed to retrieve inventory.' });
  }
});

// POST /inventory/:itemId/equip - Equip gear, avatar, title, or theme
router.post('/:itemId/equip', (req, res) => {
  try {
    const itemId = req.params.itemId;

    const inventoryEntry = db.prepare(`
      SELECT inv.*, i.category, i.item_key, i.name
      FROM inventory inv
      JOIN items i ON i.id = inv.item_id
      WHERE inv.user_id = ? AND inv.item_id = ?
    `).get(req.userId, itemId);

    if (!inventoryEntry) {
      return res.status(404).json({ error: 'Item not found in your inventory.' });
    }

    db.exec('BEGIN TRANSACTION;');
    try {
      if (inventoryEntry.category === 'theme') {
        // Extract theme name (e.g. theme_nebula -> nebula)
        const themeSlug = inventoryEntry.item_key.replace('theme_', '');
        db.prepare('UPDATE characters SET theme = ? WHERE user_id = ?').run(themeSlug, req.userId);
        
        // Unequip all other themes, equip this one
        db.prepare(`
          UPDATE inventory 
          SET is_equipped = CASE WHEN item_id = ? THEN 1 ELSE 0 END
          WHERE user_id = ? AND item_id IN (SELECT id FROM items WHERE category = 'theme')
        `).run(itemId, req.userId);

      } else if (inventoryEntry.category === 'avatar') {
        db.prepare('UPDATE characters SET avatar = ? WHERE user_id = ?').run(inventoryEntry.item_key, req.userId);

        db.prepare(`
          UPDATE inventory 
          SET is_equipped = CASE WHEN item_id = ? THEN 1 ELSE 0 END
          WHERE user_id = ? AND item_id IN (SELECT id FROM items WHERE category = 'avatar')
        `).run(itemId, req.userId);

      } else if (inventoryEntry.category === 'title') {
        db.prepare('UPDATE characters SET title = ? WHERE user_id = ?').run(inventoryEntry.name, req.userId);

        db.prepare(`
          UPDATE inventory 
          SET is_equipped = CASE WHEN item_id = ? THEN 1 ELSE 0 END
          WHERE user_id = ? AND item_id IN (SELECT id FROM items WHERE category = 'title')
        `).run(itemId, req.userId);

      } else {
        // Gear: toggle or set equipped
        db.prepare('UPDATE inventory SET is_equipped = 1 WHERE user_id = ? AND item_id = ?').run(req.userId, itemId);
      }

      db.exec('COMMIT;');
    } catch (txErr) {
      db.exec('ROLLBACK;');
      throw txErr;
    }

    const updatedChar = db.prepare('SELECT avatar, theme, title FROM characters WHERE user_id = ?').get(req.userId);

    res.json({
      message: `Equipped ${inventoryEntry.name}!`,
      equipped: inventoryEntry,
      character: updatedChar
    });
  } catch (err) {
    console.error('Equip item error:', err);
    res.status(500).json({ error: 'Failed to equip item.' });
  }
});

// POST /inventory/:itemId/unequip - Unequip an item
router.post('/:itemId/unequip', (req, res) => {
  try {
    const itemId = req.params.itemId;

    db.prepare(`
      UPDATE inventory 
      SET is_equipped = 0 
      WHERE user_id = ? AND item_id = ?
    `).run(req.userId, itemId);

    res.json({ message: 'Item unequipped.' });
  } catch (err) {
    console.error('Unequip item error:', err);
    res.status(500).json({ error: 'Failed to unequip item.' });
  }
});

module.exports = router;
