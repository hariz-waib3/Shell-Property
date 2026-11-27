<script setup>
import AppHeader from '@/components/layout/AppHeader.vue'
</script>

<template>
  <div class="app-shell">
    <div class="demo-bar">Proof of concept — sample data, no real payments.</div>
    <AppHeader />
    <main>
      <RouterView />
    </main>
  </div>
</template>
