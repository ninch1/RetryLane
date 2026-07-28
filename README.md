# RetryLane

RetryLane is a full-stack webhook delivery platform that sits between an event-producing application and a saved webhook destination.

A producer sends an event to RetryLane. RetryLane stores the event, forwards it as an HTTP POST request to the configured destination, and records whether the delivery succeeded or failed.

## How It Works

```text
Producer application
→ sends an event to RetryLane
→ RetryLane stores the event
→ RetryLane forwards the event to the saved destination
→ destination returns an HTTP response
→ RetryLane updates the event status
→ dashboard displays the result
```

Example event:

```json
{
  "type": "order.created",
  "payload": {
    "orderId": "123",
    "total": 50
  }
}
```

RetryLane treats the payload as arbitrary JSON. It validates the event envelope but does not depend on the payload's internal structure.

## Dashboard

![RetryLane dashboard](./images/dashboard.png)

## Features

- Create and delete webhook destinations
- Generate a unique event ingestion URL for each destination
- Copy ingestion URLs from the dashboard
- Submit test events from the dashboard
- Use predefined event and payload templates
- Validate JSON before submission
- Deliver webhook events synchronously
- Store events in PostgreSQL
- Track pending, successful, and failed events
- Display recent event history
- Handle rejected and unreachable destinations
- Validate API input with Zod
- Handle errors through centralized Express middleware

## Tech Stack

### Backend

- Node.js
- Express 5
- TypeScript
- PostgreSQL
- Prisma
- `pg`
- Zod
- Docker Compose

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- Native Fetch API

## Project Structure

```text
RetryLane/
├── client/
│   └── src/
│       ├── api/
│       ├── components/
│       └── types/
│
├── server/
│   ├── prisma/
│   └── src/
│       ├── controllers/
│       ├── errors/
│       ├── lib/
│       ├── middleware/
│       ├── routes/
│       └── services/
│
└── docker-compose.yml
```

## API Routes

### Destinations

```http
GET /api/destinations
POST /api/destinations
DELETE /api/destinations/:destinationId
```

### Events

```http
POST /api/destinations/:destinationId/events
GET /api/destinations/:destinationId/events
```

## Event Ingestion

Each destination has its own RetryLane ingestion URL:

```text
POST http://localhost:3000/api/destinations/:destinationId/events
```

Example request:

```bash
curl -X POST \
  http://localhost:3000/api/destinations/DESTINATION_ID/events \
  -H "Content-Type: application/json" \
  -d '{
    "type": "order.created",
    "payload": {
      "orderId": "123",
      "total": 50,
      "currency": "USD"
    }
  }'
```

RetryLane forwards the event to the saved destination in this format:

```json
{
  "id": "EVENT_ID",
  "type": "order.created",
  "payload": {
    "orderId": "123",
    "total": 50,
    "currency": "USD"
  }
}
```

A destination response with a status code from `200` to `299` is treated as successful.

Non-2xx responses and network failures mark the event as failed.

## Local Setup

### Prerequisites

Install:

- Node.js
- npm
- Docker Desktop

### 1. Clone the repository

```bash
git clone <repository-url>
cd RetryLane
```

### 2. Start PostgreSQL

From the directory containing `docker-compose.yml`:

```bash
docker compose up -d
```

Verify that PostgreSQL is running:

```bash
docker compose ps
```

### 3. Configure the backend

Create a `server/.env` file:

```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/retrylane?schema=public"
```

Install backend dependencies:

```bash
cd server
npm install
```

Apply database migrations:

```bash
npx prisma migrate dev
```

Generate Prisma Client:

```bash
npx prisma generate
```

Start the backend:

```bash
npm run dev
```

The API runs at:

```text
http://localhost:3000
```

### 4. Configure the frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

The dashboard runs at:

```text
http://localhost:5173
```

## Testing the Delivery Flow

1. Start PostgreSQL, the backend, and the frontend.
2. Create a destination from the dashboard.
3. For local testing, use:

```text
http://localhost:3000/api/test-receiver
```

4. Open the destination card.
5. Choose an event template or enter a custom event type.
6. Enter a valid JSON payload.
7. Send the event.
8. Confirm that the event appears in recent history with a `SUCCESS` or `FAILED` status.

## Available Scripts

### Backend

```bash
npm run dev
npm run build
npm run start
npm run typecheck
```

### Frontend

```bash
npm run dev
npm run build
npm run lint
```

## Current Architecture

RetryLane currently uses synchronous webhook delivery:

```text
Client submits event
→ API stores event
→ API sends webhook
→ API waits for destination response
→ API updates event status
→ API returns delivery result
```

This version was intentionally built before introducing queues so the limitations of synchronous delivery are easier to understand.

## Current Limitations

- Delivery is synchronous
- No automatic retries
- No background worker
- No Redis or BullMQ
- No authentication
- No API keys
- No HMAC signatures
- No idempotency protection
- No delivery-attempt history
- Destination response status codes are not persisted
- The frontend ingestion URL is currently configured for local development
- The original webhook proof-of-concept route still exists separately

## Possible Future Improvements

- Redis and BullMQ
- Background delivery worker
- Automatic retries
- Exponential backoff
- Final failed or dead-letter state
- Delivery-attempt history
- API-key authentication
- HMAC webhook signatures
- Idempotency keys
- Rate limiting
- Destination ownership checks
- Manual retry controls
- Worker health and delivery metrics
- Real-time dashboard updates

## Why This Project Was Built

RetryLane was built to explore backend engineering concepts beyond standard CRUD applications, including:

- Outbound HTTP delivery
- Failure handling
- Relational data modeling
- Asynchronous architecture
- Queues and background workers
- Retry strategies
- Idempotency
- Webhook security
- Observability

The project begins with a synchronous implementation and is designed to evolve into a more reliable queue-based delivery system.

## License

This project is for learning and portfolio purposes.
