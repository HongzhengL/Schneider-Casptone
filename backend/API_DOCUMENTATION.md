# API Contract – Load Search Service

This document describes the expected request and response formats for the load
search service after the introduction of profiles and origin selection.

## GET `/api/profiles`

Returns all available saved search profiles.

### Response Body

An array of profile objects:

```json
[
  {
    "id": "1",
    "name": "Get Home",
    "origin": "Chicago, IL",
    "originState": "IL",
    "originRadius": 50,
    "destination": "Madison, WI",
    "destinationState": "WI",
    "destinationRadius": 100
  },
  ...
]
```

## GET `/api/profiles/:id`

Returns a single profile by its ID.

### Response Body

A profile object with the same structure as described above.

## GET `/api/origins`

Returns a list of origin locations. Each entry contains the city, state and a
human‑friendly `displayName`.

### Response Body

```json
[
  {
    "city": "Madison",
    "state": "WI",
    "displayName": "Madison, WI"
  },
  ...
]
```

## GET `/api/destinations`

Returns a list of destination locations. Structure matches the origins
endpoint.

## GET `/api/loads/find`

Searches loads based on the provided query parameters. If a `profile`
parameter is provided, the corresponding profile’s fields populate default
values which can then be overridden by other query parameters.

### Query Parameters

All parameters are optional unless noted.

- `profile` (string): ID or name of a saved search profile to apply.
- `origin` (string): Origin city and state formatted as `"City, State"`.
- `originState` (string): Origin state abbreviation (overrides profile).
- `originRadius` (number): Maximum distance from the origin in miles.
- `destination` (string): Destination city and state formatted as `"City, State"`.
- `destinationState` (string): Destination state abbreviation.
- `destinationRadius` (number): Maximum distance to the destination in miles.
- `minLoadedRpm` (number): Minimum loaded rate per mile.
- `minDistance` (number): Minimum total distance.
- `maxDistance` (number): Maximum total distance.
- `startDate` (ISO date string): Earliest pickup date (inclusive).
- `endDate` (ISO date string): Latest drop date (inclusive).

### Response Body

An array of matching load objects:

```json
[
  {
    "id": "L1",
    "fromLocation": { "city": "Chicago", "state": "IL" },
    "toLocation": { "city": "Madison", "state": "WI" },
    "distance": 150,
    "distanceToOrigin": 40,
    "pickupDate": "2025-10-21",
    "dropDate": "2025-10-22",
    "price": 1200,
    "weight": 10000,
    "loadedRpm": 2.5,
    "totalRpm": 2.8,
    "serviceTags": ["Standard"]
  },
  ...
]
```

Clients must not rely on any additional fields as they may change in future
releases.