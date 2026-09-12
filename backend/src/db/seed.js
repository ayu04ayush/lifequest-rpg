const db = require('./database');
const bcrypt = require('bcryptjs');

function seedDatabase() {
  console.log('Seeding LIFEQUEST database...');

  // 1. Seed Shop Items
  const items = [
    // Gear
    { name: 'Mythic Runeblade', description: 'Forged in starlight, vibrates with focused productivity energy.', category: 'gear', price: 150, rarity: 'rare', icon: '⚔️', item_key: 'mythic_runeblade' },
    { name: 'Aegis of Discipline', description: 'An impenetrable shield against procrastination and distractions.', category: 'gear', price: 220, rarity: 'epic', icon: '🛡️', item_key: 'aegis_shield' },
    { name: 'Celestial Focus Bow', description: 'Arrows strike directly at your highest priority goals.', category: 'gear', price: 300, rarity: 'epic', icon: '🏹', item_key: 'celestial_bow' },
    { name: 'Legendary Crown of Will', description: 'Bestowed upon masters who command their destiny.', category: 'gear', price: 600, rarity: 'legendary', icon: '👑', item_key: 'crown_of_kings' },
    // Avatars
    { name: 'Archmage of Mind', description: 'Master of intellect, spells, and algorithmic deep thinking.', category: 'avatar', price: 100, rarity: 'rare', icon: '🧙', item_key: 'avatar_wizard' },
    { name: 'Cyber Paladin', description: 'An unstoppable champion of vitality and physical strength.', category: 'avatar', price: 180, rarity: 'epic', icon: '🤖', item_key: 'avatar_paladin' },
    { name: 'Shadow Assassin', description: 'Silent precision and disciplined execution in the dark.', category: 'avatar', price: 250, rarity: 'epic', icon: '🥷', item_key: 'avatar_shadow' },
    { name: 'Woodland Ranger', description: 'Harmonious balance of creativity and natural flow.', category: 'avatar', price: 120, rarity: 'rare', icon: '🧝', item_key: 'avatar_ranger' },
    // Themes
    { name: 'Nebula Night Theme', description: 'Deep cosmic indigo with radiant stellar cyan accents.', category: 'theme', price: 150, rarity: 'rare', icon: '🌌', item_key: 'theme_nebula' },
    { name: 'Molten Ember Theme', description: 'Infernal obsidian with fiery volcanic orange glow.', category: 'theme', price: 200, rarity: 'rare', icon: '🌋', item_key: 'theme_molten' },
    { name: 'Elven Forest Theme', description: 'Mystical jade emerald with lush golden accents.', category: 'theme', price: 150, rarity: 'rare', icon: '🌿', item_key: 'theme_emerald' },
    { name: 'Royal Gold Theme', description: 'Opulent golden gilded panels fit for a true conqueror.', category: 'theme', price: 350, rarity: 'legendary', icon: '✨', item_key: 'theme_royal' },
    // Titles
    { name: 'The Undaunted', description: 'Never retreats in the face of daunting tasks.', category: 'title', price: 80, rarity: 'rare', icon: '🎖️', item_key: 'title_disciplined' },
    { name: 'Time Bender', description: 'Bends the fabric of schedules to accomplish the impossible.', category: 'title', price: 180, rarity: 'epic', icon: '⏳', item_key: 'title_timebender' },
    { name: 'Grandmaster of Real Life', description: 'Has mastered real-life quests across every life domain.', category: 'title', price: 500, rarity: 'legendary', icon: '🌟', item_key: 'title_grandmaster' }
  ];

  const insertItem = db.prepare(`
    INSERT OR IGNORE INTO items (name, description, category, price, rarity, icon, item_key)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const item of items) {
    insertItem.run(item.name, item.description, item.category, item.price, item.rarity, item.icon, item.item_key);
  }

  // 2. Seed Achievements
  const achievements = [
    { code: 'first_quest', title: 'First Step into Adventure', description: 'Complete your very first real-life quest.', category: 'general', icon: '🏆', requirement_type: 'quests_completed', requirement_value: 1, xp_reward: 50, gold_reward: 25 },
    { code: 'quest_5', title: 'Apprentice of Action', description: 'Complete 5 real-life quests.', category: 'general', icon: '📜', requirement_type: 'quests_completed', requirement_value: 5, xp_reward: 100, gold_reward: 50 },
    { code: 'quest_20', title: 'Master of Execution', description: 'Complete 20 real-life quests.', category: 'general', icon: '⚔️', requirement_type: 'quests_completed', requirement_value: 20, xp_reward: 250, gold_reward: 100 },
    { code: 'streak_3', title: 'Kindled Spark', description: 'Maintain a 3-day quest streak.', category: 'streak', icon: '🔥', requirement_type: 'streak', requirement_value: 3, xp_reward: 75, gold_reward: 50 },
    { code: 'streak_7', title: 'On Fire', description: 'Maintain a 7-day quest streak without missing a day.', category: 'streak', icon: '⚡', requirement_type: 'streak', requirement_value: 7, xp_reward: 200, gold_reward: 100 },
    { code: 'streak_14', title: 'Blazing Constancy', description: 'Maintain an epic 14-day quest streak.', category: 'streak', icon: '🌟', requirement_type: 'streak', requirement_value: 14, xp_reward: 500, gold_reward: 250 },
    { code: 'level_5', title: 'Rising Hero', description: 'Ascend to Character Level 5.', category: 'progression', icon: '🛡️', requirement_type: 'level', requirement_value: 5, xp_reward: 150, gold_reward: 75 },
    { code: 'level_10', title: 'Legend of Realms', description: 'Attain the pinnacle: Character Level 10.', category: 'progression', icon: '👑', requirement_type: 'level', requirement_value: 10, xp_reward: 500, gold_reward: 300 },
    { code: 'intellect_25', title: "Scholar's Insight", description: 'Reach 25 Intellect via study and coding quests.', category: 'attribute', icon: '🧠', requirement_type: 'intellect', requirement_value: 25, xp_reward: 100, gold_reward: 50 },
    { code: 'strength_25', title: 'Iron Will', description: 'Reach 25 Strength via workouts and physical fitness.', category: 'attribute', icon: '🏋️', requirement_type: 'strength', requirement_value: 25, xp_reward: 100, gold_reward: 50 },
    { code: 'gold_500', title: 'Treasure Hunter', description: 'Accumulate 500 Gold through honest quest completion.', category: 'economy', icon: '🪙', requirement_type: 'gold_earned', requirement_value: 500, xp_reward: 150, gold_reward: 100 },
    { code: 'first_purchase', title: 'Patron of the Market', description: 'Purchase your first reward from the Reward Shop.', category: 'shop', icon: '🛍️', requirement_type: 'items_purchased', requirement_value: 1, xp_reward: 50, gold_reward: 25 }
  ];

  const insertAch = db.prepare(`
    INSERT OR IGNORE INTO achievements (code, title, description, category, icon, requirement_type, requirement_value, xp_reward, gold_reward)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const ach of achievements) {
    insertAch.run(ach.code, ach.title, ach.description, ach.category, ach.icon, ach.requirement_type, ach.requirement_value, ach.xp_reward, ach.gold_reward);
  }

  // 3. Seed Demo User ("Ayush")
  const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get('ayush');
  let userId;

  if (!existingUser) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('password123', salt);
    
    const userInsert = db.prepare(`
      INSERT INTO users (username, email, password_hash)
      VALUES (?, ?, ?)
    `).run('ayush', 'ayush@lifequest.app', hash);
    userId = Number(userInsert.lastInsertRowid);

    // Today's date string
    const today = new Date().toISOString().split('T')[0];

    // Character
    const charInsert = db.prepare(`
      INSERT INTO characters (user_id, name, title, level, current_xp, total_xp, gold, current_streak, highest_streak, last_active_date, avatar, theme)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, 'AYUSH', 'LEVEL 8 — ADVENTURER', 8, 820, 7820, 1240, 7, 7, today, 'warrior_apprentice', 'obsidian');
    const charId = Number(charInsert.lastInsertRowid);

    // Attributes
    db.prepare(`
      INSERT INTO attributes (character_id, intellect, strength, vitality, discipline, creativity)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(charId, 72, 54, 48, 65, 40);

    // Seed Active Quests
    const quests = [
      { title: 'Master DSA: Invert Binary Trees', description: 'Solve 2 tree traversal & inversion problems with clean Big-O complexity.', category: 'INTELLECT', difficulty: 'MEDIUM', xp_reward: 50, gold_reward: 20, frequency: 'daily' },
      { title: 'Hypertrophy Power Workout', description: 'Complete 4 working sets of bench press, weighted pull-ups, and romanian deadlifts.', category: 'STRENGTH', difficulty: 'HARD', xp_reward: 100, gold_reward: 45, frequency: 'daily' },
      { title: 'Hydration & Circadian Sleep Recovery', description: 'Drink 3 liters of pure water and maintain 8 hours of restorative sleep.', category: 'VITALITY', difficulty: 'EASY', xp_reward: 25, gold_reward: 10, frequency: 'daily' },
      { title: '90-Minute Uninterrupted Focus Sprint', description: 'Work on production code without tab switching or social media notifications.', category: 'DISCIPLINE', difficulty: 'MEDIUM', xp_reward: 50, gold_reward: 20, frequency: 'daily' },
      { title: 'Sketch Fantasy Pixel Crests & UI', description: 'Design 3 new RPG asset concepts and theme palettes in design tool.', category: 'CREATIVITY', difficulty: 'MEDIUM', xp_reward: 50, gold_reward: 20, frequency: 'daily' },
      { title: 'Deploy Production Release to Hackathon', description: 'Verify all edge cases, persistence, and ship full build.', category: 'DISCIPLINE', difficulty: 'EPIC', xp_reward: 250, gold_reward: 120, frequency: 'one_off' }
    ];

    const insertQuest = db.prepare(`
      INSERT INTO quests (user_id, title, description, category, difficulty, xp_reward, gold_reward, frequency, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const createdQuestIds = [];
    for (const q of quests) {
      const qRes = insertQuest.run(userId, q.title, q.description, q.category, q.difficulty, q.xp_reward, q.gold_reward, q.frequency);
      createdQuestIds.push(Number(qRes.lastInsertRowid));
    }

    // Seed completions for the past 7 days to give Ayush a genuine 7-day streak
    const insertCompletion = db.prepare(`
      INSERT INTO quest_completions (quest_id, user_id, completed_at, xp_earned, gold_earned, completion_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertActivity = db.prepare(`
      INSERT INTO activity_history (user_id, action_type, title, category, xp_change, gold_change, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (let i = 7; i >= 1; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const isoTime = d.toISOString();

      const qId = createdQuestIds[(7 - i) % createdQuestIds.length];
      const xp = 50;
      const gold = 20;

      insertCompletion.run(qId, userId, isoTime, xp, gold, dateStr);
      insertActivity.run(userId, 'quest_completed', `Completed: Master DSA`, 'INTELLECT', xp, gold, `Maintained streak on ${dateStr}`, isoTime);
    }

    // Seed initial inventory for Ayush
    const runebladeItem = db.prepare("SELECT id FROM items WHERE item_key = 'mythic_runeblade'").get();
    const wizardItem = db.prepare("SELECT id FROM items WHERE item_key = 'avatar_wizard'").get();
    const nebulaItem = db.prepare("SELECT id FROM items WHERE item_key = 'theme_nebula'").get();

    const insertInventory = db.prepare(`
      INSERT OR IGNORE INTO inventory (user_id, item_id, is_equipped)
      VALUES (?, ?, ?)
    `);

    if (runebladeItem) insertInventory.run(userId, runebladeItem.id, 1);
    if (wizardItem) insertInventory.run(userId, wizardItem.id, 0);
    if (nebulaItem) insertInventory.run(userId, nebulaItem.id, 0);

    // Seed unlocked achievements for Ayush
    const unlockedCodes = ['first_quest', 'quest_5', 'streak_3', 'streak_7', 'level_5', 'intellect_25', 'first_purchase'];
    const insertUserAch = db.prepare(`
      INSERT OR IGNORE INTO user_achievements (user_id, achievement_id, unlocked_at)
      SELECT ?, id, CURRENT_TIMESTAMP FROM achievements WHERE code = ?
    `);

    for (const code of unlockedCodes) {
      insertUserAch.run(userId, code);
    }

    console.log('Demo user "ayush" created successfully with 7-day streak & level 8 stats.');
  } else {
    userId = existingUser.id;
    console.log('Demo user "ayush" already exists (id:', userId, ').');
  }

  console.log('Database seeded successfully.');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
