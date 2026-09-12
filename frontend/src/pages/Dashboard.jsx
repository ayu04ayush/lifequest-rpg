import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import QuestCard from '../components/QuestCard';
import QuestModal from '../components/QuestModal';
import WeeklyStreakCalendar from '../components/WeeklyStreakCalendar';
import AttributeBar from '../components/AttributeBar';
import { Swords, Plus, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import { playClickSound } from '../utils/audio';

export default function Dashboard() {
  const { character } = useAuth();
  const [quests, setQuests] = useState([]);
  const [characterSheet, setCharacterSheet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('ALL');

  const loadDashboardData = async () => {
    try {
      const [questsData, sheetData] = await Promise.all([
        api.getQuests(),
        api.getCharacter()
      ]);
      setQuests(questsData.quests || []);
      setCharacterSheet(sheetData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleCreateOrUpdateQuest = async (questData) => {
    if (questData.id) {
      await api.updateQuest(questData.id, questData);
    } else {
      await api.createQuest(questData);
    }
    await loadDashboardData();
  };

  const handleDeleteQuest = async (questId) => {
    if (!window.confirm('Abandon this quest?')) return;
    playClickSound();
    try {
      await api.deleteQuest(questId);
      setQuests(prev => prev.filter(q => q.id !== questId));
    } catch (err) {
      alert(err.message || 'Failed to delete quest');
    }
  };

  const handleQuestCompleted = async (questId, res) => {
    // Update quest in local list
    setQuests(prev => prev.map(q => {
      if (q.id === questId) {
        return { ...q, is_completed_today: 1 };
      }
      return q;
    }));
    // Refresh character sheet & streak calendar
    try {
      const refreshed = await api.getCharacter();
      setCharacterSheet(refreshed);
    } catch (e) {}
  };

  const filteredQuests = quests.filter(q => {
    if (activeCategoryFilter === 'ALL') return true;
    return q.category === activeCategoryFilter;
  });

  const completedCount = quests.filter(q => q.is_completed_today === 1).length;
  const activeCount = quests.length - completedCount;

  return (
    <div className="dashboard-page">
      {/* Top Banner / Welcome Row */}
      <div className="dashboard-welcome-banner rpg-panel rpg-panel-corner">
        <div className="welcome-text">
          <span className="welcome-tag font-retro">COMMAND CENTER</span>
          <h2 className="welcome-title font-display">
            GREETINGS, {character?.name || 'HERO'}!
          </h2>
          <p className="welcome-sub">
            {activeCount > 0
              ? `You have ${activeCount} active quest${activeCount === 1 ? '' : 's'} awaiting your courage today.`
              : 'All daily quests conquered! Your legend grows. Commission more quests or explore the shop.'}
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
          <span>NEW QUEST</span>
        </button>
      </div>

      {/* Main Grid: Left = Quests, Right = Stats & Streak */}
      <div className="dashboard-grid">
        {/* Left Column: Today's Quests */}
        <div className="dashboard-quests-col">
          <div className="dashboard-section-header">
            <div className="section-title-box">
              <Swords size={20} className="text-gold" />
              <h3 className="section-title font-display">TODAY'S QUEST BOARD</h3>
              <span className="quest-count-badge">
                {completedCount} / {quests.length} Completed
              </span>
            </div>

            {/* Category Filter Pills */}
            <div className="category-filters-row">
              {['ALL', 'INTELLECT', 'STRENGTH', 'VITALITY', 'DISCIPLINE', 'CREATIVITY'].map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`filter-pill ${activeCategoryFilter === cat ? 'active' : ''}`}
                  onClick={() => {
                    playClickSound();
                    setActiveCategoryFilter(cat);
                  }}
                >
                  {cat === 'ALL' ? 'All' :
                   cat === 'INTELLECT' ? '🧠 Mind' :
                   cat === 'STRENGTH' ? '⚔️ Strength' :
                   cat === 'VITALITY' ? '❤️ Vitality' :
                   cat === 'DISCIPLINE' ? '🎯 Focus' : '🎨 Creative'}
                </button>
              ))}
            </div>
          </div>

          {/* Quest Cards List */}
          {isLoading ? (
            <div className="skeleton-quests-list">
              <div className="skeleton-card rpg-panel" />
              <div className="skeleton-card rpg-panel" />
            </div>
          ) : filteredQuests.length === 0 ? (
            <div className="empty-quests-state rpg-panel text-center">
              <Swords size={40} className="empty-icon text-muted" />
              <h4 className="empty-title">No Quests in this Category</h4>
              <p className="empty-desc">Commission a custom quest to start leveling up your attributes.</p>
              <button
                type="button"
                className="rpg-btn rpg-btn-primary"
                onClick={() => {
                  playClickSound();
                  setEditingQuest(null);
                  setIsModalOpen(true);
                }}
              >
                <Plus size={16} />
                <span>COMMISSION QUEST</span>
              </button>
            </div>
          ) : (
            <div className="quest-cards-grid">
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
                  onCompleted={handleQuestCompleted}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Hero Sheet, Attributes & Streak */}
        <aside className="dashboard-sidebar-col">
          {/* Streak Weekly Matrix */}
          <WeeklyStreakCalendar streakData={characterSheet?.streak} />

          {/* 5 Core Attributes Radar / Bars */}
          <div className="attributes-summary-panel rpg-panel rpg-panel-corner">
            <div className="rpg-panel-header">
              <h3 className="rpg-panel-title">
                <Sparkles size={18} className="text-gold" />
                <span>ATTRIBUTES PROGRESSION</span>
              </h3>
            </div>

            <div className="compact-attributes-list">
              {characterSheet?.attributes ? (
                <>
                  <AttributeBar attributeKey="INTELLECT" value={characterSheet.attributes.intellect} compact />
                  <AttributeBar attributeKey="STRENGTH" value={characterSheet.attributes.strength} compact />
                  <AttributeBar attributeKey="VITALITY" value={characterSheet.attributes.vitality} compact />
                  <AttributeBar attributeKey="DISCIPLINE" value={characterSheet.attributes.discipline} compact />
                  <AttributeBar attributeKey="CREATIVITY" value={characterSheet.attributes.creativity} compact />
                </>
              ) : (
                <p className="text-muted">Loading character stats...</p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Quest Modal */}
      <QuestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateOrUpdateQuest}
        editingQuest={editingQuest}
      />
    </div>
  );
}
