# Countdown Timer + Analytics — Shopify App

A full-stack Shopify app that lets merchants create countdown timers on their storefront to drive urgency and track impressions.

## Architecture

```
countdown-timer-app/
├── backend/             # Node.js + Express + MongoDB API
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers + validators
│   ├── middleware/       # Auth, rate limiting, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express route definitions
│   ├── services/        # Business logic layer
│   └── tests/           # Jest unit tests (7 tests)
├── frontend/            # React + Shopify Polaris admin UI
│   └── src/
│       ├── components/  # Reusable UI components
│       │   ├── Analytics/   # Dashboard metrics
│       │   ├── TimerForm/   # Create/Edit form
│       │   └── Widget/      # Countdown preview
│       ├── pages/       # Route pages
│       ├── services/    # API client
│       └── utils/       # Helpers
└── theme-extension/     # Shopify Theme App Extension
    ├── assets/          # Storefront JS widget (<30KB)
    └── blocks/          # Liquid block template
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Shopify Partner account

### Backend Setup
```bash
cd backend
cp .env.example .env     # Edit with your credentials
npm install
npm run dev              # Starts on port 3001
```

### Frontend Setup
```bash
cd frontend
npm install
npm start                # Starts on port 3000 (proxies API to 3001)
```

### Run Tests
```bash
cd backend
npm test
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/timers` | Shop | List all timers |
| POST | `/api/timers` | Shop | Create timer |
| PUT | `/api/timers/:id` | Shop | Update timer |
| DELETE | `/api/timers/:id` | Shop | Delete timer |
| GET | `/api/analytics/active-timers` | Public | Get active timers for storefront |
| POST | `/api/analytics/impression/:id` | Public | Track impression |
| GET | `/api/health` | None | Health check |

## Key Features

- **Fixed & Evergreen timers** — schedule sales or create session-based urgency
- **Product/Collection targeting** — show timers on specific pages
- **Visual customization** — colors, text, position
- **Urgency effect** — pulsing animation when timer nears expiry
- **Impression tracking** — basic analytics dashboard
- **Rate limiting** — prevents abuse of public endpoints
- **Input validation** — Joi schemas on all inputs
- **XSS protection** — xss-clean middleware
- **Zero CLS** — fixed-height widget container + tabular-nums
- **Caching** — 30s Cache-Control on active-timers endpoint

## Production Notes

- Replace `x-shop-id` header auth with Shopify session token verification
- Use Shopify Resource Picker for product/collection selection
- Set up proper MongoDB indexes for high-traffic stores
- Configure CDN caching for the widget JS asset
