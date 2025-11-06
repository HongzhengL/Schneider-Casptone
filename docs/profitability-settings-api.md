# Profitability Settings API

Backend API for storing and retrieving driver profitability calculation settings.

## Overview

The profitability settings feature allows drivers to configure their cost calculations (rolling costs, fixed costs, margins) and persist them in the database. Settings are user-specific and stored in Supabase.

## Database Setup

### 1. Create the Supabase Table

Run the SQL schema in the Supabase SQL editor:

```sql
-- See sql/profitability-settings-schema.sql for the schema
```

Or copy and paste this SQL directly into your Supabase SQL editor

The `profitability_settings` table structure:
- `id`: UUID primary key
- `user_id`: UUID foreign key to auth.users (unique constraint)
- `settings`: JSONB containing all profitability configuration
- `created_at`: Timestamp
- `updated_at`: Timestamp

Row Level Security (RLS) is enabled so users can only access their own settings.

## API Endpoints

### GET /api/profitability/settings

Fetch the current user's profitability settings.

**Authentication**: Required

**Response**: `200 OK`
```json
{
  "mpg": 6.5,
  "fuelPrice": 3.89,
  "maintenanceDollars": 1200,
  "maintenanceMiles": 10000,
  "monthlyFixedBundle": 12000,
  "tiresDollars": 800,
  "tiresMiles": 40000,
  "maintenanceDollarsDetailed": 600,
  "maintenanceMilesDetailed": 15000,
  "oilChangeDollars": 300,
  "oilChangeMiles": 15000,
  "defFluidDollars": 150,
  "defFluidMiles": 10000,
  "tollsDollars": 250,
  "tollsMiles": 10000,
  "truckPayment": 1800,
  "truckPaymentPeriod": 1,
  "truckPaymentUnit": "month",
  "trailerPayment": 400,
  "trailerPaymentPeriod": 1,
  "trailerPaymentUnit": "month",
  "insurance": 1200,
  "insurancePeriod": 1,
  "insuranceUnit": "month",
  "permits": 1200,
  "permitsPeriod": 1,
  "permitsUnit": "year",
  "eldSubscription": 45,
  "eldSubscriptionPeriod": 1,
  "eldSubscriptionUnit": "month",
  "phoneInternet": 100,
  "phoneInternetPeriod": 1,
  "phoneInternetUnit": "month",
  "parking": 200,
  "parkingPeriod": 1,
  "parkingUnit": "month",
  "softwareTools": 50,
  "softwareToolsPeriod": 1,
  "softwareToolsUnit": "month",
  "otherFixed": [],
  "marginCents": 10,
  "marginPercent": 5,
  "useWhicheverGreater": true,
  "useRealTimeFuel": false,
  "useProMode": false
}
```

If no settings exist for the user, returns default values.

### PUT /api/profitability/settings

Save or update the current user's profitability settings.

**Authentication**: Required

**Request Body**:
```json
{
  "mpg": 6.8,
  "fuelPrice": 4.05,
  "useProMode": true,
  ... (all other settings fields)
}
```

**Validation**:
- `mpg`: Must be a number
- `fuelPrice`: Must be a number
- `useProMode`: Must be a boolean

**Response**: `200 OK` - Returns the saved settings

### POST /api/profitability/settings

Alternative endpoint for saving settings (same behavior as PUT).

## Frontend Integration

### Service Functions

Located in `frontend/src/services/api.ts`:

```typescript
import { ProfitabilitySettings } from '../components/ProfitabilitySettingsPage';

// Fetch user's settings
export async function fetchProfitabilitySettings(): Promise<ProfitabilitySettings>

// Save user's settings
export async function saveProfitabilitySettings(
    settings: ProfitabilitySettings
): Promise<ProfitabilitySettings>
```

### Usage in App Component

The `App.tsx` component:
1. Loads settings on mount via `useEffect`
2. Passes settings to `ProfitabilitySettingsPage`
3. Saves settings when user clicks "Save & Start Tracking"

```typescript
// Load settings on mount
useEffect(() => {
    const loadSettings = async () => {
        const settings = await fetchProfitabilitySettings();
        setProfitabilitySettings(settings);
    };
    loadSettings();
}, []);

// Save settings handler
const handleSaveProfitabilitySettings = async (settings: ProfitabilitySettings) => {
    const savedSettings = await saveProfitabilitySettings(settings);
    setProfitabilitySettings(savedSettings);
};
```

## Backend Implementation

### Service Layer

`backend/src/utils/profitabilitySettingsService.js`:

- `getSettings(userId)`: Fetches user settings from Supabase, returns defaults if none exist
- `saveSettings(userId, settings)`: Upserts settings (updates if exists, inserts if new)

### Route Handler

`backend/src/routes/profitabilitySettings.js`:

- Requires authentication via `requireAuth` middleware
- Validates request body with express-validator
- Delegates to service layer for data operations

## Testing

### Manual Testing with curl

```bash
# Login first to get session cookie
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt

# Get settings
curl http://localhost:4000/api/profitability/settings \
  -b cookies.txt

# Save settings
curl -X PUT http://localhost:4000/api/profitability/settings \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "mpg": 7.0,
    "fuelPrice": 4.10,
    "useProMode": true,
    "maintenanceDollars": 1500,
    "maintenanceMiles": 12000,
    ... (other fields)
  }'
```

## Error Handling

- **401 Unauthorized**: User is not authenticated
- **400 Bad Request**: Validation errors (invalid field types)
- **500 Internal Server Error**: Database connection issues or other server errors

## Security

- All endpoints require authentication
- Row Level Security ensures users can only access their own settings
- Settings are stored as JSONB for flexibility while maintaining data integrity
