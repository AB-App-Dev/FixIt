import bcrypt from 'bcrypt'
import { prisma } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'E-Mail und Passwort sind erforderlich.',
    })
  }

  // Username field contains email
  const admin = await prisma.admin.findUnique({
    where: { username: email },
  })

  if (!admin) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Ungültige Anmeldedaten.',
    })
  }

  const isValidPassword = await bcrypt.compare(password, admin.password)

  if (!isValidPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Ungültige Anmeldedaten.',
    })
  }

  // Set session cookie
  setCookie(event, 'auth_session', admin.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return { success: true }
})
