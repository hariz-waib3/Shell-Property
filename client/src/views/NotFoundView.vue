<script setup>
import EmptyState from '@/components/common/EmptyState.vue'
</script>

<template>
  <main>
    <EmptyState class="card" title="Page not found" message="The page you are looking for doesn't exist.">
      <RouterLink class="btn primary" :to="{ name: 'home' }">Go to home</RouterLink>
    </EmptyState>
  </main>
</template>
