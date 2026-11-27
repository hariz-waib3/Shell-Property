<script setup>
import BaseButton from '@/components/common/BaseButton.vue'

defineProps({
  document: { type: Object, required: true },
  locked: { type: Boolean, default: false }, // Free plan: shows a lock instead of the download icon
})

const emit = defineEmits(['download'])
</script>

<template>
  <div class="card doc">
    <div class="ic">PDF</div>
    <div class="grow">
      <b>{{ document.title }}</b>
      <p>{{ document.description }}</p>
      <p>{{ document.size }} · {{ document.category }}</p>
    </div>
    <BaseButton
      small
      icon-only
      class="download"
      :icon="locked ? 'lock' : 'download'"
      :label="locked ? 'Upgrade to download' : `Download ${document.title}`"
      @click="emit('download', document)"
    />
  </div>
</template>

<style scoped>
/* Bordered square icon, centred against the card text. */
.doc .download {
  align-self: center;
  border-color: var(--line);
  background: #fff;
}

.doc .download:hover {
  border-color: var(--gold);
  color: var(--gold-d);
}
</style>
