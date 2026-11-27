<script setup>
import { ui } from '@/stores/ui'
</script>

<template>
  <Teleport to="body">
    <div v-for="item in ui.toasts" :key="item.id" class="toast" role="status">{{ item.message }}</div>
  </Teleport>
</template>
