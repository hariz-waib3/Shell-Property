<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

// Dropdown with checkboxes, for picking several values. v-model is an array of the selected options.
//
//   <MultiSelect v-model="filters.states" :options="STATES" placeholder="All states" />
const props = defineProps({
  options: { type: Array, required: true },
  placeholder: { type: String, default: 'All' },
  id: { type: String, default: undefined },
})

const selected = defineModel({ type: Array, required: true })

const isOpen = ref(false)
const rootEl = ref(null)

// What the closed dropdown shows: placeholder, the picked names, or a count.
const summary = computed(() => {
  if (selected.value.length === 0) return props.placeholder
  if (selected.value.length <= 2) return selected.value.join(', ')
  return `${selected.value.length} selected`
})

function toggleOption(option) {
  if (selected.value.includes(option)) {
    selected.value = selected.value.filter((item) => item !== option)
  } else {
    selected.value = [...selected.value, option]
  }
}

function clearSelection() {
  selected.value = []
}

// Close when clicking anywhere outside the dropdown, or pressing Escape.
function onDocumentClick(event) {
  if (rootEl.value && !rootEl.value.contains(event.target)) isOpen.value = false
}

function onKeydown(event) {
  if (event.key === 'Escape') isOpen.value = false
}

onMounted(() => {
  document.addEventListener('mousedown', onDocumentClick)
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div ref="rootEl" class="multi-select">
    <button
      :id="id"
      type="button"
      class="trigger"
      :class="{ open: isOpen, 'has-value': selected.length > 0 }"
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
    >
      <span class="summary">{{ summary }}</span>
    </button>

    <div v-if="isOpen" class="menu">
      <label v-for="option in options" :key="option" class="option">
        <input type="checkbox" :checked="selected.includes(option)" @change="toggleOption(option)" />
        {{ option }}
      </label>

      <div class="menu-footer">
        <button type="button" class="clear" :disabled="selected.length === 0" @click="clearSelection">Clear</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.multi-select {
  position: relative;
}

.trigger {
  width: 100%;
  height: 40px;
  padding: 0 34px 0 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  text-align: left;
  color: var(--muted);
  position: relative;
}

.trigger.has-value {
  color: var(--ink);
  font-weight: 500;
}

.trigger.open,
.trigger:focus-visible {
  outline: none;
  border-color: var(--gold);
  box-shadow: 0 0 0 3px var(--gold-l);
}

/* Chevron on the right. */
.trigger::after {
  content: '';
  position: absolute;
  right: 14px;
  top: 50%;
  width: 7px;
  height: 7px;
  border-right: 1.5px solid var(--muted);
  border-bottom: 1.5px solid var(--muted);
  transform: translateY(-70%) rotate(45deg);
}

.summary {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  min-width: 200px;
  max-height: 280px;
  overflow-y: auto;
  padding: 6px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 10px;
  box-shadow: 0 12px 30px rgba(20, 22, 26, 0.12);
  z-index: 40;
}

.option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 13.5px;
  font-weight: 400;
  cursor: pointer;
}

.option:hover {
  background: var(--bg);
}

.option input {
  accent-color: var(--gold);
  width: 15px;
  height: 15px;
}

.menu-footer {
  border-top: 1px solid var(--line);
  margin-top: 6px;
  padding: 8px 10px 2px;
  text-align: right;
}

.clear {
  background: none;
  border: 0;
  padding: 0;
  color: var(--gold-d);
  font-weight: 600;
  font-size: 12.5px;
}

.clear:disabled {
  color: var(--muted);
  cursor: default;
}
</style>
