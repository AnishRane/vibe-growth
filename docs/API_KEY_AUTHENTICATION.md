# API Key Authentication

## Overview

The Vibe Growth API uses API key authentication via the `x-api-key` header to secure all endpoints (except health checks and Swagger documentation).

## Setup

### 1. Configure API Key

Set the `API_KEY` environment variable:

```bash
export API_KEY=your-secret-api-key-here
```

Or create a `.env` file in the project root:

```env
API_KEY=your-secret-api-key-here
PORT=3000
```

### 2. Start the Application

```bash
npm run start:dev
```

## Usage

### Making Authenticated Requests

Include the `x-api-key` header in all API requests:

```bash
curl -H "x-api-key: your-secret-api-key-here" \
  http://localhost:3000/campaigns
```

### Using Swagger UI

1. Navigate to `http://localhost:3000/api`
2. Click the "Authorize" button (lock icon) at the top right
3. Enter your API key in the `x-api-key` field
4. Click "Authorize"
5. All subsequent requests from Swagger UI will include the API key

### Excluded Endpoints

The following endpoints do NOT require API key authentication:

- `/health` - Health check endpoint
- `/api` - Swagger documentation

## Response Codes

- **200/201**: Successful request with valid API key
- **401 Unauthorized**: Missing or invalid API key
  - `"API key is missing"` - No `x-api-key` header provided
  - `"Invalid API key"` - Incorrect API key value

## Security Notes

1. **Keep your API key secure** - Never commit it to version control
2. **Use environment variables** - Store the key in `.env` (add to `.gitignore`)
3. **Rotate keys regularly** - Change your API key periodically
4. **Use HTTPS in production** - Never transmit API keys over unencrypted connections

## Development Mode

If the `API_KEY` environment variable is not set, the interceptor will skip verification and log a warning. This is useful for local development but should NEVER be used in production.

## Implementation Details

The API key verification is implemented using a NestJS interceptor (`ApiKeyInterceptor`) that:

1. Runs before all route handlers
2. Checks for the `x-api-key` header
3. Validates it against the configured `API_KEY` environment variable
4. Skips verification for excluded paths (`/health`, `/api`)
5. Returns 401 Unauthorized if validation fails

For more details, see:
- Interceptor: `src/common/interceptors/api-key.interceptor.ts`
- Registration: `src/app.module.ts`

