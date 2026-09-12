# ⚔️ LIFEQUEST — Full-Stack Productivity RPG

> *"Turn Your Real Life Into An Adventure."*

LIFEQUEST is a full-stack, production-quality productivity web application with authentic 16-bit fantasy RPG mechanics. It transforms everyday tasks into engaging quests, awarding XP, Gold, character attribute points, streaks, levels, and shop cosmetics with full database persistence.

---

## 🌟 Key Features

1. **Authentic 16-Bit Fantasy RPG Aesthetics**:
   - Deep obsidian fantasy backdrops with subtle particle atmosphere.
   - Gilded gold panel borders, pixel crests, and glowing mana progress bars.
   - Typography powered by Google Fonts: `Cinzel`, `Outfit`, and `Press Start 2P`.
   - Five custom realm themes: **Obsidian Night**, **Nebula Night**, **Molten Ember**, **Elven Forest**, and **Royal Gold**.

2. **1-Click Hackathon Judge Demo Mode**:
   - Dedicated `⚡ Instant Demo (Ayush - Lvl 8)` button on landing and login pages.
   - Instantly loads pre-seeded character state: Level 8 Adventurer, 820 XP, 1,240 Gold, 7-Day Streak, active quests, and inventory items.

3. **Non-Linear RPG Progression Engine**:
   - Progressive XP threshold formula:
     $$\text{requiredXP}(\text{level}) = \lfloor 100 \times \text{level}^{1.5} \rfloor$$
   - Dramatic full-screen **Level-Up modal** with victory fanfare, crown animations, confetti bursts, title upgrades, and tribute gold bonuses.

4. **5 Core Life Attributes**:
   - 🧠 **INTELLECT**: Coding, studying, problem solving, algorithmic challenges.
   - ⚔️ **STRENGTH**: Fitness, workouts, hypertrophy, stamina training.
   - ❤️ **VITALITY**: Sleep recovery, hydration, nutrition, wellness.
   - 🎯 **DISCIPLINE**: Deep focus sprints, morning routines, habit consistency.
   - 🎨 **CREATIVITY**: UI/UX design, writing, music, brainstorming.

5. **True Consecutive Streak System**:
   - Real date math derived directly from database completion timestamps (never faked).
   - Interactive weekly matrix (MON, TUE, WED, THU, FRI, SAT, SUN) with completion indicators.
   - Milestone rewards at 3, 7, 14, and 30 consecutive days.

6. **Virtual Gold Economy & Reward Shop**:
   - Earn gold exclusively through verified quest completion.
   - Reward Shop catalog: Weapons & Relics, Avatars, Dynamic Realm Themes, and Titles.
   - Atomic database transactions ensure safe deductions and unique cosmetic inventory records.

7. **Procedural 16-Bit Web Audio Engine**:
   - Zero external audio dependencies or broken links.
   - Procedural sound synthesis using browser Web Audio API:
     - Ascending crystal chime on quest completion.
     - 16-bit brass victory fanfare on level up.
     - Metallic gold coins clink.
     - Snappy UI click ticks.
   - Master mute/unmute toggle in the top HUD and settings test bench.

8. **Zero-Dependency Database Persistence**:
   - Powered by Node.js 24's built-in `node:sqlite` (`DatabaseSync`).
   - ACID transactions, WAL mode, foreign keys, and relational schema in `backend/data/lifequest.db`.

---

## 🏗️ Architecture & Directory Structure

```
d:/Desktop/rpg/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── database.js          # node:sqlite DatabaseSync with WAL & Foreign Keys
│   │   │   ├── schema.sql           # Complete relational schema
│   │   │   └── seed.js              # Initial seed for Demo User, Shop items, Achievements
│   │   ├── middleware/
│   │   │   └── auth.js              # JWT Bearer token authentication
│   │   ├── services/
│   │   │   ├── progressionService.js # Non-linear XP, level calculation, attribute growth
│   │   │   ├── streakService.js      # True streak & weekly calendar calculation
│   │   │   └── achievementService.js # Milestone evaluation engine
│   │   ├── routes/
│   │   │   ├── authRoutes.js         # Signup, Login, Demo mode, Session me
│   │   │   ├── questRoutes.js        # CRUD + atomic completion transaction
│   │   │   ├── characterRoutes.js    # Character stats, attributes breakdown
│   │   │   ├── shopRoutes.js         # Catalog listing & gold purchase transaction
│   │   │   ├── inventoryRoutes.js    # User inventory & equip/unequip
│   │   │   ├── achievementRoutes.js  # Badges with progress calculation
│   │   │   └── activityRoutes.js     # Chronological adventure log
│   │   └── server.js                 # Express server on port 5000
│   └── test-api.js                   # Automated backend integration test suite
│
├── frontend/
│   ├── src/
│   │   ├── styles/
│   │   │   ├── index.css             # Base reset, CSS custom properties, themes
│   │   │   ├── rpg-theme.css         # 16-bit fantasy panels, gold trims, badges
│   │   │   ├── animations.css        # Particle floaters, level-up modal bursts
│   │   │   └── components.css        # Layouts, responsive design, media queries
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Session recovery, login, signup, demo
│   │   │   └── GameStateContext.jsx  # Level-up triggers, audio toggles, toasts
│   │   ├── utils/
│   │   │   ├── audio.js              # Web Audio procedural 16-bit SFX
│   │   │   └── formatters.js         # Numbers, dates, category metadata
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Desktop sidebar & mobile bottom bar
│   │   │   ├── CharacterHUD.jsx      # Top bar with Level, XP bar, Gold, Streak
│   │   │   ├── QuestCard.jsx         # Quest card with difficulty & rewards
│   │   │   ├── QuestModal.jsx        # Commission & edit quest modal
│   │   │   ├── LevelUpModal.jsx      # Dramatic level up celebration
│   │   │   ├── AttributeBar.jsx      # Progress bar for attributes
│   │   │   └── WeeklyStreakCalendar.jsx # MON-SUN checkmark matrix
│   │   └── pages/
│   │       ├── LandingPage.jsx       # Hero, RPG overview, live demo preview
│   │       ├── AuthPage.jsx          # Login, Signup, 1-Click Demo mode
│   │       ├── Dashboard.jsx         # Command Center
│   │       ├── QuestBoard.jsx        # Full Quest management & filters
│   │       ├── CharacterPage.jsx     # Deep Hero sheet & attributes
│   │       ├── ShopPage.jsx          # Reward Emporium
│   │       ├── InventoryPage.jsx     # Equipment & dynamic theme switcher
│   │       ├── AchievementsPage.jsx  # Badges gallery
│   │       ├── ActivityHistoryPage.jsx # Adventure Log timeline
│   │       └── SettingsPage.jsx      # Theme switcher, audio test bench
│   └── vite.config.js                # Proxy configuration for /api
```

---

## ⚡ Quick Start Instructions

### 1. Start the Backend Server
```bash
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:5000` with local SQLite database at `backend/data/lifequest.db`.*

### 2. Start the Frontend Application
```bash
cd frontend
npm install
npm run dev
```
*Open `http://localhost:5173` in your browser.*

### 3. Run Backend Integration Tests
```bash
cd backend
npm test
```
*Executes all 12 end-to-end integration tests (Auth, Quests, Completions, Level-up, Shop, Inventory, Streaks, Achievements).*

### 4. Run Automated Browser E2E Suite
```bash
cd frontend
node verify-e2e.js
```
*Runs headless browser automation testing the full user journey and capturing screenshots.*
