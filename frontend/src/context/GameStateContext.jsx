import React, { createContext, useContext, useState } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from './AuthContext';
import {
  playQuestCompleteSound,
  playLevelUpSound,
  playGoldSound,
  playPurchaseSound,
  setSoundMuted,
  getSoundMuted
} from '../utils/audio';

const GameStateContext = createContext(null);

export function GameStateProvider({ children }) {
  const { character, updateCharacterState } = useAuth();
  const [levelUpData, setLevelUpData] = useState(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [isMuted, setIsMutedState] = useState(() => {
    return localStorage.getItem('lifequest_sound_muted') === 'true';
  });

  // Sync mute with audio utility
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMutedState(nextMuted);
    setSoundMuted(nextMuted);
    localStorage.setItem('lifequest_sound_muted', String(nextMuted));
  };

  // Trigger level up experience
  const triggerLevelUp = (data) => {
    setLevelUpData(data);
    playLevelUpSound();

    // Fire fireworks confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#00e5ff', '#a855f7', '#10b981', '#ffffff']
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#fbbf24', '#f59e0b']
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#00e5ff', '#38bdf8']
        });
      }, 300);
    } catch (e) {}
  };

  const closeLevelUpModal = () => {
    setLevelUpData(null);
  };

  // Called when quest completes
  const handleQuestCompletionResult = (res) => {
    playQuestCompleteSound();
    setTimeout(() => playGoldSound(), 250);

    if (res.character) {
      updateCharacterState(res.character);
    }

    if (res.leveledUp) {
      setTimeout(() => {
        triggerLevelUp({
          oldLevel: res.oldLevel,
          newLevel: res.newLevel,
          newTitle: res.newTitle,
          bonusGold: res.bonusGold
        });
      }, 500);
    }

    if (res.newAchievements && res.newAchievements.length > 0) {
      setUnlockedAchievements(prev => [...prev, ...res.newAchievements]);
    }
  };

  const dismissAchievementToast = (achId) => {
    setUnlockedAchievements(prev => prev.filter(a => a.id !== achId));
  };

  return (
    <GameStateContext.Provider value={{
      levelUpData,
      closeLevelUpModal,
      triggerLevelUp,
      handleQuestCompletionResult,
      unlockedAchievements,
      dismissAchievementToast,
      isMuted,
      toggleMute
    }}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameState() {
  const ctx = useContext(GameStateContext);
  if (!ctx) {
    throw new Error('useGameState must be used within GameStateProvider');
  }
  return ctx;
}
