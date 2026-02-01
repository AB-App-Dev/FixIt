import { prisma } from '../../utils/db'
import { randomBytes } from 'crypto'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email } = body

  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'E-Mail ist erforderlich.',
    })
  }

  // Username field contains email
  const admin = await prisma.admin.findUnique({
    where: { username: email },
  })

  // Always return success to prevent email enumeration
  if (!admin) {
    return { success: true }
  }

  // Generate reset token
  const resetToken = randomBytes(32).toString('hex')
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await prisma.admin.update({
    where: { id: admin.id },
    data: {
      resetToken,
      resetTokenExpiry,
    },
  })

  // In production, send email with reset link
  // For now, log the reset link (remove in production!)
  const config = useRuntimeConfig()
  const baseUrl = config.public.baseUrl || 'http://localhost:3000'
  const resetLink = `${baseUrl}/reset-password?token=${resetToken}`

  console.log('Password reset link:', resetLink)

  // TODO: Send email with resetLink
  // await sendEmail({
  //   to: admin.email,
  //   subject: 'Passwort zurücksetzen',
  //   html: `<p>Klicken Sie <a href="${resetLink}">hier</a>, um Ihr Passwort zurückzusetzen.</p>`,
  // })

  return { success: true }
})
