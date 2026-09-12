const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');
const {
  getDifficultyRewards,
  getAttributePointsForDifficulty,
  calculateLevelFromTotalXP,
  getTitleForLevel
} = require('../services/progressionService');
const { calculateUserStreak, getLocalDateString } = require('../services/streakService');
const { evaluateAchievements } = require('../services/achievementService');

// All routes require authentication
router.use(authMiddleware);

// GET /quests - List all quests with today's completion status
router.get('/', (req, res) => {
  try {
    const todayStr = getLocalDateString(new Date());

    const quests = db.prepare(`
      SELECT q.*, 
        CASE WHEN qc.id IS NOT NULL THEN 1 ELSE 0 END as is_completed_today
      FROM quests q
      LEFT JOIN quest_completions qc 
        ON qc.quest_id = q.id 
        AND qc.completion_date = ? 
        AND qc.user_id = q.user_id
      WHERE q.user_id = ? AND q.is_active = 1
      ORDER BY is_completed_today ASC, q.created_at DESC
    `).all(todayStr, req.userId);

    res.json({ quests });
  } catch (err) {
    console.error('Fetch quests error:', err);
    res.status(500).json({ error: 'Failed to retrieve quests.' });
  }
});

// POST /quests - Create a new quest
router.post('/', (req, res) => {
  try {
    const { title, description, category, difficulty, frequency } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Quest name is required.' });
    }

    const validCategories = ['INTELLECT', 'STRENGTH', 'VITALITY', 'DISCIPLINE', 'CREATIVITY'];
    const validDifficulties = ['EASY', 'MEDIUM', 'HARD', 'EPIC'];
    const validFrequencies = ['daily', 'weekly', 'one_off'];

    const chosenCategory = validCategories.includes(category) ? category : 'INTELLECT';
    const chosenDifficulty = validDifficulties.includes(difficulty) ? difficulty : 'MEDIUM';
    const chosenFrequency = validFrequencies.includes(frequency) ? frequency : 'daily';

    // Calculate server-side rewards based on difficulty
    const rewards = getDifficultyRewards(chosenDifficulty);

    const result = db.prepare(`
      INSERT INTO quests (user_id, title, description, category, difficulty, xp_reward, gold_reward, frequency, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
      req.userId,
      title.trim(),
      description ? description.trim() : '',
      chosenCategory,
      chosenDifficulty,
      rewards.xp,
      rewards.gold,
      chosenFrequency
    );

    const newQuest = db.prepare('SELECT * FROM quests WHERE id = ?').get(result.lastInsertRowid);
    newQuest.is_completed_today = 0;

    res.status(201).json({
      message: 'Quest created successfully!',
      quest: newQuest
    });
  } catch (err) {
    console.error('Create quest error:', err);
    res.status(500).json({ error: 'Failed to create quest.' });
  }
});

// PUT /quests/:id - Update quest details
router.put('/:id', (req, res) => {
  try {
    const questId = req.params.id;
    const { title, description, category, difficulty, frequency } = req.body;

    const quest = db.prepare('SELECT * FROM quests WHERE id = ? AND user_id = ?').get(questId, req.userId);
    if (!quest) {
      return res.status(404).json({ error: 'Quest not found or unauthorized.' });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Quest name is required.' });
    }

    const validCategories = ['INTELLECT', 'STRENGTH', 'VITALITY', 'DISCIPLINE', 'CREATIVITY'];
    const validDifficulties = ['EASY', 'MEDIUM', 'HARD', 'EPIC'];
    const validFrequencies = ['daily', 'weekly', 'one_off'];

    const chosenCategory = validCategories.includes(category) ? category : quest.category;
    const chosenDifficulty = validDifficulties.includes(difficulty) ? difficulty : quest.difficulty;
    const chosenFrequency = validFrequencies.includes(frequency) ? frequency : quest.frequency;
    const rewards = getDifficultyRewards(chosenDifficulty);

    db.prepare(`
      UPDATE quests 
      SET title = ?, description = ?, category = ?, difficulty = ?, xp_reward = ?, gold_reward = ?, frequency = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).run(
      title.trim(),
      description !== undefined ? description.trim() : quest.description,
      chosenCategory,
      chosenDifficulty,
      rewards.xp,
      rewards.gold,
      chosenFrequency,
      questId,
      req.userId
    );

    const updatedQuest = db.prepare('SELECT * FROM quests WHERE id = ?').get(questId);
    res.json({ message: 'Quest updated.', quest: updatedQuest });
  } catch (err) {
    console.error('Update quest error:', err);
    res.status(500).json({ error: 'Failed to update quest.' });
  }
});

// DELETE /quests/:id - Delete quest
router.delete('/:id', (req, res) => {
  try {
    const questId = req.params.id;
    const quest = db.prepare('SELECT * FROM quests WHERE id = ? AND user_id = ?').get(questId, req.userId);
    if (!quest) {
      return res.status(404).json({ error: 'Quest not found or unauthorized.' });
    }

    db.prepare('DELETE FROM quests WHERE id = ? AND user_id = ?').run(questId, req.userId);
    res.json({ message: 'Quest deleted successfully.' });
  } catch (err) {
    console.error('Delete quest error:', err);
    res.status(500).json({ error: 'Failed to delete quest.' });
  }
});

