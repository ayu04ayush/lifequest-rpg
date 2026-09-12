// LIFEQUEST Non-linear RPG Progression Service

function getRequiredXP(level) {
  // requiredXP(level) = floor(100 * level^1.5)
  return Math.floor(100 * Math.pow(level, 1.5));
}

function getTitleForLevel(level) {
  if (level >= 15) return 'Mythic Sovereign';
  if (level >= 10) return 'Grandmaster of Will';
  if (level >= 8) return 'LEVEL ' + level + ' — ADVENTURER';
  if (level >= 6) return 'Valiant Vanguard';
  if (level >= 4) return 'Skilled Pathfinder';
  if (level >= 2) return 'Apprentice Seeker';
  return 'Novice Adventurer';
}

function getAttributePointsForDifficulty(difficulty) {
  switch (difficulty) {
    case 'EASY': return 2;
    case 'MEDIUM': return 5;
    case 'HARD': return 10;
    case 'EPIC': return 25;
    default: return 5;
  }
}

function getDifficultyRewards(difficulty) {
  switch (difficulty) {
    case 'EASY': return { xp: 25, gold: 10 };
    case 'MEDIUM': return { xp: 50, gold: 20 };
    case 'HARD': return { xp: 100, gold: 45 };
    case 'EPIC': return { xp: 250, gold: 120 };
    default: return { xp: 50, gold: 20 };
  }
}

/**
 * Calculates level and current XP progress inside that level from total XP
 */
function calculateLevelFromTotalXP(totalXP) {
  let level = 1;
  let remainingXP = totalXP;

  while (true) {
    const needed = getRequiredXP(level);
    if (remainingXP >= needed) {
      remainingXP -= needed;
      level++;
    } else {
      break;
    }
  }

  return {
    level,
    currentXP: remainingXP,
    neededXP: getRequiredXP(level)
  };
}

module.exports = {
  getRequiredXP,
  getTitleForLevel,
  getAttributePointsForDifficulty,
  getDifficultyRewards,
  calculateLevelFromTotalXP
};
