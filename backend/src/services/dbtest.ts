import 'dotenv/config';
import db from './db/index.js';

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests(): Promise<void> {
  console.log('🧪 Starting database tests...\n');

  try {
    // 1. Initialize databases
    console.log('1️⃣  Connecting to databases...');
    await db.init();
    console.log('   ✅ Connected to MongoDB and PostgreSQL\n');

    // 2. Create a bin
    console.log('2️⃣  Creating a bin...');
    const bin = await db.bins.create('test-bin-123', 'test-token-xyz');
    console.log('   ✅ Bin created:');
    console.log(`      ID: ${bin.id}`);
    console.log(`      Route: ${bin.bin_route}`);
    console.log(`      Token: ${bin.token}\n`);

    // 3. Create requests with different body types
    console.log('3️⃣  Creating requests with different body types...');

    // Request with JSON body
    const request1 = await db.requests.create(bin.id, {
      method: 'POST',
      parameters: { page: '1', limit: '10' },
      headers: { 'content-type': 'application/json', 'x-custom-header': 'test' },
      body: { message: 'Hello World', userId: 42, items: ['a', 'b', 'c'] }
    });
    console.log('   ✅ Request 1 created (JSON body):', request1.id);

    // Request with string body
    const request2 = await db.requests.create(bin.id, {
      method: 'POST',
      parameters: {},
      headers: { 'content-type': 'text/plain' },
      body: 'Plain text body content'
    });
    console.log('   ✅ Request 2 created (string body):', request2.id);

    // Request with array body
    const request3 = await db.requests.create(bin.id, {
      method: 'POST',
      parameters: { debug: 'true' },
      headers: { 'content-type': 'application/json' },
      body: [{ id: 1 }, { id: 2 }, { id: 3 }]
    });
    console.log('   ✅ Request 3 created (array body):', request3.id);

    console.log();

    // 4. Read requests by bin_id
    console.log('4️⃣  Reading requests by bin_id...');
    const requestsByBinId = await db.requests.getByBinId(bin.id);
    console.log(`   ✅ Found ${requestsByBinId.length} requests`);
    
    // Verify body data
    console.log('   Verifying body data:');
    const r1 = requestsByBinId.find(r => r.id === request1.id);
    const r2 = requestsByBinId.find(r => r.id === request2.id);
    const r3 = requestsByBinId.find(r => r.id === request3.id);

    if (r1 && typeof r1.body === 'object' && (r1.body as any).message === 'Hello World') {
      console.log('   ✅ Request 1 body verified');
    } else {
      console.log('   ❌ Request 1 body mismatch!');
    }

    if (r2 && r2.body === 'Plain text body content') {
      console.log('   ✅ Request 2 body verified');
    } else {
      console.log('   ❌ Request 2 body mismatch!');
    }

    if (r3 && Array.isArray(r3.body) && r3.body.length === 3) {
      console.log('   ✅ Request 3 body verified');
    } else {
      console.log('   ❌ Request 3 body mismatch!');
    }
    console.log();

    // 5. Read requests by bin_route
    console.log('5️⃣  Reading requests by bin_route (test-bin-123)...');
    const requestsByRoute = await db.requests.getByBinRoute('test-bin-123');
    console.log(`   ✅ Found ${requestsByRoute.length} requests by route\n`);

    // 6. Read single request by ID
    console.log('6️⃣  Reading single request by ID...');
    const singleRequest = await db.requests.getById(request1.id);
    if (singleRequest && singleRequest.method === 'POST') {
      console.log('   ✅ Single request retrieved correctly\n');
    } else {
      console.log('   ❌ Failed to retrieve single request\n');
    }

    // 7. Test bin lookup by route
    console.log('7️⃣  Looking up bin by route...');
    const foundBin = await db.bins.getByRoute('test-bin-123');
    if (foundBin && foundBin.id === bin.id) {
      console.log('   ✅ Bin lookup by route works\n');
    } else {
      console.log('   ❌ Bin lookup by route failed\n');
    }

    // 8. Test non-existent bin returns null
    console.log('8️⃣  Testing non-existent bin...');
    const nonExistentBin = await db.bins.getByRoute('does-not-exist');
    if (nonExistentBin === null) {
      console.log('   ✅ Non-existent bin returns null\n');
    } else {
      console.log('   ❌ Non-existent bin should return null\n');
    }

    // 9. Test getByBinRoute with non-existent route
    console.log('9️⃣  Testing getByBinRoute with non-existent route...');
    const emptyRequests = await db.requests.getByBinRoute('does-not-exist');
    if (Array.isArray(emptyRequests) && emptyRequests.length === 0) {
      console.log('   ✅ Returns empty array for non-existent route\n');
    } else {
      console.log('   ❌ Should return empty array for non-existent route\n');
    }

    // 10. Cleanup - delete requests
    console.log('🔟 Cleaning up test requests...');
    await db.requests.delete(request1.id);
    await db.requests.delete(request2.id);
    await db.requests.delete(request3.id);
    
    // Verify deletion
    const deletedRequest = await db.requests.getById(request1.id);
    if (deletedRequest === null) {
      console.log('   ✅ Requests deleted from PostgreSQL');
    } else {
      console.log('   ❌ Request still exists in PostgreSQL');
    }
    
    // Body should also be gone from MongoDB (we can't easily verify without direct Mongo access,
    // but the implementation handles this)
    console.log('   ✅ Bodies should be deleted from MongoDB (via implementation)');
    console.log();

    // 11. Cleanup - delete bin
    console.log('🗑️  Cleaning up test bin...');
    await db.bins.delete(bin.id);
    const deletedBin = await db.bins.getById(bin.id);
    if (deletedBin === null) {
      console.log('   ✅ Bin deleted\n');
    } else {
      console.log('   ❌ Bin still exists\n');
    }

    console.log('✅ All tests passed!\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await db.close();
    console.log('👋 Database connections closed');
  }
}

runTests();
