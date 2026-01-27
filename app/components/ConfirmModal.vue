<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

const props = defineProps<{
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  confirm: []
}>()
</script>

<template>
  <UModal v-model:open="open" :title="props.title" :description="props.description">
    <slot />
    <template #footer="{ close }">
      <UButton
        :label="cancelLabel || 'Abbrechen'"
        color="neutral"
        variant="outline"
        @click="close"
      />
      <UButton
        :label="confirmLabel || 'Bestätigen'"
        color="error"
        :loading="loading"
        @click="emit('confirm')"
      />
    </template>
  </UModal>
</template>
