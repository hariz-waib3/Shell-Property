<script setup>
import BaseButton from './BaseButton.vue'

// Filter icon for table toolbars. v-model:open shows / hides the page's filter panel;
// `count` puts a small gold badge on the icon when filters are in use.
defineProps({
  count: { type: Number, default: 0 },
})

const open = defineModel('open', { type: Boolean, required: true })
</script>

<template>
  <div class="filter-button">
    <BaseButton
      icon-only
      icon="sliders"
      label="Filters"
      class="toolbar-icon"
      :class="{ 'is-open': open }"
      :aria-expanded="open"
      @click="open = !open"
    />
    <span v-if="count > 0" class="count">{{ count }}</span>
  </div>
</template>

<style scoped>
.filter-button {
  position: relative;
}

.toolbar-icon {
  border-color: var(--line);
  background: #fff;
  color: var(--ink);
}

.toolbar-icon:hover {
  border-color: #cfccc5;
  background: #fbfaf8;
}

.toolbar-icon.is-open {
  border-color: var(--ink);
}

.toolbar-icon :deep(svg) {
  width: 20px;
  height: 20px;
}

.count {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: var(--gold);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  display: grid;
  place-items: center;
  pointer-events: none;
}
</style>
