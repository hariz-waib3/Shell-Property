<script setup>
import { onBeforeUnmount, onMounted } from 'vue'

defineProps({
  title: { type: String, required: true },
})

const emit = defineEmits(['close'])

const onKeydown = (event) => event.key === 'Escape' && emit('close')

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <div class="modal-bg" @click.self="emit('close')">
      <div class="modal" role="dialog" aria-modal="true" :aria-label="title">
        <header>
          <h3>{{ title }}</h3>
          <button class="x" aria-label="Close" @click="emit('close')">×</button>
        </header>
        <div class="body">
          <slot />
        </div>
        <footer v-if="$slots.footer">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>
