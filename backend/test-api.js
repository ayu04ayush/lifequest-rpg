// Backend End-to-End API Test Suite for LIFEQUEST
const http = require('http');
const app = require('./src/server');

const PORT = 5055; // Use dedicated test port
let server;

function request(method, path, data, token) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const options = {
      hostname: '127.0.0.1',
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting LIFEQUEST Backend Integration Tests...');
  server = app.listen(PORT);

  try {
    // 1. Health Check
    console.log('\n1. Testing Health Check...');
    const health = await request('GET', '/api/health');
    console.log('Status:', health.status, 'Response:', health.data.status);
    if (health.status !== 200 || health.data.status !== 'online') throw new Error('Health check failed');

    // 2. Demo User Login
    console.log('\n2. Testing Demo Mode Login (/api/auth/demo)...');
    const demo = await request('POST', '/api/auth/demo');
    console.log('Status:', demo.status, 'User:', demo.data.user.username, 'Level:', demo.data.character.level, 'Gold:', demo.data.character.gold, 'Streak:', demo.data.character.currentStreak);
    if (demo.status !== 200 || !demo.data.token) throw new Error('Demo login failed');
    const token = demo.data.token;

    // 3. Fetch Quests
    console.log('\n3. Testing Fetch Quests (/api/quests)...');
    const questsRes = await request('GET', '/api/quests', null, token);
    console.log('Status:', questsRes.status, 'Quests count:', questsRes.data.quests.length);
    if (questsRes.status !== 200 || questsRes.data.quests.length === 0) throw new Error('Fetch quests failed');

    // 4. Create New Quest
    console.log('\n4. Testing Create Quest (/api/quests)...');
    const newQuestRes = await request('POST', '/api/quests', {
      title: 'Automated Test: Solve Leetcode Hard',
      description: 'Master dynamic programming graph memoization',
      category: 'INTELLECT',
      difficulty: 'EPIC',
      frequency: 'one_off'
    }, token);
    console.log('Status:', newQuestRes.status, 'Created Quest:', newQuestRes.data.quest.title, 'XP:', newQuestRes.data.quest.xp_reward, 'Gold:', newQuestRes.data.quest.gold_reward);
    if (newQuestRes.status !== 201 || !newQuestRes.data.quest.id) throw new Error('Create quest failed');
    const testQuestId = newQuestRes.data.quest.id;

    // 5. Complete Quest
    console.log(`\n5. Testing Complete Quest (/api/quests/${testQuestId}/complete)...`);
    const completeRes = await request('POST', `/api/quests/${testQuestId}/complete`, {}, token);
    console.log('Status:', completeRes.status, 'Message:', completeRes.data.message);
    console.log('XP Earned:', completeRes.data.xpEarned, 'Gold Earned:', completeRes.data.goldEarned, 'Leveled Up:', completeRes.data.leveledUp);
    console.log('New Level:', completeRes.data.character.level, 'New Total XP:', completeRes.data.character.totalXP, 'New Gold:', completeRes.data.character.gold);
    if (completeRes.status !== 200 || !completeRes.data.success) throw new Error('Complete quest failed');

    // 6. Test Duplicate Completion Guard
    console.log(`\n6. Testing Duplicate Completion Protection...`);
    const dupRes = await request('POST', `/api/quests/${testQuestId}/complete`, {}, token);
    console.log('Status:', dupRes.status, 'Error Expected:', dupRes.data.error);
    if (dupRes.status !== 400) throw new Error('Duplicate guard should return 400');

    // 7. Test Shop Catalog & Purchase
    console.log('\n7. Testing Shop Catalog & Purchase (/api/shop)...');
    const shopRes = await request('GET', '/api/shop', null, token);
    console.log('Status:', shopRes.status, 'Shop items count:', shopRes.data.items.length, 'User Gold:', shopRes.data.userGold);
    const unpurchased = shopRes.data.items.find(i => !i.is_purchased && i.price <= shopRes.data.userGold);
    if (unpurchased) {
      console.log('Purchasing:', unpurchased.name, 'Price:', unpurchased.price);
      const buyRes = await request('POST', '/api/shop/purchase', { itemId: unpurchased.id }, token);
      console.log('Buy status:', buyRes.status, 'Message:', buyRes.data.message, 'Remaining Gold:', buyRes.data.newGold);
      if (buyRes.status !== 200) throw new Error('Purchase failed');

      // 8. Test Inventory Equip
      console.log('\n8. Testing Inventory Equip (/api/inventory/:id/equip)...');
      const equipRes = await request('POST', `/api/inventory/${unpurchased.id}/equip`, {}, token);
      console.log('Equip status:', equipRes.status, 'Message:', equipRes.data.message);
      if (equipRes.status !== 200) throw new Error('Equip failed');
    }

    // 9. Fetch Character Progression Sheet
    console.log('\n9. Testing Character Sheet (/api/character)...');
    const charRes = await request('GET', '/api/character', null, token);
    console.log('Status:', charRes.status, 'Name:', charRes.data.character.name, 'Streak:', charRes.data.streak.currentStreak, 'Intellect:', charRes.data.attributes.intellect);
    if (charRes.status !== 200) throw new Error('Character sheet failed');

    // 10. Test Achievements
    console.log('\n10. Testing Achievements (/api/achievements)...');
    const achRes = await request('GET', '/api/achievements', null, token);
    console.log('Status:', achRes.status, 'Total achievements:', achRes.data.totalCount, 'Unlocked:', achRes.data.totalUnlocked);
    if (achRes.status !== 200) throw new Error('Achievements failed');

    // 11. Test Activity Adventure Log
    console.log('\n11. Testing Adventure Log (/api/activity)...');
    const actRes = await request('GET', '/api/activity', null, token);
    console.log('Status:', actRes.status, 'Recent activity count:', actRes.data.activities.length);
    if (actRes.status !== 200 || actRes.data.activities.length === 0) throw new Error('Activity history failed');

    // 12. Test Fresh User Signup Flow
    console.log('\n12. Testing Fresh User Signup Flow (/api/auth/signup)...');
    const testUsername = 'hero_' + Date.now();
    const signupRes = await request('POST', '/api/auth/signup', {
      username: testUsername,
      email: `${testUsername}@quest.com`,
      password: 'password123',
      characterName: 'GALAHAD'
    });
    console.log('Signup Status:', signupRes.status, 'Hero:', signupRes.data.character.name, 'Initial Gold:', signupRes.data.character.gold);
    if (signupRes.status !== 201 || !signupRes.data.token) throw new Error('Signup failed');

    console.log('\n🎉 ALL 12 BACKEND INTEGRATION TESTS PASSED WITH 100% SUCCESS!\n');
  } finally {
    server.close();
  }
}

runTests().catch(err => {
  console.error('❌ Test failed with error:', err);
  if (server) server.close();
  process.exit(1);
});
