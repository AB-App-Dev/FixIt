<script setup lang="ts">
const view = ref<'current' | 'all'>('current')

const { data: stats, refresh } = await useFetch<{ month?: number; year?: number; count: number }[]>(
  '/api/stats',
  { query: computed(() => ({ view: view.value })) }
)

const monthNames = [
  'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez',
]

const maxCount = computed(() => {
  if (!stats.value?.length) return 1
  return Math.max(...stats.value.map((s) => s.count), 1)
})

const bars = computed(() => {
  if (!stats.value) return []
  return stats.value.map((s) => ({
    label: view.value === 'current' ? monthNames[(s.month ?? 1) - 1] : String(s.year),
    count: s.count,
    height: Math.round((s.count / maxCount.value) * 100),
  }))
})
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold">Statistik</h2>
      <div class="flex gap-1">
        <UButton
          label="Aktuell"
          :variant="view === 'current' ? 'solid' : 'ghost'"
          size="xs"
          @click="view = 'current'"
        />
        <UButton
          label="Gesamt"
          :variant="view === 'all' ? 'solid' : 'ghost'"
          size="xs"
          @click="view = 'all'"
        />
      </div>
    </div>

    <p v-if="!bars.length" class="text-sm text-(--ui-text-muted)">
      Keine Daten vorhanden.
    </p>

    <div v-else class="flex items-end gap-2 h-40">
      <div
        v-for="bar in bars"
        :key="bar.label"
        class="flex-1 flex flex-col items-center gap-1"
      >
        <span class="text-xs font-medium">{{ bar.count }}</span>
        <div
          class="w-full rounded-t bg-(--ui-primary) transition-all duration-300"
          :style="{ height: `${bar.height}%`, minHeight: bar.count ? '4px' : '0' }"
        />
        <span class="text-xs text-(--ui-text-muted)">{{ bar.label }}</span>
      </div>
    </div>
  </div>
</template>
