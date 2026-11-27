<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <div class="row page-header">
    <div class="grow">
      <h1 class="page">{{ title }}</h1>
      <p v-if="subtitle" class="sub">{{ subtitle }}</p>
    </div>
    <slot name="actions" />
  </div>
</template>

<style scoped>
.page-header {
  flex-wrap: wrap;
  align-items: flex-start;
}
</style>
