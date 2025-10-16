# Vibe Growth API

A NestJS API for managing marketing campaigns with natural language query support.

## Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `env/.local.env`:
```bash
NODE_ENV=development
X_API_KEY=your-secret-key-here
```

### 3. Start the Server
```bash
npm run start:dev
```

Server runs at: `http://localhost:3000`  
Swagger docs: `http://localhost:3000/api`

---

## Testing with cURL

### Health Check
```bash
# No API key required
curl http://localhost:3000/health
```

### Get All Campaigns
```bash
curl -H "x-api-key: your-secret-key-here" \
  http://localhost:3000/campaigns
```

### Get Active Campaigns (Filtered)
```bash
curl -H "x-api-key: your-secret-key-here" \
  "http://localhost:3000/campaigns?status=active"
```

### Get Campaigns by Date Range
```bash
curl -H "x-api-key: your-secret-key-here" \
  "http://localhost:3000/campaigns?dateFrom=2024-01-01&dateTo=2024-12-31"
```

### Get Campaigns (Paginated)
```bash
curl -H "x-api-key: your-secret-key-here" \
  "http://localhost:3000/campaigns?page=1&limit=5"
```

### Get Single Campaign
```bash
curl -H "x-api-key: your-secret-key-here" \
  http://localhost:3000/campaigns/camp-001
```

### Get Metrics Summary
```bash
curl -H "x-api-key: your-secret-key-here" \
  http://localhost:3000/metrics/summary
```

### Natural Language Query
```bash
# Query: "top 5 active campaigns by CTR from last 7 days"
curl -X POST \
  -H "x-api-key: your-secret-key-here" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "top 5 active campaigns by CTR from last 7 days"}' \
  http://localhost:3000/intent/query
```

### More Natural Language Examples
```bash
# Show active campaigns
curl -X POST \
  -H "x-api-key: your-secret-key-here" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "show me active campaigns"}' \
  http://localhost:3000/intent/query

# Best performers by conversion rate
curl -X POST \
  -H "x-api-key: your-secret-key-here" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "top 10 campaigns by conversion rate"}' \
  http://localhost:3000/intent/query

# Worst performers by CPA
curl -X POST \
  -H "x-api-key: your-secret-key-here" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "worst 5 campaigns by CPA"}' \
  http://localhost:3000/intent/query

# Campaigns from last 30 days
curl -X POST \
  -H "x-api-key: your-secret-key-here" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "campaigns from last 30 days"}' \
  http://localhost:3000/intent/query
```

---

## Available Scripts

```bash
npm run start:dev    # Development mode with watch
npm run build        # Build for production
npm run start:prod   # Run production build
npm test             # Run tests
npm run test:cov     # Run tests with coverage
```

---

## Postman Collection

Import these cURL commands directly into Postman:
1. Click "Import" in Postman
2. Select "Raw text"
3. Paste any cURL command above
4. Postman will auto-convert to a request

Remember to set `x-api-key` header to your API key value.

---

## Documentation

- **API Docs**: [docs/API.md](docs/API.md)
- **Authentication**: [docs/API_KEY_AUTHENTICATION.md](docs/API_KEY_AUTHENTICATION.md)

