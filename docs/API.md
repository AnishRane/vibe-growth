# Vibe Growth - API Documentation

**Version**: 1.0  
**Base URL**: `http://localhost:3000`

---

## 📊 Health Endpoints

### GET /health

Get API health metrics including uptime, P95 latency, and error rate.

**Response**:
```json
{
  "uptime": "2h 31m",
  "latencyP95": 92,
  "errorRate": 1.25
}
```

**Fields**:
- `uptime` (string): Human-readable uptime (e.g., "2h 31m", "3d 4h")
- `latencyP95` (number): 95th percentile latency in milliseconds
- `errorRate` (number): Error rate as percentage (0-100)

---

## 🎯 Campaign Endpoints

### GET /campaigns

Get a paginated list of campaigns with filters and KPIs.

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `status` | enum | No | - | Filter by status: `active`, `paused`, `completed` |
| `dateFrom` | string | No | - | Filter campaigns starting from this date (ISO 8601) |
| `dateTo` | string | No | - | Filter campaigns ending before this date (ISO 8601) |
| `page` | number | No | 1 | Page number (min: 1) |
| `limit` | number | No | 10 | Items per page (min: 1) |

**Examples**:
```bash
# Get all campaigns (default pagination)
GET /campaigns

# Get only active campaigns
GET /campaigns?status=active

# Get campaigns from Q2 2025
GET /campaigns?dateFrom=2025-04-01&dateTo=2025-06-30

# Get second page with 5 items
GET /campaigns?page=2&limit=5

# Combine filters
GET /campaigns?status=active&dateFrom=2025-01-01&page=1&limit=20
```

**Response**:
```json
{
  "data": [
    {
      "id": "camp-001",
      "name": "Summer Sale 2025",
      "status": "active",
      "startDate": "2025-06-01",
      "endDate": "2025-08-31",
      "budget": 50000,
      "stats": {
        "impressions": 1000000,
        "clicks": 25000,
        "conversions": 1250,
        "spend": 12500
      },
      "kpis": {
        "ctr": 2.5,
        "cvr": 5.0,
        "cpc": 0.5,
        "cpa": 10.0
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 10,
    "totalPages": 1
  }
}
```

**KPI Definitions**:
- `ctr` (CTR): Click-Through Rate = (clicks / impressions) × 100
- `cvr` (CVR): Conversion Rate = (conversions / clicks) × 100
- `cpc` (CPC): Cost Per Click = spend / clicks
- `cpa` (CPA): Cost Per Acquisition = spend / conversions

---

### GET /campaigns/:id

Get a single campaign by ID with full details including KPIs.

**Path Parameters**:
- `id` (string): Campaign ID (e.g., "camp-001")

**Example**:
```bash
GET /campaigns/camp-001
```

**Response**:
```json
{
  "id": "camp-001",
  "name": "Summer Sale 2025",
  "status": "active",
  "startDate": "2025-06-01",
  "endDate": "2025-08-31",
  "budget": 50000,
  "stats": {
    "impressions": 1000000,
    "clicks": 25000,
    "conversions": 1250,
    "spend": 12500
  },
  "dailyMetrics": [
    {
      "date": "2025-06-01",
      "impressions": 10000,
      "clicks": 250,
      "conversions": 12,
      "spend": 125
    }
  ],
  "kpis": {
    "ctr": 2.5,
    "cvr": 5.0,
    "cpc": 0.5,
    "cpa": 10.0
  }
}
```

**Error Response** (404):
```json
{
  "statusCode": 404,
  "message": "Campaign with ID \"invalid-id\" not found",
  "error": "Not Found"
}
```

---

## 📝 Data Models

### Campaign

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique campaign identifier |
| `name` | string | Campaign name |
| `status` | enum | Campaign status: `active`, `paused`, `completed` |
| `startDate` | string | Start date (ISO 8601) |
| `endDate` | string? | End date (ISO 8601), optional |
| `budget` | number | Total budget in currency units |
| `stats` | object | Campaign statistics |
| `dailyMetrics` | array? | Daily breakdown (optional, only in detail view) |
| `kpis` | object | Calculated KPIs |

### CampaignStats

| Field | Type | Description |
|-------|------|-------------|
| `impressions` | number | Total ad impressions |
| `clicks` | number | Total ad clicks |
| `conversions` | number | Total conversions |
| `spend` | number | Total spend in currency units |

