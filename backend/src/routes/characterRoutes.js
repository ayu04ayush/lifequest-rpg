const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');
const { calculateLevelFromTotalXP } = require('../services/progressionService');
const { calculateUserStreak } = require('../services/streakService');

router.use(authMiddleware);

// GET /character - Comprehensive hero progression sheet
router.get('/', (req, res) => {
  try {
    const character = db.prepare('SELECT * FROM characters WHERE user_id = ?').get(req.userId);
    if (!character) {
      return res.status(404).json({ error: 'Character not found.' });
    }

    const attributes = db.prepare('SELECT * FROM attributes WHERE character_id = ?').get(character.id);
    const xpProg = calculateLevelFromTotalXP(character.total_xp);
    const streakInfo = calculateUserStreak(req.userId);

    // Fetch equipped items
    const equipped = db.prepare(`
      SELECT i.* 
      FROM inventory inv
      JOIN items i ON i.id = inv.item_id
      WHERE inv.user_id = ? AND inv.is_equipped = 1
    `).all(req.userId);

    // Total quests completed
    const statsRow = db.prepare(`
      SELECT COUNT(*) as total_completed, SUM(xp_earned) as total_xp_quests, SUM(gold_earned) as total_gold_quests
      FROM quest_completions
      WHERE user_id = ?
    `).get(req.userId);

    // Attribute breakdown breakdown count of quests completed per category
    const categoryStats = db.prepare(`
      SELECT q.category, COUNT(qc.id) as completions_count, SUM(qc.xp_earned) as category_xp
      FROM quest_completions qc
      JOIN quests q ON q.id = qc.quest_id
      WHERE qc.user_id = ?
      GROUP BY q.category
    `).all(req.userId);

    res.json({
      character: {
        id: character.id,
        name: character.name,
        title: character.title,
        level: character.level,
        currentXP: character.current_xp,
        neededXP: xpProg.neededXP,
        totalXP: character.total_xp,
        gold: character.gold,
        currentStreak: streakInfo.currentStreak,
        highestStreak: streakInfo.highestStreak,
        avatar: character.avatar,
        theme: character.theme
      },
      attributes: {
        intellect: attributes ? attributes.intellect : 10,
        strength: attributes ? attributes.strength : 10,
        vitality: attributes ? attributes.vitality : 10,
        discipline: attributes ? attributes.discipline : 10,
        creativity: attributes ? attributes.creativity : 10
      },
      equipped,
      streak: streakInfo,
      stats: {
        totalCompleted: statsRow ? statsRow.total_completed : 0,
        totalXpQuests: statsRow ? statsRow.total_xp_quests || 0 : 0,
        totalGoldQuests: statsRow ? statsRow.total_gold_quests || 0 : 0,
        categoryBreakdown: categoryStats
      }
    });
  } catch (err) {
    console.error('Character sheet error:', err);
    res.status(500).json({ error: 'Failed to retrieve character data.' });
  }
});

// PUT /character/profile - Update name, active avatar, or theme
router.put('/profile', (req, res) => {
  try {
    const { name, avatar, theme, title } = req.body;
    const character = db.prepare('SELECT * FROM characters WHERE user_id = ?').get(req.userId);
    if (!character) {
      return res.status(404).json({ error: 'Character not found.' });
    }

    const newName = (name && name.trim()) || character.name;
    const newAvatar = avatar || character.avatar;
    const newTheme = theme || character.theme;
    const newTitle = title || character.title;

    db.prepare(`
      UPDATE characters 
      SET name = ?, avatar = ?, theme = ?, title = ?
      WHERE id = ?
    `).run(newName, newAvatar, newTheme, newTitle, character.id);

    res.json({
      message: 'Profile updated successfully.',
      character: {
        ...character,
        name: newName,
        avatar: newAvatar,
        theme: newTheme,
        title: newTitle
      }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update character profile.' });
  }
});

module.exports = router;
