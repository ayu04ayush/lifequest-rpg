import React, { useEffect } from 'react';
import { useGameState } from '../context/GameStateContext';
import { Sparkles, Trophy, Coins, ArrowRight, ShieldCheck } from 'lucide-react';
import { playClickSound } from '../utils/audio';

export default function LevelUpModal() {
  const { levelUpData, closeLevelUpModal } = useGameState();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        if (levelUpData) {
          playClickSound();
          closeLevelUpModal();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [levelUpData, closeLevelUpModal]);

  if (!levelUpData) return null;

  const { oldLevel, newLevel, newTitle, bonusGold } = levelUpData;

  const handleContinue = () => {
    playClickSound();
    closeLevelUpModal();
  };

  return (
    <div 
      className="levelup-overlay" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="levelup-heading"
      onClick={handleContinue}
    >
      <div 
        className="levelup-card rpg-panel-corner" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="levelup-emblem" aria-hidden="true">
          👑
        </div>

        <h2 id="levelup-heading" className="levelup-title">
          LEVEL UP!
        </h2>

        <p className="levelup-subtitle">
          Your real-life discipline and grit have forged a stronger hero!
        </p>

        <div className="levelup-stats-box">
          <div className="level-transition">
            <span className="level-old">LVL {oldLevel}</span>
            <ArrowRight size={20} className="level-arrow" />
            <span className="level-new">LVL {newLevel}</span>
          </div>
        </div>

        {newTitle && (
          <div className="levelup-reward-item">
            <ShieldCheck size={18} className="reward-icon" />
            <span>Title Unlocked: <strong>{newTitle}</strong></span>
          </div>
        )}

        {bonusGold > 0 && (
          <div className="levelup-reward-item gold-reward">
            <Coins size={18} className="reward-icon gold-icon" />
            <span>Level Tribute: <strong>+{bonusGold} Gold</strong></span>
          </div>
        )}

        <button
          type="button"
          className="rpg-btn rpg-btn-primary levelup-btn"
          onClick={handleContinue}
          autoFocus
        >
          <Sparkles size={18} />
          <span>CONTINUE ADVENTURE</span>
        </button>
      </div>
    </div>
  );
}
