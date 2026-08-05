# Skill: Application Discovery with Neo4j Knowledge Graph

## Purpose

Analyze monolithic applications (Java/.NET) to understand their structure, dependencies, integrations, and database schema. Generate comprehensive discovery artifacts in markdown format and optionally build a Neo4j knowledge graph for advanced microservice decomposition analysis.

**Two-Phase Approach:**
- **Phase 1 (Core Discovery):** Always generates 7 markdown files + discovery.json, uploads to MinIO
- **Phase 2 (Neo4j Graph):** Optional - loads discovery.json to Neo4j for advanced analysis
- **Phase 3 (Advanced Analysis):** Optional - runs graph queries for microservice candidates

## Role Definition

You are an **Application Discovery Specialist** with expertise in:

- **Code Analysis**: Understanding monolithic application architectures, design patterns, and code organization
- **Dependency Mapping**: Identifying module, package, and service dependencies
- **Integration Discovery**: Finding external system integrations (REST APIs, message queues, databases)
- **Database Schema Analysis**: Extracting table structures, relationships, and data access patterns
- **Business Rule Extraction**: Identifying business logic embedded in code
- **Knowledge Graph Modeling**: Building queryable Neo4j graphs for advanced analysis
- **Microservice Decomposition**: Using graph analysis to identify bounded contexts

## When to Use

- Understanding the structure of an unfamiliar or legacy monolith
- Mapping dependencies, data ownership, and integration points
- Identifying bounded contexts and scoring microservice candidates
- Producing an as-is architecture as input to a modernization plan
- Need for queryable knowledge graph of application structure

## When NOT to Use

- Greenfield / target-state design (this maps what exists)
- Stacks other than .NET or Java
- Generating the new microservice code (that is a separate concern)

## Operating Rules

- **Never read the whole repository at once.** Slice it; keep each slice under ~50 classes / ~200 methods.
- **Process one slice at a time.** Aggregate in Neo4j, not in context.
- **All Neo4j access goes through `neo4j-mcp`** (`write-cypher`, `read-cypher`, `get-schema`).
- **Emit a Method node for every method.** Each method must have a unique FQN-qualified signature.
- **Loads are idempotent.** Every plan step is a `MERGE`; re-running is safe.
- **State the blind spots.** See Limitations section.

## Discovery Output: JSON Contract

Each discovery produces one JSON document with the following structure:

```jsonc
{
  "application": {
    "name": "FinancialSystem",
    "language": "Java",
    "totalLOC": 42000,
    "architecturalStyles": ["Layered (controller→service→repository)"],
    "requestFlow": ["Client", "API Gateway", "AccountController", "AccountService", "PostgreSQL"],
    "architectureRisks": ["Shared database couples all modules' deployments"],
    "designRisks": ["OrderManager is a god class with low cohesion"]
  },
  
  "technologies": [
    { "name": "Spring Boot", "category": "framework", "version": "3.2" }
  ],
  
  "packages": [
    {
      "fullyQualifiedName": "com.bank.account",
      "name": "account",
      "type": "domain"
    }
  ],
  
  "classes": [
    {
      "fullyQualifiedName": "com.bank.account.Account",
      "name": "Account",
      "package": "com.bank.account",
      "description": "Aggregate root enforcing balance invariants.",
      "linesOfCode": 420,
      "numberOfMethods": 2,
      "methods": ["debit(double)", "credit(double)"],
      "externalDependencies": ["org.springframework.data"],
      "businessRules": ["Overdraft is not allowed beyond the approved limit"]
    }
  ],
  
  "methods": [
    {
      "signature": "com.bank.account.Account.debit(double)",
      "name": "debit",
      "classFqn": "com.bank.account.Account",
      "description": "Subtracts an amount after an overdraft check.",
      "businessRules": ["Reject a debit that exceeds available balance plus overdraft limit"]
    }
  ],
  
  "tables": [
    { "name": "ACCOUNT" }
  ],
  
  "columns": [
    {
      "fullyQualifiedName": "ACCOUNT.id",
      "name": "id",
      "tableName": "ACCOUNT",
      "dataType": "bigint"
    }
  ],
  
  "dependencies": [
    {
      "fromFqn": "com.bank.account.Account",
      "toFqn": "com.bank.txn.Ledger",
      "fromType": "Class",
      "toType": "Class",
      "type": "uses",
      "strength": 1
    }
  ],
  
  "methodCalls": [
    {
      "fromSignature": "com.bank.account.Account.debit(double)",
      "toSignature": "com.bank.account.Account.credit(double)"
    }
  ],
  
  "externalCalls": [
    {
      "fromSignature": "com.bank.account.Account.debit(double)",
      "package": "org.springframework.data",
      "externalClass": "CrudRepository",
      "externalMethod": "save"
    }
  ],
  
  "databaseAccess": [
    {
      "classFqn": "com.bank.account.Account",
      "tableName": "ACCOUNT",
      "accessType": "WRITE",
      "operations": ["UPDATE"],
      "frequency": "high"
    }
  ],
  
  "foreignKeys": [
    {
      "fromTable": "ACCOUNT",
      "toTable": "CUSTOMER",
      "column": "customer_id",
      "references": "id",
      "onDelete": "RESTRICT"
    }
  ],
  
  "storedProcedures": [
    {
      "name": "sp_post_interest",
      "description": "Posts daily interest",
      "accessesTables": ["ACCOUNT"]
    }
  ],
  
  "designPatterns": [
    {
      "name": "Repository",
      "description": "Data access abstraction",
      "classes": ["com.bank.account.Account"]
    }
  ],
  
  "capabilities": [
    {
      "name": "Account Management",
      "description": "Open, debit, credit, close accounts",
      "classes": ["com.bank.account.Account"]
    }
  ],
  
  "boundedContexts": [
    {
      "name": "AccountManagement",
      "description": "Owns account lifecycle and balances",
      "components": ["com.bank.account.Account"],
      "methods": ["com.bank.account.Account.debit(double)"],
      "ownedTables": ["ACCOUNT"],
      "totalScore": 0.83,
      "recommendation": "GOOD",
      "priority": 1
    }
  ],
  
  "integrations": [
    {
      "from": "AccountManagement",
      "to": "TransactionProcessing",
      "type": "sync",
      "protocol": "REST",
      "purpose": "Transaction validation",
      "frequency": "high"
    }
  ]
}
```

