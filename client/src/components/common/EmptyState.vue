<script setup>
defineProps({
  title: { type: String, required: true },
  message: { type: String, default: '' },
})
</script>

<template>
  <div class="empty">
    <b>{{ title }}</b>
    {{ message }}
    <div v-if="$slots.default" class="actions">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.actions {
  margin-top: 16px;
}
</style>
