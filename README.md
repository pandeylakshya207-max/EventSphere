# EventSphere

![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Deployed on Render](https://img.shields.io/badge/Deployed_on-Render-46E3B7?style=flat-square&logo=render&logoColor=white)

**Live Demo → [eventsphere-o3if.onrender.com](https://eventsphere-o3if.onrender.com)**

---

## 🚀 Overview

**EventSphere** is a full-stack event discovery and ticketing platform that enables users to browse events, book tickets, host their own events, and manage everything through a personalised dashboard — all in one place.

The problem it solves is fragmentation: event discovery, registration, and management are typically scattered across multiple tools. EventSphere brings all three into a single, cohesive experience backed by a real-time Supabase database and secured via industry-standard JWT/NextAuth authentication.

Whether you are an attendee looking for your next experience or an organiser managing a lineup of events, EventSphere handles the complexity so you don't have to.

---

## ✨ Features

- **Event Discovery** — Browse a live catalogue of events with search and filtering by category, date, and location.
- **Ticket Booking** — Seamlessly reserve tickets for events with instant confirmation and booking reference.
- **User Dashboard** — View, manage, and cancel your bookings from a clean, personalised dashboard.
- **Event Hosting** — Organisers can create and publish events directly through the platform.
- **Secure Authentication** — JWT and NextAuth-powered login with protected routes ensuring only authorised users access sensitive pages.
- **Real-Time Updates** — Supabase's real-time layer keeps seat availability and event data current without page refreshes.
- **Responsive UI** — Fully responsive design built with Tailwind CSS, optimised for desktop and mobile.
- **Graceful Fallbacks** — Robust handling of missing or dynamic content to maintain a polished user experience under all conditions.
- **Server-Side Rendering** — Next.js SSR ensures fast initial page loads and SEO-friendly event pages.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js (App Router), React |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS, PostCSS |
| **Backend / BaaS** | Supabase (PostgreSQL, Realtime, Storage) |
| **Authentication** | NextAuth.js, JWT |
| **API Layer** | Next.js API Routes, Node.js |
| **Linting** | ESLint |
| **Deployment** | Render |

---

## 📦 Installation

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) v9 or higher (or yarn / pnpm)
- A [Supabase](https://supabase.com/) project (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/pandeylakshya207-max/EventSphere.git
cd EventSphere
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Fill in your values — see the [⚙️ Configuration](#️-configuration) section for all required variables.

### 4. Set Up the Supabase Database

Log in to your [Supabase dashboard](https://app.supabase.com), create a new project, and run the SQL migrations located in `lib/` (or the relevant migration folder) to scaffold the required tables.

### 5. Start the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

---

## ▶️ Usage

### Development

```bash
npm run dev        # Start the Next.js dev server with hot reload
```

### Production Build

```bash
npm run build      # Create an optimised production build
npm run start      # Start the production server
```

### Linting

```bash
npm run lint       # Run ESLint across the codebase
```

### User Flows

**As an Attendee:**
1. Sign up or log in via the authentication page.
2. Browse the event listing page and use filters to find events by category or date.
3. Open an event detail page and click **Book Tickets**.
4. Navigate to your **Dashboard** to view all active bookings and cancel if needed.

**As an Organiser:**
1. Log in and navigate to the **Host an Event** section.
2. Fill in the event details — title, description, date, venue, ticket capacity, and price.
3. Publish the event so it appears in the public listing immediately.
4. Monitor bookings and attendee count from the organiser view in your dashboard.

---

## 📁 Project Structure

```
EventSphere/
├── src/
│   ├── app/                    # Next.js App Router pages and layouts
│   │   ├── (auth)/             # Authentication routes (login, register)
│   │   ├── events/             # Event listing and detail pages
│   │   ├── dashboard/          # User and organiser dashboard
│   │   ├── api/                # Next.js API route handlers
│   │   └── layout.tsx          # Root application layout
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Base design system components
│   │   ├── events/             # Event-specific components (cards, filters)
│   │   └── dashboard/          # Dashboard-specific components
│   ├── hooks/                  # Custom React hooks
│   └── types/                  # Shared TypeScript type definitions
├── lib/
│   ├── supabase.ts             # Supabase client initialisation
│   ├── auth.ts                 # NextAuth configuration and helpers
│   └── utils.ts                # Shared utility functions
├── public/                     # Static assets (images, icons, fonts)
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript compiler options
├── eslint.config.mjs           # ESLint rules
├── postcss.config.mjs          # PostCSS configuration
└── package.json                # Project metadata and scripts
```

---

## ⚙️ Configuration

Create a `.env.local` file in the project root. All variables prefixed with `NEXT_PUBLIC_` are exposed to the browser; the rest are server-only.

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous (public) API key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | ✅ |
| `NEXTAUTH_SECRET` | Secret used to sign NextAuth session tokens | ✅ |
| `NEXTAUTH_URL` | Canonical URL of your deployment (e.g. `http://localhost:3000`) | ✅ |
| `DATABASE_URL` | Direct PostgreSQL connection string (for migrations) | Optional |

Example `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXTAUTH_SECRET=a-long-random-secret-string
NEXTAUTH_URL=http://localhost:3000
```

> **Security note:** Never commit `.env.local` to version control. It is already listed in `.gitignore`.

---

## 🧪 Testing

For type safety validation:

```bash
npx tsc --noEmit
```

For linting checks:

```bash
npm run lint
```

If a `test` script is configured in `package.json`:

```bash
npm test
```

> If you add new features, please include corresponding unit or integration tests before submitting a pull request.

---

## 🤝 Contributing

Contributions are welcome. To get started:

1. **Fork** the repository and create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**, keeping commits focused and descriptive.

3. **Lint and type-check** before pushing:
   ```bash
   npm run lint
   npx tsc --noEmit
   ```

4. **Push** to your fork and open a **Pull Request** against `main` with a clear description of the change and its motivation.

5. For large or breaking changes, open an issue first to align on scope before writing code.

Please follow the existing code style (TypeScript strict mode, Tailwind utility classes, ESLint rules) to keep the codebase consistent.

---

## 🐛 Troubleshooting

**Supabase connection errors on startup**
Verify that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` match the values shown in your Supabase project's **Settings → API** page exactly.

**NextAuth session not persisting**
Ensure `NEXTAUTH_SECRET` is set to a non-empty value and that `NEXTAUTH_URL` matches the exact URL you are accessing (including the port number in development).

**`npm run build` fails with type errors**
Run `npx tsc --noEmit` to surface all type errors with file and line numbers. Resolve each before retrying the build.

**Database tables not found**
Make sure you have run all SQL migration scripts against your Supabase project. Check the `lib/` directory for schema files and execute them via the Supabase SQL editor or the Supabase CLI.

**Slow cold starts on Render free tier**
Render's free tier spins down inactive services after a period of inactivity. The first request after a spin-down can take 30–60 seconds. Upgrading to a paid plan or using a scheduled ping to keep the service warm resolves this.

**Port 3000 already in use**
Kill the existing process or start the dev server on a different port:
```bash
# Kill the process on port 3000
lsof -ti:3000 | xargs kill

# Or start on a custom port
PORT=3001 npm run dev
```

---

## 📄 License

This project does not currently include a license file. All rights are reserved by the author unless otherwise stated. If you wish to use, fork, or build upon this project, please contact the maintainer directly.

---

## 🙌 Acknowledgements

- [Next.js](https://nextjs.org/) — The React framework for production-grade web applications.
- [Supabase](https://supabase.com/) — Open-source Firebase alternative providing PostgreSQL, Auth, and Realtime out of the box.
- [NextAuth.js](https://next-auth.js.org/) — Flexible, secure authentication for Next.js.
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS framework for rapid UI development.
- [Render](https://render.com/) — Cloud platform for deploying web services and static sites.

---

## 📬 Contact

**Lakshya Pandey** — Full-Stack Engineer | Next.js · Node.js · Supabase

[![Email](https://img.shields.io/badge/Email-pandeylakshya207%40gmail.com-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:pandeylakshya207@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-lakshyapandeybn-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/lakshyapandeybn)
[![GitHub](https://img.shields.io/badge/GitHub-pandeylakshya207--max-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/pandeylakshya207-max)

For bug reports and feature requests, please [open an issue](https://github.com/pandeylakshya207-max/EventSphere/issues).

---

> *"Comfortable taking a feature from wireframe to deployed application — solo or in a team."*
