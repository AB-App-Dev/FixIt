import { prisma } from '../../utils/db'

export default defineEventHandler(async (event) => {
  // TODO: Verify admin session

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID fehlt.' })
  }

  const incident = await prisma.incident.update({
    where: { id },
    data: {
      status: 'CLOSED',
      closeDate: new Date(),
    },
  })

  return incident
})
