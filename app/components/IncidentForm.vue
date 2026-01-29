<script setup lang="ts">
import { useReCaptcha } from 'vue-recaptcha-v3'

const recaptcha = useReCaptcha()

const form = reactive({
  title: '',
  description: '',
  location: '',
  image: null as File | null,
  wantsContact: false,
  phoneNumber: '',
})

const loading = ref(false)
const success = ref(false)
const error = ref('')
const imagePreview = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const touched = reactive({
  title: false,
  description: false,
  location: false,
  image: false,
  phoneNumber: false,
})

const errors = computed(() => ({
  title: !form.title
    ? 'Titel ist erforderlich.'
    : form.title.length < 5
      ? 'Titel muss mindestens 5 Zeichen haben.'
      : form.title.length > 200
        ? 'Titel darf maximal 200 Zeichen haben.'
        : null,
  description: !form.description
    ? 'Beschreibung ist erforderlich.'
    : form.description.length < 10
      ? 'Beschreibung muss mindestens 10 Zeichen haben.'
      : null,
  location: !form.location
    ? 'Standort ist erforderlich.'
    : form.location.length < 5
      ? 'Standort muss mindestens 5 Zeichen haben.'
      : null,
  image: !form.image ? 'Foto ist erforderlich.' : null,
  phoneNumber: form.wantsContact && !form.phoneNumber
    ? 'Telefonnummer ist erforderlich wenn Sie kontaktiert werden möchten.'
    : null,
}))

const isValid = computed(() => {
  return !errors.value.title &&
    !errors.value.description &&
    !errors.value.location &&
    !errors.value.image &&
    !errors.value.phoneNumber
})

async function compressImage(file: File, maxSizeBytes: number): Promise<File> {
  if (file.size <= maxSizeBytes) {
    return file
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    img.onload = () => {
      let { width, height } = img
      const maxDimension = 1920

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = (height / width) * maxDimension
          width = maxDimension
        } else {
          width = (width / height) * maxDimension
          height = maxDimension
        }
      }

      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)

      let quality = 0.8
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Komprimierung fehlgeschlagen'))
              return
            }

            if (blob.size <= maxSizeBytes || quality <= 0.1) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              quality -= 0.1
              tryCompress()
            }
          },
          'image/jpeg',
          quality
        )
      }
      tryCompress()
    }

    img.onerror = () => reject(new Error('Bild konnte nicht geladen werden'))
    img.src = URL.createObjectURL(file)
  })
}

async function handleImageChange(event: Event) {
  touched.image = true
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    form.image = null
    imagePreview.value = null
    return
  }

  if (!file.type.startsWith('image/')) {
    error.value = 'Bitte wählen Sie eine Bilddatei aus.'
    form.image = null
    imagePreview.value = null
    return
  }

  error.value = ''

  try {
    const compressedFile = await compressImage(file, 500 * 1024)
    form.image = compressedFile
    imagePreview.value = URL.createObjectURL(compressedFile)
  } catch (e) {
    error.value = 'Fehler bei der Bildverarbeitung.'
    form.image = null
    imagePreview.value = null
  }
}

function touchAll() {
  touched.title = true
  touched.description = true
  touched.location = true
  touched.image = true
  touched.phoneNumber = true
}

function resetForm() {
  form.title = ''
  form.description = ''
  form.location = ''
  form.image = null
  form.wantsContact = false
  form.phoneNumber = ''
  imagePreview.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  touched.title = false
  touched.description = false
  touched.location = false
  touched.image = false
  touched.phoneNumber = false
  success.value = false
  error.value = ''
}

