# Schneider-Casptone Enhancements – Release Notes

## Overview

This release introduces support for saved search profiles and origin selection
to the load search feature. The backend now exposes a `/api/profiles`
endpoint for retrieving profiles and applies profile filters when searching for
loads via `/api/loads/find`. The frontend has been updated to allow users to
select an origin as well as a saved profile, with profile values
automatically populating the search form. Unit tests for both the backend and
frontend ensure critical pieces of functionality continue to work as
expected.

## Backend Changes

- **Profile Support:** Added a `profiles` collection to the data layer and new
  routes `/api/profiles` and `/api/profiles/:id`.
- **Filtering Logic:** The `/api/loads/find` endpoint now accepts a `profile`
  query parameter (ID or name). When present, the profile’s filter values
  provide default search criteria that can be overridden by other query
  parameters.
- **Origin and Destination Endpoints:** Introduced `/api/origins` to
  complement the existing `/api/destinations`, enabling the frontend to
  populate origin selectors.
- **Filtering Pipeline:** Extended the filter pipeline to honour `origin`,
  `originState`, `originRadius`, `destination`, `destinationState`,
  `destinationRadius`, `minLoadedRpm`, `minDistance`, `maxDistance`,
  `startDate` and `endDate` fields.
- **Tests:** Added Supertest-based coverage for the new profile endpoints and
  verified that profile filters and overrides behave as expected.

## Frontend Changes

- **Profile Selection:** Added a profile drop‑down to the search page.
  Selecting a profile automatically fills in the origin, destination and
  radius fields based on the stored profile.
- **Origin Selector:** Added an origin input with datalist suggestions
  populated from the new `/api/origins` endpoint.
- **Destination Selector:** Updated the destination input to use a datalist
  for suggestions.
- **Search Form:** Added radius inputs for origin and destination. The search
  request forwards all form values as query parameters to the backend.
- **Tests:** Added Jest/React Testing Library coverage that verifies the
  profile selection logic populates the form fields.

## Manual Verification Steps

1. **Start the backend**: Run `npm install` and `npm start` inside the
   `project/backend` directory. The server listens on port 3001.
2. **Start the frontend**: In a separate shell, run `npm install` and
   `npm run dev` inside `project/frontend`. Navigate to
   `http://localhost:3000` in a browser.
3. **Search without a profile**: Leave the profile selector empty. Choose an
   origin from the drop‑down and a destination. Click **Search**. Verify that
   results only include loads matching the selected origin and destination.
4. **Search using the “Get Home” profile**:
   - Select **Get Home** in the profile drop‑down.
   - Observe that the origin, destination and radius fields are automatically
     populated.
   - Click **Search**. Confirm that the results correspond to the profile’s
     criteria.
5. **Override profile defaults**:
   - While the **Get Home** profile is selected, change the origin input to
     another city (e.g., `Madison, WI`).
   - Click **Search**. Verify that the results now reflect the overridden
     origin while still respecting other profile defaults.
6. **Run tests**: From the project root, execute `npm test` in both the
   `backend` and `frontend` directories. All tests should pass.

These steps confirm that multi‑profile scenarios such as “Get Home” operate
correctly and that origin selection behaves as intended.