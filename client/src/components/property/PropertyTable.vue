<script setup>
// Partner property table, used on Properties and My Lists.
import { computed, ref } from 'vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import PropertyTags from '@/components/property/PropertyTags.vue'
import { formatPrice, packagePrice } from '@/utils/format'
import { addToMyList, findProperty, isInMyList, removeFromMyList } from '@/stores/db'
import { openEnquiry, toast } from '@/stores/ui'

const props = defineProps({
  properties: { type: Array, required: true }, // the rows on the current page
  startIndex: { type: Number, default: 0 }, // position of the first row in the whole list
  // Free plan: only the first rows of the whole list are usable, the rest are blurred.
  unlockedCount: { type: Number, default: Infinity },
  hidePrices: { type: Boolean, default: false },
  sortArrow: { type: Function, required: true },
  // My Lists: ask before unsaving, because the row disappears from the list.
  from: { type: String, default: '' }, // page the row links come from, so the detail page can link back to it
  confirmUnsave: { type: Boolean, default: false },
})

const emit = defineEmits(['sort'])

// Star button: saves the property to My Lists, or removes it if it is already saved.
const unsavingId = ref(null) // property waiting for "Remove from My Lists?" confirmation

const unsaveMessage = computed(() => {
  const property = findProperty(unsavingId.value)
  if (!property) return ''
  return `${property.lot}, ${property.suburb} ${property.state} will be removed from your list.`
})

function toggleFavourite(propertyId) {
  if (!isInMyList(propertyId)) {
    addToMyList(propertyId)
    toast('Saved to My Lists')
    return
  }
  if (props.confirmUnsave) {
    unsavingId.value = propertyId
    return
  }
  unsave(propertyId)
}

function unsave(propertyId) {
  removeFromMyList(propertyId)
  unsavingId.value = null
  toast('Removed from My Lists')
}

function isRowLocked(index) {
  return props.startIndex + index >= props.unlockedCount
}
</script>

<template>
  <div class="table-wrap">
    <table class="data-table">
      <thead>
        <tr>
          <th>
            <button type="button" class="sort" @click="emit('sort', 'property')">
              Lot / Location / Project {{ sortArrow('property') }}
            </button>
          </th>
          <th>
            <button type="button" class="sort" @click="emit('sort', 'status')">Status {{ sortArrow('status') }}</button>
          </th>
          <th>
            <button type="button" class="sort" @click="emit('sort', 'price')">
              Package price {{ sortArrow('price') }}
            </button>
          </th>
          <th>
            <button type="button" class="sort" @click="emit('sort', 'type')">Type {{ sortArrow('type') }}</button>
          </th>
          <th>
            <button type="button" class="sort" @click="emit('sort', 'build')">Build m² {{ sortArrow('build') }}</button>
          </th>
          <th>
            <button type="button" class="sort" @click="emit('sort', 'buildPrice')">
              Build price {{ sortArrow('buildPrice') }}
            </button>
          </th>
          <th>
            <button type="button" class="sort" @click="emit('sort', 'land')">Land m² {{ sortArrow('land') }}</button>
          </th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(property, index) in properties" :key="property.id" :class="{ locked: isRowLocked(index) }">
          <td class="cell-location">
            <span v-if="property.incentive" class="tag t-ok incentive">{{ property.incentive }}</span>
            <b>{{ property.state }}, {{ property.suburb }}</b>
            <div class="muted location">{{ property.lot }}, {{ property.estate }}</div>
          </td>
          <td class="cell-status">
            <StatusTag :status="property.status" />
            <PropertyTags :tags="property.tags" />
          </td>
          <td class="price cell-price" :class="{ locked: hidePrices }">{{ formatPrice(packagePrice(property)) }}</td>
          <td class="cell-type">
            {{ property.type }}
            <div class="muted text-sm">{{ property.beds }} bd · {{ property.baths }} ba · {{ property.cars }} car</div>
          </td>
          <td class="cell-stat" data-label="Build m²">{{ property.build }}</td>
          <td class="cell-stat" data-label="Build price" :class="{ locked: hidePrices }">
            {{ formatPrice(property.buildPrice) }}
          </td>
          <td class="cell-stat" data-label="Land m²">{{ property.land }}</td>
          <td class="cell-actions">
            <div class="row actions">
              <button
                type="button"
                class="favourite"
                :class="{ saved: isInMyList(property.id) }"
                :disabled="isRowLocked(index)"
                :aria-pressed="isInMyList(property.id)"
                :aria-label="isInMyList(property.id) ? 'Remove from favourites' : 'Save to favourites'"
                :title="isInMyList(property.id) ? 'Remove from favourites' : 'Save to favourites'"
                @click="toggleFavourite(property.id)"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" />
                </svg>
              </button>
              <button v-if="isRowLocked(index)" class="btn sm" disabled>View</button>
              <RouterLink
                v-else
                class="btn sm"
                :to="{ name: 'property-detail', params: { id: property.id }, query: from ? { from } : {} }"
              >
                View
              </RouterLink>
              <button class="btn sm gold" :disabled="isRowLocked(index)" @click="openEnquiry(property.id)">
                Enquire
              </button>
            </div>
          </td>
        </tr>

        <tr v-if="properties.length === 0" class="empty-row">
          <td colspan="8">
            <EmptyState title="No matches" message="Try a different search or clear the filters." />
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <ConfirmDialog
    v-if="unsavingId"
    title="Remove from My Lists?"
    :message="unsaveMessage"
    confirm-label="Remove"
    danger
    @confirm="unsave(unsavingId)"
    @cancel="unsavingId = null"
  />
</template>

<style scoped>
.table-wrap table {
  min-width: 960px;
}

.location {
  font-size: 13px;
}

.incentive {
  margin-right: 6px;
}

.actions {
  justify-content: flex-end;
}

/* ---------- Phones: each row becomes a card (list view) ---------- */
@media (max-width: 900px) {
  .table-wrap table {
    min-width: 0;
  }

  thead {
    display: none;
  }

  table,
  tbody {
    display: block;
  }

  /* Card layout: 3 columns. Location, type and actions use the full width. */
  tbody tr {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px 12px;
    padding: 16px;
    border-bottom: 1px solid var(--line);
  }

  tbody tr:last-child {
    border-bottom: 0;
  }

  tbody td {
    padding: 0;
    border: 0;
  }

  .cell-location,
  .cell-type,
  .cell-actions,
  .empty-row td {
    grid-column: 1 / -1;
  }

  .cell-status {
    grid-column: span 2;
  }

  .cell-price {
    justify-self: end;
    font-size: 16px;
  }

  .cell-type {
    display: flex;
    gap: 8px;
    align-items: baseline;
  }

  /* The three numbers get small labels, since the column headings are hidden. */
  .cell-stat::before {
    content: attr(data-label);
    display: block;
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: var(--muted);
  }

  .cell-actions .actions {
    justify-content: flex-start;
    padding-top: 4px;
  }
}

/* Star button: outline when not saved, filled gold when saved. */
.favourite {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  color: var(--muted);
  transition:
    color 0.15s,
    border-color 0.15s,
    background 0.15s;
}

.favourite svg {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linejoin: round;
}

.favourite:hover:not(:disabled) {
  color: var(--gold-d);
  border-color: var(--gold);
}

.favourite.saved {
  color: var(--gold);
  border-color: var(--gold);
  background: var(--gold-l);
}

.favourite.saved svg {
  fill: currentColor;
}

.favourite:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