async function submit() {
  touchAll()
  error.value = ''
  success.value = false

  if (!isValid.value) {
    error.value = 'Bitte korrigieren Sie die markierten Felder.'
    return
  }

  loading.value = true

  try {
    await recaptcha?.recaptchaLoaded()
    const recaptchaToken = await recaptcha?.executeRecaptcha('submit_incident')

    if (!recaptchaToken) {
      throw new Error('reCAPTCHA-Überprüfung fehlgeschlagen. Bitte versuchen Sie es erneut.')
    }

    const formData = new FormData()
    formData.append('title', form.title)
    formData.append('description', form.description)
    formData.append('location', form.location)
    formData.append('image', form.image!)
    formData.append('wantsContact', String(form.wantsContact))
    formData.append('recaptchaToken', recaptchaToken)
    if (form.wantsContact && form.phoneNumber) {
      formData.append('phoneNumber', form.phoneNumber)
    }

    await $fetch('/api/incidents', {
      method: 'POST',
      body: formData,
    })

    success.value = true
    form.title = ''
    form.description = ''
    form.location = ''
    form.image = null
    form.wantsContact = false
    form.phoneNumber = ''
    imagePreview.value = null
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    touched.title = false
    touched.description = false
    touched.location = false
    touched.image = false
    touched.phoneNumber = false
  } catch (e: any) {
    error.value = e.data?.message || e.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <!-- Success state with options -->
    <div v-if="success" class="text-center py-8">
      <UIcon name="i-lucide-check-circle" class="text-success text-5xl mb-4" />
      <h2 class="text-xl font-semibold mb-2">Vielen Dank!</h2>
      <p class="text-muted mb-6">Ihre Meldung wurde erfolgreich eingereicht.</p>
      <p class="mb-6">Möchten Sie einen weiteren Vorfall melden?</p>
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <UButton
          label="Ja"
          icon="i-lucide-plus"
          @click="resetForm"
        />
        <UButton
          label="Nein"
          variant="soft"
          icon="i-lucide-home"
          @click="navigateTo('/')"
        />
      </div>
    </div>

    <!-- Form -->
    <template v-else>
      <p v-if="error" class="text-sm text-error mb-3">
        {{ error }}
      </p>

      <form class="space-y-4" @submit.prevent="submit">
      <UFormField
        label="Titel"
        required
        :error="touched.title && errors.title ? errors.title : undefined"
      >
        <UInput
          v-model="form.title"
          placeholder="Kurze Beschreibung des Problems"
          maxlength="200"
          class="w-full"
          @blur="touched.title = true"
        />
      </UFormField>

      <UFormField
        label="Beschreibung"
        required
        :error="touched.description && errors.description ? errors.description : undefined"
      >
        <UTextarea
          v-model="form.description"
          placeholder="Beschreiben Sie das Problem genauer"
          :rows="4"
          class="w-full"
          @blur="touched.description = true"
        />
      </UFormField>

      <UFormField
        label="Standort"
        required
        :error="touched.location && errors.location ? errors.location : undefined"
      >
        <UInput
          v-model="form.location"
          placeholder="z.B. Hauptstraße 15, Musterstadt"
          class="w-full"
          @blur="touched.location = true"
        />
      </UFormField>

      <UFormField
        label="Foto"
        required
        :error="touched.image && errors.image ? errors.image : undefined"
      >
        <div class="space-y-2">
          <label class="flex items-center gap-2 cursor-pointer">
            <UButton
              type="button"
              variant="soft"
              icon="i-lucide-upload"
              label="Bild auswählen"
              @click="fileInput?.click()"
            />
            <span v-if="form.image" class="text-sm text-(--ui-text-muted)">
              {{ form.image.name }}
            </span>
            <span v-else class="text-sm text-(--ui-text-muted)">
              Keine Datei ausgewählt
            </span>
          </label>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleImageChange"
          />
          <img
            v-if="imagePreview"
            :src="imagePreview"
            class="max-h-48 rounded border border-(--ui-border)"
            alt="Bildvorschau"
          />
        </div>
      </UFormField>

      <UCheckbox
        v-model="form.wantsContact"
        label="Ich möchte kontaktiert werden"
      />

      <UFormField
        v-if="form.wantsContact"
        label="Telefonnummer"
        required
        :error="touched.phoneNumber && errors.phoneNumber ? errors.phoneNumber : undefined"
      >
        <UInput
          v-model="form.phoneNumber"
          type="tel"
          placeholder="+43 123 456789"
          class="w-full"
          @blur="touched.phoneNumber = true"
        />
      </UFormField>

      <UButton
        type="submit"
        label="Meldung absenden"
        icon="i-lucide-send"
        :loading="loading"
      />

      <p class="text-xs text-muted mt-4">
        Diese Seite ist durch reCAPTCHA geschützt. Es gelten die
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener" class="underline hover:text-primary">Datenschutzerklärung</a>
        und
        <a href="https://policies.google.com/terms" target="_blank" rel="noopener" class="underline hover:text-primary">Nutzungsbedingungen</a>
        von Google.
      </p>
    </form>
    </template>
  </div>
</template>
