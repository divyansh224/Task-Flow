# TaskFlow API

A portfolio-ready task management backend built with Node.js, Express, MongoDB, Mongoose, JWT, and Zod. It demonstrates REST API design, authentication, authorization, validation, pagination, filtering, API documentation, and automated tests.

> **Verification note:** This project was generated in an environment where npm registry access and a MongoDB service were unavailable. Source-level checks can be run here, but dependency installation, integration tests, and live database behavior must be verified locally before claiming the project is fully tested or production-ready.

## Features

- Register/login with bcrypt password hashing and JWT access tokens.
- Protected profile endpoints and documented stateless logout behavior.
- Task CRUD with per-user ownership enforced inside MongoDB queries.
- Status, priority, tag, text search, pagination, sorting, and task statistics.
- Zod request validation, Helmet, CORS allowlist, body-size limits, and auth rate limiting.
- Consistent JSON errors, health check, OpenAPI JSON, and Swagger UI.
- Graceful HTTP/database shutdown and isolated MongoDB-memory-server tests.

## Stack

Node.js 20+, modern JavaScript ES modules, Express 4, MongoDB/Mongoose, JWT, bcryptjs, Zod, Helmet, cors, express-rate-limit, Morgan, Swagger UI, Jest, Supertest, and mongodb-memory-server.

## Architecture

```text
src/
  app.js                 Express app construction (does not listen)
  server.js              environment, DB connection, HTTP server, shutdown
  config/                environment and database setup
  models/                Mongoose User and Task schemas
  routes/                endpoint-to-middleware/controller mapping
  controllers/           HTTP request/response handling
  services/              authentication and task business logic
  middleware/            auth, validation, 404, error handler
  validators/            Zod request schemas
  utils/                 ApiError and asyncHandler
  docs/openapi.js         OpenAPI 3 specification
 tests/                   Jest + Supertest integration tests
```

### Request lifecycle

A request enters Express and passes security/logging/body middleware. A route applies authentication and Zod validation, then invokes a controller. The controller calls a service for business logic; the service queries Mongoose models. The controller sends a consistent JSON response. Async errors flow to the centralized error handler through `asyncHandler`.

### Important design decisions

- **JWT:** the server signs short-lived access tokens and verifies signature, expiry, issuer, and audience. The token contains a subject identifying the user. Logout is deliberately stateless: it tells the client to discard the token; it does not revoke it server-side. Use a token denylist or refresh-token rotation if revocation is required.
- **Password storage:** bcrypt hashes passwords using a work factor of 12. Hashing is one-way; unlike encryption, it is not intended to be decrypted.
- **Ownership:** every task lookup/update/delete includes both `_id` and the authenticated `owner` in the database query. A user cannot access another user's task by guessing its ID.
- **Mass assignment:** Zod schemas reject unknown fields such as `owner`, `_id`, and MongoDB operators. Update operations use only validated fields.
- **Pagination/filtering:** page and limit are parsed with defaults and a maximum page size of 100. Only recognized sort keys are used. Search text is escaped before being used as a regular expression.
- **Indexes:** indexes on owner/status/priority/dueDate support common filters. Indexes speed up reads but consume storage and add work to writes.
- **Middleware:** Express middleware runs in registration order and can inspect/modify the request, end the response, or pass control with `next()`.

## Prerequisites

- Node.js 20 or newer and npm.
- MongoDB Community Server locally, or a MongoDB Atlas cluster.

## Installation

```bash
git clone <your-github-repository-url>
cd taskflow
npm install
cp .env.example .env
```

Generate a strong secret (example command):

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Put the generated value into `JWT_SECRET` in `.env`. Do not commit `.env`.

### Local MongoDB

Start MongoDB Community Server and keep the default URI:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/taskflow
```

### MongoDB Atlas

Create a cluster and database user in Atlas, allow your current IP in Network Access, and copy the Node.js connection string. Set it as `MONGODB_URI` in `.env`; URL-encode special characters in the database username/password. Never paste the URI into public source code or issues.

## Run

```bash
npm run dev       # watch mode
npm start         # normal start
npm test          # integration tests (uses an ephemeral MongoDB instance)
npm run test:coverage
npm run lint
```

The API defaults to `http://localhost:4003`. Health check: `GET /health`. Swagger UI: `GET /api-docs`. Raw OpenAPI document: `GET /openapi.json`.

## Environment variables

