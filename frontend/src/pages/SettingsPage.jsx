import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGameState } from '../context/GameStateContext';
import { api } from '../services/api';
import {
  playQuestCompleteSound,
  playLevelUpSound,
  playGoldSound,
  playClickSound
} from '../utils/audio';
import {
  Settings,
  Volume2,
  VolumeX,
  Palette,
  User,
  Shield,
  RefreshCw,
  Check,
  Database,
  Sparkles
} from 'lucide-react';

export default function SettingsPage() {
  const { user, character, updateCharacterState, logout } = useAuth();
  const { isMuted, toggleMute } = useGameState();

  const [charName, setCharName] = useState(character?.name || '');
  const [selectedTheme, setSelectedTheme] = useState(character?.theme || 'obsidian');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const themes = [
    { id: 'obsidian', name: 'Obsidian Night', color: '#0a0d14', accent: '#c29b38' },
    { id: 'nebula', name: 'Nebula Night', color: '#0b0c1e', accent: '#818cf8' },
    { id: 'molten', name: 'Molten Ember', color: '#140908', accent: '#ea580c' },
    { id: 'emerald', name: 'Elven Forest', color: '#06140e', accent: '#10b981' },
    { id: 'royal', name: 'Royal Gold', color: '#121008', accent: '#fbbf24' }
  ];

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback('');
    playClickSound();

    try {
      const res = await api.updateProfile({
        name: charName.trim(),
        theme: selectedTheme
      });
      updateCharacterState({ name: charName.trim(), theme: selectedTheme });
      document.documentElement.setAttribute('data-theme', selectedTheme);
      setFeedback('Hero profile updated successfully!');
    } catch (err) {
      setFeedback(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleThemePreview = (themeId) => {
    playClickSound();
    setSelectedTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
  };

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="settings-banner rpg-panel rpg-panel-corner rpg-panel-gilded">
        <div className="settings-header-text">
          <span className="settings-tag font-retro">CONFIG & TUNE</span>
          <h2 className="settings-title font-display">GAME SETTINGS</h2>
          <p className="settings-desc">
            Fine-tune your sensory feedback, audio synthesis, hero title, and visual themes.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="shop-feedback-alert alert-success rpg-panel">
          <Sparkles size={18} />
          <span>{feedback}</span>
        </div>
      )}

      <div className="settings-grid">
        {/* Profile Settings */}
        <div className="settings-card rpg-panel rpg-panel-corner">
          <div className="rpg-panel-header">
            <h3 className="rpg-panel-title">
              <User size={18} className="text-gold" />
              <span>HERO IDENTITY</span>
            </h3>
          </div>

          <form onSubmit={handleSaveProfile} className="settings-form">
            <div className="form-group">
              <label className="form-label" htmlFor="settings-name">Character Call-Sign</label>
              <input
                id="settings-name"
                type="text"
                className="rpg-input"
                value={charName}
                onChange={(e) => setCharName(e.target.value)}
                maxLength={24}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Active Realm Theme</label>
              <div className="theme-selector-grid">
                {themes.map(th => {
                  const isSelected = selectedTheme === th.id;
                  return (
                    <button
                      key={th.id}
                      type="button"
                      className={`theme-swatch-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleThemePreview(th.id)}
                      style={{ borderColor: isSelected ? th.accent : undefined }}
                    >
                      <span className="swatch-circle" style={{ background: th.color, border: `2px solid ${th.accent}` }} />
                      <span className="swatch-name">{th.name}</span>
                      {isSelected && <Check size={14} className="swatch-check" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="rpg-btn rpg-btn-primary"
              disabled={isSaving}
            >
              <span>{isSaving ? 'Saving Changes...' : 'SAVE SETTINGS'}</span>
            </button>
          </form>
        </div>

        {/* Audio Engine Settings */}
        <div className="settings-card rpg-panel rpg-panel-corner">
          <div className="rpg-panel-header">
            <h3 className="rpg-panel-title">
              <Volume2 size={18} className="text-gold" />
              <span>16-BIT AUDIO SYNTHESIS</span>
            </h3>
          </div>

          <div className="audio-settings-body">
            <p className="audio-desc">
              All sound effects are synthesized client-side via the Web Audio API with zero external network lag.
            </p>

            <div className="audio-toggle-row">
              <div>
                <strong className="audio-toggle-label">Master Audio Effects</strong>
                <p className="audio-toggle-sub">Toggle retro chimes, gold clinks, and fanfares</p>
              </div>

              <button
                type="button"
                className={`audio-switch-btn ${isMuted ? 'muted' : 'active'}`}
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                <span>{isMuted ? 'MUTED' : 'ENABLED'}</span>
              </button>
            </div>

            <div className="audio-test-bench">
              <span className="test-bench-label font-retro">TEST SOUND FX:</span>
              <div className="test-bench-buttons">
                <button
                  type="button"
                  className="rpg-btn rpg-btn-secondary"
                  onClick={() => playQuestCompleteSound()}
                  disabled={isMuted}
                >
                  Quest Chime
                </button>
                <button
                  type="button"
                  className="rpg-btn rpg-btn-secondary"
                  onClick={() => playGoldSound()}
                  disabled={isMuted}
                >
                  Gold Clink
                </button>
                <button
                  type="button"
                  className="rpg-btn rpg-btn-secondary"
                  onClick={() => playLevelUpSound()}
                  disabled={isMuted}
                >
                  Victory Fanfare
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* System & Persistence Details */}
        <div className="settings-card rpg-panel rpg-panel-corner full-width-card">
          <div className="rpg-panel-header">
            <h3 className="rpg-panel-title">
              <Database size={18} className="text-gold" />
              <span>SYSTEM ARCHITECTURE & PERSISTENCE</span>
            </h3>
          </div>

          <div className="system-info-grid">
            <div className="system-info-cell">
              <span className="info-key">DATABASE ENGINE</span>
              <strong className="info-value">Node.js 24 SQLite (DatabaseSync)</strong>
            </div>
            <div className="system-info-cell">
              <span className="info-key">STORAGE LOCATION</span>
              <strong className="info-value">backend/data/lifequest.db (WAL Mode)</strong>
            </div>
            <div className="system-info-cell">
              <span className="info-key">SECURITY</span>
              <strong className="info-value">JWT Bearer + Bcrypt Password Hashing</strong>
            </div>
            <div className="system-info-cell">
              <span className="info-key">DATA INTEGRITY</span>
              <strong className="info-value">Server-side XP & Gold Math Enforcement</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
