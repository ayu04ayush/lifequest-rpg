import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGameState } from '../context/GameStateContext';
import { api } from '../services/api';
import { formatNumber } from '../utils/formatters';
import { playClickSound, playPurchaseSound } from '../utils/audio';
import {
  ShoppingBag,
  Coins,
  Check,
  Sparkles,
  Shield,
  Palette,
  User,
  Crown,
  AlertCircle
} from 'lucide-react';

export default function ShopPage() {
  const { character, updateCharacterState } = useAuth();
  const [items, setItems] = useState([]);
  const [userGold, setUserGold] = useState(character?.gold || 0);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const loadShopData = async () => {
    try {
      const data = await api.getShop();
      setItems(data.items || []);
      setUserGold(data.userGold || 0);
    } catch (err) {
      console.error('Failed to load shop items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadShopData();
  }, []);

  const handlePurchase = async (item) => {
    if (item.is_purchased || purchasingId) return;

    if (userGold < item.price) {
      setFeedback({ type: 'error', message: `Insufficient Gold! Complete more quests to earn ${item.price - userGold} more Gold.` });
      return;
    }

    setPurchasingId(item.id);
    setFeedback(null);
    playClickSound();

    try {
      const res = await api.purchaseItem(item.id);
      playPurchaseSound();
      setUserGold(res.newGold);
      updateCharacterState({ gold: res.newGold });

      // Mark item purchased in local state
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_purchased: 1 } : i));

      setFeedback({
        type: 'success',
        message: `Acquired ${item.name}! You can now equip it in your Inventory.`
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Purchase failed' });
    } finally {
      setPurchasingId(null);
    }
  };

  const filteredItems = items.filter(item => {
    if (categoryFilter === 'ALL') return true;
    return item.category === categoryFilter;
  });

  return (
    <div className="shop-page">
      {/* Shop Header Banner */}
      <div className="shop-header-banner rpg-panel rpg-panel-corner rpg-panel-gilded">
        <div className="shop-header-info">
          <span className="shop-badge font-retro">ROYAL BAZAAR</span>
          <h2 className="shop-title font-display">THE REWARD EMPORIUM</h2>
          <p className="shop-desc">
            Convert your real-life grit and discipline into legendary cosmetic artifacts, avatars, and realm themes.
          </p>
        </div>

        <div className="shop-gold-treasury">
          <span className="treasury-label">YOUR TREASURY</span>
          <div className="treasury-count gold-badge">
            <Coins size={22} className="gold-coin-icon" />
            <span className="treasury-amount">{formatNumber(userGold)}</span>
            <span className="treasury-currency">GOLD</span>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`shop-feedback-alert ${feedback.type === 'error' ? 'alert-error' : 'alert-success'} rpg-panel`}>
          {feedback.type === 'error' ? <AlertCircle size={18} /> : <Sparkles size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="shop-categories-tabs">
        {[
          { id: 'ALL', label: 'All Catalog', icon: ShoppingBag },
          { id: 'gear', label: 'Weapons & Relics', icon: Shield },
          { id: 'avatar', label: 'Hero Avatars', icon: User },
          { id: 'theme', label: 'Realm Themes', icon: Palette },
          { id: 'title', label: 'Honorific Titles', icon: Crown },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = categoryFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`shop-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => {
                playClickSound();
                setCategoryFilter(tab.id);
                setFeedback(null);
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Items Grid */}
      {isLoading ? (
        <div className="loading-state text-center p-12">
          <p className="text-muted">Unpacking royal merchant caravans...</p>
        </div>
      ) : (
        <div className="shop-grid">
          {filteredItems.map(item => {
            const isPurchased = item.is_purchased === 1;
            const canAfford = userGold >= item.price;
            const isProcessing = purchasingId === item.id;

            return (
              <div 
                key={item.id} 
                className={`shop-item-card rpg-panel rarity-${item.rarity} ${isPurchased ? 'item-owned' : ''}`}
              >
                <div className="shop-item-top">
                  <span className={`item-rarity-pill font-retro rarity-text-${item.rarity}`}>
                    {item.rarity.toUpperCase()}
                  </span>
                  <span className="item-category-tag">{item.category.toUpperCase()}</span>
                </div>

                <div className="shop-item-icon-frame">
                  <span className="shop-icon-display">{item.icon}</span>
                </div>

                <div className="shop-item-details">
                  <h4 className="shop-item-name">{item.name}</h4>
                  <p className="shop-item-description">{item.description}</p>
                </div>

                <div className="shop-item-footer">
                  <div className="item-price-tag">
                    <Coins size={16} className="text-gold" />
                    <span>{formatNumber(item.price)} Gold</span>
                  </div>

                  {isPurchased ? (
                    <div className="owned-status-badge">
                      <Check size={16} />
                      <span>OWNED</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className={`rpg-btn ${canAfford ? 'rpg-btn-primary' : 'rpg-btn-secondary'} buy-btn`}
                      onClick={() => handlePurchase(item)}
                      disabled={!canAfford || isProcessing}
                    >
                      <span>
                        {isProcessing 
                          ? 'Transacting...' 
                          : canAfford 
                            ? 'ACQUIRE ITEM' 
                            : 'NEED MORE GOLD'}
                      </span>
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
