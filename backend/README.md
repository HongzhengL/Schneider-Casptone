# CS 620 Schneider Capstone Project - Team 2

## Members

- **Hongzheng Li** – Developer, Scrum Master, Scribe  
  📧 [hongzheng@cs.wisc.edu](mailto:hongzheng@cs.wisc.edu)

- **Tyler James Sussis** – Product Owner, UX  
  📧 [tsussis@wisc.edu](mailto:tsussis@wisc.edu)

- **Tianyuan Ru** – Developer, Testing Lead  
  📧 [tru@wisc.edu](mailto:tru@wisc.edu)

- **Yikai Chen** – Developer, Demo Coordinator  
  📧 [ychen2537@wisc.edu](mailto:ychen2537@wisc.edu)

## Project Structure

- `frontend/` – React + Vite starter application.
- `backend/` – Express API starter that pairs with the frontend.

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The backend listens on the port defined in `.env` (defaults to `3000`) and exposes basic routes for health checks and sample data that can be consumed by the frontend starter.
