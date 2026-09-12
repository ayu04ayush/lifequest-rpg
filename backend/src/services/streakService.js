const db = require('../db/database');

function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calculateUserStreak(userId) {
  // Fetch all unique completion dates ordered descending
  const rows = db.prepare(`
    SELECT DISTINCT completion_date 
    FROM quest_completions 
    WHERE user_id = ? 
    ORDER BY completion_date DESC
  `).all(userId);

  if (!rows || rows.length === 0) {
    return {
      currentStreak: 0,
      highestStreak: 0,
      completedToday: false,
      weeklyCalendar: getWeeklyCalendar(userId)
    };
  }

  const uniqueDates = rows.map(r => r.completion_date);
  const todayStr = getLocalDateString(new Date());
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  const completedToday = uniqueDates.includes(todayStr);
  const completedYesterday = uniqueDates.includes(yesterdayStr);

  let currentStreak = 0;
  if (completedToday || completedYesterday) {
    let checkDate = new Date();
    if (!completedToday) {
      checkDate = yesterday;
    }

    while (true) {
      const dateStr = getLocalDateString(checkDate);
      if (uniqueDates.includes(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate historic highest streak
  let highestStreak = currentStreak;
  let running = 0;
  // Sort ascending for historical streak run
  const ascDates = [...uniqueDates].sort();
  for (let i = 0; i < ascDates.length; i++) {
    if (i === 0) {
      running = 1;
    } else {
      const prevDate = new Date(ascDates[i - 1]);
      const currDate = new Date(ascDates[i]);
      const diffDays = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        running++;
      } else if (diffDays > 1) {
        running = 1;
      }
    }
    if (running > highestStreak) {
      highestStreak = running;
    }
  }

  // Update character record
  db.prepare(`
    UPDATE characters 
    SET current_streak = ?, highest_streak = MAX(highest_streak, ?), last_active_date = ?
    WHERE user_id = ?
  `).run(currentStreak, highestStreak, completedToday ? todayStr : yesterdayStr, userId);

  return {
    currentStreak,
    highestStreak,
    completedToday,
    weeklyCalendar: getWeeklyCalendar(userId)
  };
}

function getWeeklyCalendar(userId) {
  const today = new Date();
  // Get current day of week (0 = Sunday, 1 = Monday, ... 6 = Saturday)
  const dayIndex = today.getDay();
  // Distance from Monday (if today is Sunday, dayIndex is 0, distance from prev Monday is 6)
  const diffToMonday = (dayIndex + 6) % 7;
  
  const monday = new Date(today);
  monday.setDate(today.getDate() - diffToMonday);

  const dayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const calendar = [];

  // Query this week's completion dates
  const weekStartStr = getLocalDateString(monday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const weekEndStr = getLocalDateString(sunday);

  const activeDatesRows = db.prepare(`
    SELECT DISTINCT completion_date 
    FROM quest_completions 
    WHERE user_id = ? AND completion_date >= ? AND completion_date <= ?
  `).all(userId, weekStartStr, weekEndStr);

  const activeDatesSet = new Set(activeDatesRows.map(r => r.completion_date));
  const todayStr = getLocalDateString(today);

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + i);
    const dateStr = getLocalDateString(dayDate);

    calendar.push({
      day: dayLabels[i],
      date: dateStr,
      isToday: dateStr === todayStr,
      isCompleted: activeDatesSet.has(dateStr),
      isPast: dateStr < todayStr
    });
  }

  return calendar;
}

module.exports = {
  getLocalDateString,
  calculateUserStreak,
  getWeeklyCalendar
};
