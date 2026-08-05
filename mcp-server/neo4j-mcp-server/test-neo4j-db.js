const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
  'neo4j://localhost:7687',
  neo4j.auth.basic('neo4j', 'password')
);

async function testConnection() {
  try {
    await driver.verifyConnectivity();
    console.log('✓ Neo4j connection successful');
    
    const session = driver.session({ database: 'neo4j' });
    
    // Test query
    const result = await session.run('RETURN "Hello from Neo4j!" as message');
    console.log('✓ Database query successful:', result.records[0].get('message'));
    
    // Get node count
    const countResult = await session.run('MATCH (n) RETURN count(n) as count');
    const nodeCount = countResult.records[0].get('count').toNumber();
    console.log(`✓ Total nodes in database: ${nodeCount}`);
    
    // Get relationship count
    const relResult = await session.run('MATCH ()-[r]->() RETURN count(r) as count');
    const relCount = relResult.records[0].get('count').toNumber();
    console.log(`✓ Total relationships in database: ${relCount}`);
    
    await session.close();
    await driver.close();
    
    console.log('\n✓ Neo4j MCP connection is working correctly!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Connection failed:', error.message);
    await driver.close();
    process.exit(1);
  }
}

testConnection();

// Made with Bob
