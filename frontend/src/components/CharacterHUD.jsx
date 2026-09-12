import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useGameState } from '../context/GameStateContext';
import { Volume2, VolumeX, Flame, Coins, Shield, Sparkles } from 'lucide-react';
import { formatNumber } from '../utils/formatters';

export default function CharacterHUD() {
  const { character } = useAuth();
  const { isMuted, toggleMute } = useGameState();

  if (!character) return null;

  const currentXP = character.currentXP ?? character.current_xp ?? 0;
  const neededXP = character.neededXP || 100;
  const xpPercent = Math.min(100, Math.max(0, Math.round((currentXP / neededXP) * 100)));
  const gold = character.gold ?? 0;
  const streak = character.currentStreak ?? character.current_streak ?? 0;
  const level = character.level ?? 1;
  const title = character.title || 'Novice Adventurer';

  return (
    <header className="hud-container" role="banner" aria-label="Character Status HUD">
      <div className="hud-inner">
        {/* Left: Avatar & Identity */}
        <div className="hud-identity">
          <div className="hud-avatar-box" title={`Avatar: ${character.avatar || 'Adventurer'}`}>
            <span className="hud-avatar-emoji">
              {character.avatar === 'avatar_wizard' ? '🧙' :
               character.avatar === 'avatar_paladin' ? '🤖' :
               character.avatar === 'avatar_shadow' ? '🥷' :
               character.avatar === 'avatar_ranger' ? '🧝' : '⚔️'}
            </span>
            <span className="hud-level-pill">LV {level}</span>
          </div>

          <div className="hud-names">
            <h2 className="hud-char-name">{character.name || 'HERO'}</h2>
            <p className="hud-char-title">{title}</p>
          </div>
        </div>

        {/* Center: XP Bar */}
        <div className="hud-progression">
          <div className="hud-xp-label">
            <span className="xp-text">
              <Sparkles size={14} className="xp-icon" /> XP PROGRESS
            </span>
            <span className="xp-values">
              <strong>{formatNumber(currentXP)}</strong> / {formatNumber(neededXP)} XP ({xpPercent}%)
            </span>
          </div>
          <div className="rpg-progress-container" title={`${xpPercent}% towards Level ${level + 1}`}>
            <div 
              className="rpg-progress-fill" 
              style={{ width: `${xpPercent}%` }}
              role="progressbar"
              aria-valuenow={currentXP}
              aria-valuemin={0}
              aria-valuemax={neededXP}
            />
          </div>
        </div>

        {/* Right: Currency, Streak, Audio */}
        <div className="hud-stats">
          <div className="gold-badge" title="Virtual Gold Currency earned through quest completion">
            <Coins size={16} className="gold-coin-icon" />
            <span>{formatNumber(gold)}</span>
          </div>

          <div className="streak-badge" title="Current Daily Streak">
            <Flame size={16} className="streak-flame-icon" />
            <span>{streak} {streak === 1 ? 'DAY' : 'DAYS'}</span>
          </div>

          <button 
            type="button"
            className="hud-audio-btn"
            onClick={toggleMute}
            title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            aria-label={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
