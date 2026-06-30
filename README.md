# Kona ☕

A simple coffee shop rating app. Rate cafés, track your visits, and share your profile with friends.

**Live app:** https://kona-ochre.vercel.app

Built by [Daniel Matloub](https://github.com/DanielMatloub)

---

## Features

- **Rate coffee shops** — 0.5 to 5 stars with optional drink and visit date
- **Location-aware search** — finds shops near you using OpenStreetMap
- **Public profiles** — shareable at `/user/username`
- **Homepage feed** — see recent ratings from all users
- **Interactive map** — view all your rated shops on a dark mode map
- **Profile pictures** — upload a custom avatar

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Maps | Leaflet.js + OpenStreetMap + CARTO tiles |
| Deployment | Vercel |

---

## Running Locally

**Prerequisites:** Node.js 18+, a Supabase project

1. Clone the repo
```bash
git clone https://github.com/DanielMatloub/kona.git
cd kona
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env.local` file
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the database — run `supabase/schema.sql` in your Supabase SQL Editor

5. Start the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure
src/

├── app/

│   ├── page.tsx          # Homepage feed

│   ├── auth/             # Login & signup

│   ├── onboarding/       # Username setup

│   ├── rate/             # Rate a coffee shop

│   ├── user/[username]/  # Public profile page

│   └── api/search/       # OpenStreetMap search API

├── components/

│   ├── Navbar.tsx        # Navigation

│   └── Map.tsx           # Leaflet map component

├── lib/

│   └── supabase.ts       # Supabase client

supabase/

└── schema.sql            # Database schema & policies

---

## License

MIT