### CampaignKPIs

| Field | Type | Description |
|-------|------|-------------|
| `ctr` | number | Click-Through Rate (percentage, 0-100) |
| `cvr` | number | Conversion Rate (percentage, 0-100) |
| `cpc` | number | Cost Per Click (currency) |
| `cpa` | number | Cost Per Acquisition (currency) |

---

## 🚨 Error Responses

### 400 Bad Request
Invalid query parameters (e.g., invalid date format, negative page number)

```json
{
  "statusCode": 400,
  "message": ["page must be a positive number"],
  "error": "Bad Request"
}
```

### 404 Not Found
Campaign ID not found

```json
{
  "statusCode": 404,
  "message": "Campaign with ID \"camp-999\" not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error
Unexpected server error

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## 📈 Metrics Endpoints

### GET /metrics/summary

Get aggregate metrics across all campaigns, including totals, averages, and best/worst performers.

**Response**:
```json
{
  "totals": {
    "impressions": 12137500,
    "clicks": 319000,
    "conversions": 16390,
    "spend": 161500
  },
  "averages": {
    "ctr": 2.63,
    "cvr": 5.15,
    "cpc": 0.51,
    "cpa": 9.86
  },
  "bestPerforming": {
    "byCTR": {
      "id": "camp-005",
      "name": "Holiday Promotion 2024",
      "value": 3.33
    },
    "byCVR": {
      "id": "camp-008",
      "name": "Flash Sale October",
      "value": 6.67
    }
  },
  "worstPerforming": {
    "byCTR": {
      "id": "camp-010",
      "name": "Brand Awareness Q4",
      "value": 1.5
    },
    "byCVR": {
      "id": "camp-006",
      "name": "New Year Mega Sale",
      "value": 4.0
    }
  }
}
```

**Fields**:

- **totals** (object): Sum of all campaign stats
  - `impressions` (number): Total impressions across all campaigns
  - `clicks` (number): Total clicks across all campaigns
  - `conversions` (number): Total conversions across all campaigns
  - `spend` (number): Total spend across all campaigns

- **averages** (object): Mean KPI values across all campaigns
  - `ctr` (number): Average Click-Through Rate (percentage)
  - `cvr` (number): Average Conversion Rate (percentage)
  - `cpc` (number): Average Cost Per Click (dollars)
  - `cpa` (number): Average Cost Per Acquisition (dollars)

- **bestPerforming** (object): Campaigns with highest performance
  - `byCTR` (object): Campaign with highest CTR
  - `byCVR` (object): Campaign with highest CVR
  - Each contains: `id`, `name`, `value`

- **worstPerforming** (object): Campaigns with lowest performance
  - `byCTR` (object): Campaign with lowest CTR
  - `byCVR` (object): Campaign with lowest CVR
  - Each contains: `id`, `name`, `value`

**Notes**:
- All averages are rounded to 2 decimal places
- Best/worst performers are `null` when no campaigns exist
- This endpoint aggregates data from all campaigns regardless of status

---

## 🤖 Intent Parser Endpoints

### POST /intent/query

Convert natural language prompts into structured campaign queries. This endpoint parses your plain English request and returns matching campaigns.

**Request Body**:
```json
{
  "prompt": "show me top 5 active campaigns by CTR from last 7 days"
}
```

**Supported Prompts**:

**Status Filters**:
- `"active campaigns"`
- `"paused campaigns"`
- `"completed campaigns"`

**Date Filters**:
- `"yesterday"` - Campaigns from yesterday
- `"today"` - Campaigns from today
- `"last 7 days"` - Campaigns from the past 7 days
- `"last 30 days"` - Campaigns from the past 30 days
- `"this week"` - Campaigns from the start of this week
- `"last week"` - Campaigns from last week
- `"this month"` - Campaigns from the start of this month
- `"last month"` - Campaigns from last month
- `"this year"` - Campaigns from the start of this year

**Sorting**:
- `"top campaigns by CTR"` - Sort by CTR (highest first)
- `"best campaigns by CVR"` - Sort by CVR (highest first)
- `"worst campaigns by CPC"` - Sort by CPC (lowest first)
- `"lowest campaigns by CPA"` - Sort by CPA (lowest first)
- `"highest spend"` - Sort by spend (highest first)

**Limit**:
- `"top 5"` - Return top 5 results
- `"worst 3"` - Return worst 3 results
- `"bottom 10"` - Return bottom 10 results

**Example Prompts**:
```bash
# Simple status filter
POST /intent/query
{
  "prompt": "show me active campaigns"
}

