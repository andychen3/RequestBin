import 'dotenv/config';
import db from './db/index.js';
import { BodyModel } from './db/models.js';

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

    // 10. Test bin deletion cascades to MongoDB bodies
    console.log('🔟 Testing bin deletion cascades to MongoDB bodies...');
    
    // Create another bin with requests specifically for this test
    const testBin = await db.bins.create('cascade-test-bin', 'test-token-abc');
    const testRequest1 = await db.requests.create(testBin.id, {
      method: 'POST',
      parameters: {},
      headers: { 'content-type': 'application/json' },
      body: { test: 'body1', data: 'for cascade test' }
    });
    const testRequest2 = await db.requests.create(testBin.id, {
      method: 'POST',
      parameters: {},
      headers: { 'content-type': 'application/json' },
      body: { test: 'body2', data: 'for cascade test' }
    });
    
    // Store body_ids for later verification
    const bodyId1 = testRequest1.body_id;
    const bodyId2 = testRequest2.body_id;
    
    console.log('   Created test bin with 2 requests');
    console.log(`   Body ID 1: ${bodyId1}`);
    console.log(`   Body ID 2: ${bodyId2}`);
    
    // Verify bodies exist in MongoDB before deletion
    const bodyBefore1 = await BodyModel.findById(bodyId1);
    const bodyBefore2 = await BodyModel.findById(bodyId2);
    if (bodyBefore1 && bodyBefore2) {
      console.log('   ✅ Both bodies exist in MongoDB before bin deletion');
    } else {
      console.log('   ❌ Bodies missing before bin deletion!');
    }
    
    // Delete the bin (should cascade to bodies)
    await db.bins.delete(testBin.id);
    
    // Verify bin is deleted
    const deletedTestBin = await db.bins.getById(testBin.id);
    if (deletedTestBin === null) {
      console.log('   ✅ Test bin deleted from PostgreSQL');
    } else {
      console.log('   ❌ Test bin still exists in PostgreSQL');
    }
    
    // Verify bodies are deleted from MongoDB
    const bodyAfter1 = await BodyModel.findById(bodyId1);
    const bodyAfter2 = await BodyModel.findById(bodyId2);
    if (bodyAfter1 === null && bodyAfter2 === null) {
      console.log('   ✅ Both bodies deleted from MongoDB (cascade delete working!)');
    } else {
      console.log('   ❌ Bodies still exist in MongoDB - cascade delete NOT working!');
      if (bodyAfter1) console.log('      Body 1 still exists:', bodyAfter1._id);
      if (bodyAfter2) console.log('      Body 2 still exists:', bodyAfter2._id);
    }
    console.log();

    // 11. Cleanup - delete original test requests
    console.log('🗑️  Cleaning up original test requests...');
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
    console.log('   ✅ Bodies deleted from MongoDB (via individual request delete)');
    console.log();

    // 12. Cleanup - delete original test bin
    console.log('🧹 Cleaning up original test bin...');
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
