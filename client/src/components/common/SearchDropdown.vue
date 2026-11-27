<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import BaseButton from './BaseButton.vue'

// Lens icon that opens a small dropdown with a search box. Used above the property tables.
// v-model is the search text. It stays applied when the dropdown closes (outside click or Escape).
//
//   <SearchDropdown v-model="filters.query" :result-count="rows.length" hint="Search by suburb, estate or lot number." />
defineProps({
  placeholder: { type: String, default: 'Search…' },
  hint: { type: String, default: '' },
  resultCount: { type: Number, default: 0 },
})

const query = defineModel({ type: String, required: true })

const isOpen = ref(false)
const rootEl = ref(null)
const inputEl = ref(null)

async function toggle() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    await nextTick()
    inputEl.value.focus()
  }
}

function clearQuery() {
  query.value = ''
  inputEl.value.focus()
}

function onDocumentClick(event) {
  if (rootEl.value && !rootEl.value.contains(event.target)) isOpen.value = false
}

onMounted(() => document.addEventListener('mousedown', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocumentClick))
</script>

<template>
  <div ref="rootEl" class="search-dropdown">
    <BaseButton
      icon-only
      icon="search"
      label="Search"
      class="toolbar-icon"
      :class="{ 'is-open': isOpen }"
      :aria-expanded="isOpen"
      @click="toggle"
    />
    <!-- Gold dot on the lens while a search is active. -->
    <span v-if="query.trim()" class="search-dot" aria-hidden="true"></span>

    <Transition name="drop">
      <div v-if="isOpen" class="search-menu">
        <div class="search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            ref="inputEl"
            v-model="query"
            type="text"
            :placeholder="placeholder"
            :aria-label="placeholder"
            @keydown.esc="isOpen = false"
          />
          <button v-if="query" type="button" class="clear-search" aria-label="Clear search" @click="clearQuery">
            ✕
          </button>
        </div>

        <p v-if="hint" class="search-hint">{{ hint }}</p>

        <div class="search-footer">
          <span v-if="query.trim()">
            <b>{{ resultCount }}</b> {{ resultCount === 1 ? 'match' : 'matches' }}
          </span>
          <span v-else class="muted">Start typing to filter the table</span>
          <span class="key-hint"><kbd>Esc</kbd> to close</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.search-dropdown {
  position: relative;
}

/* Bordered icon button, to match the other toolbar buttons.
   :deep because BaseButton passes the class on by hand, so the scoped attribute doesn't reach it. */
.search-dropdown :deep(.toolbar-icon) {
  border-color: var(--line);
  background: #fff;
  color: var(--ink);
}

.search-dropdown :deep(.toolbar-icon:hover) {
  border-color: #cfccc5;
  background: #fbfaf8;
}

.search-dropdown :deep(.toolbar-icon.is-open) {
  border-color: var(--ink);
}

.search-dropdown :deep(.toolbar-icon svg) {
  width: 23px;
  height: 23px;
}

.search-dot {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--gold);
  pointer-events: none;
}

.search-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 380px;
  padding: 14px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  box-shadow: 0 16px 40px rgba(20, 22, 26, 0.14);
  z-index: 35;
}

.search {
  position: relative;
}

.search svg {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  fill: none;
  stroke: var(--muted);
  stroke-width: 2;
  stroke-linecap: round;
  pointer-events: none;
}

.search input {
  width: 100%;
  height: 44px;
  padding: 0 40px 0 42px;
  border: 1px solid var(--line);
  border-radius: 10px;
  font-size: 14.5px;
  background: #fff;
}

.search input:focus {
  outline: none;
  border-color: var(--gold);
  box-shadow: 0 0 0 3px var(--gold-l);
}

.clear-search {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  border: 0;
  border-radius: 50%;
  background: #efeee9;
  color: var(--ink2);
  font-size: 11px;
  line-height: 1;
}

.clear-search:hover {
  background: #e2e0da;
}

.search-hint {
  margin: 8px 2px 0;
  font-size: 12px;
  color: var(--muted);
}

.search-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--line);
  font-size: 12.5px;
}

.key-hint {
  color: var(--muted);
}

kbd {
  font: inherit;
  font-size: 11px;
  font-weight: 600;
  padding: 1px 6px;
  border: 1px solid var(--line);
  border-bottom-width: 2px;
  border-radius: 4px;
  background: var(--bg);
  color: var(--ink2);
}

.drop-enter-active,
.drop-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.drop-enter-from,
.drop-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 600px) {
  .search-menu {
    right: auto;
    left: 0;
    width: calc(100vw - 32px);
  }
}
</style>
