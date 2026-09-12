// Utility formatters for RPG presentation

export const CATEGORY_INFO = {
  INTELLECT: {
    label: 'Intellect',
    icon: '🧠',
    color: '#818cf8',
    bg: 'rgba(129, 140, 248, 0.12)',
    border: 'rgba(129, 140, 248, 0.35)',
    description: 'Improved by learning, studying, and coding quests.'
  },
  STRENGTH: {
    label: 'Strength',
    icon: '⚔️',
    color: '#f87171',
    bg: 'rgba(248, 113, 113, 0.12)',
    border: 'rgba(248, 113, 113, 0.35)',
    description: 'Improved by workouts, fitness, and physical training.'
  },
  VITALITY: {
    label: 'Vitality',
    icon: '❤️',
    color: '#34d399',
    bg: 'rgba(52, 211, 153, 0.12)',
    border: 'rgba(52, 211, 153, 0.35)',
    description: 'Improved by sleep, hydration, nutrition, and wellness.'
  },
  DISCIPLINE: {
    label: 'Discipline',
    icon: '🎯',
    color: '#fbbf24',
    bg: 'rgba(251, 191, 36, 0.12)',
    border: 'rgba(251, 191, 36, 0.35)',
    description: 'Improved by focus routines, morning habits, and consistency.'
  },
  CREATIVITY: {
    label: 'Creativity',
    icon: '🎨',
    color: '#e879f9',
    bg: 'rgba(232, 121, 249, 0.12)',
    border: 'rgba(232, 121, 249, 0.35)',
    description: 'Improved by writing, art, UI design, and brainstorming.'
  }
};

export const DIFFICULTY_INFO = {
  EASY: {
    label: 'Easy',
    color: '#34d399',
    badgeClass: 'badge-easy',
    xp: 25,
    gold: 10
  },
  MEDIUM: {
    label: 'Medium',
    color: '#38bdf8',
    badgeClass: 'badge-medium',
    xp: 50,
    gold: 20
  },
  HARD: {
    label: 'Hard',
    color: '#fbbf24',
    badgeClass: 'badge-hard',
    xp: 100,
    gold: 45
  },
  EPIC: {
    label: 'Epic',
    color: '#c084fc',
    badgeClass: 'badge-epic',
    xp: 250,
    gold: 120
  }
};

export function formatNumber(num) {
  if (num === undefined || num === null) return '0';
  return Number(num).toLocaleString();
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const past = new Date(dateString);
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 172800) return 'Yesterday';
  return formatDate(dateString);
}
