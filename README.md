## computeStore

computeStore is a modern cloud marketplace web application where users can:

- Register and log in
- Browse curated virtual machine offers
- Configure custom VMs (CPU, RAM, storage, OS)
- Add VMs to a cart and pay by card (simulated for now)
- Deploy VMs (provisioning stub, to be backed by Terraform + Huawei Cloud later)
- Monitor VM status and interact via a web console

### Stack

- **Frontend**: Next.js (App Router, TypeScript, Tailwind CSS) in the `frontend` directory
- **Backend**: FastAPI (Python) in the `backend` directory
- **Database**: PostgreSQL
- **Auth**: JWT-based authentication

### High-level architecture

- The **Next.js frontend** provides:
  - Authentication pages (sign up, sign in)
  - A modern dashboard-style layout
  - VM catalog browsing and search
  - VM configuration builder
  - Shopping cart and checkout flow
  - VM detail, monitoring, and console views

- The **FastAPI backend** exposes:
  - `/auth/*` endpoints for registration and login
  - `/offers/*` endpoints for VM offer catalog
  - `/cart/*` endpoints for cart management
  - `/checkout/*` endpoints for card payment (mock) and order creation
  - `/vms/*` endpoints for deployment, lifecycle, metrics, and console streams (simulated for now)

### Local development

#### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- PostgreSQL 14+ running locally (or in Docker)

#### Backend (FastAPI)

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Create and migrate the database (Alembic commands will be added later)

uvicorn app.main:app --reload --port 8000
```

#### Frontend (Next.js)

```bash
cd frontend
npm install  # if not already installed by the scaffold
npm run dev -- --port 3000
```

Then open `http://localhost:3000` in your browser. The frontend will talk to the FastAPI backend at `http://localhost:8000` by default.

