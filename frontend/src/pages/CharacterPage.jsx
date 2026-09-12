import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import AttributeBar from '../components/AttributeBar';
import { formatNumber } from '../utils/formatters';
import {
  Shield,
  Award,
  Sparkles,
  Coins,
  Flame,
  Swords,
  CheckCircle2,
  PieChart,
  UserCheck
} from 'lucide-react';

export default function CharacterPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const sheet = await api.getCharacter();
        setData(sheet);
      } catch (err) {
        console.error('Failed to load character sheet:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-state text-center p-12">
        <p className="text-muted">Manifesting hero sheet...</p>
      </div>
    );
  }

  const { character, attributes, equipped = [], stats, streak } = data || {};

  return (
    <div className="character-page">
      {/* Hero Header Card */}
      <div className="character-hero-card rpg-panel rpg-panel-gilded rpg-panel-corner">
        <div className="char-hero-left">
          <div className="char-portrait-box">
            <span className="char-portrait-emoji">
              {character?.avatar === 'avatar_wizard' ? '🧙' :
               character?.avatar === 'avatar_paladin' ? '🤖' :
               character?.avatar === 'avatar_shadow' ? '🥷' :
               character?.avatar === 'avatar_ranger' ? '🧝' : '⚔️'}
            </span>
            <div className="char-level-badge">LVL {character?.level}</div>
          </div>

          <div className="char-identity-meta">
            <h2 className="char-fullname font-display">{character?.name}</h2>
            <p className="char-current-title">{character?.title || 'Rising Adventurer'}</p>
            <div className="char-sub-tags">
              <span className="char-theme-tag">Theme: {character?.theme?.toUpperCase()}</span>
              <span className="char-class-tag">Class: High Discipline Disciple</span>
            </div>
          </div>
        </div>

        {/* Lifetime Key Metrics */}
        <div className="char-hero-metrics">
          <div className="metric-box">
            <span className="metric-label">TOTAL XP EARNED</span>
            <strong className="metric-value text-mana">
              <Sparkles size={16} /> {formatNumber(character?.totalXP)}
            </strong>
          </div>

          <div className="metric-box">
            <span className="metric-label">GOLD RESERVES</span>
            <strong className="metric-value text-gold">
              <Coins size={16} /> {formatNumber(character?.gold)}
            </strong>
          </div>

          <div className="metric-box">
            <span className="metric-label">ACTIVE STREAK</span>
            <strong className="metric-value text-flame">
              <Flame size={16} /> {streak?.currentStreak || 0} DAYS
            </strong>
          </div>

          <div className="metric-box">
            <span className="metric-label">QUESTS COMPLETED</span>
            <strong className="metric-value text-emerald">
              <CheckCircle2 size={16} /> {stats?.totalCompleted || 0}
            </strong>
          </div>
        </div>
      </div>

      {/* Attributes Section */}
      <div className="attributes-detailed-section">
        <div className="section-title-row">
          <h3 className="section-heading font-display">THE 5 CORE PILLARS OF REAL LIFE</h3>
          <p className="section-subheading">
            Each completed quest channels experience directly into its aligned attribute.
          </p>
        </div>

        <div className="attributes-cards-grid">
          {attributes && (
            <>
              <AttributeBar attributeKey="INTELLECT" value={attributes.intellect} />
              <AttributeBar attributeKey="STRENGTH" value={attributes.strength} />
              <AttributeBar attributeKey="VITALITY" value={attributes.vitality} />
              <AttributeBar attributeKey="DISCIPLINE" value={attributes.discipline} />
              <AttributeBar attributeKey="CREATIVITY" value={attributes.creativity} />
            </>
          )}
        </div>
      </div>

      {/* Bottom Row: Equipped Gear Showcase & Activity Distribution */}
      <div className="character-bottom-grid">
        {/* Equipped Gear Loadout */}
        <div className="equipped-loadout-panel rpg-panel rpg-panel-corner">
          <div className="rpg-panel-header">
            <h4 className="rpg-panel-title">
              <Shield size={18} className="text-gold" />
              <span>EQUIPPED ARTIFACTS & LOADOUT</span>
            </h4>
          </div>

          {equipped.length === 0 ? (
            <p className="text-muted text-center p-6">
              No artifacts currently equipped. Visit the Reward Shop to acquire legendary gear!
            </p>
          ) : (
            <div className="equipped-items-list">
              {equipped.map(item => (
                <div key={item.id} className="equipped-item-card rpg-panel">
                  <span className="equipped-item-icon">{item.icon}</span>
                  <div className="equipped-item-info">
                    <h5 className="equipped-item-name">{item.name}</h5>
                    <p className="equipped-item-desc">{item.description}</p>
                    <span className="equipped-rarity-tag font-retro">{item.rarity.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Life Energy Breakdown */}
        <div className="activity-breakdown-panel rpg-panel rpg-panel-corner">
          <div className="rpg-panel-header">
            <h4 className="rpg-panel-title">
              <PieChart size={18} className="text-mana" />
              <span>QUEST ACTIVITY DISTRIBUTION</span>
            </h4>
          </div>

          {stats?.categoryBreakdown && stats.categoryBreakdown.length > 0 ? (
            <div className="breakdown-list">
              {stats.categoryBreakdown.map(item => (
                <div key={item.category} className="breakdown-row">
                  <div className="breakdown-label">
                    <span>{item.category}</span>
                    <span className="breakdown-counts">
                      {item.completions_count} quests (+{formatNumber(item.category_xp)} XP)
                    </span>
                  </div>
                  <div className="rpg-progress-container compact-bar">
                    <div 
                      className="rpg-progress-fill" 
                      style={{ 
                        width: `${Math.min(100, Math.round((item.completions_count / (stats.totalCompleted || 1)) * 100))}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-center p-6">
              Complete quests across different categories to see your personal life energy distribution!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
