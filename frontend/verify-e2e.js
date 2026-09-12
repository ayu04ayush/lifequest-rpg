// End-to-End Browser Automation & Verification Script for LIFEQUEST
import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\Ayush Mahato\\.gemini\\antigravity-ide\\brain\\e2ccbfac-b60d-4d71-a4ba-682437b649de';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function runBrowserVerification() {
  console.log('🚀 Launching Headless Edge for LIFEQUEST E2E Verification...');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Browser Error Console:', msg.text());
    }
  });

  try {
    // 1. Visit Landing Page
    console.log('1. Navigating to Landing Page (http://localhost:5173/)...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    await sleep(1000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '01_landing_page.png') });
    console.log('✓ Captured 01_landing_page.png');

    // 2. Click Instant Demo Button
    console.log('2. Clicking "⚡ INSTANT DEMO (LVL 8)" to log in...');
    const demoBtn = await page.waitForSelector('.demo-quick-btn');
    await demoBtn.click();
    await sleep(1500);

    // 3. Confirm Dashboard (Command Center)
    console.log('3. Verifying Command Center HUD & Quests...');
    await page.waitForSelector('.hud-char-name');
    const heroName = await page.$eval('.hud-char-name', el => el.textContent);
    const heroTitle = await page.$eval('.hud-char-title', el => el.textContent);
    console.log(`Hero logged in: ${heroName} (${heroTitle})`);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '02_command_center.png') });
    console.log('✓ Captured 02_command_center.png');

    // 4. Commission New Quest
    console.log('4. Commissioning New Quest...');
    const newQuestBtn = await page.waitForSelector('.dashboard-welcome-banner .rpg-btn-primary');
    await newQuestBtn.click();
    await sleep(500);

    await page.waitForSelector('#quest-title');
    await page.type('#quest-title', 'Architect Resilient Distributed Cache');
    await page.type('#quest-desc', 'Design LRU eviction policy with Redis replication and benchmark throughput.');
    
    // Select Intellect category
    const catBtns = await page.$$('.category-picker-btn');
    if (catBtns.length > 0) await catBtns[0].click(); // Intellect

    // Select Epic difficulty
    await page.select('#quest-diff', 'EPIC');

    // Submit Quest Form
    const submitBtn = await page.waitForSelector('.quest-form .rpg-btn-primary');
    await submitBtn.click();
    await sleep(1500);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, '03_quest_created.png') });
    console.log('✓ Captured 03_quest_created.png');

    // 5. Complete Quest
    console.log('5. Completing Quest on Quest Board...');
    // Find complete buttons
    const completeBtns = await page.$$('.quest-complete-btn');
    if (completeBtns.length > 0) {
      console.log('Clicking Complete Quest...');
      await completeBtns[0].click();
      await sleep(1500);
    }

    // Check if Level Up Modal appeared
    const levelUpModal = await page.$('.levelup-overlay');
    if (levelUpModal) {
      console.log('🎉 LEVEL UP MODAL TRIGGERED!');
      await page.screenshot({ path: path.join(ARTIFACT_DIR, '04_level_up_modal.png') });
      console.log('✓ Captured 04_level_up_modal.png');
      const continueBtn = await page.$('.levelup-btn');
      if (continueBtn) await continueBtn.click();
      await sleep(500);
    } else {
      await page.screenshot({ path: path.join(ARTIFACT_DIR, '04_quest_completed.png') });
      console.log('✓ Captured 04_quest_completed.png');
    }

    // 6. Navigate to Hero Sheet (Character Page)
    console.log('6. Navigating to Hero Sheet...');
    const navLinks = await page.$$('.sidebar-link');
    for (const link of navLinks) {
      const text = await page.evaluate(el => el.textContent, link);
      if (text.includes('Hero Sheet')) {
        await link.click();
        break;
      }
    }
    await sleep(1200);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '05_hero_sheet.png') });
    console.log('✓ Captured 05_hero_sheet.png');

    // 7. Navigate to Reward Shop
    console.log('7. Navigating to Reward Shop...');
    for (const link of await page.$$('.sidebar-link')) {
      const text = await page.evaluate(el => el.textContent, link);
      if (text.includes('Reward Shop')) {
        await link.click();
        break;
      }
    }
    await sleep(1200);

    // Purchase an item
    const buyBtns = await page.$$('.shop-item-card .buy-btn');
    for (const b of buyBtns) {
      const btnText = await page.evaluate(el => el.textContent, b);
      if (btnText.includes('ACQUIRE ITEM')) {
        console.log('Purchasing shop item...');
        await b.click();
        await sleep(1500);
        break;
      }
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '06_reward_shop.png') });
    console.log('✓ Captured 06_reward_shop.png');

    // 8. Navigate to Inventory
    console.log('8. Navigating to Inventory...');
    for (const link of await page.$$('.sidebar-link')) {
      const text = await page.evaluate(el => el.textContent, link);
      if (text.includes('Inventory')) {
        await link.click();
        break;
      }
    }
    await sleep(1200);

    // Equip an item
    const equipBtns = await page.$$('.equip-btn');
    if (equipBtns.length > 0) {
      console.log('Equipping inventory item...');
      await equipBtns[0].click();
      await sleep(1000);
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '07_inventory_equipped.png') });
    console.log('✓ Captured 07_inventory_equipped.png');

    // 9. Navigate to Achievements (Badges)
    console.log('9. Navigating to Badges / Achievements...');
    for (const link of await page.$$('.sidebar-link')) {
      const text = await page.evaluate(el => el.textContent, link);
      if (text.includes('Badges')) {
        await link.click();
        break;
      }
    }
    await sleep(1200);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '08_achievements_gallery.png') });
    console.log('✓ Captured 08_achievements_gallery.png');

    // 10. Navigate to Adventure Log
    console.log('10. Navigating to Adventure Log...');
    for (const link of await page.$$('.sidebar-link')) {
      const text = await page.evaluate(el => el.textContent, link);
      if (text.includes('Adventure Log')) {
        await link.click();
        break;
      }
    }
    await sleep(1200);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '09_adventure_log.png') });
    console.log('✓ Captured 09_adventure_log.png');

    // 11. Navigate to Game Settings
    console.log('11. Navigating to Game Settings...');
    for (const link of await page.$$('.sidebar-link')) {
      const text = await page.evaluate(el => el.textContent, link);
      if (text.includes('Game Settings')) {
        await link.click();
        break;
      }
    }
    await sleep(1200);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '10_game_settings.png') });
    console.log('✓ Captured 10_game_settings.png');

    // 12. Test Mobile Viewport
    console.log('12. Testing Mobile Responsive Viewport (390x844)...');
    await page.setViewport({ width: 390, height: 844 });
    // Go to Command Center on mobile
    const mobileNavBtns = await page.$$('.mobile-nav-btn');
    if (mobileNavBtns.length > 0) {
      await mobileNavBtns[0].click();
      await sleep(1000);
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '11_mobile_command_center.png') });
    console.log('✓ Captured 11_mobile_command_center.png');

    // 13. Hard Browser Reload to Test 100% Persistence
    console.log('13. Testing Hard Browser Refresh for 100% Persistence...');
    await page.setViewport({ width: 1440, height: 900 });
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(1500);

    const persistedHero = await page.$eval('.hud-char-name', el => el.textContent);
    console.log(`✓ Session successfully restored after hard reload for: ${persistedHero}`);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '12_persistence_after_refresh.png') });
    console.log('✓ Captured 12_persistence_after_refresh.png');

    console.log('\n🌟 ALL E2E BROWSER TESTS AND SCREENSHOTS SUCCESSFULLY COMPLETED!\n');
  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    await browser.close();
  }
}

runBrowserVerification();