# Date filter
POST /intent/query
{
  "prompt": "campaigns from last 30 days"
}

# Sorting with limit
POST /intent/query
{
  "prompt": "top 5 campaigns by CTR"
}

# Complex query
POST /intent/query
{
  "prompt": "show me top 5 active campaigns by conversion rate from last week"
}

# Worst performers
POST /intent/query
{
  "prompt": "worst 3 paused campaigns by CPA"
}
```

**Response**:
```json
{
  "intent": {
    "status": "active",
    "dateFrom": "2025-10-08",
    "dateTo": "2025-10-15",
    "sortBy": "ctr",
    "sortOrder": "desc",
    "limit": 5
  },
  "campaigns": [
    {
      "id": "camp-005",
      "name": "Holiday Promotion 2024",
      "status": "active",
      "startDate": "2024-11-15",
      "endDate": "2024-12-31",
      "budget": 100000,
      "stats": {
        "impressions": 1500000,
        "clicks": 50000,
        "conversions": 2500,
        "spend": 25000
      },
      "kpis": {
        "ctr": 3.33,
        "cvr": 5.0,
        "cpc": 0.5,
        "cpa": 10.0
      }
    }
  ],
  "message": "Found 1 campaign with status \"active\" from 2025-10-08 to 2025-10-15 sorted by highest CTR."
}
```

**Fields**:

- **intent** (object): Parsed intent from the prompt
  - `status` (string, optional): Parsed campaign status filter
  - `dateFrom` (string, optional): Parsed start date (ISO 8601)
  - `dateTo` (string, optional): Parsed end date (ISO 8601)
  - `sortBy` (string, optional): Parsed sort field (`ctr`, `cvr`, `cpc`, `cpa`, `spend`)
  - `sortOrder` (string, optional): Sort direction (`asc` or `desc`)
  - `limit` (number, optional): Number of results to return

- **campaigns** (array): Array of matching campaigns with KPIs

- **message** (string): Human-readable summary of the results

**Error Response (400 - Unparseable Prompt)**:
```json
{
  "statusCode": 400,
  "message": "Unable to parse your prompt. Try these examples:",
  "hints": [
    "\"Show me active campaigns\"",
    "\"Top 5 campaigns by CTR\"",
    "\"Paused campaigns from last week\"",
    "\"Best performing campaigns by conversion rate\"",
    "\"Campaigns from last 30 days\"",
    "\"Show me yesterday's campaigns\"",
    "\"Worst campaigns by CPA\""
  ]
}
```

**Natural Language Parsing Features**:

1. **Case Insensitive**: Works with any case (`"ACTIVE"`, `"active"`, `"Active"`)
2. **Flexible Phrasing**: Multiple ways to express the same intent
   - `"top campaigns"` = `"best campaigns"` = `"highest campaigns"`
   - `"worst campaigns"` = `"lowest campaigns"` = `"bottom campaigns"`
   - `"CTR"` = `"click-through rate"` = `"click through rate"`
3. **Combinable Filters**: Combine status, dates, sorting, and limits in any order
4. **Smart Defaults**: Missing filters are simply omitted (no error)

**Notes**:
- Prompts must contain at least one recognizable filter (status, date, or sort)
- Unrecognized prompts return a 400 error with helpful examples
- Date calculations are based on the server's current time
- All campaigns include full stats and calculated KPIs
- Sorting happens after filtering, then limit is applied

---

## 💡 Usage Tips

1. **Pagination**: Always use pagination for production. Default limit is 10, but you can increase to 100 for bulk operations.

2. **Date Filtering**: Use ISO 8601 format (YYYY-MM-DD). The API compares dates as strings, so this format ensures correct ordering.

3. **Combining Filters**: All filters work together. Use them to narrow down results efficiently.

4. **KPI Precision**: All KPIs are rounded to 2 decimal places for display purposes.

5. **Zero Division**: KPIs return 0 when the denominator is 0 (e.g., CTR when impressions = 0).

6. **Natural Language**: Use the `/intent/query` endpoint for quick ad-hoc queries in plain English.

---

*Last updated: October 15, 2025*

