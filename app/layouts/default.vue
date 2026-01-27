<script setup lang="ts">
const { checkSession } = useAuth()

onMounted(() => {
  checkSession()
})
</script>

<template>
  <div class="flex flex-col min-h-screen bg-(--ui-bg)">
    <AppHeader />
    <UContainer as="main" class="flex-1 py-6">
      <slot />
    </UContainer>
    <AppFooter />
  </div>
</template>
