import React from 'react';
import { useAuth } from '../context/AuthContext';
import { playClickSound } from '../utils/audio';
import {
  Swords,
  Shield,
  Sparkles,
  Flame,
  Trophy,
  Brain,
  Zap,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function LandingPage({ onGetStarted, onGoToAuth }) {
  const { demoLogin } = useAuth();

  const handleDemoClick = async () => {
    playClickSound();
    await demoLogin();
  };

  const handleExploreClick = () => {
    playClickSound();
    const el = document.getElementById('features-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-wrapper">
      {/* Landing Navigation */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <span className="logo-icon">⚔️</span>
            <span className="logo-text font-display">LIFEQUEST</span>
          </div>

          <div className="landing-nav-actions">
            <button 
              type="button" 
              className="rpg-btn rpg-btn-secondary demo-quick-btn"
              onClick={handleDemoClick}
              title="One-click demo for hackathon judges"
            >
              <Zap size={16} className="text-gold" />
              <span>⚡ INSTANT DEMO (LVL 8)</span>
            </button>

            <button 
              type="button" 
              className="rpg-btn rpg-btn-primary"
              onClick={() => {
                playClickSound();
                onGoToAuth();
              }}
            >
              <span>ENTER REALM</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero" aria-label="Hero Section">
        <div className="hero-content">
          <div className="hero-badge-pill">
            <Sparkles size={14} className="text-gold" />
            <span>THE REAL-LIFE PRODUCTIVITY RPG</span>
          </div>

          <h1 className="hero-title font-display">
            TURN YOUR REAL LIFE <br />
            <span className="hero-gradient-text">INTO AN ADVENTURE.</span>
          </h1>

          <p className="hero-subheading">
            Complete real-world quests. Earn XP. Build character attributes. Maintain streaks. 
            Level up your real life with an authentic 16-bit fantasy progression system.
          </p>

          <div className="hero-cta-group">
            <button 
              type="button" 
              className="rpg-btn rpg-btn-primary hero-main-btn"
              onClick={() => {
                playClickSound();
                onGoToAuth();
              }}
            >
              <Swords size={20} />
              <span>START YOUR JOURNEY</span>
            </button>

            <button 
              type="button" 
              className="rpg-btn rpg-btn-secondary hero-sec-btn"
              onClick={handleExploreClick}
            >
              <span>EXPLORE THE WORLD</span>
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Interactive RPG Character Showcase Card */}
          <div className="hero-preview-container">
            <div className="hero-preview-card rpg-panel rpg-panel-gilded rpg-panel-corner">
              <div className="preview-card-header">
                <div className="preview-hero-info">
                  <span className="preview-avatar">⚔️</span>
                  <div>
                    <h3 className="preview-name">AYUSH</h3>
                    <span className="preview-title">LEVEL 8 — ADVENTURER</span>
                  </div>
                </div>
                <div className="preview-badges">
                  <span className="gold-badge">🪙 1,240 GOLD</span>
                  <span className="streak-badge">🔥 7 DAYS</span>
                </div>
              </div>

              {/* Sample Quest Card in Preview */}
              <div className="preview-quest-box">
                <div className="preview-quest-top">
                  <span className="badge-category" style={{ background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8' }}>
                    🧠 INTELLECT
                  </span>
                  <span className="badge-difficulty badge-medium">MEDIUM</span>
                </div>
                <h4 className="preview-quest-title">⚔️ Master The Array & Invert Trees</h4>
                <p className="preview-quest-desc">Practice array problems & tree traversals for 45 minutes.</p>
                <div className="preview-quest-footer">
                  <div className="preview-rewards">
                    <span className="xp-pill">+50 XP</span>
                    <span className="gold-pill">+20 Gold</span>
                  </div>
                  <div className="preview-completed-pill">
                    <CheckCircle2 size={14} /> COMPLETE QUEST
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="features-section" className="landing-features" aria-label="Features Section">
        <div className="section-header text-center">
          <span className="section-eyebrow">RPG CORE GAMEPLAY</span>
          <h2 className="section-heading font-display">HOW REAL LIFE BECOMES A GAME</h2>
          <p className="section-desc">
            No generic checkboxes. Every daily activity upgrades your real-world stats.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card rpg-panel rpg-panel-corner">
            <div className="feature-icon-box" style={{ borderColor: '#818cf8', color: '#818cf8' }}>
              <Brain size={28} />
            </div>
            <h3 className="feature-title">Real Life Into Quests</h3>
            <p className="feature-desc">
              Transform study sessions, gym workouts, sleep hygiene, and coding sprints into tangible quests with difficulty tiers.
            </p>
          </div>

          <div className="feature-card rpg-panel rpg-panel-corner">
            <div className="feature-icon-box" style={{ borderColor: '#00e5ff', color: '#00e5ff' }}>
              <Sparkles size={28} />
            </div>
            <h3 className="feature-title">Non-Linear Progression</h3>
            <p className="feature-desc">
              Every quest awards server-validated XP based on requiredXP(level) = floor(100 × level^1.5), unlocking cinematic Level-Up moments.
            </p>
          </div>

          <div className="feature-card rpg-panel rpg-panel-corner">
            <div className="feature-icon-box" style={{ borderColor: '#f87171', color: '#f87171' }}>
              <Flame size={28} />
            </div>
            <h3 className="feature-title">True Real Streak System</h3>
            <p className="feature-desc">
              Calculated from genuine completion database logs. Weekly calendar matrix monitors your consistency and grants milestone gold tributes.
            </p>
          </div>

          <div className="feature-card rpg-panel rpg-panel-corner">
            <div className="feature-icon-box" style={{ borderColor: '#fbbf24', color: '#fbbf24' }}>
              <ShoppingBag size={28} />
            </div>
            <h3 className="feature-title">Reward Shop & Economy</h3>
            <p className="feature-desc">
              Spend hard-earned Gold on cosmetic weapons, custom avatars, titles, and live dynamic app themes that re-skin your entire experience.
            </p>
          </div>

          <div className="feature-card rpg-panel rpg-panel-corner">
            <div className="feature-icon-box" style={{ borderColor: '#a855f7', color: '#a855f7' }}>
              <Trophy size={28} />
            </div>
            <h3 className="feature-title">Badges & Adventure Log</h3>
            <p className="feature-desc">
              Unlock over 12 unique achievements across categories. Every completed quest is permanently etched into your chronological Adventure Log.
            </p>
          </div>

          <div className="feature-card rpg-panel rpg-panel-corner">
            <div className="feature-icon-box" style={{ borderColor: '#34d399', color: '#34d399' }}>
              <Shield size={28} />
            </div>
            <h3 className="feature-title">5 Core Life Attributes</h3>
            <p className="feature-desc">
              Watch your Intellect, Strength, Vitality, Discipline, and Creativity scale up numerically as you invest effort into your real-world craft.
            </p>
          </div>
        </div>
      </section>

      {/* Landing CTA Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner rpg-panel rpg-panel-gilded">
          <h2 className="footer-cta-title font-display">YOUR ADVENTURE AWAITS</h2>
          <p className="footer-cta-desc">
            No more boring to-do lists. Rise through the ranks and become a legendary hero of real life.
          </p>
          <div className="footer-cta-actions">
            <button 
              type="button" 
              className="rpg-btn rpg-btn-primary"
              onClick={() => {
                playClickSound();
                onGoToAuth();
              }}
            >
              <Swords size={18} />
              <span>COMMENCE LIFEQUEST</span>
            </button>
            <button
              type="button"
              className="rpg-btn rpg-btn-secondary"
              onClick={handleDemoClick}
            >
              <Zap size={16} className="text-gold" />
              <span>JUDGE DEMO ACCESS</span>
            </button>
          </div>
        </div>
        <p className="footer-copyright">
          LIFEQUEST © 2026 — Built with Passion for the Hackathon. Zero Fluff, 100% Real Progression.
        </p>
      </footer>
    </div>
  );
}
