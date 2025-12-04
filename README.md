# CS 620 Schneider Capstone Project – Team 2

## Team Members

- **Hongzheng Li** – Developer, Scrum Master, Scribe
  📧 hongzheng@cs.wisc.edu

- **Tyler James Sussis** – Product Owner, UX
  📧 tsussis@wisc.edu

- **Tianyuan Ru** – Developer, Testing Lead
  📧 tru@wisc.edu

- **Yikai Chen** – Developer, Demo Coordinator
  📧 ychen2537@wisc.edu

## Project Overview

This repository contains the final capstone project for **CS 620** in collaboration with
**Schneider**. The goal of this project is to create a driver‑facing web application that
helps owner‑operators and company drivers manage their business by:

- Viewing suggested and confirmed loads and searching for additional loads.
- Tracking profitability through customizable settings such as fuel, maintenance,
  tire costs and margins.
- Booking loads and confirming appointments.
- Viewing weekly coverage of fixed costs and a running cost per mile (RCM) to
  understand earnings vs. expenses.
- Viewing a driver portal with performance metrics, wallet information, notices,
  and leaderboard standings.

The application is split into a **frontend** built with React/TypeScript and a
**backend** built with Node.js/Express. **Supabase** is used for authentication and as
a database to store user‑specific profitability settings.

## Repository Structure

```
.
├── backend       # Express API for auth, loads, profiles & coverage
│   ├── src
│   │   ├── config      # Env & Supabase config
│   │   ├── routes      # Auth, profiles, profitability, coverage
│   │   ├── data        # Mock data (loads, profiles, metrics, runs)
│   │   ├── middleware  # Auth guard & error handling
│   │   └── utils       # Supabase client & service functions
│   ├── .env.example    # Sample environment variables
│   └── README.md
├── frontend      # React + Vite SPA
│   ├── src
│   │   ├── components  # Pages and reusable UI components
│   │   ├── contexts    # React contexts for auth & theme
│   │   ├── services    # API wrappers for backend & Supabase
│   │   ├── constants   # Default filter & profitability settings
│   │   └── utils       # Helper functions
│   ├── index.html      # Vite entry point
│   ├── tsconfig.json   # TypeScript config
│   ├── vite.config.ts  # Vite config
│   └── README.md
├── docs          # Additional documentation
├── package.json  # Root package config enabling workspaces
└── README.md     # (this file)
```

## Getting Started

### Prerequisites

- **Node.js** ≥ 18 and **npm** (or `pnpm`, `yarn`) installed.
- A [Supabase](https://supabase.com/) project. You’ll need a Supabase URL and an API
  key to enable authentication and persistence of profitability settings.

### Installation

1. **Clone the repository** and install root dependencies:

    ```bash
    git clone https://github.com/HongzhengL/Schneider-Casptone.git
    cd Schneider-Casptone
    npm install
    ```

    The repository uses
    [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces) to manage
    the **backend** and **frontend** packages.

2. **Set environment variables**:
    - Copy `backend/.env.example` to `backend/.env` and adjust values:

        ```bash
        cd backend
        cp .env.example .env
        # Edit .env and set:
        # PORT=4000                          # Port for backend (default 4000)
        # FRONTEND_URL=http://localhost:5173 # URL of the frontend dev server
        # SUPABASE_URL=<your Supabase URL>
        # SUPABASE_KEY=<your Supabase service role key>
        ```

    - Supabase credentials are only required if you wish to enable authentication and
      the profitability settings API. Without these values the backend runs in
      “mock” mode and exposes health, load search and other endpoints using
      in‑memory data.

3. **Set up the database (optional)**:

    To persist profitability settings, create the `profitability_settings` table in
    Supabase. Run the SQL script located at
    `sql/profitability-settings-schema.sql` in the Supabase SQL editor. See
    `docs/profitability-settings-api.md` for a full description of the API,
    including authentication requirements, endpoints, expected request/response
    payloads, error codes and security considerations.

### Running the Application

Open two terminals—one for the backend and one for the frontend.

- **Backend**

    ```bash
    cd backend
    npm install
    npm run dev
    ```

    The backend will start on the port defined in `backend/.env` (`4000` by default). It
    exposes REST endpoints under `/api`, including:
    - `GET /api/health` – simple health check.
    - `GET /api/loads/suggested` – suggested loads for the driver home page.
    - `GET /api/loads/find` – find loads with filters like distance, revenue, destination
      and weight.
    - `GET /api/profitability/coverage` – driver’s fixed cost coverage for the current
      week. The calculation is in `backend/src/utils/coverage.js` and can be unit
      tested with a `referenceDate` query param (see `docs/assumptions.md`).
    - `GET/PUT/POST /api/profitability/settings` – fetch or save the authenticated
      user’s profitability settings. Auth is via Supabase; see
      `docs/profitability-settings-api.md`.
    - `GET /api/driver/portal` – returns driver profile, wallet, menu sections,
      performance summary and app version.
    - Additional endpoints for driver notices, metrics, leaderboard and profiles.

- **Frontend**

    ```bash
    cd frontend
    npm install
    npm run dev
    ```

    The frontend runs at `http://localhost:5173` by default. It’s a single‑page
    application built with **React**, **TypeScript** and **Vite**. Important
    pages/components include:
    - `HomePage` – shows suggested loads, weekly coverage and quick links.
    - `NoticePage` – displays messages and notices for the driver.
    - `SearchPage` and `FindLoadsResultsPage` – allow searching for loads based on
      filters (distance, RPM, weight, destination, etc.).
    - `LoadDetailPage`, `BookLoadConfirmationPage` and `BookLoadConfirmedPage` –
      handle the booking workflow.
    - `ProfitabilitySettingsPage` – form for editing profitability settings which
      persist via the backend API.
    - `LeaderboardPage`, `SettingsPage`, `MorePage` – additional features.

    Authentication and session state are handled via the `AuthContext` using
    Supabase. The UI uses Radix UI components and Tailwind CSS. Toast notifications
    are provided by `sonner`.

### Scripts

At the root you can run:

- `npm run format:check` – check formatting using Prettier.
- `npm run format:write` – automatically format code.
- `npm run lint:all` – run ESLint in both workspaces.

Within each workspace you can run `npm run lint` to lint that package, and
`npm run test` if tests are added in the future.

## Additional Documentation

- **Assumptions & Design Decisions** – see `docs/assumptions.md` for details on
  assumptions around fixed cost coverage and how calculations are mocked for
  demos.
- **Profitability Settings API** – see
  `docs/profitability-settings-api.md` for a full description of the settings
  API endpoints, request/response formats and Supabase integration.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
