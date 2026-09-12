import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { playClickSound } from '../utils/audio';
import { Swords, Zap, ArrowLeft, AlertCircle, Shield, Sparkles } from 'lucide-react';

export default function AuthPage({ onBackToLanding }) {
  const { login, signup, demoLogin } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [characterName, setCharacterName] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    playClickSound();

    try {
      if (isLoginMode) {
        if (!identifier.trim() || !password) {
          throw new Error('Please fill in your username/email and password.');
        }
        await login(identifier.trim(), password);
      } else {
        if (!username.trim() || username.trim().length < 3) {
          throw new Error('Username must be at least 3 characters long.');
        }
        if (!email.trim() || !email.includes('@')) {
          throw new Error('A valid email address is required.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        await signup({
          username: username.trim(),
          email: email.trim(),
          password,
          characterName: characterName.trim()
        });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoClick = async () => {
    setError('');
    setIsLoading(true);
    playClickSound();
    try {
      await demoLogin();
    } catch (err) {
      setError(err.message || 'Failed to activate demo mode');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card rpg-panel rpg-panel-corner rpg-panel-gilded">
        {/* Back Button */}
        <button
          type="button"
          className="auth-back-btn"
          onClick={() => {
            playClickSound();
            onBackToLanding();
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Realm Gateway</span>
        </button>

        {/* Header */}
        <div className="auth-header text-center">
          <span className="auth-emblem">⚔️</span>
          <h2 className="auth-title font-display">
            {isLoginMode ? 'HERO LOGIN' : 'CREATE YOUR HERO'}
          </h2>
          <p className="auth-subtitle">
            {isLoginMode 
              ? 'Enter your credentials to resume your real-life adventure.' 
              : 'Forge a new character and begin earning XP from everyday life.'}
          </p>
        </div>

        {/* 1-Click Judge Demo Mode Highlight */}
        <div className="demo-highlight-box">
          <div className="demo-highlight-text">
            <span className="demo-tag">HACKATHON JUDGES & EVALUATORS</span>
            <p className="demo-desc">
              Test pre-populated Level 8 account with active quests, streak, 1,240 Gold & gear instantly:
            </p>
          </div>
          <button
            type="button"
            className="rpg-btn rpg-btn-primary demo-action-btn"
            onClick={handleDemoClick}
            disabled={isLoading}
          >
            <Zap size={18} className="text-gold" />
            <span>⚡ PLAY INSTANT DEMO (AYUSH - LVL 8)</span>
          </button>
        </div>

        <div className="auth-divider">
          <span>OR SIGN IN MANUALLY</span>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="form-error-alert" role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {isLoginMode ? (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="login-id">
                  Username or Email
                </label>
                <input
                  id="login-id"
                  type="text"
                  className="rpg-input"
                  placeholder="e.g. ayush or warrior@quest.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="login-pwd">
                  Password
                </label>
                <input
                  id="login-pwd"
                  type="password"
                  className="rpg-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="signup-user">
                  Hero Username <span className="required-star">*</span>
                </label>
                <input
                  id="signup-user"
                  type="text"
                  className="rpg-input"
                  placeholder="e.g. shadow_blade"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-email">
                  Email Address <span className="required-star">*</span>
                </label>
                <input
                  id="signup-email"
                  type="email"
                  className="rpg-input"
                  placeholder="hero@lifequest.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-name">
                  Display Character Name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  className="rpg-input"
                  placeholder="e.g. AYUSH or SIR GALAHAD"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-pwd">
                  Password (min 6 characters) <span className="required-star">*</span>
                </label>
                <input
                  id="signup-pwd"
                  type="password"
                  className="rpg-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="rpg-btn rpg-btn-primary auth-submit-btn"
            disabled={isLoading}
          >
            <span>
              {isLoading 
                ? 'Validating Realm Pass...' 
                : isLoginMode 
                  ? 'ENTER COMMAND CENTER' 
                  : 'FORGE NEW HERO'}
            </span>
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="auth-toggle-box text-center">
          <button
            type="button"
            className="auth-toggle-link"
            onClick={() => {
              playClickSound();
              setIsLoginMode(!isLoginMode);
              setError('');
            }}
          >
            {isLoginMode 
              ? "Don't have a hero yet? Sign up here." 
              : "Already have a hero? Log in here."}
          </button>
        </div>
      </div>
    </div>
  );
}
