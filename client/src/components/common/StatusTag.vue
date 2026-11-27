<script setup>
import { statusColorClass } from '@/utils/format'

defineProps({
  status: { type: String, required: true },
})
</script>

<template>
  <span class="tag" :class="statusColorClass(status)">{{ status }}</span>
</template>
