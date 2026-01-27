<script setup lang="ts">
const { data: openIncidents, refresh: refreshOpen } = await useFetch('/api/incidents', {
  query: { status: 'open' },
})

const { data: closedIncidents, refresh: refreshClosed } = await useFetch('/api/incidents', {
  query: { status: 'closed' },
})

async function onIncidentClosed() {
  await Promise.all([refreshOpen(), refreshClosed()])
}
</script>

<template>
  <div class="space-y-10">
    <!-- Hero -->
    <section class="text-center py-8">
      <h1 class="text-3xl font-bold mb-3">Melden Sie Probleme in Ihrer Gemeinde</h1>
      <p class="text-(--ui-text-muted) mb-6 max-w-lg mx-auto">
        Melden Sie öffentliche Missstände schnell und unkompliziert.<br/>Gemeinsam sorgen wir für eine bessere Umgebung.
      </p>
      <UButton
        label="Vorfall melden"
        icon="i-lucide-alert-triangle"
        size="lg"
        to="/report"
      />
    </section>

    <USeparator />

    <!-- Incidents -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <section>
        <IncidentList
          title="Offene Meldungen"
          type="open"
          :incidents="openIncidents || []"
          @closed="onIncidentClosed"
        />
      </section>

      <section>
        <IncidentList
          title="Erledigte Meldungen"
          type="closed"
          :incidents="closedIncidents || []"
        />
      </section>
    </div>

    <USeparator />

    <!-- Statistics -->
    <section>
      <StatsChart />
    </section>

    <USeparator />

    <!-- Contact -->
    <section>
      <ContactForm />
    </section>
  </div>
</template>
