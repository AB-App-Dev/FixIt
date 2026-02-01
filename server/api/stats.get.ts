import { prisma } from '../utils/db'

export default defineEventHandler(async () => {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  // Monthly stats for current year
  const openMonthly = await prisma.$queryRaw<{ month: number; count: number }[]>`
    SELECT
      EXTRACT(MONTH FROM "reportDate")::int AS month,
      COUNT(*)::int AS count
    FROM incidents
    WHERE
      status = 'OPEN'
      AND EXTRACT(YEAR FROM "reportDate") = ${currentYear}
    GROUP BY EXTRACT(MONTH FROM "reportDate")
  `

  const closedMonthly = await prisma.$queryRaw<{ month: number; count: number }[]>`
    SELECT
      EXTRACT(MONTH FROM "closeDate")::int AS month,
      COUNT(*)::int AS count
    FROM incidents
    WHERE
      status = 'CLOSED'
      AND "closeDate" IS NOT NULL
      AND EXTRACT(YEAR FROM "closeDate") = ${currentYear}
    GROUP BY EXTRACT(MONTH FROM "closeDate")
  `

  const openMonthMap = new Map(openMonthly.map(s => [s.month, s.count]))
  const closedMonthMap = new Map(closedMonthly.map(s => [s.month, s.count]))

  const monthly = []
  for (let month = 1; month <= currentMonth; month++) {
    monthly.push({
      month,
      open: openMonthMap.get(month) || 0,
      closed: closedMonthMap.get(month) || 0,
    })
  }

  // Yearly stats
  const openYearly = await prisma.$queryRaw<{ year: number; count: number }[]>`
    SELECT
      EXTRACT(YEAR FROM "reportDate")::int AS year,
      COUNT(*)::int AS count
    FROM incidents
    WHERE status = 'OPEN'
    GROUP BY EXTRACT(YEAR FROM "reportDate")
  `

  const closedYearly = await prisma.$queryRaw<{ year: number; count: number }[]>`
    SELECT
      EXTRACT(YEAR FROM "closeDate")::int AS year,
      COUNT(*)::int AS count
    FROM incidents
    WHERE
      status = 'CLOSED'
      AND "closeDate" IS NOT NULL
    GROUP BY EXTRACT(YEAR FROM "closeDate")
  `

  const allYears = new Set([
    ...openYearly.map(s => s.year),
    ...closedYearly.map(s => s.year),
  ])
  const sortedYears = Array.from(allYears).sort((a, b) => a - b)

  const openYearMap = new Map(openYearly.map(s => [s.year, s.count]))
  const closedYearMap = new Map(closedYearly.map(s => [s.year, s.count]))

  const yearly = sortedYears.map(year => ({
    year,
    open: openYearMap.get(year) || 0,
    closed: closedYearMap.get(year) || 0,
  }))

  return { monthly, yearly }
})
