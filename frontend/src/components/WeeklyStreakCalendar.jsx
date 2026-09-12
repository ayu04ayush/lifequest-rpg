import React from 'react';
import { Flame, Check, Trophy, Sparkles } from 'lucide-react';

export default function WeeklyStreakCalendar({ streakData }) {
  if (!streakData) return null;

  const { currentStreak = 0, highestStreak = 0, weeklyCalendar = [] } = streakData;

  // Milestone rewards calculation
  const nextMilestone = currentStreak < 3 ? 3 : currentStreak < 7 ? 7 : currentStreak < 14 ? 14 : 30;
  const daysRemaining = Math.max(0, nextMilestone - currentStreak);

  return (
    <div className="streak-calendar-panel rpg-panel rpg-panel-corner">
      <div className="rpg-panel-header">
        <h3 className="rpg-panel-title">
          <Flame size={20} className="text-flame" />
          <span>REAL-LIFE STREAK</span>
        </h3>
        <span className="streak-record-tag">
          Personal Best: <strong>{highestStreak} Days</strong>
        </span>
      </div>

      <div className="streak-hero-display">
        <div className="streak-count-wrapper">
          <span className="streak-number">{currentStreak}</span>
          <span className="streak-unit">{currentStreak === 1 ? 'DAY STREAK' : 'DAYS STREAK'}</span>
        </div>
        <p className="streak-description">
          {currentStreak > 0
            ? 'Your momentum is burning bright! Complete a quest daily to keep the fire alive.'
            : 'No active streak today. Complete any quest below to start your streak fire!'}
        </p>
      </div>

      {/* Weekly Mon-Sun Matrix */}
      <div className="weekly-matrix" role="region" aria-label="Weekly Activity Calendar">
        {weeklyCalendar.map((item) => (
          <div 
            key={item.date} 
            className={`week-day-cell ${item.isCompleted ? 'completed' : ''} ${item.isToday ? 'today' : ''}`}
            title={`${item.day} (${item.date}): ${item.isCompleted ? 'Quests completed ✓' : 'No quests completed'}`}
          >
            <span className="day-name">{item.day}</span>
            <div className="day-status-orb">
              {item.isCompleted ? (
                <Check size={14} className="check-icon" />
              ) : (
                <span className="empty-dot" />
              )}
            </div>
            {item.isToday && <span className="today-badge">TODAY</span>}
          </div>
        ))}
      </div>

      {/* Milestone Progress Bar */}
      <div className="streak-milestone-box">
        <div className="milestone-label">
          <span>
            <Trophy size={14} className="milestone-icon" /> Next Milestone: {nextMilestone} Days
          </span>
          <span className="milestone-remaining">
            {daysRemaining === 0 ? 'Milestone achieved!' : `${daysRemaining} days to go`}
          </span>
        </div>
        <div className="rpg-progress-container">
          <div 
            className="rpg-progress-fill streak-progress"
            style={{ width: `${Math.min(100, Math.round((currentStreak / nextMilestone) * 100))}%` }}
          />
        </div>
        <span className="milestone-reward-text">
          Reward: {nextMilestone === 3 ? '+50 Gold & Kindled Spark Badge' :
                   nextMilestone === 7 ? '+100 Gold & On Fire Badge' :
                   nextMilestone === 14 ? '+250 Gold & Blazing Constancy Badge' : 'Epic Legendary Sovereign Title'}
        </span>
      </div>
    </div>
  );
}
