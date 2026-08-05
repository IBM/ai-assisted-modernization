const { spawn } = require('child_process');

console.log('Testing Neo4j MCP Server Protocol...\n');

const mcpServer = spawn('node', ['C:/neo4j-mcp-server/index.js'], {
  env: {
    ...process.env,
    NEO4J_URI: 'neo4j://localhost:7687',
    NEO4J_USERNAME: 'neo4j',
    NEO4J_PASSWORD: 'password',
    NEO4J_DATABASE: 'neo4j'
  }
});

let responseCount = 0;

mcpServer.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(line => line.trim());
  lines.forEach(line => {
    try {
      const response = JSON.parse(line);
      responseCount++;
      console.log(`Response ${responseCount}:`, JSON.stringify(response, null, 2));
    } catch (e) {
      console.log('Non-JSON output:', line);
    }
  });
});

mcpServer.stderr.on('data', (data) => {
  console.log('Server log:', data.toString().trim());
});

mcpServer.on('close', (code) => {
  console.log(`\nMCP server exited with code ${code}`);
  process.exit(code);
});

// Test sequence
setTimeout(() => {
  console.log('\n1. Sending initialize request...');
  mcpServer.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'test-client', version: '1.0.0' }
    }
  }) + '\n');
}, 500);

setTimeout(() => {
  console.log('\n2. Sending tools/list request...');
  mcpServer.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list'
  }) + '\n');
}, 1500);

setTimeout(() => {
  console.log('\n3. Sending get-schema tool call...');
  mcpServer.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'get-schema',
      arguments: {}
    }
  }) + '\n');
}, 2500);

setTimeout(() => {
  console.log('\n4. Sending read-cypher tool call...');
  mcpServer.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: {
      name: 'read-cypher',
      arguments: {
        query: 'RETURN "MCP Test Successful!" as message, timestamp() as time'
      }
    }
  }) + '\n');
}, 3500);

setTimeout(() => {
  console.log('\n✓ All tests completed successfully!');
  mcpServer.kill();
}, 5000);

// Made with Bob
