<script setup>
import { computed } from 'vue'
import { formatDate, formatPrice, packagePrice, propertyCode } from '@/utils/format'

const props = defineProps({
  property: { type: Object, required: true },
})

// "Details", "Investment snapshot" and "Referral details" on the property page (partner and admin).

// Simple 24x24 line icons for the specification rows.
const ICONS = {
  house: 'M4 11l8-7 8 7v9H4z M10 20v-5h4v5',
  layers: 'M12 4l9 5-9 5-9-5z M3 14l9 5 9-5',
  area: 'M4 4h16v16H4z M4 9h5V4',
  land: 'M3 20l6-14 4 8 3-5 5 11z',
  contract: 'M7 3h7l4 4v14H7z M14 3v4h4 M10 12h5 M10 16h5',
  tag: 'M3 12V4h8l10 10-8 8z M8 8h.01',
  title:
    'M12 3l2.5 2 3.2-.3.7 3.1 2.6 1.9-1.4 2.9 1.4 2.9-2.6 1.9-.7 3.1-3.2-.3L12 21l-2.5-2-3.2.3-.7-3.1L3 14.4l1.4-2.9L3 8.6l2.6-1.9.7-3.1 3.2.3z M9 12l2 2 4-4',
  id: 'M5 9h14 M5 15h14 M10 4l-2 16 M16 4l-2 16',
  width: 'M3 12h18 M6 9l-3 3 3 3 M18 9l3 3-3 3',
  calendar: 'M4 6h16v14H4z M4 10h16 M8 3v4 M16 3v4',
}

const specifications = computed(() => {
  const property = props.property
  return [
    { label: 'Property ID', value: propertyCode(property.id), icon: ICONS.id },
    { label: 'Construction', value: property.type, icon: ICONS.house },
    { label: 'Elevation', value: `${property.storeys} storey`, icon: ICONS.layers },
    { label: 'Total floor area', value: `${property.build} m²`, icon: ICONS.area },
    { label: 'Land size', value: `${property.land} m²`, icon: ICONS.land },
    { label: 'Land width', value: property.landWidth ? `${property.landWidth} m` : '–', icon: ICONS.width },
    { label: 'Contract type', value: property.contract, icon: ICONS.contract },
    { label: 'Pricing', value: property.pricing, icon: ICONS.tag },
    { label: 'Title', value: property.titled ? 'Titled' : 'Untitled', icon: ICONS.title },
    { label: 'Status verified', value: formatDate(property.verified), icon: ICONS.calendar },
  ]
})

// Titled land is ready now; otherwise the expected registration date.
function registrationText(property) {
  if (property.titled) return 'Titled'
  return property.registration ? formatDate(property.registration) : 'On request'
}

// Empty figures show "On request", like the builder's own listings.
const snapshot = computed(() => [
  { label: 'Est. gross yield', value: props.property.grossYield || 'On request' },
  { label: 'Est. rent p/w', value: props.property.weeklyRent || 'On request' },
  { label: 'Registration', value: registrationText(props.property) },
])
</script>

<template>
  <section class="detail-block">
    <div class="section-t">Details</div>

    <div class="details-layout">
      <!-- Specification rows: icon, label, value. -->
      <dl class="spec-list">
        <div v-for="item in specifications" :key="item.label" class="spec-row">
          <dt>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="item.icon" /></svg>
            {{ item.label }}
          </dt>
          <dd>{{ item.value }}</dd>
        </div>
      </dl>

      <!-- Price breakdown, laid out like a receipt. -->
      <div class="receipt">
        <span class="receipt-title">Price breakdown</span>
        <div class="receipt-line">
          <span>Build price</span>
          <span>{{ formatPrice(property.buildPrice) }}</span>
        </div>
        <div class="receipt-line">
          <span>Land price</span>
          <span>{{ formatPrice(property.landPrice) }}</span>
        </div>
        <div class="receipt-line total">
          <span>Package total</span>
          <span>{{ formatPrice(packagePrice(property)) }}</span>
        </div>
      </div>
    </div>
  </section>

  <section class="detail-block">
    <div class="section-t">Investment snapshot</div>
    <div class="snapshot">
      <div v-for="item in snapshot" :key="item.label" class="snapshot-item">
        <b>{{ item.value }}</b>
        <span>{{ item.label }}</span>
      </div>
    </div>
  </section>

  <!-- Collapsed by default: only needed when a partner is ready to refer a buyer. -->
  <details class="detail-block referral">
    <summary class="section-t">Referral details</summary>
    <dl class="referral-list">
      <div>
        <dt>Referral fee</dt>
        <dd>{{ property.referralFee || 'On request' }}</dd>
      </div>
      <div>
        <dt>Payment terms</dt>
        <dd>{{ property.referralTerms || 'On request' }}</dd>
      </div>
    </dl>
  </details>
</template>

<style scoped>
/* ---------- Details: spec rows + receipt ---------- */
.details-layout {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 24px;
  align-items: start;
}

.spec-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 28px;
  margin: 0;
}

.spec-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 0;
  border-bottom: 1px solid var(--line);
  font-size: 13.5px;
}

.spec-row dt {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
}

.spec-row dt svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: var(--gold-d);
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.spec-row dd {
  margin: 0;
  font-weight: 600;
  text-align: right;
}

.receipt {
  padding: 16px 18px;
  border-radius: 10px;
  background: var(--gold-l);
}

.receipt-title {
  display: block;
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--gold-d);
}

.receipt-line {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13.5px;
}

.receipt-line.total {
  margin-top: 6px;
  padding-top: 10px;
  border-top: 1px dashed #d9c7a6;
  font-size: 15.5px;
  font-weight: 700;
}

/* ---------- Investment snapshot ---------- */
.snapshot {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.snapshot-item {
  display: grid;
  gap: 4px;
  padding: 14px 16px;
  border: 1px solid var(--line);
  border-radius: 10px;
}

.snapshot-item b {
  font-size: 18px;
}

.snapshot-item span {
  font-size: 12.5px;
  color: var(--muted);
}

/* ---------- Referral details (collapsible) ---------- */
.referral summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  cursor: pointer;
  list-style: none;
}

.referral summary::-webkit-details-marker {
  display: none;
}

/* Chevron that turns when opened. */
.referral summary::after {
  content: '';
  width: 7px;
  height: 7px;
  border-right: 1.5px solid var(--muted);
  border-bottom: 1.5px solid var(--muted);
  transform: rotate(45deg);
  transition: transform 0.15s;
}

.referral[open] summary::after {
  transform: rotate(225deg);
}

.referral-list {
  margin: 12px 0 0;
}

.referral-list div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 9px 0;
  border-bottom: 1px solid var(--line);
  font-size: 13.5px;
}

.referral-list dt {
  color: var(--muted);
}

.referral-list dd {
  margin: 0;
  font-weight: 500;
  text-align: right;
}

@media (max-width: 1100px) {
  .details-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .spec-list,
  .snapshot {
    grid-template-columns: 1fr;
  }
}
</style>
