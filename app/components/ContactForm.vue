<script setup lang="ts">
const form = reactive({
  name: '',
  email: '',
  message: '',
})

const loading = ref(false)
const success = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  success.value = false
  loading.value = true

  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: form,
    })
    success.value = true
    form.name = ''
    form.email = ''
    form.message = ''
  } catch (e: any) {
    error.value = e.data?.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-[500px] mx-auto">
    <h2 class="text-lg font-semibold mb-3">Kontakt</h2>

    <p v-if="success" class="text-sm text-success mb-3">
      Ihre Nachricht wurde erfolgreich gesendet.
    </p>
    <p v-if="error" class="text-sm text-error mb-3">
      {{ error }}
    </p>

    <form class="space-y-3" @submit.prevent="submit">
      <UFormField label="Name" required>
        <UInput v-model="form.name" placeholder="Ihr Name" class="w-full" required />
      </UFormField>

      <UFormField label="E-Mail" required>
        <UInput v-model="form.email" type="email" placeholder="Ihre E-Mail-Adresse" class="w-full" required />
      </UFormField>

      <UFormField label="Nachricht" required>
        <UTextarea v-model="form.message" placeholder="Ihre Nachricht" :rows="4" class="w-full" required />
      </UFormField>

      <UButton
        type="submit"
        label="Absenden"
        icon="i-lucide-send"
        :loading="loading"
      />
    </form>
  </div>
</template>
