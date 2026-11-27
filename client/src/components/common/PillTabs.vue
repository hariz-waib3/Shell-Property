<script setup>
defineProps({
  options: { type: Array, required: true },
})

const model = defineModel({ type: String, required: true })
</script>

<template>
  <div class="pills" role="tablist">
    <button
      v-for="option in options"
      :key="option"
      role="tab"
      :aria-selected="model === option"
      :class="{ on: model === option }"
      @click="model = option"
    >
      {{ option }}
    </button>
  </div>
</template>