| Variable | Purpose | Default |
|---|---|---|
| `PORT` | HTTP port | `4003` |
| `NODE_ENV` | `development`, `test`, or `production` | `development` |
| `MONGODB_URI` | MongoDB connection string | local taskflow database |
| `JWT_SECRET` | JWT signing secret (minimum 32 characters) | required from `.env` |
| `JWT_EXPIRES_IN` | JWT expiry (jsonwebtoken format) | `15m` |
| `CORS_ORIGIN` | Comma-separated allowed origins | `http://localhost:3000` |

## API endpoints

All endpoints use the `/api/v1` prefix. Protected endpoints require `Authorization: Bearer <accessToken>`.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Create account |
| POST | `/auth/login` | No | Get access token |
| GET | `/auth/me` | Yes | Current profile |
| PATCH | `/auth/me` | Yes | Update name/email/password |
| POST | `/auth/logout` | Yes | Stateless logout guidance; client discards token |
| POST | `/tasks` | Yes | Create task |
| GET | `/tasks` | Yes | List own tasks |
| GET | `/tasks/:id` | Yes | Read own task |
| PATCH | `/tasks/:id` | Yes | Update own task |
| DELETE | `/tasks/:id` | Yes | Delete own task (204) |
| PATCH | `/tasks/:id/status` | Yes | Change task status |
| GET | `/tasks/stats` | Yes | Task counts including overdue |

List query parameters: `page`, `limit` (max 100), `status`, `priority`, `tag`, `search`, `sortBy` (`createdAt`, `dueDate`, `priority`, `updatedAt`), and `sortOrder` (`asc`, `desc`).

## Example requests

Register:

```bash
curl -X POST http://localhost:4003/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Divyansh","email":"divyansh@example.com","password":"change_this_password"}'
```

Login and copy `data.accessToken` from the response:

```bash
curl -X POST http://localhost:4003/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"divyansh@example.com","password":"change_this_password"}'
```

Create a task (replace `YOUR_TOKEN`):

```bash
curl -X POST http://localhost:4003/api/v1/tasks \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{"title":"Prepare Node.js interview","priority":"high","tags":["career","interview"]}'
```

Filter and paginate:

```bash
curl 'http://localhost:4003/api/v1/tasks?page=1&limit=10&status=pending&search=interview&sortBy=createdAt&sortOrder=desc' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

## Response examples

Success:

```json
{"success":true,"message":"Tasks retrieved successfully","data":[],"meta":{"page":1,"limit":10,"total":0,"totalPages":0,"hasNextPage":false,"hasPreviousPage":false}}
```

Error:

```json
{"success":false,"message":"Request validation failed","errors":[{"field":"title","message":"Required"}]}
```

## Authentication flow

1. Registration validates input and saves a bcrypt password hash.
2. Login verifies the password and signs a JWT with a subject (`sub`) set to the user's ID and a configured expiry.
3. The client sends the JWT as a Bearer token for private endpoints.
4. Authentication middleware verifies the JWT and loads the current user.
5. The client discards its token at logout. Since this is stateless access-token auth, the token is still valid until expiry; server-side revocation is not implemented.

## Security checklist

- Never commit `.env`, database credentials, tokens, or real user data.
- Use HTTPS and a strong unique `JWT_SECRET` in production.
- Set `CORS_ORIGIN` to explicit trusted origins; do not use `*` for a credentialed browser deployment.
- Configure Atlas network access narrowly and use a least-privilege database user.
- Use a reverse proxy/trusted proxy configuration before relying on client IP rate limiting in production.
- Consider token revocation/refresh rotation, account verification, password reset, audit logging, and stricter operational monitoring before a real production launch.

## Troubleshooting

- **Invalid environment configuration:** ensure `.env` exists and `JWT_SECRET` is at least 32 characters.
- **MongoDB connection timeout:** confirm the local service is running, or check Atlas IP allowlist, URI, and database user.
- **CORS error:** add the frontend origin to `CORS_ORIGIN` (comma-separated for multiple origins).
- **Tests cannot download MongoDB binary:** `mongodb-memory-server` may need internet access on first run. Use a pre-provisioned test MongoDB only if it is isolated; never point tests at production.
- **Port already in use:** change `PORT` in `.env`.

## Future improvements

Refresh-token rotation and revocation, email verification/password reset, role-based access control, audit events, CI pipeline, containerization, deployment, and monitoring.

## Resume description

**TaskFlow — Task Management REST API:** Built a modular Node.js/Express REST API with MongoDB/Mongoose, JWT authentication, bcrypt password hashing, Zod validation, per-user task authorization, paginated filtering/search/sorting, task analytics, Swagger documentation, centralized error handling, and Jest/Supertest integration tests.
