import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { formatDate, formatRelativeTime, formatNumber, CATEGORY_INFO } from '../utils/formatters';
import { History, Sparkles, Coins, Swords, CheckCircle2, Calendar } from 'lucide-react';

export default function ActivityHistoryPage() {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadActivities() {
      try {
        const data = await api.getActivity();
        setActivities(data.activities || []);
      } catch (err) {
        console.error('Failed to load activity log:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadActivities();
  }, []);

  // Group activities by date
  const grouped = activities.reduce((acc, act) => {
    const dStr = formatDate(act.created_at);
    if (!acc[dStr]) acc[dStr] = [];
    acc[dStr].push(act);
    return acc;
  }, {});

  return (
    <div className="activity-page">
      {/* Header */}
      <div className="activity-header-banner rpg-panel rpg-panel-corner rpg-panel-gilded">
        <div className="activity-header-text">
          <span className="activity-tag font-retro">CHRONICLES OF GLORY</span>
          <h2 className="activity-title font-display">THE ADVENTURE LOG</h2>
          <p className="activity-desc">
            A permanent record of every real-life quest completed, badge unlocked, and treasure acquired.
          </p>
        </div>

        <div className="activity-count-badge">
          <History size={20} className="text-gold" />
          <span>{activities.length} Total Logged Actions</span>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-state text-center p-12">
          <p className="text-muted">Unrolling ancient papyrus logs...</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="empty-quests-state rpg-panel text-center">
          <History size={48} className="empty-icon text-muted" />
          <h4 className="empty-title">The Adventure Log is Pristine</h4>
          <p className="empty-desc">Complete your first quest to begin recording your legendary tale.</p>
        </div>
      ) : (
        <div className="timeline-container">
          {Object.entries(grouped).map(([dateGroup, items]) => (
            <div key={dateGroup} className="timeline-day-group">
              <div className="timeline-date-header">
                <Calendar size={16} className="text-gold" />
                <h3 className="timeline-date-heading">{dateGroup}</h3>
                <span className="timeline-count-badge">{items.length} events</span>
              </div>

              <div className="timeline-items-list">
                {items.map(act => {
                  const cat = CATEGORY_INFO[act.category] || { icon: '⚔️', color: '#fbbf24' };

                  return (
                    <div key={act.id} className="timeline-item-card rpg-panel">
                      <div className="timeline-item-left">
                        <div 
                          className="timeline-item-icon" 
                          style={{ borderColor: cat.color }}
                        >
                          <span>{cat.icon}</span>
                        </div>

                        <div className="timeline-item-info">
                          <h4 className="timeline-item-title">{act.title}</h4>
                          {act.details && (
                            <p className="timeline-item-desc">{act.details}</p>
                          )}
                          <span className="timeline-time-meta">
                            {formatRelativeTime(act.created_at)}
                          </span>
                        </div>
                      </div>

                      <div className="timeline-item-rewards">
                        {act.xp_change > 0 && (
                          <span className="xp-pill">
                            <Sparkles size={13} /> +{formatNumber(act.xp_change)} XP
                          </span>
                        )}
                        {act.gold_change !== 0 && (
                          <span className={act.gold_change > 0 ? 'gold-pill' : 'gold-pill spent-gold'}>
                            <Coins size={13} /> {act.gold_change > 0 ? `+${act.gold_change}` : act.gold_change} Gold
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
