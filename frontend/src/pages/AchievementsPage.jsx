import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { formatDate } from '../utils/formatters';
import { Trophy, Lock, CheckCircle2, Sparkles, Coins, Award } from 'lucide-react';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({ totalUnlocked: 0, totalCount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAchievements() {
      try {
        const data = await api.getAchievements();
        setAchievements(data.achievements || []);
        setStats({
          totalUnlocked: data.totalUnlocked || 0,
          totalCount: data.totalCount || 0
        });
      } catch (err) {
        console.error('Failed to load achievements:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAchievements();
  }, []);

  const percentComplete = stats.totalCount > 0 
    ? Math.round((stats.totalUnlocked / stats.totalCount) * 100) 
    : 0;

  return (
    <div className="achievements-page">
      {/* Achievements Hero Banner */}
      <div className="achievements-banner rpg-panel rpg-panel-corner rpg-panel-gilded">
        <div className="ach-banner-info">
          <span className="ach-badge font-retro">HALL OF GLORY</span>
          <h2 className="ach-title font-display">HERO ACHIEVEMENTS</h2>
          <p className="ach-desc">
            Milestone honors forged through perseverance, consistency, and real-life excellence.
          </p>
        </div>

        <div className="ach-progress-card">
          <div className="ach-progress-header">
            <span>REALM PROGRESS</span>
            <strong>{stats.totalUnlocked} / {stats.totalCount} BADGES ({percentComplete}%)</strong>
          </div>
          <div className="rpg-progress-container">
            <div className="rpg-progress-fill" style={{ width: `${percentComplete}%` }} />
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      {isLoading ? (
        <div className="loading-state text-center p-12">
          <p className="text-muted">Polishing achievement medals...</p>
        </div>
      ) : (
        <div className="achievements-grid">
          {achievements.map(ach => {
            const isUnlocked = ach.is_unlocked === 1;

            return (
              <div 
                key={ach.id} 
                className={`achievement-card rpg-panel ${isUnlocked ? 'ach-unlocked rpg-panel-corner' : 'ach-locked'}`}
              >
                <div className="ach-icon-wrapper">
                  <span className="ach-emoji">{ach.icon}</span>
                  {!isUnlocked && (
                    <div className="ach-lock-overlay" title="Locked Achievement">
                      <Lock size={16} />
                    </div>
                  )}
                </div>

                <div className="ach-content">
                  <div className="ach-title-row">
                    <h4 className="ach-card-title">{ach.title}</h4>
                    {isUnlocked && (
                      <span className="ach-unlocked-tag">
                        <CheckCircle2 size={13} /> Unlocked
                      </span>
                    )}
                  </div>

                  <p className="ach-card-desc">{ach.description}</p>

                  {/* Progress towards unlock if locked */}
                  {!isUnlocked && (
                    <div className="ach-progress-section">
                      <div className="ach-progress-labels">
                        <span>Progress</span>
                        <span>{ach.currentProgress} / {ach.targetValue}</span>
                      </div>
                      <div className="rpg-progress-container compact-bar">
                        <div 
                          className="rpg-progress-fill ach-bar" 
                          style={{ width: `${ach.progressPercent}%` }} 
                        />
                      </div>
                    </div>
                  )}

                  {/* Reward / Unlocked at footer */}
                  <div className="ach-card-footer">
                    <div className="ach-reward-pills">
                      <span className="xp-pill font-retro">+{ach.xp_reward} XP</span>
                      <span className="gold-pill font-retro">+{ach.gold_reward} Gold</span>
                    </div>

                    {isUnlocked && ach.unlocked_at && (
                      <span className="ach-date-tag">
                        {formatDate(ach.unlocked_at)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
