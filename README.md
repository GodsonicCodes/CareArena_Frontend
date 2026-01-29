# CareArena Frontend

A professional, healthcare-focused web application frontend for **CareArena**, a multi-agent AI system that creates and delivers patient education campaigns across multiple channels (SMS, Voice/IVR, WhatsApp, Web).

## Features

- **Dashboard**: Overview of campaign metrics and recent activity
- **Campaign Management**: Create, view, and manage patient education campaigns
- **Multi-Step Campaign Wizard**: Intuitive 6-step form for creating campaigns
- **Real-time Updates**: Poll for campaign status and delivery updates
- **Testing Tools**: Test SMS, Voice, WhatsApp, and bulk voice delivery
- **Analytics Dashboard**: Visualize campaign performance with charts
- **Settings**: Manage API keys, notifications, and preferences

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React
- **Routing**: React Router v6
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/GodsonicCodes/CareArena_Frontend.git
cd CareArena_Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure your API keys in `.env`:
```env
VITE_API_BASE_URL=https://carearena-mai-3svi.onrender.com
VITE_WS_BASE_URL=wss://carearena-mai-3svi.onrender.com
VITE_API_KEY=your-api-key-here
VITE_ADMIN_API_KEY=your-admin-api-key-here
```

5. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## Project Structure

```
src/
├── components/
│   ├── layout/         # Header, Sidebar, Layout wrapper
│   ├── campaign/       # Campaign-specific components
│   ├── forms/          # Form components
│   ├── testing/        # Testing tool components
│   └── ui/             # Reusable UI components
├── pages/
│   ├── Dashboard.tsx   # Home dashboard
│   ├── CampaignsList.tsx
│   ├── CreateCampaign.tsx
│   ├── CampaignDetail.tsx
│   ├── TestingTools.tsx
│   ├── Analytics.tsx
│   └── Settings.tsx
├── lib/
│   ├── api.ts          # Axios API client
│   ├── types.ts        # TypeScript types
│   ├── utils.ts        # Utility functions
│   └── queries.ts      # React Query hooks
├── hooks/              # Custom React hooks
├── App.tsx             # Main app component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## API Integration

The frontend connects to the CareArena backend API:

- **Production**: `https://carearena-mai-3svi.onrender.com`
- **API Documentation**: `/docs` (Swagger UI)

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/jobs/create` | POST | Create a new campaign |
| `/jobs/{id}/status` | GET | Get campaign status |
| `/jobs` | GET | List all campaigns |
| `/admin/approve/{id}` | POST | Approve/reject campaign |
| `/test/send-sms` | POST | Test SMS delivery |
| `/test/make-ivr-call` | POST | Test voice call |
| `/test/whatsapp` | POST | Test WhatsApp message |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_BASE_URL` | Backend API base URL | Yes |
| `VITE_WS_BASE_URL` | WebSocket URL for real-time updates | No |
| `VITE_API_KEY` | API key for authentication | Yes |
| `VITE_ADMIN_API_KEY` | Admin API key for approval actions | No |

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Pages

### Dashboard (`/`)
- Key metrics cards (total campaigns, active, delivered, success rate)
- Quick action buttons
- Recent campaigns list
- System status indicators

### Campaigns (`/campaigns`)
- Filterable and searchable campaign list
- Status badges with color coding
- Pagination support
- Quick actions (view, copy ID)

### Create Campaign (`/campaigns/create`)
- 6-step wizard form:
  1. Basic Information (disease, audience, goals)
  2. Channel Selection (SMS, Voice, WhatsApp, Web, Multi)
  3. Content & Documents (supporting files)
  4. Recipients (CSV upload or manual entry)
  5. Delivery Settings (time, frequency, dry run)
  6. Review & Submit

### Campaign Detail (`/campaigns/:jobId`)
- Progress timeline showing campaign state
- Tabbed interface:
  - Overview: Campaign info and delivery stats
  - Generated Content: AI-generated messages and audio
  - Claim Verification: Medical claim accuracy
  - Delivery Status: Per-recipient delivery tracking
- Approval/rejection controls for pending campaigns

### Testing Tools (`/testing`)
- SMS Test: Send single test SMS
- Voice Test: Make test IVR call
- WhatsApp Test: Send test WhatsApp message
- Bulk Voice Test: Test bulk voice calls

### Analytics (`/analytics`)
- Delivery timeline chart
- Channel performance comparison
- Language distribution pie chart
- Campaign status distribution
- Top health topics

### Settings (`/settings`)
- API Keys management
- Notification preferences
- Channel configuration
- Application preferences

## Supported Languages

- **English (en)**
- **Twi (tw)** - Ghanaian language
- **Ga (ga)** - Ghanaian language

## Supported Channels

- **SMS** - Text messages via mNotify
- **Voice/IVR** - Automated voice calls via Twilio
- **WhatsApp** - WhatsApp messages via Chatbots Africa
- **Web Platform** - Web-based content delivery

## License

MIT License

## Support

For support, contact admin@carearena.org or open an issue in the repository.
