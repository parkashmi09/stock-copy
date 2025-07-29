# Environment Variables Setup

This project uses environment variables to manage API endpoints and other configuration settings.

## Setup Instructions

1. Create a `.env` file in the root directory of the project
2. Add the following environment variables:

```env
VITE_BASE_URL=/
VITE_API_BASE_URL=https://stockapi.targetboard.co/api/v1
```

## Environment Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `VITE_BASE_URL` | Base URL for Vite development server and build output | `/` |
| `VITE_API_BASE_URL` | Base URL for all API endpoints | `https://stockapi.targetboard.co/api/v1` |

## Usage

The environment variables are automatically loaded by Vite and can be accessed in your React components using:

```javascript
import.meta.env.VITE_BASE_URL
import.meta.env.VITE_API_BASE_URL
```

Or use the centralized config file:

```javascript
import { VITE_BASE_URL, API_BASE_URL } from '../config';
```

## Configuration File

The project includes a centralized configuration file at `src/config.js` that:

- Imports environment variables
- Provides fallback values
- Exports pre-configured API endpoints

## API Endpoints

The following API endpoints are configured and available through the config file:

- `LOGIN` - User authentication
- `SIGNUP` - User registration
- `TRANSACTIONS` - Transaction management
- `STOCKS` - Stock management
- `CATEGORIES` - Category management
- `CATEGORY` - Single category operations
- `SUBCATEGORY` - Subcategory operations
- And more...

## Development vs Production

### Development
- `VITE_BASE_URL=/` (default)
- `VITE_API_BASE_URL=https://stockapi.targetboard.co/api/v1` (or your dev API)

### Production
- `VITE_BASE_URL=/` (or your deployment path)
- `VITE_API_BASE_URL=https://stockapi.targetboard.co/api/v1` (production API)

### Subdirectory Deployment
If deploying to a subdirectory (e.g., `https://example.com/app/`):
```env
VITE_BASE_URL=/app/
```

## Security Notes

- Never commit the `.env` file to version control
- The `.env.example` file serves as a template
- Environment variables prefixed with `VITE_` are exposed to the client-side code 