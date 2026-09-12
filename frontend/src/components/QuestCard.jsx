import React, { useState } from 'react';
import { useGameState } from '../context/GameStateContext';
import { api } from '../services/api';
import { CATEGORY_INFO, DIFFICULTY_INFO, formatNumber } from '../utils/formatters';
import { Check, Edit2, Trash2, Sparkles, Coins, Clock, AlertCircle } from 'lucide-react';
import { playClickSound } from '../utils/audio';

export default function QuestCard({ quest, onEdit, onDelete, onCompleted }) {
  const { handleQuestCompletionResult } = useGameState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [floatingRewards, setFloatingRewards] = useState(null);
  const [error, setError] = useState(null);

  const category = CATEGORY_INFO[quest.category] || CATEGORY_INFO.INTELLECT;
  const difficulty = DIFFICULTY_INFO[quest.difficulty] || DIFFICULTY_INFO.MEDIUM;

  const isCompletedToday = quest.is_completed_today === 1 || justCompleted;

  const handleComplete = async () => {
    if (isCompletedToday || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    playClickSound();

    try {
      const res = await api.completeQuest(quest.id);
      setJustCompleted(true);
      setFloatingRewards({ xp: res.xpEarned, gold: res.goldEarned });

      // Trigger global level up or reward logic
      handleQuestCompletionResult(res);

      if (onCompleted) {
        onCompleted(quest.id, res);
      }

      // Hide floater after animation
      setTimeout(() => {
        setFloatingRewards(null);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to complete quest');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article 
      className={`quest-card rpg-panel rpg-panel-corner ${isCompletedToday ? 'quest-card-done' : ''}`}
      aria-label={`Quest: ${quest.title}`}
    >
      {/* Floating XP / Gold Indicator when completed */}
      {floatingRewards && (
        <div className="reward-floater" aria-hidden="true">
          <span className="reward-float-xp">+{floatingRewards.xp} XP</span>
          <span className="reward-float-gold">+{floatingRewards.gold} Gold</span>
        </div>
      )}

      {/* Card Header: Category & Difficulty */}
      <div className="quest-card-top">
        <div className="quest-badges">
          <span 
            className="badge-category"
            style={{ 
              backgroundColor: category.bg, 
              color: category.color, 
              border: `1px solid ${category.border}` 
            }}
          >
            <span>{category.icon}</span>
            <span>{category.label}</span>
          </span>

          <span className={`badge-difficulty ${difficulty.badgeClass}`}>
            {difficulty.label}
          </span>
        </div>

        {/* Actions menu: edit/delete */}
        {!isCompletedToday && (
          <div className="quest-actions-menu">
            {onEdit && (
              <button 
                type="button" 
                className="quest-action-icon-btn" 
                onClick={() => onEdit(quest)}
                title="Edit Quest"
                aria-label="Edit Quest"
              >
                <Edit2 size={15} />
              </button>
            )}
            {onDelete && (
              <button 
                type="button" 
                className="quest-action-icon-btn delete-btn" 
                onClick={() => onDelete(quest.id)}
                title="Delete Quest"
                aria-label="Delete Quest"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quest Body */}
      <div className="quest-card-body">
        <h4 className="quest-title">{quest.title}</h4>
        {quest.description && (
          <p className="quest-description">{quest.description}</p>
        )}
      </div>

      {/* Rewards Pill */}
      <div className="quest-reward-preview">
        <div className="reward-preview-pill xp-pill">
          <Sparkles size={14} />
          <span>+{formatNumber(quest.xp_reward)} XP</span>
        </div>
        <div className="reward-preview-pill gold-pill">
          <Coins size={14} />
          <span>+{formatNumber(quest.gold_reward)} Gold</span>
        </div>
        <span className="quest-freq-tag">
          <Clock size={12} /> {quest.frequency === 'daily' ? 'Daily' : quest.frequency === 'weekly' ? 'Weekly' : 'One-Time'}
        </span>
      </div>

      {/* Error Message if any */}
      {error && (
        <div className="quest-error-msg" role="alert">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Complete Button / Completed Status */}
      <div className="quest-card-footer">
        {isCompletedToday ? (
          <div className="quest-completed-badge">
            <Check size={16} />
            <span>✓ COMPLETED TODAY</span>
          </div>
        ) : (
          <button
            type="button"
            className="rpg-btn rpg-btn-complete quest-complete-btn"
            onClick={handleComplete}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            <Check size={18} />
            <span>{isSubmitting ? 'Saving Progress...' : 'COMPLETE QUEST'}</span>
          </button>
        )}
      </div>
    </article>
  );
}
