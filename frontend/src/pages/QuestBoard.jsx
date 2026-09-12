import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import QuestCard from '../components/QuestCard';
import QuestModal from '../components/QuestModal';
import { Swords, Plus, Search, Filter, Sparkles, CheckCircle2 } from 'lucide-react';
import { playClickSound } from '../utils/audio';

export default function QuestBoard() {
  const [quests, setQuests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, COMPLETED

  const loadQuests = async () => {
    try {
      const data = await api.getQuests();
      setQuests(data.quests || []);
    } catch (err) {
      console.error('Failed to load quests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuests();
  }, []);

  const handleSaveQuest = async (payload) => {
    if (payload.id) {
      await api.updateQuest(payload.id, payload);
    } else {
      await api.createQuest(payload);
    }
    await loadQuests();
  };

  const handleDeleteQuest = async (questId) => {
    if (!window.confirm('Are you sure you want to abandon this quest?')) return;
    playClickSound();
    try {
      await api.deleteQuest(questId);
      setQuests(prev => prev.filter(q => q.id !== questId));
    } catch (err) {
      alert(err.message || 'Failed to delete quest');
    }
  };

  const handleCompleted = (questId, res) => {
    setQuests(prev => prev.map(q => q.id === questId ? { ...q, is_completed_today: 1 } : q));
  };

  const filteredQuests = quests.filter(q => {
    // Search
    if (searchQuery.trim()) {
      const qText = `${q.title} ${q.description}`.toLowerCase();
      if (!qText.includes(searchQuery.toLowerCase())) return false;
    }
    // Category
    if (selectedCategory !== 'ALL' && q.category !== selectedCategory) return false;
    // Difficulty
    if (selectedDifficulty !== 'ALL' && q.difficulty !== selectedDifficulty) return false;
    // Status
    if (statusFilter === 'ACTIVE' && q.is_completed_today === 1) return false;
    if (statusFilter === 'COMPLETED' && q.is_completed_today !== 1) return false;

    return true;
  });

  return (
    <div className="quest-board-page">
      {/* Top Banner */}
      <div className="board-header-row">
        <div>
          <h2 className="board-title font-display">GRAND QUEST ARCHIVES</h2>
          <p className="board-sub">
            Organize, commission, and execute your real-world productivity quests.
          </p>
        </div>

        <button
          type="button"
          className="rpg-btn rpg-btn-primary"
          onClick={() => {
            playClickSound();
            setEditingQuest(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={18} />
          <span>COMMISSION QUEST</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="quest-filter-bar rpg-panel">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="rpg-input search-input"
            placeholder="Search quest objectives or titles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filters-dropdown-group">
          {/* Category Dropdown */}
          <select
            className="rpg-select filter-select"
            value={selectedCategory}
            onChange={(e) => {
              playClickSound();
              setSelectedCategory(e.target.value);
            }}
          >
            <option value="ALL">All Categories</option>
            <option value="INTELLECT">🧠 Intellect</option>
            <option value="STRENGTH">⚔️ Strength</option>
            <option value="VITALITY">❤️ Vitality</option>
            <option value="DISCIPLINE">🎯 Discipline</option>
            <option value="CREATIVITY">🎨 Creativity</option>
          </select>

          {/* Difficulty Dropdown */}
          <select
            className="rpg-select filter-select"
            value={selectedDifficulty}
            onChange={(e) => {
              playClickSound();
              setSelectedDifficulty(e.target.value);
            }}
          >
            <option value="ALL">All Difficulties</option>
            <option value="EASY">Easy (+25 XP)</option>
            <option value="MEDIUM">Medium (+50 XP)</option>
            <option value="HARD">Hard (+100 XP)</option>
            <option value="EPIC">Epic (+250 XP)</option>
          </select>

          {/* Status Segmented Buttons */}
          <div className="status-toggle-pills">
            {['ALL', 'ACTIVE', 'COMPLETED'].map(status => (
              <button
                key={status}
                type="button"
                className={`status-pill ${statusFilter === status ? 'active' : ''}`}
                onClick={() => {
                  playClickSound();
                  setStatusFilter(status);
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quests Grid */}
      {isLoading ? (
        <div className="loading-state text-center p-8">
          <p className="text-muted">Loading quest manifests...</p>
        </div>
      ) : filteredQuests.length === 0 ? (
        <div className="empty-quests-state rpg-panel text-center">
          <Swords size={48} className="empty-icon text-muted" />
          <h4 className="empty-title">No Quests Match Your Filter</h4>
          <p className="empty-desc">Clear your search parameters or forge a new quest.</p>
          <button
            type="button"
            className="rpg-btn rpg-btn-primary mt-4"
            onClick={() => {
              playClickSound();
              setSearchQuery('');
              setSelectedCategory('ALL');
              setSelectedDifficulty('ALL');
              setStatusFilter('ALL');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="quest-cards-grid quest-board-grid">
          {filteredQuests.map(quest => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onEdit={(q) => {
                playClickSound();
                setEditingQuest(q);
                setIsModalOpen(true);
              }}
              onDelete={handleDeleteQuest}
              onCompleted={handleCompleted}
            />
          ))}
        </div>
      )}

      {/* Quest Modal */}
      <QuestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveQuest}
        editingQuest={editingQuest}
      />
    </div>
  );
}
