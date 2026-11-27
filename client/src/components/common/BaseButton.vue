<script setup>
import { computed, nextTick, ref } from 'vue'
import { RouterLink } from 'vue-router'

// The app's standard button. Use it everywhere instead of writing <button class="btn ...">.
//
//   <BaseButton>Cancel</BaseButton>                                 light, no icon
//   <BaseButton variant="dark" icon="plus">Add property</BaseButton> dark, with icon
//   <BaseButton small icon="trash" danger>Delete</BaseButton>        small, red text
//   <BaseButton :to="{ name: 'admin-plans' }">Edit plans</BaseButton> works as a link
//   <BaseButton small icon-only icon="edit" label="Edit" />          borderless icon, dark tooltip on hover
// Two root nodes (the button and its tooltip), so class / disabled / aria-* from the parent are passed on by hand.
defineOptions({ inheritAttrs: false })

const props = defineProps({
  variant: { type: String, default: 'light' }, // 'light' | 'dark'
  icon: { type: String, default: '' }, // a key from ICONS below
  small: { type: Boolean, default: false }, // 32px high instead of 40px, for table rows
  block: { type: Boolean, default: false }, // full width
  danger: { type: Boolean, default: false }, // red text, for destructive actions
  iconOnly: { type: Boolean, default: false }, // square button with just the icon
  label: { type: String, default: '' }, // tooltip and screen-reader text, required for icon-only buttons
  to: { type: [String, Object], default: null }, // when set, renders a router link
  type: { type: String, default: 'button' },
})

// Simple 24x24 line icons, drawn with the button's text colour.
const ICONS = {
  plus: ['M12 5v14', 'M5 12h14'],
  upload: ['M12 15V4', 'M7 9l5-5 5 5', 'M5 20h14'],
  download: ['M12 4v11', 'M7 10l5 5 5-5', 'M5 20h14'],
  edit: ['M4 20h4L19 9l-4-4L4 16z', 'M13.5 6.5l4 4'],
  trash: ['M4 7h16', 'M10 11v6', 'M14 11v6', 'M6 7l1 13h10l1-13', 'M9 7V4h6v3'],
  'arrow-right': ['M5 12h14', 'M13 6l6 6-6 6'],
  filter: ['M4 5h16l-6 8v6l-4-2v-4z'],
  power: ['M12 3v8', 'M6.3 6.8a8 8 0 1 0 11.4 0'],
  lock: ['M6 11h12v9H6z', 'M8.5 11V8a3.5 3.5 0 0 1 7 0v3'],
  unlock: ['M6 11h12v9H6z', 'M8.5 11V8a3.5 3.5 0 0 1 6.8-1.2'],
  'arrow-up': ['M12 19V5', 'M6 11l6-6 6 6'],
  'arrow-down': ['M12 5v14', 'M6 13l6 6 6-6'],
  search: ['M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z', 'M20 20l-3.5-3.5'],
  sliders: [
    'M4 7h9',
    'M17 7h3',
    'M15 5a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
    'M4 17h3',
    'M11 17h9',
    'M9 15a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
  ],
  eye: ['M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
}

const iconPaths = computed(() => ICONS[props.icon] || [])

/* ---------- Tooltip (icon-only buttons) ---------- */
// The label shows in a small dark tooltip above the button on hover or keyboard focus.
// It is added to <body> with fixed positioning, so it never widens or gets clipped by a scrolling table.
const tooltip = computed(() => (props.iconOnly && props.label ? props.label : ''))
const buttonEl = ref(null)
const tooltipEl = ref(null)
const tooltipStyle = ref(null) // null = hidden

async function showTooltip() {
  if (!tooltip.value) return
  const element = buttonEl.value.$el || buttonEl.value // RouterLink gives a component, <button> an element
  const box = element.getBoundingClientRect()
  tooltipStyle.value = { left: `${box.left + box.width / 2}px`, top: `${box.top - 8}px` }

  // Keep it inside the window when the button is near the right or left edge.
  await nextTick()
  if (!tooltipEl.value) return
  const width = tooltipEl.value.offsetWidth
  const centre = Math.min(Math.max(box.left + box.width / 2, width / 2 + 8), window.innerWidth - width / 2 - 8)
  tooltipStyle.value = { ...tooltipStyle.value, left: `${centre}px` }
}

function hideTooltip() {
  tooltipStyle.value = null
}

const classes = computed(() => [
  'base-btn',
  props.variant,
  { small: props.small, block: props.block, danger: props.danger, 'icon-only': props.iconOnly },
])
</script>

<template>
  <RouterLink
    v-if="to"
    ref="buttonEl"
    v-bind="$attrs"
    :to="to"
    :class="classes"
    :aria-label="label || undefined"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
    @focus="showTooltip"
    @blur="hideTooltip"
    @click="hideTooltip"
  >
    <svg v-if="iconPaths.length" viewBox="0 0 24 24" aria-hidden="true">
      <path v-for="d in iconPaths" :key="d" :d="d" />
    </svg>
    <slot />
  </RouterLink>

  <button
    v-else
    ref="buttonEl"
    v-bind="$attrs"
    :type="type"
    :class="classes"
    :aria-label="label || undefined"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
    @focus="showTooltip"
    @blur="hideTooltip"
    @click="hideTooltip"
  >
    <svg v-if="iconPaths.length" viewBox="0 0 24 24" aria-hidden="true">
      <path v-for="d in iconPaths" :key="d" :d="d" />
    </svg>
    <slot />
  </button>

  <Teleport to="body">
    <div v-if="tooltipStyle" ref="tooltipEl" class="btn-tooltip" role="tooltip" :style="tooltipStyle">
      {{ tooltip }}
    </div>
  </Teleport>
</template>

<style scoped>
.base-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 40px;
  padding: 0 16px;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  text-decoration: none;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s,
    color 0.15s;
}

.base-btn svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Light: white with a thin border. */
.light {
  background: #fff;
  border-color: var(--line);
  color: var(--ink);
}

.light:hover {
  border-color: #cfccc5;
  background: #fbfaf8;
}

/* Dark: brand ink background. */
.dark {
  background: var(--ink);
  border-color: var(--ink);
  color: #fff;
}

.dark:hover {
  background: var(--ink2);
}

.danger {
  color: var(--bad);
}

.danger:hover {
  border-color: var(--bad);
  background: var(--bad-l);
}

.small {
  height: 32px;
  padding: 0 12px;
  font-size: 13px;
  gap: 6px;
}

.small svg {
  width: 14px;
  height: 14px;
}

.block {
  width: 100%;
}

/* Icon-only: no border, grey background on hover, with a tooltip (see .btn-tooltip). */
.icon-only {
  position: relative;
  width: 40px;
  padding: 0;
  border-color: transparent;
  background: transparent;
  color: var(--ink2);
}

.icon-only.small {
  width: 32px;
}

.icon-only:hover {
  border-color: transparent;
  background: #efeee9;
}

.icon-only.danger {
  color: var(--bad);
}

.icon-only.danger:hover {
  background: var(--bad-l);
}

.icon-only.small svg {
  width: 17px;
  height: 17px;
}

/* Tooltip for icon-only buttons (shown in <body>, see showTooltip). */
.btn-tooltip {
  position: fixed;
  z-index: 200;
  transform: translate(-50%, -100%);
  padding: 6px 10px;
  border-radius: 6px;
  background: var(--ink);
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  pointer-events: none;
}

.base-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
