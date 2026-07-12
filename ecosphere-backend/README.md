# EcoSphere ESG Management Platform Backend

Backend server powering the EcoSphere ESG Platform, built with Express, TypeScript, and MongoDB.

## Features
- **Scope 1/2/3 Carbon Emissions auto-calculations** with configurable scopes/factors.
- **CSR activities and gamified challenges** awarding XP/points to employees.
- **Badge Awarding Engine** running idempotently on XP/challenge updates.
- **Atomic Reward Redemption** using MongoDB transactions preventing race-conditions.
- **Scheduled Jobs** (Compliance overdue checks, challenge deadline reminders) running via `node-cron` and triggering notifications.
- **Centralized Notifications System** with pagination and read states.
- **Compliance Tracking & Audits** mapping overdue statuses and owners.
- **ESG singleton configuration settings** for scorers, weights, and auto-calculators.
- **CSV, Excel (XLSX), and PDF reports export** with data previews streaming.
- **Robust uploads** supporting Multer configurations, size checks (5MB limit), and file validation.

## Production Readiness Setup
- **Helmet with Content Security Policy (CSP)** for secure client header protection.
- **Rate limiting** restricting requests (100 req/min for auth endpoints).
- **Structured logging using Pino** attaching context request-ids.
- **Graceful lifecycle shutdowns** handling `SIGTERM` / `SIGINT` to cleanly close server listeners and database connections.
- **Input sanitization** via `express-mongo-sanitize` defending against NoSQL injection.
- **Health status check** (`GET /health`) checking DB ready state.

---

## Setup & Running

### 1. Prerequisites
- **Node.js** (v18+)
- **npm** (v9+)
- **MongoDB** (local connection or Atlas Cluster link)

### 2. Environment Variables
Duplicate the example configurations:
```bash
cp .env.example .env
```
Fill out the variables inside `.env`:
- `MONGODB_URI`: Link string to your database.
- `JWT_SECRET`: Signing token.
- `VITE_FRONTEND_URL`: CORS allowed origin.

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Seeding
To populate initial collections (departments, emission factors, employees, configs, audit logs, challenges):
```bash
# Reset database and insert seed records:
SEED_RESET=true npm run seed

# Upsert seed records without resetting:
SEED_RESET=false npm run seed
```

### 5. Running the Application
```bash
# Start in development mode:
npm run dev

# Compile and build files:
npm run build

# Start in production mode:
npm start
```

### 6. Swagger API Docs
Interactive API Swagger documentation is served at:
`http://localhost:5000/api-docs`

---

## Running Verification Tests
Tests use `mongodb-memory-server` ensuring they run completely isolated in-memory without mutating the main database cluster.
```bash
npm run test
```

---

## Render Deployment Guide (Free Tier)

This project contains a [render.yaml](file:///Users/savansolanki/Desktop/EcoSphere/EcoSphere-ESG-Management-Platform/ecosphere-backend/render.yaml) file at the root directory to enable easy Infrastructure as Code (IaC) deployment on **Render's Free Tier**.

### Deployment Configurations
* **Build Command**: `npm install && npm run build`
* **Start Command**: `npm run start`

### Required Environment Variables
Configure these variables in the Render Dashboard when deploying:
- `MONGODB_URI`: Your production MongoDB Atlas connection string URI.
- `JWT_SECRET`: A secure random secret key (minimum 10 characters) used to sign/verify JWTs.
- `JWT_EXPIRES_IN`: Defaults to `7d`.
- `PORT`: Set to `5000` (Render will automatically route traffic to this port).
- `NODE_ENV`: Set to `production`.
- `SEED_RESET`: Set to `false` (prevents resetting DB collections during production app starts).
- `VITE_FRONTEND_URL`: **IMPORTANT** Set this value to the deployed URL of your frontend application to allow CORS requests to succeed.

