import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GameStateProvider, useGameState } from './context/GameStateContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import QuestBoard from './pages/QuestBoard';
import CharacterPage from './pages/CharacterPage';
import ShopPage from './pages/ShopPage';
import InventoryPage from './pages/InventoryPage';
import AchievementsPage from './pages/AchievementsPage';
import ActivityHistoryPage from './pages/ActivityHistoryPage';
import SettingsPage from './pages/SettingsPage';
import Navbar from './components/Navbar';
import CharacterHUD from './components/CharacterHUD';
import LevelUpModal from './components/LevelUpModal';
import { Trophy, X } from 'lucide-react';
import './styles/index.css';
import './styles/rpg-theme.css';
import './styles/animations.css';
import './styles/components.css';

function MainGameApp() {
  const { isAuthenticated, isLoading } = useAuth();
  const { unlockedAchievements, dismissAchievementToast } = useGameState();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAuthPage, setShowAuthPage] = useState(false);

  if (isLoading) {
    return (
      <div className="app-loading-screen">
        <div className="loading-crest">⚔️</div>
        <h2 className="loading-text font-display">ENTERING LIFEQUEST REALM...</h2>
        <div className="rpg-progress-container" style={{ width: 240, margin: '1rem auto' }}>
          <div className="rpg-progress-fill" style={{ width: '80%' }} />
        </div>
      </div>
    );
  }

  // If user is not logged in
  if (!isAuthenticated) {
    if (showAuthPage) {
      return <AuthPage onBackToLanding={() => setShowAuthPage(false)} />;
    }
    return (
      <LandingPage 
        onGetStarted={() => setShowAuthPage(true)} 
        onGoToAuth={() => setShowAuthPage(true)} 
      />
    );
  }

  return (
    <div className="app-container">
      {/* Navigation (Sidebar on Desktop, Bottom on Mobile) */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        {/* Sticky RPG HUD */}
        <CharacterHUD />

        {/* Dynamic Page Router */}
        <main className="page-content" role="main">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'quests' && <QuestBoard />}
          {activeTab === 'character' && <CharacterPage />}
          {activeTab === 'shop' && <ShopPage />}
          {activeTab === 'inventory' && <InventoryPage />}
          {activeTab === 'achievements' && <AchievementsPage />}
          {activeTab === 'activity' && <ActivityHistoryPage />}
          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Dramatic Level-Up Modal Overlay */}
      <LevelUpModal />

      {/* Global Achievement Unlocked Toasts */}
      {unlockedAchievements.length > 0 && (
        <div className="achievement-toasts-container" role="status" aria-live="polite">
          {unlockedAchievements.map((ach) => (
            <div key={ach.id} className="achievement-toast rpg-panel rpg-panel-gilded">
              <span className="toast-icon">{ach.icon}</span>
              <div className="toast-body">
                <span className="toast-tag font-retro">ACHIEVEMENT UNLOCKED!</span>
                <h4 className="toast-title">{ach.title}</h4>
                <p className="toast-desc">+{ach.xp_reward} XP, +{ach.gold_reward} Gold</p>
              </div>
              <button
                type="button"
                className="toast-dismiss-btn"
                onClick={() => dismissAchievementToast(ach.id)}
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <GameStateProvider>
        <MainGameApp />
      </GameStateProvider>
    </AuthProvider>
  );
}
