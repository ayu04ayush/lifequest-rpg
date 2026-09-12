import React from 'react';
import { CATEGORY_INFO } from '../utils/formatters';

export default function AttributeBar({ attributeKey, value, compact = false }) {
  const upperKey = attributeKey.toUpperCase();
  const info = CATEGORY_INFO[upperKey] || {
    label: upperKey,
    icon: '⭐',
    color: '#38bdf8',
    description: 'Hero attribute'
  };

  // Max visual scale target for attributes (e.g. 100 for novice/intermediate tier, expands gracefully)
  const maxScale = Math.max(100, Math.ceil((value + 15) / 25) * 25);
  const percent = Math.min(100, Math.round((value / maxScale) * 100));

  if (compact) {
    return (
      <div className="compact-attribute-item" title={`${info.label}: ${value} pts`}>
        <div className="compact-attr-header">
          <span className="attr-icon-label">
            <span className="attr-emoji">{info.icon}</span>
            <span className="attr-name">{info.label}</span>
          </span>
          <strong className="attr-val" style={{ color: info.color }}>{value}</strong>
        </div>
        <div className="rpg-progress-container compact-bar">
          <div 
            className="rpg-progress-fill" 
            style={{ 
              width: `${percent}%`, 
              background: `linear-gradient(90deg, ${info.color}88 0%, ${info.color} 100%)`,
              boxShadow: `0 0 8px ${info.color}66`
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="full-attribute-card rpg-panel rpg-panel-corner">
      <div className="full-attr-top">
        <div className="attr-left">
          <div className="attr-big-icon" style={{ background: info.bg, borderColor: info.border }}>
            {info.icon}
          </div>
          <div>
            <h4 className="attr-full-name">{info.label}</h4>
            <p className="attr-tagline">{info.description}</p>
          </div>
        </div>

        <div className="attr-score-badge" style={{ borderColor: info.border, color: info.color }}>
          <span className="attr-score-number">{value}</span>
          <span className="attr-score-label">PTS</span>
        </div>
      </div>

      <div className="attr-bar-section">
        <div className="attr-bar-label-row">
          <span>Tier Progress</span>
          <span>{value} / {maxScale}</span>
        </div>
        <div className="rpg-progress-container">
          <div 
            className="rpg-progress-fill" 
            style={{ 
              width: `${percent}%`, 
              background: `linear-gradient(90deg, ${info.color}88 0%, ${info.color} 100%)`,
              boxShadow: `0 0 10px ${info.color}66`
            }}
          />
        </div>
      </div>
    </div>
  );
}
