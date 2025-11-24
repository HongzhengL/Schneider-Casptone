# Assumptions and Design Decisions

## Fixed Cost Coverage Backend Implementation

### Context
The "Fixed Cost Coverage" feature displays how much of the driver's weekly fixed costs have been covered by completed loads. Currently, the application lacks a full booking and completion workflow.

### Assumptions
1.  **Data Source**: The "Covered Amount" is derived from the `completedRuns` data source.
2.  **Calculation**: It is the sum of the `priceNum` (revenue) of all loads completed within the "current week".
3.  **Current Week**: Defined as the ISO week (Monday to Sunday) containing the current system date.
4.  **Demo Data**: To ensure the UI demonstrates functionality during the demo (given the current date is Nov 18, 2025), we have injected mock "completed runs" into the dataset that fall within this specific week. This ensures the status bar is not empty.

### Maintainability
-   The calculation logic is encapsulated in the backend (`/api/profitability/coverage`), keeping the frontend dumb (it just displays the received amount).
-   Future integration with a real database would only require updating the data fetching logic in the backend service, without changing the API contract or frontend code.
-   The backend exposes a pure helper (`src/utils/coverage.js`) so week-boundary math can be unit tested and reused outside the HTTP layer. The route accepts an optional `referenceDate` query parameter for demos or automated tests while defaulting to the current week (or the most recent week with data in mock mode).
