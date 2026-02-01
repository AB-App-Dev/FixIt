<script setup lang="ts">
interface Incident {
  id: string
  title: string
  description: string
  location: string
  imageUrl: string
  reportDate: string
  closeDate: string | null
  status: string
  wantsContact: boolean
  phoneNumber: string | null
}

const props = defineProps<{
  title: string
  incidents: Incident[]
  type: 'open' | 'closed'
}>()

const emit = defineEmits<{
  closed: [id: string]
}>()

const { loggedIn } = useAuth()
const closingId = ref<string | null>(null)
const confirmOpen = ref(false)
const closing = ref(false)

function isNew(reportDate: string) {
  const diff = Date.now() - new Date(reportDate).getTime()
  return diff < 48 * 60 * 60 * 1000
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function getGoogleMapsUrl(location: string) {
  const coords = location.replace(/\s/g, '')
  return `https://www.google.com/maps?q=${coords}`
}

function openConfirm(id: string) {
  closingId.value = id
  confirmOpen.value = true
}

async function closeIncident() {
  if (!closingId.value) return
  closing.value = true
  try {
    await $fetch(`/api/incidents/${closingId.value}`, { method: 'PATCH' })
    confirmOpen.value = false
    emit('closed', closingId.value)
  } finally {
    closing.value = false
    closingId.value = null
  }
}

const accordionItems = computed(() =>
  props.incidents.map((incident) => ({
    label: incident.title,
    value: incident.id,
    slot: incident.id as any,
  }))
)
</script>

<template>
  <div
    class="rounded-lg border p-4"
    :class="type === 'open' ? 'border-warning bg-warning/5' : 'border-success bg-success/5'"
  >
    <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
      <UIcon
        :name="type === 'open' ? 'i-lucide-alert-circle' : 'i-lucide-check-circle'"
        :class="type === 'open' ? 'text-warning' : 'text-success'"
      />
      {{ title }}
    </h2>

    <p v-if="incidents.length === 0" class="text-muted text-sm">
      Keine Meldungen vorhanden.
    </p>

    <UAccordion
      v-else
      type="single"
      collapsible
      :items="accordionItems"
      :ui="{ trigger: 'cursor-pointer hover:bg-muted/50 rounded-md transition-colors' }"
    >
      <template #leading="{ item }">
        <span class="text-sm text-muted mr-4">
          {{ formatDate(type === 'closed'
            ? incidents.find(i => i.id === item.value)!.closeDate!
            : incidents.find(i => i.id === item.value)!.reportDate
          ) }}
        </span>
        <UBadge
          v-if="type === 'open' && isNew(incidents.find(i => i.id === item.value)!.reportDate)"
          label="Neu"
          color="info"
          variant="subtle"
          size="xs"
        />
      </template>

      <template
        v-for="incident in incidents"
        :key="incident.id"
        #[incident.id]
      >
        <div class="space-y-3 px-2 pb-3">
          <a
            :href="getGoogleMapsUrl(incident.location)"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <UIcon name="i-lucide-map-pin" />
            Standort auf Google Maps
          </a>

          <img
            :src="incident.imageUrl"
            :alt="incident.title"
            class="rounded-md max-h-48 object-cover w-full"
          />

          <p class="text-sm text-muted">{{ incident.description }}</p>

          <div v-if="loggedIn && incident.wantsContact" class="text-sm">
            <p class="font-medium">Kontaktanfrage:</p>
            <a :href="`tel:${incident.phoneNumber}`" class="text-primary hover:underline">
              {{ incident.phoneNumber }}
            </a>
          </div>

          <UButton
            v-if="loggedIn && type === 'open'"
            label="Als erledigt markieren"
            icon="i-lucide-check"
            color="success"
            variant="soft"
            size="sm"
            @click="openConfirm(incident.id)"
          />
        </div>
      </template>
    </UAccordion>

    <ConfirmModal
      v-model:open="confirmOpen"
      title="Meldung schließen"
      description="Sind Sie sicher, dass Sie diese Meldung als erledigt markieren möchten?"
      confirm-label="Erledigt"
      :loading="closing"
      @confirm="closeIncident"
    />
  </div>
</template>
