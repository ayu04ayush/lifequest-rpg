const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /achievements - List all achievements with current unlock progress
router.get('/', (req, res) => {
  try {
    const character = db.prepare(`
      SELECT c.*, a.intellect, a.strength, a.vitality, a.discipline, a.creativity
      FROM characters c
      JOIN attributes a ON a.character_id = c.id
      WHERE c.user_id = ?
    `).get(req.userId);

    const questCountRow = db.prepare(`
      SELECT COUNT(*) as count FROM quest_completions WHERE user_id = ?
    `).get(req.userId);
    const totalQuests = questCountRow ? questCountRow.count : 0;

    const purchaseCountRow = db.prepare(`
      SELECT COUNT(*) as count FROM inventory WHERE user_id = ?
    `).get(req.userId);
    const totalPurchases = purchaseCountRow ? purchaseCountRow.count : 0;

    const allAchievements = db.prepare(`
      SELECT a.*, 
        CASE WHEN ua.id IS NOT NULL THEN 1 ELSE 0 END as is_unlocked,
        ua.unlocked_at
      FROM achievements a
      LEFT JOIN user_achievements ua ON ua.achievement_id = a.id AND ua.user_id = ?
      ORDER BY is_unlocked DESC, a.requirement_value ASC
    `).all(req.userId);

    // Compute progress for each
    const achievementsWithProgress = allAchievements.map(ach => {
      let current = 0;
      switch (ach.requirement_type) {
        case 'quests_completed':
          current = totalQuests;
          break;
        case 'streak':
          current = character ? Math.max(character.current_streak, character.highest_streak) : 0;
          break;
        case 'level':
          current = character ? character.level : 1;
          break;
        case 'intellect':
          current = character ? character.intellect : 0;
          break;
        case 'strength':
          current = character ? character.strength : 0;
          break;
        case 'gold_earned':
          current = character ? character.gold : 0;
          break;
        case 'items_purchased':
          current = totalPurchases;
          break;
        default:
          current = 0;
      }

      const target = ach.requirement_value;
      const progressPercent = ach.is_unlocked ? 100 : Math.min(100, Math.floor((current / target) * 100));

      return {
        ...ach,
        currentProgress: current,
        targetValue: target,
        progressPercent
      };
    });

    res.json({
      achievements: achievementsWithProgress,
      totalUnlocked: achievementsWithProgress.filter(a => a.is_unlocked).length,
      totalCount: achievementsWithProgress.length
    });
  } catch (err) {
    console.error('Fetch achievements error:', err);
    res.status(500).json({ error: 'Failed to retrieve achievements.' });
  }
});

module.exports = router;
