const db = require('../db/database');

function evaluateAchievements(userId) {
  const newUnlocks = [];

  // Fetch character stats
  const character = db.prepare(`
    SELECT c.*, a.intellect, a.strength, a.vitality, a.discipline, a.creativity
    FROM characters c
    JOIN attributes a ON a.character_id = c.id
    WHERE c.user_id = ?
  `).get(userId);

  if (!character) return newUnlocks;

  // Fetch counts
  const questCountRow = db.prepare(`
    SELECT COUNT(*) as count FROM quest_completions WHERE user_id = ?
  `).get(userId);
  const totalQuests = questCountRow ? questCountRow.count : 0;

  const purchaseCountRow = db.prepare(`
    SELECT COUNT(*) as count FROM inventory WHERE user_id = ?
  `).get(userId);
  const totalPurchases = purchaseCountRow ? purchaseCountRow.count : 0;

  // Fetch currently locked achievements
  const lockedAchievements = db.prepare(`
    SELECT a.*
    FROM achievements a
    WHERE a.id NOT IN (
      SELECT achievement_id FROM user_achievements WHERE user_id = ?
    )
  `).all(userId);

  const unlockStmt = db.prepare(`
    INSERT INTO user_achievements (user_id, achievement_id, unlocked_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
  `);

  const rewardStmt = db.prepare(`
    UPDATE characters
    SET total_xp = total_xp + ?, gold = gold + ?
    WHERE user_id = ?
  `);

  const activityStmt = db.prepare(`
    INSERT INTO activity_history (user_id, action_type, title, category, xp_change, gold_change, details)
    VALUES (?, 'achievement_unlocked', ?, 'ACHIEVEMENT', ?, ?, ?)
  `);

  for (const ach of lockedAchievements) {
    let qualifies = false;

    switch (ach.requirement_type) {
      case 'quests_completed':
        qualifies = totalQuests >= ach.requirement_value;
        break;
      case 'streak':
        qualifies = character.current_streak >= ach.requirement_value || character.highest_streak >= ach.requirement_value;
        break;
      case 'level':
        qualifies = character.level >= ach.requirement_value;
        break;
      case 'intellect':
        qualifies = character.intellect >= ach.requirement_value;
        break;
      case 'strength':
        qualifies = character.strength >= ach.requirement_value;
        break;
      case 'gold_earned':
        qualifies = character.gold >= ach.requirement_value;
        break;
      case 'items_purchased':
        qualifies = totalPurchases >= ach.requirement_value;
        break;
      default:
        qualifies = false;
    }

    if (qualifies) {
      unlockStmt.run(userId, ach.id);
      rewardStmt.run(ach.xp_reward, ach.gold_reward, userId);
      activityStmt.run(userId, `Unlocked: ${ach.title}`, ach.xp_reward, ach.gold_reward, ach.description);
      newUnlocks.push(ach);
    }
  }

  return newUnlocks;
}

module.exports = {
  evaluateAchievements
};
