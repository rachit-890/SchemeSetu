# SchemeSetu

SchemeSetu bridges everyday citizens to the government welfare schemes — subsidies, scholarships, pensions — they actually qualify for, explained in plain language.

## Monorepo Structure

- **`/backend`**: Spring Boot 3 (Java 21) backend service built with Maven, PostgreSQL (pgvector), Redis, Flyway, and Spring AI (Google Gemini).
- **`/frontend`**: React + Vite + TypeScript single-page application with Tailwind CSS and Lucide icons.
- **`render.yaml`**: Infrastructure-as-Code blueprint for deploying Backend, PostgreSQL, and Redis to Render.
- **`docker-compose.yml`**: Local infrastructure configuration for PostgreSQL 16 (`pgvector`) and Redis 7.
- **`/docs`**: Project documentation directory.

## Documentation

Project documentation can be found in the [/docs](./docs) directory:
- [Deployment Checklist & Post-Deploy Verification](./docs/deployment-checklist.md)

---

## Local Development Getting Started

### Prerequisites

- Java 21+ (OpenJDK / Temurin)
- Node.js 20+ & npm
- Docker & Docker Compose

### 1. Running Local Infrastructure

Start local development dependencies (PostgreSQL 16 with pgvector extension & Redis 7):

```bash
docker compose up -d
```

### 2. Running Backend Locally

Ensure `GEMINI_API_KEY` and `ADMIN_API_KEY` are exported in your environment:

```bash
cd backend
export GEMINI_API_KEY="your-gemini-api-key"
export ADMIN_API_KEY="your-admin-api-key"
./mvnw spring-boot:run
```

The backend server starts at `http://localhost:8080`.

### 3. Running Frontend Locally

```bash
cd frontend
npm install
npm run dev
```

The frontend development server starts at `http://localhost:5173`.

---

## Production Deployment (Render + Vercel)

SchemeSetu is architected for cloud deployment across two platforms:
- **Backend & Data Tier (Render)**: Spring Boot containerized web service, Managed PostgreSQL 16 (with `pgvector`), and Redis.
- **Frontend SPA (Vercel)**: React/Vite client built directly from the repository.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Vercel (Frontend SPA)                         │
│                    https://schemesetu.vercel.app                        │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTPS (VITE_API_BASE_URL)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Render (Backend Private Network)                     │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │ schemesetu-backend (Web Service / Dockerfile)                   │   │
│   │ https://schemesetu-backend.onrender.com                         │   │
│   └───────────────┬─────────────────────────────────┬───────────────┘   │
│                   │ JDBC / SQL                      │ RESP / TCP        │
│                   ▼                                 ▼                   │
│   ┌───────────────────────────────┐ ┌───────────────────────────────┐   │
│   │ schemesetu-db (PostgreSQL 16) │ │ schemesetu-redis              │   │
│   │ Extension: vector (pgvector)  │ │ (Private Redis Service)       │   │
│   └───────────────────────────────┘ └───────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Step 1: Backend Deployment on Render

Render's managed PostgreSQL natively supports the `pgvector` extension on **all PostgreSQL 13+ instances (including Starter and higher tiers)** with no plan-tier restrictions (refer to [Render PostgreSQL Extensions Documentation](https://render.com/docs/postgresql-extensions)).

You can deploy the backend using either the automated **Render Blueprint** (`render.yaml`) or the **Manual Dashboard**.

#### Option A: Automated Deploy via Render Blueprint (`render.yaml`)
1. Log in to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** > **Blueprint**.
3. Connect your GitHub repository (`SchemeSetu`).
4. Render will detect `render.yaml` and provision:
   - `schemesetu-db`: Managed PostgreSQL 16 instance.
   - `schemesetu-redis`: Private Redis service.
   - `schemesetu-backend`: Web service configured with `backend/Dockerfile`.
5. When prompted, fill in the non-synced environment variables:
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
   - `ADMIN_API_KEY`: A secure random secret string for admin operations.
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g. `https://schemesetu.vercel.app` or `http://localhost:5173` initially).
6. Click **Apply**.

#### Option B: Manual Render Dashboard Setup
If configuring services individually via the dashboard:

1. **Create Managed PostgreSQL Database**:
   - Go to **New +** > **PostgreSQL**.
   - **Name**: `schemesetu-db`
   - **Database**: `schemesetu`
   - **User**: `schemesetu_user`
   - **PostgreSQL Version**: `16`
   - Once provisioned, note the **Internal Database URL** (e.g., `postgresql://schemesetu_user:...@dpg-...-a:5432/schemesetu`).
   - Open the **Connect** dropdown > **Web Shell** (or `psql`) and verify the `vector` extension is active:
     ```sql
     CREATE EXTENSION IF NOT EXISTS vector;
     SELECT * FROM pg_extension WHERE extname = 'vector';
     ```

2. **Create Redis Service**:
   - Go to **New +** > **Private Service** (or Render Key-Value).
   - **Name**: `schemesetu-redis`
   - **Image URL**: `redis:7-alpine`
   - Note the internal hostname (e.g. `schemesetu-redis`) and port (`6379`).

3. **Create Backend Web Service**:
   - Go to **New +** > **Web Service**.
   - Connect your repository.
   - **Name**: `schemesetu-backend`
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `./backend/Dockerfile`
   - **Docker Build Context**: `./backend`
   - **Health Check Path**: `/api/v1/schemes`
   - Configure the following **Environment Variables**:

| Variable Name | Value / Description | Example |
| :--- | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | `prod` | `prod` |
| `GEMINI_API_KEY` | Google Gemini API Key | `AIzaSy...` |
| `ADMIN_API_KEY` | Admin Secret Key for Ingestion & Translation APIs | `prod-admin-secret-key-32chars` |
| `FRONTEND_URL` | Vercel production origin (for CORS policy) | `https://schemesetu.vercel.app` |
| `SPRING_DATASOURCE_URL` | JDBC URL for Render Postgres (Internal) | `jdbc:postgresql://dpg-xxxx-a:5432/schemesetu` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `schemesetu_user` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `<render-generated-db-password>` |
| `SPRING_DATA_REDIS_HOST` | Internal hostname of Redis service | `schemesetu-redis` |
| `SPRING_DATA_REDIS_PORT` | Redis port | `6379` |

4. Click **Create Web Service**. Flyway migrations (`V1` through `V8`) and the PGVectorStore schema will automatically initialize on first startup.

---

### Step 2: Frontend Deployment on Vercel

The frontend is a single-page React application that is built directly by Vercel without requiring a container image.

1. Log in to [Vercel Dashboard](https://vercel.com) and click **Add New...** > **Project**.
2. Import your GitHub repository (`SchemeSetu`).
3. Configure the **Project Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` and select `frontend` (or type `frontend`).
   - **Build Command**: `npm run build` (or leave default Vite configuration).
   - **Output Directory**: `dist` (default for Vite).
   - **Install Command**: `npm ci` (or `npm install`).
4. Configure **Environment Variables**:

| Variable Name | Value / Description |
| :--- | :--- |
| `VITE_API_BASE_URL` | Public URL of your deployed Render backend (e.g. `https://schemesetu-backend.onrender.com` without trailing slash) |

5. Click **Deploy**.
6. Once deployed, copy your assigned Vercel URL (e.g. `https://schemesetu-xxx.vercel.app`) and update the `FRONTEND_URL` environment variable in your Render backend dashboard to ensure CORS requests are accepted.

---

### Step 3: Post-Deployment Verification

Refer to [docs/deployment-checklist.md](./docs/deployment-checklist.md) for the end-to-end verification checklist after deployment.
