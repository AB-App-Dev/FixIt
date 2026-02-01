<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const { login, loggedIn } = useAuth()
const router = useRouter()
const toast = useToast()

const form = reactive({
  email: '',
  password: '',
})

const resetForm = reactive({
  email: '',
})

const loading = ref(false)
const resetLoading = ref(false)
const error = ref('')
const showForgotPassword = ref(false)
const resetSent = ref(false)

// Redirect if already logged in
watchEffect(() => {
  if (loggedIn.value) {
    router.push('/')
  }
})

async function submit() {
  error.value = ''
  loading.value = true

  try {
    await login(form.email, form.password)
    router.push('/')
  } catch (e: any) {
    error.value = e.data?.message || 'Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Zugangsdaten.'
  } finally {
    loading.value = false
  }
}

async function submitResetRequest() {
  resetLoading.value = true

  try {
    await $fetch('/api/auth/reset-request', {
      method: 'POST',
      body: { email: resetForm.email },
    })
    resetSent.value = true
    toast.add({
      title: 'E-Mail gesendet',
      description: 'Falls ein Konto mit dieser E-Mail existiert, erhalten Sie einen Link zum Zurücksetzen.',
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
  } catch (e: any) {
    toast.add({
      title: 'Fehler',
      description: e.data?.message || 'Ein Fehler ist aufgetreten.',
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  } finally {
    resetLoading.value = false
  }
}

function closeResetModal() {
  showForgotPassword.value = false
  resetSent.value = false
  resetForm.email = ''
}
</script>

<template>
  <div class="min-h-[60vh] flex items-center justify-center">
    <div class="w-full max-w-100 p-6 rounded-lg border border-default bg-default">
      <h1 class="text-xl font-semibold mb-6 text-center">Admin-Anmeldung</h1>

      <p v-if="error" class="text-sm text-error mb-4 p-3 rounded bg-error/10">
        {{ error }}
      </p>

      <form class="space-y-4" @submit.prevent="submit">
        <UFormField label="E-Mail" required>
          <UInput
            v-model="form.email"
            type="email"
            placeholder="E-Mail eingeben"
            class="w-full"
            autocomplete="email"
            required
          />
        </UFormField>

        <UFormField label="Passwort" required>
          <UInput
            v-model="form.password"
            type="password"
            placeholder="Passwort eingeben"
            class="w-full"
            autocomplete="current-password"
            required
          />
        </UFormField>

        <div class="text-right">
          <button
            type="button"
            class="text-sm text-primary hover:underline cursor-pointer"
            @click="showForgotPassword = true"
          >
            Passwort vergessen?
          </button>
        </div>

        <UButton
          type="submit"
          label="Anmelden"
          icon="i-lucide-log-in"
          class="w-full cursor-pointer"
          :loading="loading"
        />
      </form>
    </div>

    <UModal v-model:open="showForgotPassword" @close="closeResetModal">
      <template #content>
        <div class="p-6">
          <h2 class="text-lg font-semibold mb-4">Passwort zurücksetzen</h2>

          <template v-if="!resetSent">
            <p class="text-muted mb-4">
              Geben Sie Ihre E-Mail-Adresse ein. Sie erhalten einen Link zum Zurücksetzen Ihres Passworts.
            </p>

            <form class="space-y-4" @submit.prevent="submitResetRequest">
              <UFormField label="E-Mail" required>
                <UInput
                  v-model="resetForm.email"
                  type="email"
                  placeholder="E-Mail eingeben"
                  class="w-full"
                  required
                />
              </UFormField>

              <div class="flex gap-2">
                <UButton
                  type="button"
                  label="Abbrechen"
                  variant="ghost"
                  class="flex-1 cursor-pointer"
                  @click="closeResetModal"
                />
                <UButton
                  type="submit"
                  label="Link senden"
                  class="flex-1 cursor-pointer"
                  :loading="resetLoading"
                />
              </div>
            </form>
          </template>

          <template v-else>
            <div class="text-center">
              <UIcon name="i-lucide-mail-check" class="text-4xl text-success mb-4" />
              <p class="text-muted mb-4">
                Falls ein Konto mit dieser E-Mail existiert, wurde ein Link zum Zurücksetzen gesendet.
              </p>
              <UButton
                label="Schließen"
                class="w-full cursor-pointer"
                @click="closeResetModal"
              />
            </div>
          </template>
        </div>
      </template>
    </UModal>
  </div>
</template>
