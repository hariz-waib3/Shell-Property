<script setup>
import StatusTag from '@/components/common/StatusTag.vue'
import { formatPrice, packagePrice } from '@/utils/format'

// Top card on the property page (partner and admin): type, location and features on the left, price on the right.
defineProps({
  property: { type: Object, required: true },
  priceLocked: { type: Boolean, default: false }, // Free plan: blur the price
  showStatus: { type: Boolean, default: false }, // partner page shows the status here
})
</script>

<template>
  <!-- Summary: what and where on the left, price on the right. -->
  <section class="summary">
    <div class="summary-main">
      <h2 class="heading">{{ property.type }} in {{ property.suburb }}, {{ property.state }}</h2>
      <p class="location">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
          <circle cx="12" cy="9.5" r="2.5" />
        </svg>
        {{ [property.lot, property.address].filter(Boolean).join(', ') }} · {{ property.estate }}
      </p>

      <ul class="feature-chips">
        <li>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18v-6h18v6M3 12V7h8v5M3 18v2M21 18v2" /></svg>
          {{ property.beds }} bed
        </li>
        <li>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM6 12V6a2 2 0 0 1 4 0" />
          </svg>
          {{ property.baths }} bath
        </li>
        <li>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 16l1.5-5h11L19 16M4 16h16v3H4zM7 19v1M17 19v1" />
          </svg>
          {{ property.cars }} garage
        </li>
        <li v-for="tag in property.tags" :key="tag" class="tag-chip" :class="tag === 'Exclusive' ? 'gold' : 'info'">
          {{ tag }}
        </li>
      </ul>
    </div>

    <div class="summary-price">
      <span class="price-label">Package price</span>
      <span class="price" :class="{ locked: priceLocked }">{{ formatPrice(packagePrice(property)) }}</span>
      <span class="muted price-note">Build + land</span>
      <span v-if="property.incentive" class="tag t-ok">{{ property.incentive }}</span>
      <StatusTag v-if="showStatus" :status="property.status" />
    </div>
  </section>
</template>

<style scoped>
/* ---------- Summary card ---------- */
.summary {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 22px;
}

.heading {
  font-size: 24px;
  letter-spacing: -0.3px;
}

.location {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  color: var(--muted);
}

.location svg,
.feature-chips svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.feature-chips {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.feature-chips li {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  background: var(--bg);
  font-size: 13px;
  font-weight: 500;
}

.feature-chips .tag-chip.gold {
  background: var(--ink);
  color: var(--gold);
}

.feature-chips .tag-chip.info {
  background: var(--info-l);
  color: var(--info);
}

/* Price block on the right, separated by a thin line. */
.summary-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
  padding-left: 24px;
  border-left: 1px solid var(--line);
  text-align: right;
  white-space: nowrap;
}

.price-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--muted);
}

.price {
  font-size: 30px;
  font-weight: 600;
  letter-spacing: -0.5px;
}

.price-note {
  font-size: 12.5px;
  margin-bottom: 6px;
}

@media (max-width: 600px) {
  .summary {
    flex-direction: column;
  }

  .summary-price {
    align-items: flex-start;
    padding-left: 0;
    padding-top: 16px;
    border-left: 0;
    border-top: 1px solid var(--line);
    text-align: left;
  }
}
</style>
