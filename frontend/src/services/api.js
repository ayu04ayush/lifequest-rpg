// Centralized API Client for LIFEQUEST

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function apiRequest(endpoint, method = 'GET', data = null) {
  const token = localStorage.getItem('lifequest_token');
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401) {
        // Clear invalid token
        localStorage.removeItem('lifequest_token');
      }
      throw new Error(result.error || `Request failed with status ${res.status}`);
    }

    return result;
  } catch (err) {
    if (err.message === 'Failed to fetch') {
      throw new Error('Unable to connect to game server. Please verify the backend is running.');
    }
    throw err;
  }
}

// API Methods
export const api = {
  // Auth
  signup: (payload) => apiRequest('/auth/signup', 'POST', payload),
  login: (payload) => apiRequest('/auth/login', 'POST', payload),
  demoLogin: () => apiRequest('/auth/demo', 'POST'),
  getCurrentUser: () => apiRequest('/auth/me'),

  // Quests
  getQuests: () => apiRequest('/quests'),
  createQuest: (payload) => apiRequest('/quests', 'POST', payload),
  updateQuest: (id, payload) => apiRequest(`/quests/${id}`, 'PUT', payload),
  deleteQuest: (id) => apiRequest(`/quests/${id}`, 'DELETE'),
  completeQuest: (id) => apiRequest(`/quests/${id}/complete`, 'POST'),

  // Character
  getCharacter: () => apiRequest('/character'),
  updateProfile: (payload) => apiRequest('/character/profile', 'PUT', payload),

  // Shop & Inventory
  getShop: () => apiRequest('/shop'),
  purchaseItem: (itemId) => apiRequest('/shop/purchase', 'POST', { itemId }),
  getInventory: () => apiRequest('/inventory'),
  equipItem: (itemId) => apiRequest(`/inventory/${itemId}/equip`, 'POST'),
  unequipItem: (itemId) => apiRequest(`/inventory/${itemId}/unequip`, 'POST'),

  // Achievements & Activity
  getAchievements: () => apiRequest('/achievements'),
  getActivity: () => apiRequest('/activity')
};
