<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { formatDate } from '@/utils/format'

// Date field that opens a calendar when clicked. v-model is an ISO date string ('2027-07-01') or ''.
//
//   <DatePicker id="pf-registration" v-model="form.registration" />
//
// Dates are handled as plain year / month / day numbers, so time zones can't shift the chosen day.
const props = defineProps({
  id: { type: String, default: undefined },
  placeholder: { type: String, default: 'Select a date' },
  disabled: { type: Boolean, default: false },
})

const value = defineModel({ type: String, default: '' })

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

const isOpen = ref(false)
const rootEl = ref(null)

// The month shown in the calendar (not necessarily the chosen one).
const viewYear = ref(0)
const viewMonth = ref(0) // 0 = January

const pad = (number) => String(number).padStart(2, '0')
const toIso = (year, month, day) => `${year}-${pad(month + 1)}-${pad(day)}`

const now = new Date()
const todayIso = toIso(now.getFullYear(), now.getMonth(), now.getDate())

// One entry per square in the grid: empty squares first, so day 1 sits under the right weekday (weeks start Monday).
const calendarDays = computed(() => {
  const firstWeekday = (new Date(viewYear.value, viewMonth.value, 1).getDay() + 6) % 7
  const daysInMonth = new Date(viewYear.value, viewMonth.value + 1, 0).getDate()

  const squares = Array.from({ length: firstWeekday }, () => null)
  for (let day = 1; day <= daysInMonth; day++) {
    squares.push({ day, iso: toIso(viewYear.value, viewMonth.value, day) })
  }
  return squares
})

// The year list covers a few years back and ten years ahead (registrations are usually in the future).
const years = computed(() => {
  const start = Math.min(now.getFullYear() - 5, viewYear.value)
  return Array.from({ length: 16 }, (_, index) => start + index)
})

function open() {
  if (props.disabled) return
  const [year, month] = value.value ? value.value.split('-').map(Number) : [now.getFullYear(), now.getMonth() + 1]
  viewYear.value = year
  viewMonth.value = month - 1
  isOpen.value = true
}

function close() {
  isOpen.value = false
}

function changeMonth(step) {
  const date = new Date(viewYear.value, viewMonth.value + step, 1)
  viewYear.value = date.getFullYear()
  viewMonth.value = date.getMonth()
}

function choose(iso) {
  value.value = iso
  close()
}

function onDocumentClick(event) {
  if (rootEl.value && !rootEl.value.contains(event.target)) close()
}

function onKeydown(event) {
  if (event.key === 'Escape') close()
}

onMounted(() => document.addEventListener('mousedown', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocumentClick))
</script>

<template>
  <div ref="rootEl" class="date-picker" @keydown="onKeydown">
    <button
      :id="id"
      type="button"
      class="trigger"
      :class="{ open: isOpen, empty: !value }"
      :disabled="disabled"
      aria-haspopup="dialog"
      :aria-expanded="isOpen"
      @click="isOpen ? close() : open()"
    >
      <span>{{ value ? formatDate(value) : placeholder }}</span>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3.5" y="5" width="17" height="15" rx="2" />
        <path d="M3.5 10h17M8 3v4M16 3v4" />
      </svg>
    </button>

    <div v-if="isOpen" class="calendar" role="dialog" aria-label="Choose a date">
      <div class="calendar-head">
        <button type="button" class="nav" aria-label="Previous month" @click="changeMonth(-1)">‹</button>
        <div class="month-year">
          <select v-model="viewMonth" aria-label="Month">
            <option v-for="(name, index) in MONTHS" :key="name" :value="index">{{ name }}</option>
          </select>
          <select v-model="viewYear" aria-label="Year">
            <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
          </select>
        </div>
        <button type="button" class="nav" aria-label="Next month" @click="changeMonth(1)">›</button>
      </div>

      <div class="grid weekdays">
        <span v-for="weekday in WEEKDAYS" :key="weekday">{{ weekday }}</span>
      </div>

      <div class="grid days">
        <template v-for="(square, index) in calendarDays" :key="index">
          <span v-if="!square"></span>
          <button
            v-else
            type="button"
            class="day"
            :class="{ selected: square.iso === value, today: square.iso === todayIso }"
            :aria-label="formatDate(square.iso)"
            :aria-pressed="square.iso === value"
            @click="choose(square.iso)"
          >
            {{ square.day }}
          </button>
        </template>
      </div>

      <div class="calendar-foot">
        <button type="button" class="link-button" @click="choose(todayIso)">Today</button>
        <button type="button" class="link-button muted" :disabled="!value" @click="choose('')">Clear</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.date-picker {
  position: relative;
}

.trigger {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 0 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  color: var(--ink);
  font-size: 14px;
  text-align: left;
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

.trigger:disabled {
  background: var(--bg);
  cursor: not-allowed;
}

.trigger svg {
  width: 17px;
  height: 17px;
  flex: none;
  fill: none;
  stroke: var(--muted);
  stroke-width: 1.7;
  stroke-linecap: round;
}

.calendar {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  width: 290px;
  padding: 12px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  box-shadow: 0 12px 30px rgba(20, 22, 26, 0.14);
  z-index: 40;
}

.calendar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 10px;
}

.nav {
  width: 30px;
  height: 30px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  font-size: 18px;
  line-height: 1;
  color: var(--ink);
}

.nav:hover {
  background: var(--bg);
}

.month-year {
  display: flex;
  gap: 4px;
}

.month-year select {
  width: auto;
  height: 30px;
  padding: 0 24px 0 8px;
  border: 0;
  border-radius: 6px;
  background-color: transparent;
  font-size: 13.5px;
  font-weight: 600;
}

.month-year select:hover {
  background-color: var(--bg);
}

.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  text-align: center;
}

.weekdays span {
  padding: 4px 0;
  font-size: 11px;
  font-weight: 600;
  color: var(--muted);
}

.day {
  height: 34px;
  border: 0;
  border-radius: 8px;
  background: none;
  font-size: 13px;
  color: var(--ink);
}

.day:hover {
  background: var(--bg);
}

.day.today {
  font-weight: 700;
  color: var(--gold-d);
}

.day.selected {
  background: var(--ink);
  color: #fff;
}

.calendar-foot {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--line);
}

.link-button {
  background: none;
  border: 0;
  padding: 4px 2px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--gold-d);
}

.link-button.muted {
  color: var(--muted);
}

.link-button:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
