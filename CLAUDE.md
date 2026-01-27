# CLAUDE.md

## Project Overview

FixIt is a citizen incident reporting web app for municipalities. Citizens report public issues (road damage, broken street lamps, uncollected garbage, etc.) and admins manage them. Mobile-first responsive design. All user-facing text is in German (Deutsch).

## Tech Stack

- **Framework:** Nuxt 4.3.0 (Vue 3)
- **UI Components:** Nuxt UI 4.4.0
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon serverless)
- **ORM:** Prisma
- **Auth:** bcrypt (admin-only login, no registration)

## Commands

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run generate   # Static site generation
npm run preview    # Preview production build
```

## Project Structure

```
app/               # Nuxt application source (pages, components, layouts, composables)
public/            # Static assets (favicon, robots.txt)
docs/              # Project documentation (schema, UI standards, localization)
nuxt.config.ts     # Nuxt configuration
package.json       # Dependencies and scripts
tsconfig.json      # TypeScript config (references Nuxt-generated configs)
```

## Key Conventions

- Only use **Nuxt UI** components for all UI elements (buttons, inputs, modals, tables, cards, etc.). No custom or third-party UI components.
- Use Nuxt's default theme — do not customize the Nuxt UI theme.
- All user-facing text must be in **German (Deutsch)**.
- Mobile-first responsive design is mandatory.
- Follow Nuxt 4 conventions: file-based routing, auto-imports, server API routes in `server/api/`.

## Access Control

- **Public:** View incidents, report incidents, view statistics, contact form.
- **Admin-only:** Login/logout, "Mark as Done" button, view contact request info (phone numbers).

## Documentation

Refer to `docs/` for detailed specifications:
- `docs/DATABASE_SCHEMA.md` — Prisma schema and database models
- `docs/ui.md` — UI coding standards
- `docs/local.md` — Localization requirements
