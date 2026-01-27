# Database Schema - Citizen Incident Reporting App

## Overview

This document describes the database schema for the Citizen Incident Reporting Web App using **Prisma ORM** with **Neon PostgreSQL**.

---

## Setup

### 1. Install Dependencies

```bash
npm install prisma @prisma/client
npx prisma init
```

### 2. Configure Neon Connection

Update `.env`:

```env
DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/incident_db?sslmode=require"
```

Update `prisma/schema.prisma` datasource:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Admin {
  id        String   @id @default(cuid())
  username  String   @unique
  password  String   // hashed with bcrypt
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("admins")
}

model Incident {
  id           String         @id @default(cuid())
  title        String         @db.VarChar(200)
  description  String         @db.Text
  location     String         // Google Maps URL
  imageUrl     String         // Stored image URL (e.g., S3, Cloudinary)
  status       IncidentStatus @default(OPEN)
  reportDate   DateTime       @default(now())
  closeDate    DateTime?
  wantsContact Boolean        @default(false)
  phoneNumber  String?        @db.VarChar(30)
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  @@index([status])
  @@index([reportDate])
  @@map("incidents")
}

model ContactMessage {
  id        String   @id @default(cuid())
  name      String   @db.VarChar(100)
  email     String   @db.VarChar(255)
  message   String   @db.Text
  createdAt DateTime @default(now())

  @@map("contact_messages")
}

enum IncidentStatus {
  OPEN
  CLOSED
}
```

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                          Admin                              │
├─────────────────────────────────────────────────────────────┤
│ id         │ String    │ PK, CUID                          │
│ username   │ String    │ Unique                            │
│ password   │ String    │ Hashed                            │
│ createdAt  │ DateTime  │ Auto                              │
│ updatedAt  │ DateTime  │ Auto                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                        Incident                             │
├─────────────────────────────────────────────────────────────┤
│ id           │ String         │ PK, CUID                   │
│ title        │ String(200)    │ Required                   │
│ description  │ Text           │ Required                   │
│ location     │ String         │ Google Maps URL            │
│ imageUrl     │ String         │ Uploaded image URL         │
│ status       │ Enum           │ OPEN / CLOSED              │
│ reportDate   │ DateTime       │ Auto (now)                 │
│ closeDate    │ DateTime?      │ Nullable                   │
│ wantsContact │ Boolean        │ Default: false             │
│ phoneNumber  │ String(30)?    │ Nullable                   │
│ createdAt    │ DateTime       │ Auto                       │
│ updatedAt    │ DateTime       │ Auto                       │
├─────────────────────────────────────────────────────────────┤
│ Indexes: status, reportDate                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     ContactMessage                          │
├─────────────────────────────────────────────────────────────┤
│ id        │ String       │ PK, CUID                        │
│ name      │ String(100)  │ Required                        │
│ email     │ String(255)  │ Required                        │
│ message   │ Text         │ Required                        │
│ createdAt │ DateTime     │ Auto                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Commands

### Generate Prisma Client

```bash
npx prisma generate
```

### Push Schema to Neon (Development)

```bash
npx prisma db push
```

### Create Migration (Production)

```bash
npx prisma migrate dev --name init
```

### Open Prisma Studio

```bash
npx prisma studio
```

---

## Seed Admin User

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('your-secure-password', 10)

  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword
    }
  })

  console.log('Admin user seeded')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

Run seed:

```bash
npm install -D tsx
npx prisma db seed
```

---

## Nuxt Server Utility

Create `server/utils/db.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}
```

---

## Example API Usage

### Get Open Incidents

`server/api/incidents/index.get.ts`:

```typescript
import { prisma } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const incidents = await prisma.incident.findMany({
    where: { status: 'OPEN' },
    orderBy: { reportDate: 'desc' },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      imageUrl: true,
      reportDate: true,
      status: true
      // phoneNumber and wantsContact excluded for public
    }
  })

  return incidents
})
```

### Close Incident (Admin Only)

`server/api/incidents/[id].patch.ts`:

```typescript
import { prisma } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  // TODO: Verify admin auth

  const id = getRouterParam(event, 'id')

  const incident = await prisma.incident.update({
    where: { id },
    data: {
      status: 'CLOSED',
      closeDate: new Date()
    }
  })

  return incident
})
```

### Get Statistics

`server/api/stats.get.ts`:

```typescript
import { prisma } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const view = query.view as string || 'current'

  if (view === 'all') {
    // Group by year
    const stats = await prisma.$queryRaw`
      SELECT 
        EXTRACT(YEAR FROM "closeDate") as year,
        COUNT(*)::int as count
      FROM incidents
      WHERE status = 'CLOSED' AND "closeDate" IS NOT NULL
      GROUP BY EXTRACT(YEAR FROM "closeDate")
      ORDER BY year
    `
    return stats
  }

  // Current year - group by month
  const currentYear = new Date().getFullYear()
  const stats = await prisma.$queryRaw`
    SELECT 
      EXTRACT(MONTH FROM "closeDate") as month,
      COUNT(*)::int as count
    FROM incidents
    WHERE 
      status = 'CLOSED' 
      AND "closeDate" IS NOT NULL
      AND EXTRACT(YEAR FROM "closeDate") = ${currentYear}
    GROUP BY EXTRACT(MONTH FROM "closeDate")
    ORDER BY month
  `
  return stats
})
```

---

## Notes

- **Neon PostgreSQL** supports connection pooling - use the pooled connection string for serverless
- **Image storage**: Store images in Cloudinary/S3/Supabase Storage, save URL in `imageUrl`
- **Password hashing**: Always use bcrypt with salt rounds ≥ 10
- **Indexes**: Added on `status` and `reportDate` for query performance
