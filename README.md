# DocFlow

DocFlow is a collaborative, browser-based document editor. It provides user accounts, rich-text documents, role-based sharing, and live collaboration signals such as document updates, presence, typing indicators, and cursor positions.

The project is built as a small microservices system: a React frontend communicates with Spring Boot services through an API gateway, while a dedicated WebSocket service distributes realtime events.

## Features

- Account registration, login, logout, and refresh-token authentication.
- JWT-protected routes and API requests.
- Create, list, open, update, and delete documents.
- Rich-text editing using Tiptap (headings, bold, italic, underline, lists, quotes, and code blocks).
- Document sharing by email with `EDITOR` and `VIEWER` roles.
- A dashboard for owned documents and documents shared with the current user.
- Live document-content broadcasts, active-user presence, typing status, and cursor position broadcasts.
- Service discovery through Eureka and API routing through Spring Cloud Gateway.

## Architecture

```text
                         +--------------------------+
                         | React / Vite web app     |
                         | http://localhost:5173    |
                         +------------+-------------+
                                      | REST
                                      v
                         +--------------------------+
                         | API gateway              |
                         | http://localhost:8080    |
                         +---------+-------+--------+
                                   |       |
                                  v         v
                    +----------------+  +------------------+
                    | User service   |  | Document service |
                    | :8081          |  | :8082            |
                    +-------+--------+  +---------+--------+
                            |                     |
                            +----------+----------+
                                       v
                              +----------------+
                              | PostgreSQL     |
                              | localhost:5432 |
                              +----------------+

  The web app also opens a SockJS/STOMP connection directly to:
  Collaboration service (WebSocket): http://localhost:8083/ws

  All backend services register with Eureka: http://localhost:8761
```

## Project layout

```text
DocFlow /
├── Backend/
│   ├── eureka-server/          # Eureka service registry
│   ├── api-gateway/            # REST routing gateway
│   ├── user-service/           # Accounts, passwords, JWT and refresh tokens
│   ├── document-service/       # Documents, access roles and sharing
│   └── collaboration-service/  # STOMP/WebSocket realtime events
├── frontend/
│   └── web-app/                # React + Vite client
├── infrastructure/
│   └── docker-compose.yml      # PostgreSQL and pgAdmin for local development
└── docs/                       # Project documentation/assets (if applicable)
```

## Technology stack

| Area | Technology |
| --- | --- |
| Frontend | React 19, Vite, React Router, Tailwind CSS |
| Editor | Tiptap |
| HTTP client | Axios |
| Realtime | SockJS, STOMP, Spring WebSocket |
| Backend | Java 21, Spring Boot, Spring Security, Spring Data JPA |
| Service infrastructure | Spring Cloud Gateway, Netflix Eureka |
| Database | PostgreSQL 16 |
| Build tools | Maven Wrapper and npm |

## Prerequisites

Install the following before running the application:

- Java Development Kit (JDK) 21
- Node.js 20 or newer with npm
- Docker Desktop and Docker Compose (recommended for the database)

On Windows, use PowerShell or Command Prompt. Maven does not need to be installed separately because each backend service includes Maven Wrapper scripts.

## Run locally

### 1. Start PostgreSQL

From the project root:

```powershell
cd infrastructure
docker compose up -d
```

This starts:

| Service | URL / port | Default credentials |
| --- | --- | --- |
| PostgreSQL | `localhost:5432` | database: `docflow`, user: `postgres`, password: `secret` |
| pgAdmin | http://localhost:5050 | email: `admin@docflow.com`, password: `admin` |

### 2. Start backend services

Run each command in a separate terminal, in this order.

```powershell
# Terminal 1 — service registry
cd Backend\eureka-server
.\mvnw.cmd spring-boot:run
```

```powershell
# Terminal 2 — authentication service
cd Backend\user-service
.\mvnw.cmd spring-boot:run
```

```powershell
# Terminal 3 — document service
cd Backend\document-service
.\mvnw.cmd spring-boot:run
```

```powershell
# Terminal 4 — realtime collaboration service
cd Backend\collaboration-service
.\mvnw.cmd spring-boot:run
```

```powershell
# Terminal 5 — HTTP gateway
cd Backend\api-gateway
.\mvnw.cmd spring-boot:run
```

Open the Eureka dashboard at http://localhost:8761 to confirm the services have registered. Start the gateway after the other services are available so its routes can resolve through Eureka.

### 3. Start the frontend

```powershell
cd frontend\web-app
npm install
npm run dev
```

Open the URL Vite prints in the terminal, normally http://localhost:5173. Register an account, then create a document from the dashboard.

### Stop local services

Stop the Java and Vite processes with `Ctrl+C`. To stop the database containers:

```powershell
cd infrastructure
docker compose down
```

