<script setup>
// One number on the admin dashboard, with an icon. The whole card links to the page behind the number.
//
//   <StatCard label="Active listings" :value="42" hint="129 total" icon="home" :to="{ name: 'admin-properties' }" />
const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  hint: { type: String, default: '' },
  icon: { type: String, default: 'home' }, // a key from ICONS below
  to: { type: [String, Object], required: true },
})

const ICONS = {
  home: 'M4 11l8-7 8 7v9H4z M10 20v-5h4v5',
  users:
    'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M2 21v-1a6 6 0 0 1 12 0v1 M16 3.5a4 4 0 0 1 0 7.5 M22 21v-1a6 6 0 0 0-4-5.6',
  dollar: 'M12 2v20 M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  inbox: 'M3 13h5l2 3h4l2-3h5 M5 5h14l2 8v6H3v-6z',
}

const iconPath = ICONS[props.icon]
</script>

<template>
  <RouterLink class="card stat-card" :to="to">
    <span class="stat-icon">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="iconPath" /></svg>
    </span>
    <span class="stat-label">{{ label }}</span>
    <b class="stat-value">{{ value }}</b>
    <small v-if="hint" class="stat-hint">{{ hint }}</small>
  </RouterLink>
</template>

<style scoped>
.stat-card {
  display: grid;
  gap: 2px;
  padding: 18px 20px;
  color: inherit;
  text-decoration: none;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}

.stat-card:hover {
  border-color: var(--gold);
  box-shadow: 0 6px 20px rgba(20, 22, 26, 0.06);
}

.stat-icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  margin-bottom: 10px;
  border-radius: 10px;
  background: var(--gold-l);
}

.stat-icon svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: var(--gold-d);
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.stat-label {
  font-size: 12.5px;
  color: var(--muted);
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.5px;
}

.stat-hint {
  font-size: 12px;
  color: var(--muted);
}
</style>
