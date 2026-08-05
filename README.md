# AI-Assisted Modernization

<!-- Build Status, is a great thing to have at the top of your repository, it shows that you take your CI/CD as first class citizens -->
<!-- [![Build Status](https://travis-ci.org/jjasghar/ibm-cloud-cli.svg?branch=master)](https://travis-ci.org/jjasghar/ibm-cloud-cli) -->

## Scope

The purpose of this project is to provide an AI-assisted brownfield modernization workflow that combines context engineering, reusable AI skills, MCP servers, and IBM Bob to help modernize monolithic applications into microservices.

## Overview

This platform provides:

- **MCP Servers**: Model Context Protocol servers that expose contextual knowledge to IBM Bob
  - Neo4j MCP server for knowledge graph operations
  - MinIO MCP server for artifact storage operations

- **AI Skills**: Reusable skills that guide each stage of the modernization workflow
  - Application Discovery skill for analyzing monolithic applications
  - Microservices Architect skill for identifying bounded contexts and candidate microservices
  - Microservices Designer skill for generating design artifacts
  - Microservices Developer skill for implementing production-ready microservices

## Repository Structure

This repository contains the following documentation and resources:

* [LICENSE](LICENSE) - Apache 2.0 License
* [README.md](README.md) - This file
* [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
* [MAINTAINERS.md](MAINTAINERS.md) - Project maintainers
* [CHANGELOG.md](CHANGELOG.md) - Version history and changes

## Getting Started

### Prerequisites

- Node.js 22 LTS or later
- IBM Bob 2.0 or later
- Neo4j Community Edition 5.26 LTS or later
- MinIO Community Edition (latest version)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/IBM/ai-assisted-modernization.git
   cd ai-assisted-modernization
   ```

2. Install MCP server dependencies:
   ```bash
   # Neo4j MCP server
   cd mcp-server/neo4j-mcp-server
   npm install
   
   # MinIO MCP server
   cd ../minio-mcp
   npm install
   npm run build
   ```

3. Configure the MCP servers in IBM Bob's `mcp-config.json` file with your Neo4j and MinIO credentials.

4. Copy the AI skills from the `skills/` directory to your IBM Bob workspace `.bob/skills/` directory.

For detailed setup instructions and usage, please refer to the accompanying tutorial documentation.

## Contributing

Pull requests are very welcome! Make sure your changes are well tested.

Before contributing, please:

1. Read the [CONTRIBUTING.md](CONTRIBUTING.md) file for detailed guidelines
2. Fork the repo
3. Create your feature branch (`git checkout -b feature/my-new-feature`)
4. Commit your changes with sign-off (`git commit -s -m 'Add some feature'`)
5. Push to the branch (`git push origin feature/my-new-feature`)
6. Create a new Pull Request

If you have any questions or issues, you can create a new [issue here](https://github.com/IBM/ai-assisted-modernization/issues/new).

## License

All source files must include a Copyright and License header. The SPDX license header is 
preferred because it can be easily scanned.

If you would like to see the detailed LICENSE click [here](LICENSE).

```text
#
# Copyright IBM Corp. 2026
# SPDX-License-Identifier: Apache-2.0
#
```

## Maintainers

For the list of project maintainers, see [MAINTAINERS.md](MAINTAINERS.md).

## Authors

- Aditya Sengupta - aditseng@in.ibm.com
