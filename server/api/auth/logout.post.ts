export default defineEventHandler(async (event) => {
  deleteCookie(event, 'auth_session', {
    path: '/',
  })

  return { success: true }
})
