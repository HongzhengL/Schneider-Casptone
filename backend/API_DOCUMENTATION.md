# API Documentation - Loads Filtering Pipeline

## Overview

The filtering pipeline has been extended to support stored configuration files that can be referenced by ID or name when querying the `/api/loads/find` endpoint. This allows for predictable query coverage and reusable filter presets.

## New Endpoints

### GET /api/configurations

Retrieves all available filter configurations.

**Query Parameters:**
- `search` (optional): Search term to filter configurations by name or description

**Response:**
```json
{
  "configurations": [
    {
      "id": "high-value-loads",
      "name": "High Value Loads",
      "description": "Premium loads with high RPM and confirmed appointments",
      "filters": {
        "minLoadedRpm": 2.0,
        "confirmedOnly": true,
        "serviceExclusions": ["hazmat", "driver-load", "driver-unload"]
      },
      "createdBy": "system",
      "createdAt": "2024-01-15T10:00:00Z",
      "lastUsed": "2024-01-20T14:30:00Z",
      "usageCount": 45
    }
  ],
  "total": 8,
  "searchTerm": "high value" // Only present if search parameter was provided
}
```

### GET /api/configurations/:identifier

Retrieves a specific configuration by ID or name.

**Parameters:**
- `identifier`: Configuration ID or name (case-insensitive for names)

**Response (Success):**
```json
{
  "id": "high-value-loads",
  "name": "High Value Loads",
  "description": "Premium loads with high RPM and confirmed appointments",
  "filters": {
    "minLoadedRpm": 2.0,
    "confirmedOnly": true,
    "serviceExclusions": ["hazmat", "driver-load", "driver-unload"]
  },
  "createdBy": "system",
  "createdAt": "2024-01-15T10:00:00Z",
  "lastUsed": "2024-01-20T14:30:00Z",
  "usageCount": 45
}
```

**Response (Not Found):**
```json
{
  "error": "Configuration not found",
  "identifier": "invalid-config"
}
```

## Extended Endpoint

### GET /api/loads/find

The existing endpoint has been extended to support configuration-based filtering.

**New Query Parameters:**
- `configId`: Apply a configuration by ID
- `configName`: Apply a configuration by name (case-insensitive)

**Existing Query Parameters (all still supported):**
- `minLoadedRpm`: Minimum loaded rate per mile
- `minDistance`: Minimum distance in miles
- `maxDistance`: Maximum distance in miles
- `serviceExclusions`: Comma-separated list of service tags to exclude
- `confirmedOnly`: Filter for confirmed appointments only
- `standardNetworkOnly`: Filter for standard network loads only
- `destination`: Destination city filter
- `destinationState`: Destination state filter
- `destinationRadius`: Maximum distance to origin
- `minWeight`: Minimum weight in pounds
- `maxWeight`: Maximum weight in pounds
- `loadType`: Comma-separated list of load types
- `customer`: Comma-separated list of customers
- `startDate`: Pickup date start (ISO format)
- `endDate`: Pickup date end (ISO format)
- `destinationDateFrom`: Delivery date start (ISO format)
- `destinationDateTo`: Delivery date end (ISO format)

**Filter Precedence:**
Query parameters take precedence over configuration filters. This allows for configuration-based defaults with query parameter overrides.

## Request/Response Contract

### Request Examples

**Using Configuration by ID:**
```
GET /api/loads/find?configId=high-value-loads
```

**Using Configuration by Name:**
```
GET /api/loads/find?configName=High Value Loads
```

**Combining Configuration with Query Parameters:**
```
GET /api/loads/find?configId=standard-dry-van&minDistance=100&maxDistance=400
```

**Traditional Query Parameters (still supported):**
```
GET /api/loads/find?minLoadedRpm=1.8&maxDistance=500&loadType=Dry Van&confirmedOnly=true
```

### Response Format

**Success Response:**
```json
{
  "loads": [
    {
      "id": "1",
      "price": "$582",
      "priceNum": 582,
      "distance": "320.0 miles",
      "distanceNum": 320,
      "weight": "38,200 lb",
      "weightNum": 38200,
      "loadedRpm": "$1.82",
      "loadedRpmNum": 1.82,
      "totalRpm": "$1.94",
      "totalRpmNum": 1.94,
      "loadType": "Dry Van",
      "fromLocation": "Green Bay, WI (Terminal A - North Gate)",
      "fromDate": "Mon Jan 15 6:00 AM",
      "pickupDate": "2024-01-15T06:00:00.000Z",
      "toLocation": "Denver, CO (Rocky Mountain DC)",
      "toDate": "Tue Jan 16 12:00 PM",
      "details": "Customer: Walmart\nDriver assist load required\nDock appointment set\nSNI-4701",
      "customer": "Walmart",
      "serviceTags": ["driver-assist-load"],
      "hasReload": false,
      "confirmedAppointment": true,
      "distanceToOrigin": 8.5,
      "addedDate": "2024-01-12T06:00:00.000Z",
      "dropDate": "2024-01-16T12:00:00.000Z"
    }
  ],
  "total": 1,
  "appliedConfiguration": {
    "id": "high-value-loads",
    "name": "High Value Loads",
    "description": "Premium loads with high RPM and confirmed appointments"
  },
  "filters": {
    "minLoadedRpm": 2.0,
    "minDistance": 0,
    "maxDistance": null,
    "serviceExclusions": ["hazmat", "driver-load", "driver-unload"],
    "confirmedOnly": true,
    "standardNetworkOnly": false,
    "destination": null,
    "destinationState": null,
    "loadType": null,
    "customer": null,
    "startDate": null,
    "endDate": null,
    "destinationDateFrom": null,
    "destinationDateTo": null,
    "minWeight": null,
    "maxWeight": null,
    "destinationRadius": null
  }
}
```

**Error Response (Configuration Not Found):**
```json
{
  "error": "Configuration not found",
  "configId": "invalid-config"
}
```

## Available Configurations

The system includes the following predefined configurations:

1. **high-value-loads**: Premium loads with high RPM and confirmed appointments
2. **standard-dry-van**: Standard dry van loads within 500 miles
3. **temperature-controlled**: Refrigerated and temperature control loads
4. **expedited-loads**: Fast delivery loads with high priority
5. **long-haul-flatbed**: Long distance flatbed loads for construction materials
6. **local-deliveries**: Short distance loads within 200 miles
7. **hazmat-specialized**: Hazmat loads with specialized requirements
8. **weekend-loads**: Loads available for weekend pickup and delivery

## Usage Examples

### Example 1: Using High Value Configuration
```bash
curl "http://localhost:4000/api/loads/find?configId=high-value-loads"
```

### Example 2: Combining Configuration with Overrides
```bash
curl "http://localhost:4000/api/loads/find?configName=Standard Dry Van&maxDistance=300&destination=Denver"
```

### Example 3: Searching Configurations
```bash
curl "http://localhost:4000/api/configurations?search=temperature"
```

### Example 4: Getting Specific Configuration
```bash
curl "http://localhost:4000/api/configurations/high-value-loads"
```

## Error Handling

- **404 Not Found**: Returned when a configuration ID or name is not found
- **400 Bad Request**: Returned for invalid query parameters
- **500 Internal Server Error**: Returned for server-side errors

## Backward Compatibility

The extended endpoint maintains full backward compatibility. Existing API calls using only query parameters will continue to work exactly as before, with the response format enhanced to include metadata about applied configurations and effective filters.
