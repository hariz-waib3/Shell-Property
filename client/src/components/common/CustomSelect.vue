<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

// Custom dropdown for picking one value, styled the same everywhere. v-model is the selected option.
// Longer lists (more than SEARCH_FROM options) get a search box at the top.
//
//   <CustomSelect id="pf-state" v-model="form.state" :options="STATES" />
//
// Keyboard: Enter / Space / ↓ opens it, ↑ ↓ to move, Enter to pick, Escape to close (type to search on long lists).
const props = defineProps({
  options: { type: Array, required: true },
  placeholder: { type: String, default: 'Select…' },
  id: { type: String, default: undefined }, // so a <label for="..."> points at the button
})

const SEARCH_FROM = 7

const selected = defineModel({ type: [String, Number], default: '' })

const isOpen = ref(false)
const search = ref('')
const highlighted = ref(0) // position in filteredOptions
const rootEl = ref(null)
const searchEl = ref(null)
const listEl = ref(null)

const hasSearch = computed(() => props.options.length >= SEARCH_FROM)

const filteredOptions = computed(() => {
  const text = search.value.trim().toLowerCase()
  return props.options.filter((option) => String(option).toLowerCase().includes(text))
})

async function open() {
  isOpen.value = true
  search.value = ''
  highlighted.value = Math.max(props.options.indexOf(selected.value), 0)
  await nextTick()
  if (hasSearch.value) searchEl.value.focus()
  scrollToHighlighted()
}

function close() {
  isOpen.value = false
}

function choose(option) {
  selected.value = option
  close()
}

function moveHighlight(step) {
  const count = filteredOptions.value.length
  if (count === 0) return
  highlighted.value = (highlighted.value + step + count) % count
  scrollToHighlighted()
}

async function scrollToHighlighted() {
  await nextTick()
  listEl.value?.children[highlighted.value]?.scrollIntoView({ block: 'nearest' })
}

// Arrow keys, Enter and Escape while open: from the search box, or from the button on short lists.
function onOpenKeydown(event) {
  if (event.key === 'ArrowDown') moveHighlight(1)
  else if (event.key === 'ArrowUp') moveHighlight(-1)
  else if (event.key === 'Enter') {
    const option = filteredOptions.value[highlighted.value]
    if (option !== undefined) choose(option)
  } else if (event.key === 'Escape' || event.key === 'Tab') close()
  else return
  event.preventDefault()
}

function onTriggerKeydown(event) {
  if (isOpen.value) {
    onOpenKeydown(event)
    return
  }
  if (['ArrowDown', 'Enter', ' '].includes(event.key)) {
    event.preventDefault()
    open()
  }
}

// Close when clicking anywhere outside the dropdown.
function onDocumentClick(event) {
  if (rootEl.value && !rootEl.value.contains(event.target)) close()
}

onMounted(() => document.addEventListener('mousedown', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocumentClick))
</script>

<template>
  <div ref="rootEl" class="search-select">
    <button
      :id="id"
      type="button"
      class="trigger"
      :class="{ open: isOpen, empty: selected === '' || selected === null }"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      @click="isOpen ? close() : open()"
      @keydown="onTriggerKeydown"
    >
      <span class="value">{{ selected === '' || selected === null ? placeholder : selected }}</span>
    </button>

    <div v-if="isOpen" class="menu">
      <input
        v-if="hasSearch"
        ref="searchEl"
        v-model="search"
        class="search"
        placeholder="Search…"
        autocomplete="off"
        aria-label="Search options"
        @input="highlighted = 0"
        @keydown="onOpenKeydown"
      />

      <ul ref="listEl" class="options" role="listbox">
        <li
          v-for="(option, index) in filteredOptions"
          :key="option"
          role="option"
          class="option"
          :class="{ highlighted: index === highlighted, chosen: option === selected }"
          :aria-selected="option === selected"
          @mousedown.prevent="choose(option)"
          @mousemove="highlighted = index"
        >
          {{ option }}
          <span v-if="option === selected" class="tick" aria-hidden="true">✓</span>
        </li>
      </ul>
      <p v-if="filteredOptions.length === 0" class="no-results">No matches for "{{ search }}"</p>
    </div>
  </div>
</template>

<style scoped>
.search-select {
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
  color: var(--ink);
  font-size: 14px;
  position: relative;
}

.trigger.empty {
  color: var(--muted);
}

.trigger.open,
.trigger:focus-visible {
  outline: none;
  border-color: var(--gold);
  box-shadow: 0 0 0 3px var(--gold-l);
}

/* Chevron on the right, turned up while open. */
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
  transition: transform 0.15s;
}

.trigger.open::after {
  transform: translateY(-30%) rotate(225deg);
}

.value {
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
  padding: 6px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 10px;
  box-shadow: 0 12px 30px rgba(20, 22, 26, 0.12);
  z-index: 40;
}

.search {
  width: 100%;
  height: 34px;
  margin-bottom: 6px;
  padding: 0 10px;
  border: 1px solid var(--line);
  border-radius: 6px;
  font-size: 13.5px;
}

.search:focus {
  outline: none;
  border-color: var(--gold);
}

.options {
  list-style: none;
  max-height: 240px;
  overflow-y: auto;
}

.option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 13.5px;
  cursor: pointer;
}

.option.highlighted {
  background: var(--bg);
}

.option.chosen {
  font-weight: 600;
}

.tick {
  color: var(--gold-d);
}

.no-results {
  padding: 8px 10px;
  font-size: 13px;
  color: var(--muted);
}
</style>
