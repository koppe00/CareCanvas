# CareCanvas — Opstartinstructies

## Vereisten

- Node.js >= 20
- pnpm >= 9 (`npm install -g pnpm`)
- Docker + Docker Compose

## 1. Omgevingsvariabelen instellen

```bash
cp infra/.env.example apps/api/.env
cp infra/.env.example apps/web/.env.local
# Pas de .env bestanden aan naar wens
```

Zodra u een Anthropic API key heeft:
```bash
# In apps/api/.env:
ANTHROPIC_API_KEY=sk-ant-uw-echte-key
```

## 2. Infrastructuur starten (Docker)

```bash
npm run docker:up
# Of handmatig:
docker compose -f infra/docker-compose.yml up -d
```

Services:
| Service        | URL                              |
|----------------|----------------------------------|
| PostgreSQL      | localhost:5432                   |
| Neo4j Browser   | http://localhost:7474             |
| Elasticsearch   | http://localhost:9200             |
| MinIO Console   | http://localhost:9001             |
| FHIR Server     | http://localhost:8080/fhir        |
| Redis           | localhost:6379                    |
| Kafka           | localhost:9092                    |

## 3. Dependencies installeren

```bash
pnpm install
# Of per app:
cd apps/api && npm install
cd apps/web && npm install
```

## 4. API starten

```bash
cd apps/api
npm run start:dev
# API: http://localhost:4001
# Swagger docs: http://localhost:4001/api/docs
```

## 5. Frontend starten

```bash
cd apps/web
npm run dev
# Web: http://localhost:4000
```

## 6. Verificatie

1. Open http://localhost:4000 — landingspagina
2. Klik "Gratis registreren" — maak een account aan
3. Log in → dashboard
4. Ga naar "Sparring-Partner" en chat met de AI (mock)
5. Maak een project aan via het formulier of de Sparring-Partner
6. Open het project → voer een Compliance-scan uit
7. Genereer specificaties (User Stories, datamodellen)
8. Open http://localhost:4001/api/docs — Swagger API documentatie

## Architectuur

```
CareCanvas/
├── apps/
│   ├── api/          NestJS backend (poort 4001)
│   └── web/          Next.js 14 frontend (poort 4000)
├── packages/
│   └── shared/       Gedeelde TypeScript types
└── infra/
    └── docker-compose.yml
```

## Claude API inschakelen

Zodra u een API key heeft van console.anthropic.com:

```bash
# apps/api/.env
ANTHROPIC_API_KEY=sk-ant-uw-key-hier
ANTHROPIC_MODEL=claude-sonnet-4-6
```

Herstart de API. De AiService schakelft automatisch van mock naar Claude.


git config --global user.name "Koppe00
git config --global user.email "erickoppelaar@gmail.com"