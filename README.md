# TaskSphere 🌌

TaskSphere is a premium, collaborative two-tier Kanban board application built using modern web technologies and DevOps best practices. It features a stunning glassmorphic interface (Dark Space Theme) with drag-and-drop board mechanics, connected to a PostgreSQL database for real-time task status transitions.

---

## 🏗️ Architecture Overview

TaskSphere uses a classic **two-tier architecture**:

1. **Tier 1 (Web Logic & Client)**: 
   - A single-page React client built with **Vite** for maximum performance, featuring micro-animations and custom dark aesthetics.
   - Served by a **Node.js Express** server, which handles API routes (`/api/tasks`) and provides a health check dashboard (`/health`).
2. **Tier 2 (Database Data Store)**:
   - A **PostgreSQL** database that persists the board state, auto-migrating and seeding demo data on application startup.

---

## 🛠️ DevOps Integrations

TaskSphere comes loaded with ready-to-use DevOps pipelines and configurations:
- **Containerization**: Single-command container deployment via Docker & Docker Compose (`docker-compose.yml`).
- **Multi-Stage Build**: Highly optimized `Dockerfile` compilation that packages built static frontend assets and runtime backend code in a single minimal Node container.
- **CI/CD Pipeline (GitHub Actions)**: Workflow (`.github/workflows/ci-cd.yml`) that lints code, runs tests, and verifies Docker builds.
- **Jenkins Automation**: Included a declarative `Jenkinsfile` for enterprise CI/CD integration, which automates testing and Docker artifact packaging.
- **Infrastructure-as-Code (IaC)**: Standard Kubernetes manifests (`k8s/` folder) containing Deployment, ClusterIP/NodePort Services, ConfigMaps, PersistentVolumeClaims, and Secret templates for cloud deployments.
- **Microservice Healthchecks**: Real-time liveness/readiness probes mapped to the `/health` endpoint for auto-healing container networks.

---

## 🚀 How to Run TaskSphere

### Prerequisites
- Node.js (v18+)
- Docker Desktop (active)

### 💻 1. Development Mode (Hot-Reloading)
To run backend, frontend, and database in development mode:

#### Option A: One-click script (Windows)
Double-click `run-dev.bat`. This will:
1. Start the PostgreSQL Docker container.
2. Launch the backend Node server on `localhost:5000`.
3. Launch the React dev server on `localhost:5173`.
4. Open your default web browser to the dashboard.

#### Option B: Manual Startup
1. Run the database container:
   ```bash
   docker-compose up -d db
   ```
2. Install and launch the Backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
3. Install and launch the Frontend client:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

### 📦 2. Production Mode (Single-Container Docker Compose)
To compile the entire app and run it in production mode:

#### Option A: One-click script (Windows)
Double-click `run-prod.bat`. This compiles the frontend assets inside a temporary docker container, bundles it with the Express API server, and serves the unified web application on `http://localhost:5000`.

#### Option B: Manual Command
```bash
docker-compose up --build -d
```
Access the application at: `http://localhost:5000`

---

## ☸️ 3. Kubernetes Deployment (IaC)
To deploy the application to a local Kubernetes cluster (e.g. Minikube):

1. Start your cluster:
   ```bash
   minikube start
   ```
2. Configure your shell to use minikube's Docker daemon:
   ```bash
   minikube docker-env | Invoke-Expression
   ```
3. Build the Docker image inside minikube:
   ```bash
   docker build -t tasksphere-web:latest -f backend/Dockerfile .
   ```
4. Apply the Kubernetes configurations:
   ```bash
   kubectl apply -f k8s/
   ```
5. Get service URL to access the web board:
   ```bash
   minikube service tasksphere-web-service
   ```

---

## 🧪 Testing

Integration tests for the backend API endpoints are written with **Jest** and **Supertest** (with mock DB query clients):

To run tests:
```bash
cd backend
npm test
```
