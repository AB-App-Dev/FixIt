<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface MonthlyStats {
  month: number
  open: number
  closed: number
}

interface YearlyStats {
  year: number
  open: number
  closed: number
}

const { data: stats } = await useFetch<{ monthly: MonthlyStats[]; yearly: YearlyStats[] }>(
  '/api/stats'
)

const view = ref<'monthly' | 'yearly'>('monthly')

const monthNames = [
  'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez',
]

const monthlyChartData = computed(() => {
  if (!stats.value?.monthly) {
    return { labels: [], datasets: [] }
  }

  return {
    labels: stats.value.monthly.map(s => monthNames[s.month - 1]),
    datasets: [
      {
        label: 'Offene Meldungen',
        data: stats.value.monthly.map(s => s.open),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Erledigte Meldungen',
        data: stats.value.monthly.map(s => s.closed),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  }
})

const yearlyChartData = computed(() => {
  if (!stats.value?.yearly) {
    return { labels: [], datasets: [] }
  }

  return {
    labels: stats.value.yearly.map(s => String(s.year)),
    datasets: [
      {
        label: 'Offene Meldungen',
        data: stats.value.yearly.map(s => s.open),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Erledigte Meldungen',
        data: stats.value.yearly.map(s => s.closed),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
      },
    },
  },
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold">
        {{ view === 'monthly' ? 'Meldungen pro Monat' : 'Meldungen pro Jahr' }}
      </h2>
      <div class="flex gap-1">
        <UButton
          label="Aktuell"
          :variant="view === 'monthly' ? 'solid' : 'ghost'"
          size="xs"
          class="cursor-pointer"
          @click="view = 'monthly'"
        />
        <UButton
          label="Gesamt"
          :variant="view === 'yearly' ? 'solid' : 'ghost'"
          size="xs"
          class="cursor-pointer"
          @click="view = 'yearly'"
        />
      </div>
    </div>

    <!-- Monthly Chart -->
    <template v-if="view === 'monthly'">
      <p v-if="!stats?.monthly?.length" class="text-sm text-muted">
        Keine Daten vorhanden.
      </p>

      <div v-else class="h-64 md:h-80">
        <ClientOnly>
          <Line :data="monthlyChartData" :options="chartOptions" />
          <template #fallback>
            <div class="h-full flex items-center justify-center bg-muted rounded">
              <span class="text-muted">Diagramm wird geladen...</span>
            </div>
          </template>
        </ClientOnly>
      </div>
    </template>

    <!-- Yearly Chart -->
    <template v-else>
      <p v-if="!stats?.yearly?.length" class="text-sm text-muted">
        Keine Daten vorhanden.
      </p>

      <div v-else class="h-64 md:h-80">
        <ClientOnly>
          <Line :data="yearlyChartData" :options="chartOptions" />
          <template #fallback>
            <div class="h-full flex items-center justify-center bg-muted rounded">
              <span class="text-muted">Diagramm wird geladen...</span>
            </div>
          </template>
        </ClientOnly>
      </div>
    </template>
  </div>
</template>
