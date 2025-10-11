# Backend Starter - Express API

This directory contains a minimal Express.js setup that pairs with the React + Vite frontend starter. It provides a health check endpoint, environment configuration, and sensible defaults for local development.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the example environment variables and adjust as needed:
   ```bash
   cp .env.example .env
   ```
3. Start the development server with automatic reloads:
   ```bash
   npm run dev
   ```
4. The API will start on the port defined in your `.env` file (defaults to `3000`).

## Available Scripts

- `npm run dev` – start the server using Nodemon for live reload during development.
- `npm start` – start the server without Nodemon (suitable for production).

## API Routes

- `GET /api/health` – returns the service status and a timestamp.
- `GET /api/message` – returns a welcome message. Use this route to verify connectivity from the frontend starter.

## Project Structure

```
backend/
├── .env.example       # Example environment variables
├── .gitignore         # Node-specific ignores
├── package.json       # Dependencies and scripts
└── src/
    └── server.js      # Express application entry point
```

Feel free to add routes, middleware, database clients, and other backend functionality to meet your project's requirements.
