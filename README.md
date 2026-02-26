# kitameraki-be-test

Backend REST API built with **Azure Functions v4**, **TypeScript**, and **Azure Cosmos DB (NoSQL)**.

This project provides endpoints to manage:

- **Tasks** (multi-organization support)
- **Form Settings** (scoped per organization)

---

## Tech Stack

| Technology                  | Description               |
| --------------------------- | ------------------------- |
| **Azure Functions v4**      | Serverless runtime        |
| **TypeScript**              | Main programming language |
| **Azure Cosmos DB (NoSQL)** | Database                  |
| **Zod**                     | Input validation          |
| **Node.js v18+**            | Runtime                   |

---

## Prerequisites

Install the following before running locally:

- [Node.js v18+](https://nodejs.org/)
- [Azure Functions Core Tools v4](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local)

```bash
npm install -g azure-functions-core-tools@4 --unsafe-perm true
```

- Azure Cosmos DB instance **OR** [Cosmos DB Emulator](https://learn.microsoft.com/en-us/azure/cosmos-db/local-emulator)

---

## Database Setup

This project uses:

- **Cosmos DB API**: Core (NoSQL)
- **Single container**
- **Partition Key**: `/organizationId`

> **Important:** All documents must include `organizationId` as it is used as the partition key.

```json
{
  "organizationId": "org1"
}
```

---

## Running Locally

### 1. Clone Repository

```bash
git clone https://github.com/MuhammadFaisalMaulanaPutra/kitameraki-be-test.git
cd kitameraki-be-test
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file at the root:

```env
COSMOS_ENDPOINT=https://localhost:8081
COSMOS_KEY=your-key
COSMOS_DATABASE=TaskApp
COSMOS_CONTAINER=Tasks
NODE_TLS_REJECT_UNAUTHORIZED=0
```

Or configure inside `local.settings.json`:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "COSMOS_ENDPOINT": "https://localhost:8081",
    "COSMOS_KEY": "your-key",
    "COSMOS_DATABASE": "TaskApp",
    "COSMOS_CONTAINER": "Tasks"
    "NODE_TLS_REJECT_UNAUTHORIZED": 0,
  }
}
```

### 4. Build TypeScript

```bash
npm run build
```

For development with auto-recompile:

```bash
npm run watch
```

### 5. Start Azure Functions

```bash
func start
```

API will be available at:

```
http://localhost:7071/api
```
