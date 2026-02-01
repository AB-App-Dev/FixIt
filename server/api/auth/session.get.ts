import { prisma } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, 'auth_session')

  if (!sessionId) {
    return { loggedIn: false }
  }

  const admin = await prisma.admin.findUnique({
    where: { id: sessionId },
  })

  if (!admin) {
    deleteCookie(event, 'auth_session', { path: '/' })
    return { loggedIn: false }
  }

  return { loggedIn: true }
})