// POST /quests/:id/complete - Complete quest action with full RPG progression
router.post('/:id/complete', (req, res) => {
  try {
    const questId = req.params.id;
    const quest = db.prepare('SELECT * FROM quests WHERE id = ? AND user_id = ?').get(questId, req.userId);

    if (!quest) {
      return res.status(404).json({ error: 'Quest not found or unauthorized.' });
    }

    const todayStr = getLocalDateString(new Date());

    // Check duplicate completion today
    const existingCompletion = db.prepare(`
      SELECT id FROM quest_completions 
      WHERE quest_id = ? AND user_id = ? AND completion_date = ?
    `).get(questId, req.userId, todayStr);

    if (existingCompletion) {
      return res.status(400).json({ error: 'This quest has already been completed today.' });
    }

    // Fetch current character & attributes
    const character = db.prepare('SELECT * FROM characters WHERE user_id = ?').get(req.userId);
    const attributes = db.prepare('SELECT * FROM attributes WHERE character_id = ?').get(character.id);

    const xpEarned = quest.xp_reward;
    const goldEarned = quest.gold_reward;
    const attrPoints = getAttributePointsForDifficulty(quest.difficulty);

    // Calculate progression
    const oldLevel = character.level;
    const newTotalXP = character.total_xp + xpEarned;
    const progression = calculateLevelFromTotalXP(newTotalXP);
    const leveledUp = progression.level > oldLevel;

    let bonusGold = 0;
    let newTitle = character.title;
    if (leveledUp) {
      bonusGold = progression.level * 25; // Bonus celebration gold
      newTitle = getTitleForLevel(progression.level);
    }

    const newGold = character.gold + goldEarned + bonusGold;

    // Database transaction block
    db.exec('BEGIN TRANSACTION;');
    try {
      // 1. Record completion
      db.prepare(`
        INSERT INTO quest_completions (quest_id, user_id, xp_earned, gold_earned, completion_date)
        VALUES (?, ?, ?, ?, ?)
      `).run(questId, req.userId, xpEarned, goldEarned, todayStr);

      // 2. Update character
      db.prepare(`
        UPDATE characters 
        SET level = ?, current_xp = ?, total_xp = ?, gold = ?, title = ?
        WHERE id = ?
      `).run(progression.level, progression.currentXP, newTotalXP, newGold, newTitle, character.id);

      // 3. Update category attribute
      const attrColumn = quest.category.toLowerCase();
      db.prepare(`
        UPDATE attributes 
        SET ${attrColumn} = ${attrColumn} + ?
        WHERE character_id = ?
      `).run(attrPoints, character.id);

      // 4. Log activity
      db.prepare(`
        INSERT INTO activity_history (user_id, action_type, title, category, xp_change, gold_change, details)
        VALUES (?, 'quest_completed', ?, ?, ?, ?, ?)
      `).run(
        req.userId,
        quest.title,
        quest.category,
        xpEarned,
        goldEarned + bonusGold,
        `Earned +${xpEarned} XP, +${goldEarned} Gold, +${attrPoints} ${quest.category} attribute`
      );

      // If one_off, deactivate quest
      if (quest.frequency === 'one_off') {
        db.prepare('UPDATE quests SET is_active = 0 WHERE id = ?').run(questId);
      }

      db.exec('COMMIT;');
    } catch (txErr) {
      db.exec('ROLLBACK;');
      throw txErr;
    }

    // Refresh streak
    const streakInfo = calculateUserStreak(req.userId);

    // Evaluate newly unlocked achievements
    const newAchievements = evaluateAchievements(req.userId);

    // Fetch refreshed attributes
    const updatedAttrs = db.prepare('SELECT * FROM attributes WHERE character_id = ?').get(character.id);

    res.json({
      success: true,
      message: leveledUp ? `LEVEL UP! You ascended to Level ${progression.level}!` : 'Quest Completed!',
      xpEarned,
      goldEarned,
      bonusGold,
      leveledUp,
      oldLevel,
      newLevel: progression.level,
      newTitle,
      attributeGained: {
        category: quest.category,
        points: attrPoints,
        newTotal: updatedAttrs[quest.category.toLowerCase()]
      },
      character: {
        name: character.name,
        title: newTitle,
        level: progression.level,
        currentXP: progression.currentXP,
        neededXP: progression.neededXP,
        totalXP: newTotalXP,
        gold: newGold,
        currentStreak: streakInfo.currentStreak,
        highestStreak: streakInfo.highestStreak,
        avatar: character.avatar,
        theme: character.theme
      },
      streak: streakInfo,
      newAchievements
    });
  } catch (err) {
    console.error('Complete quest error:', err);
    res.status(500).json({ error: 'Failed to complete quest.' });
  }
});

module.exports = router;
