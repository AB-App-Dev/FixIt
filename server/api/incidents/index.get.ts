import { prisma } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const status = (query.status as string)?.toUpperCase() === 'CLOSED' ? 'CLOSED' : 'OPEN'

  const incidents = await prisma.incident.findMany({
    where: { status },
    orderBy: { reportDate: 'desc' },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      imageUrl: true,
      reportDate: true,
      closeDate: true,
      status: true,
      wantsContact: true,
      phoneNumber: true,
    },
  })

  return incidents
})
