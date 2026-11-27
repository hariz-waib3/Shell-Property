<script setup>
defineProps({
  tags: { type: Array, required: true },
})
</script>

<template>
  <span v-for="tag in tags" :key="tag" class="tag" :class="tag === 'Exclusive' ? 't-gold' : 't-info'">
    {{ tag }}
  </span>
</template>

<style scoped>
.tag {
  margin-left: 4px;
}
</style>
