export const useAuth = () => {
  const loggedIn = useState<boolean>('auth:loggedIn', () => false)

  const checkSession = async () => {
    try {
      const data = await $fetch<{ loggedIn: boolean }>('/api/auth/session')
      loggedIn.value = data.loggedIn
    } catch {
      loggedIn.value = false
    }
  }

  const login = async (username: string, password: string) => {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { username, password },
    })
    loggedIn.value = true
  }

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    loggedIn.value = false
  }

  return {
    loggedIn: readonly(loggedIn),
    checkSession,
    login,
    logout,
  }
}
