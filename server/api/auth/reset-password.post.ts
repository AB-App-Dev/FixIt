import bcrypt from 'bcrypt'
import { prisma } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { token, password } = body

  if (!token || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Token und Passwort sind erforderlich.',
    })
  }

  if (password.length < 8) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Das Passwort muss mindestens 8 Zeichen lang sein.',
    })
  }

  const admin = await prisma.admin.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        gt: new Date(),
      },
    },
  })

  if (!admin) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Ungültiger oder abgelaufener Token.',
    })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.admin.update({
    where: { id: admin.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  })

  return { success: true }
})
