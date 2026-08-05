#!/usr/bin/env node
const neo4j = require('neo4j-driver');

const uri = process.env.NEO4J_URI || 'neo4j://localhost:7687';
const username = process.env.NEO4J_USERNAME || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'password';
const database = process.env.NEO4J_DATABASE || 'shopizer';

const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));

async function executeCypher(query, params = {}) {
  const session = driver.session({ database });
  try {
    const result = await session.run(query, params);
    return {
      records: result.records.map(record => {
        const obj = {};
        record.keys.forEach(key => {
          const value = record.get(key);
          obj[key] = neo4j.isInt(value) ? value.toNumber() : value;
        });
        return obj;
      }),
      summary: {
        counters: result.summary.counters.updates(),
        resultAvailableAfter: result.summary.resultAvailableAfter.toNumber(),
        resultConsumedAfter: result.summary.resultConsumedAfter.toNumber()
      }
    };
  } catch (error) {
    throw new Error(`Cypher execution failed: ${error.message}`);
  } finally {
    await session.close();
  }
}

async function getSchema() {
  const session = driver.session({ database });
  try {
    const labels = await session.run('CALL db.labels()');
    const relTypes = await session.run('CALL db.relationshipTypes()');
    const propKeys = await session.run('CALL db.propertyKeys()');
    
    return {
      node_labels: labels.records.map(r => r.get(0)),
      relationship_types: relTypes.records.map(r => r.get(0)),
      property_keys: propKeys.records.map(r => r.get(0))
    };
  } catch (error) {
    throw new Error(`Schema retrieval failed: ${error.message}`);
  } finally {
    await session.close();
  }
}

// MCP Protocol Handler
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', async (line) => {
  try {
    const message = JSON.parse(line);
    
    // Handle initialize
    if (message.method === 'initialize') {
      const response = {
        jsonrpc: '2.0',
        id: message.id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: 'neo4j-mcp',
            version: '1.0.0'
          }
        }
      };
      console.log(JSON.stringify(response));
      return;
    }
    
    // Handle tools/list
    if (message.method === 'tools/list') {
      const response = {
        jsonrpc: '2.0',
        id: message.id,
        result: {
          tools: [
            {
              name: 'write-cypher',
              description: 'Execute a Cypher write query (CREATE, MERGE, SET, DELETE)',
              inputSchema: {
                type: 'object',
                properties: {
                  query: {
                    type: 'string',
                    description: 'The Cypher query to execute'
                  },
                  params: {
                    type: 'object',
                    description: 'Query parameters',
                    default: {}
                  }
                },
                required: ['query']
              }
            },
            {
              name: 'read-cypher',
              description: 'Execute a Cypher read query (MATCH, RETURN)',
              inputSchema: {
                type: 'object',
                properties: {
                  query: {
                    type: 'string',
                    description: 'The Cypher query to execute'
                  },
                  params: {
                    type: 'object',
                    description: 'Query parameters',
                    default: {}
                  }
                },
                required: ['query']
              }
            },
            {
              name: 'get-schema',
              description: 'Get database schema information (labels, relationship types, property keys)',
              inputSchema: {
                type: 'object',
                properties: {}
              }
            }
          ]
        }
      };
      console.log(JSON.stringify(response));
      return;
    }
    
    // Handle tools/call
    if (message.method === 'tools/call') {
      const toolName = message.params.name;
      const args = message.params.arguments || {};
      
      let result;
      
      if (toolName === 'get-schema') {
        const schema = await getSchema();
        result = {
          content: [
            {
              type: 'text',
              text: JSON.stringify(schema, null, 2)
            }
          ]
        };
      } else if (toolName === 'write-cypher' || toolName === 'read-cypher') {
        const data = await executeCypher(args.query, args.params || {});
        result = {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2)
            }
          ]
        };
      } else {
        throw new Error(`Unknown tool: ${toolName}`);
      }
      
      const response = {
        jsonrpc: '2.0',
        id: message.id,
        result: result
      };
      console.log(JSON.stringify(response));
      return;
    }
    
    // Handle notifications (no response needed)
    if (!message.id) {
      return;
    }
    
    // Unknown method
    const response = {
      jsonrpc: '2.0',
      id: message.id,
      error: {
        code: -32601,
        message: `Method not found: ${message.method}`
      }
    };
    console.log(JSON.stringify(response));
    
  } catch (error) {
    const response = {
      jsonrpc: '2.0',
      id: (message && message.id) || null,
      error: {
        code: -32603,
        message: error.message
      }
    };
    console.log(JSON.stringify(response));
  }
});

process.on('SIGINT', async () => {
  await driver.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await driver.close();
  process.exit(0);
});

// Log to stderr so it doesn't interfere with JSON-RPC
console.error('Neo4j MCP Server started');
console.error(`Connected to: ${uri}`);
console.error(`Database: ${database}`);