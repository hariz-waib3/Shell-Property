<script setup>
import { computed, ref } from 'vue'

// One accordion section of the filter sidebar. Without `options` it just shows the slot (e.g. a select).
// With `options` ({ value, label, meta }) it shows a checkbox list, the first few with "More" for the rest;
// v-model is the array of checked values.
const props = defineProps({
  title: { type: String, required: true },
  options: { type: Array, default: null },
  startOpen: { type: Boolean, default: false },
  active: { type: Boolean, default: false }, // shows a dot on the heading when a non-checkbox filter is set
})

const selected = defineModel({ type: Array, default: () => [] })

const SHOWN_AT_FIRST = 5

const isOpen = ref(props.startOpen)
const showAll = ref(false)

// Ticked options always stay visible, even when the list is cut short.
const visibleOptions = computed(() => {
  if (!props.options || showAll.value) return props.options
  return props.options.filter((option, index) => index < SHOWN_AT_FIRST || selected.value.includes(option.value))
})

const hiddenCount = computed(() => (props.options ? props.options.length - visibleOptions.value.length : 0))

function toggle(value) {
  selected.value = selected.value.includes(value)
    ? selected.value.filter((item) => item !== value)
    : [...selected.value, value]
}
</script>

<template>
  <section class="filter-group">
    <button type="button" class="group-head" :aria-expanded="isOpen" @click="isOpen = !isOpen">
      <span class="sign" :class="{ open: isOpen }" aria-hidden="true"></span>
      <span class="group-title">{{ title }}</span>
      <span v-if="selected.length" class="group-count">{{ selected.length }}</span>
      <span v-else-if="active" class="group-dot" aria-label="In use"></span>
    </button>

    <div v-if="isOpen" class="group-body">
      <slot />
      <template v-if="options">
        <label v-for="option in visibleOptions" :key="option.value" class="option">
          <input type="checkbox" :checked="selected.includes(option.value)" @change="toggle(option.value)" />
          <span class="option-label">{{ option.label }}</span>
          <span class="option-meta">{{ option.meta }}</span>
        </label>
        <p v-if="options.length === 0" class="muted empty">No matches</p>
        <button v-if="hiddenCount > 0" type="button" class="more" @click="showAll = true">
          More ({{ hiddenCount }})
        </button>
        <button
          v-else-if="showAll && options.length > SHOWN_AT_FIRST"
          type="button"
          class="more"
          @click="showAll = false"
        >
          Less
        </button>
      </template>
    </div>
  </section>
</template>

<style scoped>
.filter-group {
  border-bottom: 1px solid var(--line);
}

.group-head {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 15px 2px;
  border: 0;
  background: none;
  color: var(--ink);
  font-size: 14.5px;
  font-weight: 500;
  text-align: left;
}

.group-head:hover .group-title {
  color: var(--gold-d);
}

/* Plus when closed, minus when open. */
.sign {
  position: relative;
  flex: none;
  width: 12px;
  height: 12px;
}

.sign::before,
.sign::after {
  content: '';
  position: absolute;
  left: 0;
  top: 5px;
  width: 12px;
  height: 2px;
  border-radius: 1px;
  background: var(--ink);
  transition: transform 0.15s ease;
}

.sign::after {
  transform: rotate(90deg);
}

.sign.open::after {
  transform: rotate(0deg);
}

.group-title {
  flex: 1;
}

.group-count {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--gold-l);
  color: var(--gold-d);
  font-size: 11.5px;
  font-weight: 600;
  line-height: 20px;
  text-align: center;
}

.group-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--gold);
}

.group-body {
  padding: 0 2px 14px 24px;
}

.option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  font-size: 13.5px;
  font-weight: 400;
  cursor: pointer;
}

.option input {
  flex: none;
  width: 16px;
  height: 16px;
  accent-color: var(--gold);
}

.option-label {
  flex: 1;
}

.option-meta {
  color: var(--muted);
  font-size: 12px;
  white-space: nowrap;
}

.more {
  margin-top: 6px;
  padding: 4px 0;
  border: 0;
  background: none;
  color: var(--gold-d);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.more:hover {
  text-decoration: underline;
}

.empty {
  margin: 4px 0;
  font-size: 12.5px;
}
</style>
