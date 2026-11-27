<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

// Text box that turns entries into removable tags. v-model is an array of strings.
// Typing shows matching suggestions; Enter adds the highlighted suggestion, or the typed text as a new tag.
//
//   <TagInput v-model="form.inclusions" :suggestions="db.inclusions" placeholder="Add an inclusion" />
const props = defineProps({
  suggestions: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Type and press Enter' },
  id: { type: String, default: undefined },
})

const tags = defineModel({ type: Array, required: true })

const query = ref('')
const isOpen = ref(false)
const activeIndex = ref(-1)
const rootEl = ref(null)
const inputEl = ref(null)

const isTaken = (text) => tags.value.some((tag) => tag.toLowerCase() === text.toLowerCase())

const matches = computed(() => {
  const text = query.value.trim().toLowerCase()
  return props.suggestions.filter((item) => !isTaken(item) && item.toLowerCase().includes(text))
})

watch(query, () => {
  activeIndex.value = -1
  isOpen.value = true
})

function addTag(text) {
  const value = text.trim()
  if (value && !isTaken(value)) tags.value = [...tags.value, value]
  query.value = ''
  inputEl.value.focus()
}

// Focus alone doesn't reopen the list when the input already has focus, so a click opens it too.
function openMenu() {
  isOpen.value = true
  inputEl.value.focus()
}

function removeTag(index) {
  tags.value = tags.value.filter((_, i) => i !== index)
}

function onEnter() {
  addTag(activeIndex.value >= 0 ? matches.value[activeIndex.value] : query.value)
}

function moveActive(step) {
  if (matches.value.length === 0) return
  isOpen.value = true
  const count = matches.value.length
  activeIndex.value = (activeIndex.value + step + count) % count
}

function onBackspace() {
  if (query.value === '' && tags.value.length > 0) removeTag(tags.value.length - 1)
}

function onDocumentClick(event) {
  if (rootEl.value && !rootEl.value.contains(event.target)) isOpen.value = false
}

onMounted(() => document.addEventListener('mousedown', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocumentClick))
</script>

<template>
  <div ref="rootEl" class="tag-input">
    <div class="box" :class="{ open: isOpen && matches.length > 0 }" @click="openMenu">
      <span v-for="(tag, index) in tags" :key="tag" class="tag">
        {{ tag }}
        <button type="button" class="remove" :aria-label="`Remove ${tag}`" @click.stop="removeTag(index)">✕</button>
      </span>
      <input
        :id="id"
        ref="inputEl"
        v-model="query"
        type="text"
        autocomplete="off"
        :placeholder="tags.length ? '' : placeholder"
        @focus="isOpen = true"
        @keydown.enter.prevent="onEnter"
        @keydown.down.prevent="moveActive(1)"
        @keydown.up.prevent="moveActive(-1)"
        @keydown.backspace="onBackspace"
        @keydown.esc="isOpen = false"
      />
    </div>

    <ul v-if="isOpen && matches.length > 0" class="menu" role="listbox">
      <li
        v-for="(item, index) in matches"
        :key="item"
        class="option"
        :class="{ active: index === activeIndex }"
        role="option"
        :aria-selected="index === activeIndex"
        @mousedown.prevent="addTag(item)"
        @mouseenter="activeIndex = index"
      >
        {{ item }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.tag-input {
  position: relative;
}

.box {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  padding: 7px 8px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  cursor: text;
}

.box:focus-within {
  border-color: var(--gold);
  box-shadow: 0 0 0 3px var(--gold-l);
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 28px;
  padding: 0 4px 0 12px;
  border-radius: 999px;
  background: var(--gold-l);
  color: var(--gold-d);
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.remove {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--gold-d);
  font-size: 10px;
  line-height: 1;
  opacity: 0.7;
}

.remove:hover {
  background: rgba(143, 111, 62, 0.15);
  opacity: 1;
}

.box input {
  flex: 1;
  width: auto;
  min-width: 120px;
  height: 28px;
  padding: 0 4px;
  border: 0;
  font-size: 14px;
  background: transparent;
  box-shadow: none;
}

.box input:focus {
  outline: none;
  box-shadow: none;
}

.menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  max-height: 260px;
  overflow-y: auto;
  margin: 0;
  padding: 6px;
  list-style: none;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 10px;
  box-shadow: 0 12px 30px rgba(20, 22, 26, 0.12);
  z-index: 40;
}

.option {
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 13.5px;
  cursor: pointer;
}

.option.active {
  background: var(--bg);
}
</style>
