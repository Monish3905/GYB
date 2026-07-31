# Global Payment Operating System (GYB)

A production-grade, event-driven Global Payment Operating System built across 16 milestones.

## Architecture

This monorepo implements a complete payment platform with:

- **MS1–MS4**: Internal Payment Rail, Routing, Ledger foundations
- **MS5**: Smart Routing Engine
- **MS6**: Settlement Orchestrator
- **MS7–MS8**: Netting Engine & Immutable Ledger
- **MS9**: PostgreSQL Persistence Layer
- **MS10**: Distributed Event Streaming (Kafka/RabbitMQ abstraction)
- **MS11**: Global Compliance, AML, Fraud & Risk Platform
- **MS12**: AI Intelligence & Adaptive Fraud Detection
- **MS13**: Developer Platform, APIs, SDKs & Webhooks
- **MS14**: Merchant, Customer & Business Operations Platform
- **MS15**: Multi-Rail Network Integrations (Blockchain, Banking, Cards, Wallets)

## Tech Stack

- **Language**: TypeScript (strict mode)
- **Architecture**: Clean Architecture · DDD · CQRS · Event Sourcing · Hexagonal
- **Database**: PostgreSQL (raw SQL, no ORM)
- **Messaging**: Internal Event Bus (pluggable Kafka/RabbitMQ adapters)
- **Testing**: Jest

## Repository Structure

```
packages/           # All domain & infrastructure packages
  payments/         # Core payment domain
  routing-engine/   # Smart routing
  compliance/       # AML, Fraud, Sanctions
  ledger/           # Immutable double-entry ledger
  api-gateway/      # External API gateway
  merchants/        # Merchant management
  provider-framework/ # Universal provider abstraction
  ...               # 200+ packages across all milestones
src/                # Root application
tests/              # Integration & stress tests
```

## Getting Started

```bash
npm install
npm run build
npm test
```
