# TryFirst

Browse online, reserve locally, verify before you buy.

A hyperlocal fashion platform: customers find live stock at nearby shops,
reserve items, check quality and fit in person, then buy.

Core loop: Discover -> Reserve -> Shopkeeper prepares -> Customer verifies -> Purchase

## Stack
- Backend: NestJS + TypeScript (modular monolith)
- Database: PostgreSQL (pgvector image), Redis
- Frontend: React + Vite + Tailwind
- Infra: Docker Compose

## Architecture decisions
- Modular monolith, not microservices: one deployable app with clear modules
  (auth, shops, products, reservations, planner, recommendations, quality-check).
  There is no independent scaling need that would justify the extra complexity.
- Postgres is the source of truth for stock. Every stock change writes a row
  to inventory_events, so any number can be traced back.
- Row lock before Redis: overselling was a database read problem, so it is
  fixed in the database (SELECT ... FOR UPDATE inside a transaction).
  Redis is only used for health checks so far. A Redis lock could later be a
  fast-fail layer in front, but it is not needed for correctness.

## Reservation concurrency (the main engineering story)
Problem: two customers reserving the last unit at the same moment.

Reproduced first, then fixed:
- Without a lock, 60 parallel requests for 1 unit gave 8 successful
  reservations (overselling).
- With a row lock, the same test gives exactly 1.

How it works:
1. The reservation runs in one transaction.
2. The variant row is locked (pessimistic write), so concurrent requests queue.
3. Stock is checked, decreased, the reservation and an audit event are saved.
4. Idempotency-Key header: a retried request returns the same reservation.
   A unique index on (customerId, idempotencyKey) covers simultaneous retries.
5. A scheduled job releases holds that expire (30 minutes) and returns stock.

Run the proof: npm run test:race (in backend/, with the server running).
Note: the test uses separate curl processes, because fetch inside one Node
process is not concurrent enough to trigger the race.

## Features
- Auth with JWT and roles (customer, shopkeeper), owner-only product creation
- Product search with filters (name, category, size, color, price)
- Reservations: create, list, cancel, shopkeeper marks purchased
- Quality check: 3-item checklist and 4 ratings per reservation
- Time-boxed shopping planner: budget + time + occasion gives plans with a
  computed time saved (assumptions are returned in the API response)
- Recommendations: cosine similarity over category, color, size and price,
  with a plain-language reason for each result
- Shopkeeper dashboard (create shop and products, see reservations)

## Run it
1. docker compose up -d
2. cd backend && npm install && npm run start:dev
3. cd backend && npm run seed      (6 fake shops, 30 products)
4. cd frontend && npm install && npm run dev

Copy .env.example to .env first.

## Known limits and future work
- Schema uses synchronize: true; real migrations are still to do.
- Not built yet: WebSocket live updates, distance filter, stock confidence
  indicator, natural-language search and AI assistant.
- Deliberately not built: microservices, Kafka, Elasticsearch, trained ML.
