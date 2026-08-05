# Contributing to AI-Assisted Modernization

Thank you for your interest in contributing to the AI-Assisted Modernization project! This project provides an AI-assisted brownfield modernization workflow that combines context engineering, reusable AI skills, MCP servers, and IBM Bob to help modernize monolithic applications into microservices.

We welcome external contributions. If you have an improvement, bug fix, or new feature, please feel free to contribute.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Submitting Changes](#submitting-changes)
- [Contribution Guidelines](#contribution-guidelines)
- [Testing Your Changes](#testing-your-changes)
- [Legal Requirements](#legal-requirements)

## Code of Conduct

This project adheres to the IBM Code of Conduct. By participating, you are expected to uphold this code. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

Before you begin:
- Familiarize yourself with the project by reading the [README.md](README.md)
- Check the [issue tracker](https://github.com/IBM/ai-assisted-modernization/issues) for open issues
- Look for issues labeled `good first issue` or `help wanted` to get started

**Important:** Before embarking on a significant contribution, please open an issue or comment on an existing one to discuss your proposed changes with the maintainers. This helps avoid situations where contributions require extensive rework or cannot be accepted.

## How to Contribute

### Proposing New Features

If you would like to implement a new feature:

1. [Open an issue](https://github.com/IBM/ai-assisted-modernization/issues/new) describing the feature
2. Explain the use case and why it would be valuable
3. Wait for discussion and approval from maintainers before starting development
4. Once approved, follow the [Submitting Changes](#submitting-changes) process

### Reporting Bugs

If you find a bug:

1. [Open an issue](https://github.com/IBM/ai-assisted-modernization/issues/new) with a clear description
2. Include steps to reproduce the bug
3. Provide information about your environment (OS, Node.js version, IBM Bob version, etc.)
4. If possible, include error messages, logs, or screenshots

### Improving Documentation

Documentation improvements are always welcome! This includes:
- Fixing typos or clarifying existing documentation
- Adding examples or tutorials
- Improving AI skill documentation
- Updating setup instructions

## Development Setup

### Prerequisites

Install the following software before contributing:

| Component | Version | Purpose |
|-----------|---------|---------|
| [Node.js](https://nodejs.org/) | 22 LTS or later | Required for MCP servers |
| [IBM Bob](https://bob.ibm.com/docs/ide/getting-started/install) | 2.0 or later | AI coding assistant for testing skills |
| [Neo4j Community Edition](https://neo4j.com/download/neo4j-desktop/) | 5.26 LTS or later | Knowledge graph (for testing MCP server) |
| [MinIO Community Edition](https://min.io/download) | Latest | Object store (for testing MCP server) |
| Git | Latest | Version control |

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-assisted-modernization.git
   cd ai-assisted-modernization
   ```

3. **Add the upstream repository** as a remote:
   ```bash
   git remote add upstream https://github.com/IBM/ai-assisted-modernization.git
   ```

4. **Install dependencies for MCP servers:**

   For Neo4j MCP server:
   ```bash
   cd mcp-server/neo4j-mcp-server
   npm install
   cd ../..
   ```

   For MinIO MCP server:
   ```bash
   cd mcp-server/minio-mcp
   npm install
   npm run build
   cd ../..
   ```

5. **Configure MCP servers** (optional, for testing):
   - Follow the setup instructions in the project README
   - Configure your local Neo4j and MinIO instances
   - Update IBM Bob's `mcp-config.json` with your local credentials

## Project Structure

```
ai-assisted-modernization/
├── mcp-server/
│   ├── neo4j-mcp-server/      # Neo4j MCP server implementation
│   │   ├── index.js
│   │   ├── package.json
│   │   └── ...
│   └── minio-mcp/             # MinIO MCP server implementation
│       ├── src/
│       ├── build/
│       ├── package.json
│       └── tsconfig.json
├── skills/
│   ├── skills-app-discovery-enhanced.md
│   ├── skills-microservices-architect.md
│   ├── skills-microservices-designer.md
│   └── skills-microservices-developer.md
├── CONTRIBUTING.md
├── LICENSE
├── MAINTAINERS.md
└── README.md
```

### Component Overview

- **mcp-server/**: Model Context Protocol servers that expose contextual knowledge to IBM Bob
  - **neo4j-mcp-server/**: Node.js MCP server for Neo4j knowledge graph operations
  - **minio-mcp/**: TypeScript MCP server for MinIO object storage operations

- **skills/**: Reusable AI skills that guide each stage of the modernization workflow
  - **skills-app-discovery-enhanced.md**: Analyzes monolithic applications and constructs knowledge graphs
  - **skills-microservices-architect.md**: Identifies bounded contexts and candidate microservices using DDD
  - **skills-microservices-designer.md**: Generates design artifacts (OpenAPI, SQL schemas, design docs)
  - **skills-microservices-developer.md**: Implements production-ready microservices

## Submitting Changes

### Pull Request Process

1. **Create a feature branch** from `master`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
   or for bug fixes:
   ```bash
   git checkout -b fix/bug-description
   ```

2. **Make your changes** following the [Contribution Guidelines](#contribution-guidelines)

3. **Test your changes** thoroughly (see [Testing Your Changes](#testing-your-changes))

4. **Commit your changes** with a descriptive message and sign-off:
   ```bash
   git commit -s -m "Add feature: description of your changes"
   ```
   The `-s` flag adds a "Signed-off-by" line (required for DCO compliance)

5. **Keep your branch updated** with upstream:
   ```bash
   git fetch upstream
   git rebase upstream/master
   ```

6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request** on GitHub:
   - Go to your fork on GitHub
   - Click "Compare & pull request"
   - Provide a clear title and description
   - Reference any related issues (e.g., "Closes #123")
   - Wait for review from maintainers

### Pull Request Guidelines

- **One logical change per PR**: Keep pull requests focused on a single feature or fix
- **Clear description**: Explain what changes were made and why
- **Reference issues**: Link to related issues in your PR description
- **Update documentation**: Include documentation updates if your changes affect usage
- **Add tests**: Include tests for new functionality when applicable
- **Follow coding standards**: Maintain consistency with existing code

### Merge Approval

- The project maintainers use **LGTM (Looks Good To Me)** in code review comments to indicate acceptance
- A change requires approval from at least **one maintainer**
- For changes affecting multiple components, approval from maintainers of each affected component may be required
- See [MAINTAINERS.md](MAINTAINERS.md) for the list of project maintainers

## Contribution Guidelines

### MCP Server Contributions

When contributing to MCP servers:

- **Follow the Model Context Protocol specification**
- **Handle errors gracefully** with clear error messages
- **Log important operations** for debugging
- **Document all tools and prompts** exposed by the server
- **Test with IBM Bob** to ensure proper integration
- **Use environment variables** for configuration (never hardcode credentials)

#### Neo4j MCP Server Guidelines

- Use parameterized Cypher queries to prevent injection
- Validate all inputs before executing queries
- Return structured, consistent response formats
- Handle connection failures and timeouts gracefully

#### MinIO MCP Server Guidelines

- Follow TypeScript best practices
- Compile successfully with `npm run build`
- Handle bucket and object operations safely
- Validate file paths and bucket names
- Support streaming for large objects when appropriate

### AI Skills Contributions

When contributing to AI skills:

- **Follow IBM Bob skill documentation standards**: [Bob Skill Documentation](https://bob.ibm.com/docs/ide/features/skills)
- **Use clear, actionable language** in skill instructions
- **Include examples** where appropriate
- **Define clear inputs and outputs**
- **Document dependencies** on MCP servers or other tools
- **Test skills end-to-end** with IBM Bob
- **Maintain consistency** with existing skill structure and tone

### Code Style Guidelines

#### JavaScript/Node.js

- Use **ES6+** features where appropriate
- Use `const` and `let` instead of `var`
- Follow standard JavaScript naming conventions (camelCase for variables/functions)
- Add comments for complex logic
- Handle promises properly (use async/await or proper error handling)

#### TypeScript

- Enable strict mode in `tsconfig.json`
- Define explicit types (avoid `any` unless necessary)
- Use interfaces for object shapes
- Follow TypeScript best practices

#### Markdown

- Use consistent heading levels
- Format code blocks with appropriate language tags
- Keep line lengths reasonable (wrap at 100-120 characters)
- Use lists and tables for readability

## Testing Your Changes

### Testing MCP Servers

1. **Unit Testing** (if applicable):
   ```bash
   npm test
   ```

2. **Manual Testing with IBM Bob**:
   - Configure the MCP server in IBM Bob's `mcp-config.json`
   - Restart IBM Bob or reconnect the MCP server
   - Test each tool/operation through Bob chat
   - Verify error handling with invalid inputs

3. **Integration Testing**:
   - Test with Neo4j or MinIO instances
   - Verify connection handling and timeouts
   - Test edge cases (empty results, large datasets, connection failures)

### Testing AI Skills

1. **Install the skill** in IBM Bob (`.bob/skills/` directory)
2. **Run through the complete workflow** described in the skill
3. **Verify MCP server interactions** work correctly
4. **Test with different inputs** to ensure robustness
5. **Document any prerequisites** or dependencies

### Testing Documentation Changes

- Review rendered Markdown for formatting issues
- Verify all links work correctly
- Check code examples for accuracy
- Ensure instructions are clear and complete

## Legal Requirements

### Developer Certificate of Origin (DCO)

This project uses the [Developer's Certificate of Origin 1.1 (DCO)](https://developercertificate.org/) to manage code contributions. By contributing to this project, you certify that:

1. The contribution was created in whole or in part by you and you have the right to submit it under the open source license indicated in the file
2. The contribution is based upon previous work that is covered under an appropriate open source license and you have the right to submit that work with modifications
3. The contribution was provided directly to you by some other person who certified (1), (2) or (3) and you have not modified it

### Signing Your Commits

You must sign off on your commits by including a `Signed-off-by` line in your commit message:

```
Signed-off-by: Your Name <your.email@example.com>
```

You can add this automatically using the `-s` flag with git commit:

```bash
git commit -s -m "Your commit message"
```

The DCO bot will automatically check all pull requests. Pull requests with unsigned commits will not be merged.

### License Headers

Each source file must include an Apache 2.0 license header using the SPDX format:

For JavaScript/TypeScript files:
```javascript
/*
Copyright IBM Corp. 2026

SPDX-License-Identifier: Apache-2.0
*/
```

For Markdown files:
```markdown
<!--
Copyright IBM Corp. 2026

SPDX-License-Identifier: Apache-2.0
-->
```

## Questions or Need Help?

- **Issues**: Open an [issue](https://github.com/IBM/ai-assisted-modernization/issues) for questions or problems
- **Discussions**: Use GitHub Discussions for general questions and ideas
- **Maintainers**: See [MAINTAINERS.md](MAINTAINERS.md) for contact information

## Thank You!

Your contributions help make this project better for everyone. We appreciate your time and effort in improving the AI-Assisted Modernization platform!
