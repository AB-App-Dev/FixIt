<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const route = useRoute()
const router = useRouter()
const toast = useToast()

const token = computed(() => route.query.token as string)

const form = reactive({
  password: '',
  confirmPassword: '',
})

const loading = ref(false)
const error = ref('')
const success = ref(false)

// Redirect if no token
if (!token.value) {
  router.push('/login')
}

async function submit() {
  error.value = ''

  if (form.password.length < 8) {
    error.value = 'Das Passwort muss mindestens 8 Zeichen lang sein.'
    return
  }

  if (form.password !== form.confirmPassword) {
    error.value = 'Die Passwörter stimmen nicht überein.'
    return
  }

  loading.value = true

  try {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: {
        token: token.value,
        password: form.password,
      },
    })
    success.value = true
    toast.add({
      title: 'Passwort geändert',
      description: 'Ihr Passwort wurde erfolgreich zurückgesetzt.',
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
  } catch (e: any) {
    error.value = e.data?.message || 'Ein Fehler ist aufgetreten.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-[60vh] flex items-center justify-center">
    <div class="w-full max-w-100 p-6 rounded-lg border border-default bg-default">
      <h1 class="text-xl font-semibold mb-6 text-center">Neues Passwort setzen</h1>

      <template v-if="!success">
        <p v-if="error" class="text-sm text-error mb-4 p-3 rounded bg-error/10">
          {{ error }}
        </p>

        <form class="space-y-4" @submit.prevent="submit">
          <UFormField label="Neues Passwort" required>
            <UInput
              v-model="form.password"
              type="password"
              placeholder="Mindestens 8 Zeichen"
              class="w-full"
              autocomplete="new-password"
              required
            />
          </UFormField>

          <UFormField label="Passwort bestätigen" required>
            <UInput
              v-model="form.confirmPassword"
              type="password"
              placeholder="Passwort wiederholen"
              class="w-full"
              autocomplete="new-password"
              required
            />
          </UFormField>

          <UButton
            type="submit"
            label="Passwort speichern"
            icon="i-lucide-save"
            class="w-full cursor-pointer"
            :loading="loading"
          />
        </form>
      </template>

      <template v-else>
        <div class="text-center">
          <UIcon name="i-lucide-check-circle" class="text-5xl text-success mb-4" />
          <p class="text-muted mb-6">
            Ihr Passwort wurde erfolgreich zurückgesetzt.
          </p>
          <UButton
            label="Zur Anmeldung"
            icon="i-lucide-log-in"
            class="w-full cursor-pointer"
            @click="router.push('/login')"
          />
        </div>
      </template>
    </div>
  </div>
</template>
