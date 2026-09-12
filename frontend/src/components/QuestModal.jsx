import React, { useState, useEffect } from 'react';
import { CATEGORY_INFO, DIFFICULTY_INFO } from '../utils/formatters';
import { X, Sparkles, Coins, Swords, AlertCircle } from 'lucide-react';
import { playClickSound } from '../utils/audio';

export default function QuestModal({ isOpen, onClose, onSave, editingQuest = null }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('INTELLECT');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [frequency, setFrequency] = useState('daily');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingQuest) {
      setTitle(editingQuest.title || '');
      setDescription(editingQuest.description || '');
      setCategory(editingQuest.category || 'INTELLECT');
      setDifficulty(editingQuest.difficulty || 'MEDIUM');
      setFrequency(editingQuest.frequency || 'daily');
    } else {
      setTitle('');
      setDescription('');
      setCategory('INTELLECT');
      setDifficulty('MEDIUM');
      setFrequency('daily');
    }
    setError('');
  }, [editingQuest, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentDiff = DIFFICULTY_INFO[difficulty] || DIFFICULTY_INFO.MEDIUM;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Quest name is required.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    playClickSound();

    try {
      await onSave({
        id: editingQuest ? editingQuest.id : undefined,
        title: title.trim(),
        description: description.trim(),
        category,
        difficulty,
        frequency
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save quest');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rpg-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="rpg-modal rpg-panel rpg-panel-corner" onClick={(e) => e.stopPropagation()}>
        <div className="rpg-modal-header">
          <div className="modal-title-box">
            <Swords size={20} className="modal-icon text-gold" />
            <h3>{editingQuest ? 'EDIT QUEST' : 'COMMISSION NEW QUEST'}</h3>
          </div>
          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="quest-form">
          {error && (
            <div className="form-error-alert" role="alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Quest Name */}
          <div className="form-group">
            <label htmlFor="quest-title" className="form-label">
              Quest Title <span className="required-star">*</span>
            </label>
            <input
              id="quest-title"
              type="text"
              className="rpg-input"
              placeholder="e.g. Master Binary Search Trees for 45 mins"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              autoFocus
              required
            />
          </div>

          {/* Quest Description */}
          <div className="form-group">
            <label htmlFor="quest-desc" className="form-label">
              Quest Objective & Instructions
            </label>
            <textarea
              id="quest-desc"
              className="rpg-textarea"
              placeholder="Describe your specific real-world task guidelines, requirements, or focus conditions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Category Picker */}
          <div className="form-group">
            <label className="form-label">Attribute Alignment</label>
            <div className="category-picker-grid">
              {Object.entries(CATEGORY_INFO).map(([key, cat]) => {
                const isSelected = category === key;
                return (
                  <button
                    key={key}
                    type="button"
                    className={`category-picker-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      playClickSound();
                      setCategory(key);
                    }}
                    style={{
                      borderColor: isSelected ? cat.color : undefined,
                      boxShadow: isSelected ? `0 0 10px ${cat.color}66` : undefined
                    }}
                  >
                    <span className="cat-icon">{cat.icon}</span>
                    <span className="cat-label">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty & Frequency */}
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="quest-diff" className="form-label">Difficulty Rating</label>
              <select
                id="quest-diff"
                className="rpg-select"
                value={difficulty}
                onChange={(e) => {
                  playClickSound();
                  setDifficulty(e.target.value);
                }}
              >
                <option value="EASY">EASY (Quick win / simple habit)</option>
                <option value="MEDIUM">MEDIUM (Focused effort ~45m)</option>
                <option value="HARD">HARD (Intense grind ~90m+)</option>
                <option value="EPIC">EPIC (Massive milestone / project)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="quest-freq" className="form-label">Schedule Frequency</label>
              <select
                id="quest-freq"
                className="rpg-select"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="daily">Daily Recurring Quest</option>
                <option value="weekly">Weekly Goal</option>
                <option value="one_off">One-Time Challenge</option>
              </select>
            </div>
          </div>

          {/* Reward Calculation Callout */}
          <div className="reward-preview-box">
            <span className="reward-calc-title">Guaranteed RPG Rewards upon Completion:</span>
            <div className="reward-calc-badges">
              <span className="reward-pill xp-pill">
                <Sparkles size={14} /> +{currentDiff.xp} XP
              </span>
              <span className="reward-pill gold-pill">
                <Coins size={14} /> +{currentDiff.gold} Gold
              </span>
              <span className="reward-pill attr-pill">
                +{difficulty === 'EASY' ? 2 : difficulty === 'MEDIUM' ? 5 : difficulty === 'HARD' ? 10 : 25} {category} Points
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="rpg-btn rpg-btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rpg-btn rpg-btn-primary"
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? 'Saving...' : editingQuest ? 'SAVE CHANGES' : 'CREATE QUEST'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