To also remove the local PostgreSQL data volume, use `docker compose down -v`. This permanently removes local application data.

## Service ports and responsibilities

| Component | Port | Responsibility |
| --- | ---: | --- |
| Eureka server | 8761 | Registers and discovers backend services |
| API gateway | 8080 | Routes browser REST calls to services |
| User service | 8081 | Registration, login, logout, token refresh, current user |
| Document service | 8082 | Document persistence, document access, sharing |
| Collaboration service | 8083 | STOMP messages for edit/presence/typing/cursor events |
| PostgreSQL | 5432 | Stores user and document-service data |
| pgAdmin | 5050 | Database administration UI |
| Vite frontend | 5173 | React development server (default) |

## REST API overview

All URLs below are sent through the gateway at `http://localhost:8080` unless noted otherwise. Protected endpoints require the `Authorization: Bearer <access-token>` header; the frontend adds it automatically.

### Authentication

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create an account |
| `POST` | `/api/auth/login` | Sign in and receive access/refresh tokens |
| `POST` | `/api/auth/refresh` | Exchange a refresh token for a new access token |
| `POST` | `/api/auth/logout` | Invalidate a refresh token |
| `GET` | `/me` | Return a simple authenticated-user response |

Register request example:

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "choose-a-strong-password"
}
```

Login and registration return:

```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

### Documents

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/documents` | Create a document |
| `GET` | `/documents?page=0&size=10&sortBy=updatedAt` | List the caller's documents |
| `GET` | `/documents/{id}` | Retrieve an accessible document |
| `PUT` | `/documents/{id}` | Update a document |
| `DELETE` | `/documents/{id}` | Delete an owned document |
| `GET` | `/documents/shared` | List documents shared with the caller |
| `POST` | `/documents/{id}/share` | Add or update a collaborator |
| `GET` | `/documents/{id}/collaborators` | List collaborators |
| `DELETE` | `/documents/{id}/collaborators/{email}` | Remove a collaborator |

Create/update payload shape:

```json
{
  "title": "Project brief",
  "content": "<p>Rich-text HTML content</p>"
}
```

Share payload shape:

```json
{
  "userEmail": "collaborator@example.com",
  "role": "EDITOR"
}
```

Allowed collaborator roles are `EDITOR` and `VIEWER`. The document owner has `OWNER` access.

## Realtime collaboration protocol

The frontend connects to `http://localhost:8083/ws` with SockJS and STOMP. It sends messages under the `/app` prefix and listens under `/topic`.

| Client destination | Broadcast topic | Purpose |
| --- | --- | --- |
| `/app/document.edit` | `/topic/document/{documentId}` | Sends the full current document HTML |
| `/app/document.join` | `/topic/presence/{documentId}` | Registers a participant and broadcasts current users |
| `/app/document.leave` | `/topic/presence/{documentId}` | Removes a participant and broadcasts current users |
| `/app/document.typing` | `/topic/typing/{documentId}` | Announces typing status |
| `/app/document.cursor` | `/topic/cursor/{documentId}` | Broadcasts a cursor selection position |

The collaboration service currently relays events in memory. It does not persist realtime changes or perform operational-transform/conflict-resolution logic; document data is saved by the document service when the user clicks **Save**.

## Configuration

Current development configuration is stored in each service's `src/main/resources/application.yml`:

- The database points to `jdbc:postgresql://localhost:5432/docflow`.
- JPA uses `ddl-auto: update`, which automatically evolves the local schema.
- Access tokens expire after 15 minutes; refresh tokens expire after 7 days.
- The frontend REST base URL is hard-coded to `http://localhost:8080`.
- The frontend realtime endpoint is hard-coded to `http://localhost:8083/ws`.

For production, provide database credentials, JWT secret, allowed frontend origins, and public endpoint URLs through environment-specific configuration or a secret manager. Do not retain the supplied development passwords or JWT secret.

## Development commands

### Frontend

```powershell
cd frontend\web-app
npm run dev      # Start Vite development server
npm run build    # Create a production build
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

### Backend tests

Each Maven module can be tested individually:

```powershell
cd Backend\document-service
.\mvnw.cmd test
```

Repeat from the other service directories as needed.

## Current limitations and production considerations

- WebSocket origins are currently permissive (`*`); restrict them to the deployed frontend origin.
- The collaboration service is unauthenticated at the WebSocket layer, so authorization should be added before production use.
- Realtime updates send entire document HTML and use last-message-wins behavior; concurrent editing can overwrite another user's unpersisted changes.
- The in-memory presence service will not share participant state across multiple service instances. A shared broker/store is needed when scaling.
- API and WebSocket URLs are local-development values and should be environment-configurable.
- The root README has been restored by this file; keep setup changes documented here as the services evolve.