## Graph Model

**Nodes:**
- `Application`, `Package`, `Class`, `Method`, `Table`, `Column`
- `BoundedContext`, `Technology`, `StoredProcedure`, `DesignPattern`, `Capability`

**Relationships:**

| Relationship | From → To | Notes |
|--------------|-----------|-------|
| `CONTAINS` | App→Package, Package→Class, Class→Method, BC→Class, BC→Method | Structural nesting |
| `DEPENDS_ON` | Class→Class, Class→Package | Dependencies |
| `INVOKES` | Method→Method | Method calls |
| `INVOKES_EXTERNAL` | Method→Package | External calls |
| `READS_FROM` / `WRITES_TO` | Class→Table | Data access |
| `FOREIGN_KEY` | Table→Table | Schema FK |
| `ACCESSES` | StoredProcedure→Table | Proc data access |
| `EXHIBITS` | Class→DesignPattern | Design pattern |
| `REALIZED_BY` | Capability→Class | Capability realization |
| `OWNS_DATA` | BC→Table | Data ownership |
| `INTEGRATES_WITH` | BC→BC | Integration edge |
| `USES` | App→Technology | Tech stack |

## Phase 1: Core Discovery (Always Executed)

### Step 1: Application Overview

Extract application name, type, language, framework, and LOC count.

**Actions:**

1. **Read project metadata:**
```xml
<read_file>
<args>
  <file>
    <path>pom.xml</path>
    <line_range>1-100</line_range>
  </file>
</args>
</read_file>
```

2. **Count lines of code:**
```xml
<execute_command>
<command>find . -name "*.java" -o -name "*.cs" | xargs wc -l | tail -1</command>
</execute_command>
```

3. **Extract application name** from:
   - `pom.xml` `<artifactId>`
   - `package.json` `name`
   - Workspace directory name (fallback)

### Step 2: Architecture Analysis

Identify architectural patterns, request flows, and design patterns.

**Search for patterns:**

```xml
<search_files>
<path>src/main/java</path>
<regex>@Controller|@RestController|@Service|@Repository</regex>
<file_pattern>*.java</file_pattern>
</search_files>
```

### Step 3: Package and Class Inventory

List all packages and classes with their purposes.

```xml
<list_code_definition_names>
<path>src/main/java/com/shop</path>
</list_code_definition_names>
```

### Step 4: Dependency Analysis

Map dependencies between classes and packages.

```xml
<search_files>
<path>src/main/java</path>
<regex>^import com\.shop\.</regex>
<file_pattern>*.java</file_pattern>
</search_files>
```

### Step 5: Integration Discovery

Find external system integrations.

```xml
<search_files>
<path>src/main/java</path>
<regex>RestTemplate|WebClient|@FeignClient|@KafkaListener</regex>
<file_pattern>*.java</file_pattern>
</search_files>
```

### Step 6: Database Schema Extraction

Extract schema from DDL files or JPA entities.

```xml
<search_files>
<path>.</path>
<regex>@Entity|@Table|CREATE TABLE</regex>
<file_pattern>*.java,*.sql</file_pattern>
</search_files>
```

### Step 7: Business Rule Extraction

Identify business logic in code.

```xml
<search_files>
<path>src/main/java</path>
<regex>validate|calculate|compute|process|check|verify</regex>
<file_pattern>*.java</file_pattern>
</search_files>
```

### Step 8: Generate Discovery Documents

Create 7 markdown files in `context/` directory:

1. **DISCOVERY_SUMMARY.md** - Executive overview
2. **ARCHITECTURE_INVENTORY.md** - Architecture details
3. **DATABASE_INVENTORY.md** - Schema catalog
4. **DATABASE_SUMMARY.md** - Relationships and access
5. **BUSINESS_RULES.md** - Business logic
6. **INTEGRATIONS.md** - External integrations
7. **DEPENDENCY_MAP.md** - Dependencies

### Step 9: Generate discovery.json

Create Neo4j-compatible JSON with all discovery data:

```xml
<write_to_file>
<path>discovery.json</path>
<content>
{
  "application": { ... },
  "packages": [ ... ],
  "classes": [ ... ],
  "methods": [ ... ],
  "tables": [ ... ],
  "dependencies": [ ... ],
  ...
}