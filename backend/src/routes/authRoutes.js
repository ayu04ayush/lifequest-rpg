const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');
const { calculateLevelFromTotalXP, getTitleForLevel } = require('../services/progressionService');
const { calculateUserStreak } = require('../services/streakService');

// POST /auth/signup
router.post('/signup', (req, res) => {
  try {
    const { username, email, password, characterName } = req.body;

    if (!username || username.trim().length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long.' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Check existing
    const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(cleanUsername, cleanEmail);
    if (existing) {
      return res.status(409).json({ error: 'Username or email is already registered.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    // Create user
    const userRes = db.prepare(`
      INSERT INTO users (username, email, password_hash)
      VALUES (?, ?, ?)
    `).run(cleanUsername, cleanEmail, hash);
    const userId = Number(userRes.lastInsertRowid);

    // Create character
    const charDisplayName = (characterName && characterName.trim()) || cleanUsername.toUpperCase();
    const charRes = db.prepare(`
      INSERT INTO characters (user_id, name, title, level, current_xp, total_xp, gold, current_streak, highest_streak, avatar, theme)
      VALUES (?, ?, 'Novice Adventurer', 1, 0, 0, 50, 0, 0, 'warrior_apprentice', 'obsidian')
    `).run(userId, charDisplayName);
    const charId = Number(charRes.lastInsertRowid);

    // Create attributes
    db.prepare(`
      INSERT INTO attributes (character_id, intellect, strength, vitality, discipline, creativity)
      VALUES (?, 10, 10, 10, 10, 10)
    `).run(charId);

    // Create starter quests
    const insertQuest = db.prepare(`
      INSERT INTO quests (user_id, title, description, category, difficulty, xp_reward, gold_reward, frequency)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertQuest.run(userId, 'Hydrate & Morning Sunlight', 'Drink a large glass of water and get 15 minutes of daylight.', 'VITALITY', 'EASY', 25, 10, 'daily');
    insertQuest.run(userId, 'Focused Deep Study Session', 'Spend 45 minutes studying or reading without distractions.', 'INTELLECT', 'MEDIUM', 50, 20, 'daily');
    insertQuest.run(userId, 'Bodyweight Mobility & Strength', 'Complete 3 sets of pushups, squats, and stretching.', 'STRENGTH', 'EASY', 25, 10, 'daily');
    insertQuest.run(userId, 'Daily Habit Mastery', 'Clear inbox and plan tomorrow’s top 3 priorities.', 'DISCIPLINE', 'EASY', 25, 10, 'daily');

    // Create initial activity
    db.prepare(`
      INSERT INTO activity_history (user_id, action_type, title, category, xp_change, gold_change, details)
      VALUES (?, 'character_created', 'Began Real-Life Adventure', 'GENERAL', 0, 50, 'Created hero character')
    `).run(userId);

    const token = jwt.sign({ userId, username: cleanUsername }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Hero created successfully! Welcome to LIFEQUEST.',
      token,
      user: { id: userId, username: cleanUsername, email: cleanEmail },
      character: {
        name: charDisplayName,
        title: 'Novice Adventurer',
        level: 1,
        currentXP: 0,
        neededXP: 100,
        totalXP: 0,
        gold: 50,
        currentStreak: 0,
        highestStreak: 0,
        avatar: 'warrior_apprentice',
        theme: 'obsidian'
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error during signup. Please try again.' });
  }
});

// POST /auth/login
router.post('/login', (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Username/Email and password are required.' });
    }

    const cleanId = identifier.trim().toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(cleanId, cleanId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }

    const match = bcrypt.compareSync(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials. Password incorrect.' });
    }

    // Refresh streak status
    calculateUserStreak(user.id);

    const char = db.prepare('SELECT * FROM characters WHERE user_id = ?').get(user.id);
    const xpProg = calculateLevelFromTotalXP(char.total_xp);

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful.',
      token,
      user: { id: user.id, username: user.username, email: user.email },
      character: {
        name: char.name,
        title: char.title || getTitleForLevel(xpProg.level),
        level: xpProg.level,
        currentXP: xpProg.currentXP,
        neededXP: xpProg.neededXP,
        totalXP: char.total_xp,
        gold: char.gold,
        currentStreak: char.current_streak,
        highestStreak: char.highest_streak,
        avatar: char.avatar,
        theme: char.theme
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// POST /auth/demo - Instant login as pre-seeded demo user
router.post('/demo', (req, res) => {
  try {
    let demoUser = db.prepare('SELECT * FROM users WHERE username = ?').get('ayush');
    if (!demoUser) {
      // Seed if not seeded yet
      const seedDatabase = require('../db/seed');
      seedDatabase();
      demoUser = db.prepare('SELECT * FROM users WHERE username = ?').get('ayush');
    }

    calculateUserStreak(demoUser.id);
    const char = db.prepare('SELECT * FROM characters WHERE user_id = ?').get(demoUser.id);
    const xpProg = calculateLevelFromTotalXP(char.total_xp);

    const token = jwt.sign({ userId: demoUser.id, username: demoUser.username }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Demo mode activated! Welcome Ayush, Level 8 Adventurer.',
      token,
      user: { id: demoUser.id, username: demoUser.username, email: demoUser.email },
      character: {
        name: char.name,
        title: char.title,
        level: char.level,
        currentXP: char.current_xp,
        neededXP: xpProg.neededXP,
        totalXP: char.total_xp,
        gold: char.gold,
        currentStreak: char.current_streak,
        highestStreak: char.highest_streak,
        avatar: char.avatar,
        theme: char.theme
      }
    });
  } catch (err) {
    console.error('Demo login error:', err);
    res.status(500).json({ error: 'Failed to initialize demo session.' });
  }
});

// GET /auth/me - Verify current session
router.get('/me', authMiddleware, (req, res) => {
  try {
    const user = db.prepare('SELECT id, username, email FROM users WHERE id = ?').get(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    calculateUserStreak(req.userId);
    const char = db.prepare('SELECT * FROM characters WHERE user_id = ?').get(req.userId);
    const xpProg = calculateLevelFromTotalXP(char.total_xp);

    res.json({
      user,
      character: {
        name: char.name,
        title: char.title,
        level: char.level,
        currentXP: char.current_xp,
        neededXP: xpProg.neededXP,
        totalXP: char.total_xp,
        gold: char.gold,
        currentStreak: char.current_streak,
        highestStreak: char.highest_streak,
        avatar: char.avatar,
        theme: char.theme
      }
    });
  } catch (err) {
    console.error('Auth check error:', err);
    res.status(500).json({ error: 'Failed to verify session.' });
  }
});

module.exports = router;
