import { prisma } from '../utils/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const view = (query.view as string) || 'current'

  if (view === 'all') {
    const stats = await prisma.$queryRaw<{ year: number; count: number }[]>`
      SELECT
        EXTRACT(YEAR FROM "closeDate")::int AS year,
        COUNT(*)::int AS count
      FROM incidents
      WHERE status = 'CLOSED' AND "closeDate" IS NOT NULL
      GROUP BY EXTRACT(YEAR FROM "closeDate")
      ORDER BY year
    `
    return stats
  }

  const currentYear = new Date().getFullYear()
  const stats = await prisma.$queryRaw<{ month: number; count: number }[]>`
    SELECT
      EXTRACT(MONTH FROM "closeDate")::int AS month,
      COUNT(*)::int AS count
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
