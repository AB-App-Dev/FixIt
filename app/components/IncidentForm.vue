<script setup lang="ts">
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
const selectedLocation = ref<[number, number] | null>(null)
const mapCenter = ref<[number, number]>([46.7089, 15.7761]) // Mureck, Steiermark

// Fix Leaflet marker icon issue
const fixLeafletIcon = async () => {
  if (import.meta.client) {
    const L = await import('leaflet')
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    })
  }
}

onMounted(() => {
  fixLeafletIcon()
})

function onMapClick(event: any) {
  const { lat, lng } = event.latlng
  selectedLocation.value = [lat, lng]
  form.location = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  touched.location = true
}
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
  selectedLocation.value = null
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
    const formData = new FormData()
    formData.append('title', form.title)
    formData.append('description', form.description)
    formData.append('location', form.location)
    formData.append('image', form.image!)
    formData.append('wantsContact', String(form.wantsContact))
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
        label="Standort auf Karte auswählen"
        required
        :error="touched.location && errors.location ? errors.location : undefined"
      >
        <div class="space-y-2">
          <ClientOnly>
            <div class="h-64 rounded border border-default overflow-hidden">
              <LMap
                :zoom="13"
                :center="mapCenter"
                class="h-full w-full cursor-pointer"
                @click="onMapClick"
              >
                <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LMarker v-if="selectedLocation" :lat-lng="selectedLocation" />
              </LMap>
            </div>
            <template #fallback>
              <div class="h-64 rounded border border-default flex items-center justify-center bg-muted">
                <span class="text-muted">Karte wird geladen...</span>
              </div>
            </template>
          </ClientOnly>
          <UInput
            v-model="form.location"
            placeholder="Koordinaten"
            class="w-full"
            readonly
          />
          <p v-if="!selectedLocation" class="text-xs text-muted">
            Klicken Sie auf die Karte, um den Standort zu markieren.
          </p>
        </div>
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
    </form>
    </template>
  </div>
</template>
