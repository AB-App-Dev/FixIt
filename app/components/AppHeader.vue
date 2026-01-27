<script setup lang="ts">
const { loggedIn, logout } = useAuth()
const colorMode = useColorMode()

const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const handleLogout = async () => {
  await logout()
  navigateTo('/')
}
</script>

<template>
  <header class="border-b border-(--ui-border)">
    <UContainer class="flex items-center justify-between h-14">
      <NuxtLink to="/">
        <img src="/fixit_logo_3.png" alt="FixIt Logo" class="h-8 w-auto" />
      </NuxtLink>

      <div class="flex items-center gap-1">
        <UButton
          :icon="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
          variant="ghost"
          color="neutral"
          @click="toggleTheme"
        />
        <UButton
          v-if="loggedIn"
          label="Abmelden"
          icon="i-lucide-log-out"
          variant="ghost"
          color="neutral"
          @click="handleLogout"
        />
        <UButton
          v-else
          icon="i-lucide-circle-user"
          variant="ghost"
          color="neutral"
          to="/login"
        />
      </div>
    </UContainer>
  </header>
</template>
