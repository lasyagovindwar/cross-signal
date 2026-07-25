# Cross Signal

One dashboard for Google Ads, Meta Ads, and LinkedIn Ads campaign performance — ROI, CPC, CTR, and conversions in one place.

**Live app:** https://cross-signal.lovable.app

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)
- [License](#license)

## About

Cross Signal aggregates ad campaign data from Google Ads, Meta Ads, and
LinkedIn Ads into a single dashboard, so performance can be reviewed in one
place instead of three separate ad managers. This is an MVP and currently
uses realistic mock campaign data in place of live platform API calls.

## Features

- Email/password and OAuth (Google, GitHub) authentication
- Unified metrics: spend, ROAS, CPC, CTR, conversions
- Filter by platform and date range
- Rule-based alerts for CPA spikes and budget pacing
- AI-generated performance summary
- Saved filter views
- Role-based access (admin / viewer)
- CSV export

## Tech Stack

- React, Vite, Tailwind CSS, shadcn/ui
- Recharts
- Supabase (Postgres, Auth, Edge Functions)
- Claude API (Anthropic)

## Installation

```bash
git clone https://github.com/your-username/cross-signal.git
cd cross-signal
npm install
npm run dev
```

Runs at `http://localhost:5173`.

## Environment Variables

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Set as a Supabase Edge Function secret (not in `.env`):

```
ANTHROPIC_API_KEY=your-anthropic-api-key
```

## Usage

1. Create a Supabase project and run `supabase/schema.sql` in the SQL Editor.
2. Enable Google and GitHub providers under Authentication → Providers.
3. Add your local and production URLs under Authentication → URL Configuration.
4. Copy your Supabase URL and anon key into `.env`.
5. Run `npm run dev` and sign in at `http://localhost:5173`.

Or skip local setup and use the live app: https://cross-signal.lovable.app

## Project Structure

```
cross-signal/
├── src/
│   ├── pages/
│   ├── components/
│   ├── lib/
│   └── hooks/
├── supabase/
│   ├── schema.sql
│   └── functions/
└── README.md
```

## Roadmap

- [ ] Live Google Ads API integration
- [ ] Live Meta Marketing API integration
- [ ] Live LinkedIn Marketing API integration
- [ ] Per-user OAuth-connected ad accounts
- [ ] Multi-user workspaces

## License

MIT
