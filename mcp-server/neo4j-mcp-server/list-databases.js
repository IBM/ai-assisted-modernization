const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
  'neo4j://localhost:7687',
  neo4j.auth.basic('neo4j', 'password')
);

async function listDatabases() {
  try {
    await driver.verifyConnectivity();
    console.log('✓ Neo4j connection successful\n');
    
    const session = driver.session({ database: 'system' });
    const result = await session.run('SHOW DATABASES');
    
    console.log('Available databases:');
    result.records.forEach(record => {
      const name = record.get('name');
      const currentStatus = record.get('currentStatus');
      console.log(`  - ${name} (${currentStatus})`);
    });
    
    await session.close();
    await driver.close();
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    await driver.close();
    process.exit(1);
  }
}

listDatabases();

// Made with Bob
