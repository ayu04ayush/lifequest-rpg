import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { playClickSound } from '../utils/audio';
import {
  Backpack,
  Shield,
  Palette,
  User,
  Crown,
  Check,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function InventoryPage() {
  const { character, updateCharacterState } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [equippingId, setEquippingId] = useState(null);
  const [feedback, setFeedback] = useState('');

  const loadInventory = async () => {
    try {
      const data = await api.getInventory();
      setInventory(data.inventory || []);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleEquip = async (item) => {
    if (equippingId) return;
    setEquippingId(item.id);
    setFeedback('');
    playClickSound();

    try {
      const res = await api.equipItem(item.id);
      if (res.character) {
        updateCharacterState(res.character);
      }
      setFeedback(`Equipped ${item.name}!`);
      await loadInventory();
    } catch (err) {
      setFeedback(err.message || 'Failed to equip item');
    } finally {
      setEquippingId(null);
    }
  };

  const filteredInventory = inventory.filter(item => {
    if (activeCategory === 'ALL') return true;
    return item.category === activeCategory;
  });

  return (
    <div className="inventory-page">
      {/* Inventory Banner */}
      <div className="inventory-header-banner rpg-panel rpg-panel-corner rpg-panel-gilded">
        <div className="inventory-header-text">
          <span className="inv-badge font-retro">HERO'S ARMORY</span>
          <h2 className="inv-title font-display">YOUR INVENTORY</h2>
          <p className="inv-desc">
            Equip your unlocked cosmetics, titles, avatars, and visual realm themes. Changes persist across sessions.
          </p>
        </div>

        <div className="current-equipped-overview">
          <div className="equipped-pill">
            <User size={14} /> Avatar: <strong>{character?.avatar || 'Adventurer'}</strong>
          </div>
          <div className="equipped-pill">
            <Palette size={14} /> Realm: <strong>{character?.theme?.toUpperCase() || 'OBSIDIAN'}</strong>
          </div>
          <div className="equipped-pill">
            <Crown size={14} /> Title: <strong>{character?.title}</strong>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="shop-feedback-alert alert-success rpg-panel">
          <Sparkles size={18} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Category Tabs */}
      <div className="shop-categories-tabs">
        {[
          { id: 'ALL', label: 'All Items', icon: Backpack },
          { id: 'gear', label: 'Weapons & Gear', icon: Shield },
          { id: 'theme', label: 'Realm Themes', icon: Palette },
          { id: 'avatar', label: 'Avatars', icon: User },
          { id: 'title', label: 'Titles', icon: Crown }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`shop-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => {
                playClickSound();
                setActiveCategory(tab.id);
                setFeedback('');
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Inventory Grid */}
      {isLoading ? (
        <div className="loading-state text-center p-12">
          <p className="text-muted">Opening knapsack...</p>
        </div>
      ) : filteredInventory.length === 0 ? (
        <div className="empty-quests-state rpg-panel text-center">
          <Backpack size={48} className="empty-icon text-muted" />
          <h4 className="empty-title">No Items in this Slot</h4>
          <p className="empty-desc">Visit the Reward Shop to spend your Gold on items!</p>
        </div>
      ) : (
        <div className="inventory-grid">
          {filteredInventory.map(item => {
            const isEquipped = item.is_equipped === 1 || 
              (item.category === 'theme' && character?.theme === item.item_key.replace('theme_', '')) ||
              (item.category === 'avatar' && character?.avatar === item.item_key) ||
              (item.category === 'title' && character?.title === item.name);

            return (
              <div 
                key={item.id} 
                className={`inventory-card rpg-panel rarity-${item.rarity} ${isEquipped ? 'item-active-equipped' : ''}`}
              >
                <div className="inv-item-top">
                  <span className={`item-rarity-pill font-retro rarity-text-${item.rarity}`}>
                    {item.rarity.toUpperCase()}
                  </span>
                  <span className="item-category-tag">{item.category.toUpperCase()}</span>
                </div>

                <div className="inv-icon-display">
                  <span>{item.icon}</span>
                </div>

                <div className="inv-details">
                  <h4 className="inv-item-name">{item.name}</h4>
                  <p className="inv-item-desc">{item.description}</p>
                </div>

                <div className="inv-footer">
                  {isEquipped ? (
                    <div className="equipped-badge-pill">
                      <Check size={16} />
                      <span>EQUIPPED</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="rpg-btn rpg-btn-primary equip-btn"
                      onClick={() => handleEquip(item)}
                      disabled={equippingId === item.id}
                    >
                      <span>{equippingId === item.id ? 'Equipping...' : 'EQUIP'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
