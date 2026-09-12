import React from 'react';
import { useAuth } from '../context/AuthContext';
import { playClickSound } from '../utils/audio';
import {
  LayoutDashboard,
  Swords,
  User,
  ShoppingBag,
  Backpack,
  Trophy,
  History,
  Settings,
  LogOut,
  Sparkles
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
  { id: 'quests', label: 'Quest Board', icon: Swords },
  { id: 'character', label: 'Hero Sheet', icon: User },
  { id: 'shop', label: 'Reward Shop', icon: ShoppingBag },
  { id: 'inventory', label: 'Inventory', icon: Backpack },
  { id: 'achievements', label: 'Badges', icon: Trophy },
  { id: 'activity', label: 'Adventure Log', icon: History },
  { id: 'settings', label: 'Game Settings', icon: Settings },
];

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();

  const handleNavClick = (id) => {
    playClickSound();
    setActiveTab(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    playClickSound();
    logout();
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar-container" aria-label="Main Navigation">
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <span className="sidebar-crest">⚔️</span>
            <div className="sidebar-brand-text">
              <h1 className="brand-title">LIFEQUEST</h1>
              <span className="brand-tagline">Real Life RPG</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav" role="navigation">
          <ul className="sidebar-menu">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon size={18} className="sidebar-icon" />
                    <span className="sidebar-label">{item.label}</span>
                    {isActive && <span className="active-glow-indicator" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar">
              {user?.username?.charAt(0).toUpperCase() || 'H'}
            </div>
            <div className="sidebar-user-info">
              <p className="sidebar-username">{user?.username}</p>
              <span className="sidebar-status-pill">Active Adventurer</span>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={handleLogout}
            title="Log Out of Session"
            aria-label="Log Out"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        <div className="mobile-bottom-nav-inner">
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`mobile-nav-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
                aria-label={item.label}
              >
                <Icon size={20} />
                <span className="mobile-nav-label">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
