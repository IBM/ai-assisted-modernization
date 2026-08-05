const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
  'neo4j://localhost:7687',
  neo4j.auth.basic('neo4j', 'password')
);

async function testConnection() {
  try {
    await driver.verifyConnectivity();
    console.log('✓ Neo4j connection successful');
    
    const session = driver.session({ database: 'shopizer' });
    const result = await session.run('RETURN "Hello from Neo4j!" as message');
    console.log('✓ Database query successful:', result.records[0].get('message'));
    await session.close();
    
    await driver.close();
    process.exit(0);
  } catch (error) {
    console.error('✗ Connection failed:', error.message);
    await driver.close();
    process.exit(1);
  }
}

testConnection();

// Made with Bob
