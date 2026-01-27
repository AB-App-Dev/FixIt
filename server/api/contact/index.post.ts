import { prisma } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    name: string
    email: string
    message: string
  }>(event)

  if (!body.name || !body.email || !body.message) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Alle Felder sind erforderlich.',
    })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(body.email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    })
  }

  const contactMessage = await prisma.contactMessage.create({
    data: {
      name: body.name,
      email: body.email,
      message: body.message,
    },
  })

  return contactMessage
})
