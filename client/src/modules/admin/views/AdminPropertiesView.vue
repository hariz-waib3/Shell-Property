<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import FilterButton from '@/components/common/FilterButton.vue'
import MultiSelect from '@/components/common/MultiSelect.vue'
import SearchDropdown from '@/components/common/SearchDropdown.vue'
import TablePagination from '@/components/common/TablePagination.vue'
import { useTableControls } from '@/composables/useTableControls'
import { PROPERTY_STATUSES, PROPERTY_TYPES, STATES, VISIBILITY_OPTIONS } from '@/data/constants'
import { db, deleteProperty, findProperty, setPropertyStatus } from '@/stores/db'
import { toast } from '@/stores/ui'
import { formatDate, formatPrice, packagePrice, statusColorClass } from '@/utils/format'
import { usePropertyActivation } from '../composables/usePropertyActivation'

/* ---------- Delete (with confirmation) ---------- */

const deletingId = ref(null)

const { toggleActive, confirmation, confirmPending, cancelPending } = usePropertyActivation()

const deleteMessage = computed(() => {
  const property = findProperty(deletingId.value)
  if (!property) return ''
  return `${property.lot}, ${property.suburb} ${property.state} will be removed for all partners. This can't be undone.`
})

function confirmDelete() {
  deleteProperty(deletingId.value)
  deletingId.value = null
  toast('Property deleted')
}

/* ---------- Search and filters ---------- */

const TAG_OPTIONS = ['Exclusive', 'New', 'Has incentive']

// Each filter is a list, so several values can be picked (e.g. VIC and QLD).
function getEmptyFilters() {
  return { query: '', states: [], types: [], statuses: [], visibility: [], tags: [] }
}

const filters = reactive(getEmptyFilters())

// Number of filters in use (shown as a badge on the filter icon).
const activeFilterCount = computed(
  () =>
    [filters.states, filters.types, filters.statuses, filters.visibility, filters.tags].filter(
      (list) => list.length > 0,
    ).length,
)

function clearFilters() {
  filters.states = []
  filters.types = []
  filters.statuses = []
  filters.visibility = []
  filters.tags = []
}

function hasTag(property, tag) {
  if (tag === 'Has incentive') return Boolean(property.incentive)
  return property.tags.includes(tag)
}

// A property must match every filter in use, and any one of the values picked in that filter.
function matchesFilters(property) {
  if (filters.states.length > 0 && !filters.states.includes(property.state)) return false
  if (filters.types.length > 0 && !filters.types.includes(property.type)) return false
  if (filters.statuses.length > 0 && !filters.statuses.includes(property.status)) return false
  if (filters.visibility.length > 0 && !filters.visibility.includes(property.active ? 'Enabled' : 'Disabled')) {
    return false
  }
  if (filters.tags.length > 0 && !filters.tags.some((tag) => hasTag(property, tag))) return false

  if (filters.query) {
    const searchText = `${property.suburb} ${property.estate} ${property.lot} ${property.state}`.toLowerCase()
    if (!searchText.includes(filters.query.trim().toLowerCase())) return false
  }

  return true
}

// Filter panel: full width under the heading. Opened and closed only by the filter icon.
const showFilterPanel = ref(false)

// Import / Export: one button with a small menu.
const csvMenuOpen = ref(false)
const csvMenuEl = ref(null)

function importCsv() {
  csvMenuOpen.value = false
  toast('CSV bulk import (phase 2)')
}

// Close the Import / Export menu when clicking outside it.
function onDocumentClick(event) {
  if (csvMenuEl.value && !csvMenuEl.value.contains(event.target)) csvMenuOpen.value = false
}

// Properties after search and filters.
const visibleProperties = computed(() => db.properties.filter(matchesFilters))

/* ---------- Sorting and paging ---------- */

const {
  sortBy,
  sortArrow,
  sortedRows: sortedProperties,
  page,
  pageSize,
  pagedRows: pagedProperties,
} = useTableControls(visibleProperties, {
  resetOn: () => filters,
  sortValues: {
    property: (p) => `${p.suburb} ${p.lot}`.toLowerCase(),
    type: (p) => p.type,
    price: (p) => packagePrice(p),
    status: (p) => p.status,
    verified: (p) => p.verified,
  },
  defaultSortKey: 'verified',
  descendingKeys: ['price', 'verified'],
})

/* ---------- Export ---------- */

// Downloads the properties matching the current search and filters (all pages) as a CSV file.
function exportCsv() {
  csvMenuOpen.value = false
  const header = [
    'ID',
    'State',
    'Suburb',
    'Lot',
    'Estate',
    'Type',
    'Status',
    'Visibility',
    'Build price',
    'Land price',
    'Package price',
  ]
  const rows = sortedProperties.value.map((p) => [
    p.id,
    p.state,
    p.suburb,
    p.lot,
    p.estate,
    p.type,
    p.status,
    p.active ? 'Enabled' : 'Disabled',
    p.buildPrice,
    p.landPrice,
    packagePrice(p),
  ])

  // Wrap every value in quotes (and double any quotes inside) so commas in names don't break the columns.
  const toCsvLine = (values) => values.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')
  const csv = [header, ...rows].map(toCsvLine).join('\n')

  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  link.download = `properties-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(link.href)

  toast(`Exported ${rows.length} properties`)
}

/* ---------- Row helpers ---------- */

function changeStatus(id, status) {
  setPropertyStatus(id, status)
  toast('Status updated')
}

function getTags(property) {
  const tags = [...property.tags]
  if (property.incentive) tags.push(property.incentive)
  return tags
}

onMounted(() => {
  document.addEventListener('mousedown', onDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocumentClick)
})
</script>

<template>
  <!-- Heading on the left; search, filters and actions on the right. -->
  <div class="page-top">
    <div class="heading">
      <h1 class="page">Properties</h1>
      <p class="sub">Everything added here appears on the partner side instantly.</p>
    </div>

    <div class="top-actions">
      <SearchDropdown
        v-model="filters.query"
        :result-count="visibleProperties.length"
        placeholder="Search properties…"
        hint="Search by suburb, estate or lot number."
      />
      <FilterButton v-model:open="showFilterPanel" :count="activeFilterCount" />

      <div ref="csvMenuEl" class="csv-dropdown">
        <BaseButton :aria-expanded="csvMenuOpen" @click="csvMenuOpen = !csvMenuOpen">
          Import / Export
          <svg class="chevron" :class="{ up: csvMenuOpen }" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2.5 4.5 6 8l3.5-3.5" />
          </svg>
        </BaseButton>

        <Transition name="drop">
          <div v-if="csvMenuOpen" class="csv-menu" role="menu">
            <button type="button" role="menuitem" @click="importCsv">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 15V4" />
                <path d="M7 9l5-5 5 5" />
                <path d="M5 20h14" />
              </svg>
              <span>
                <b>Import CSV</b>
                <small>Add or update properties from a file</small>
              </span>
            </button>
            <button type="button" role="menuitem" @click="exportCsv">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 4v11" />
                <path d="M7 10l5 5 5-5" />
                <path d="M5 20h14" />
              </svg>
              <span>
                <b>Export CSV</b>
                <small>Download the {{ sortedProperties.length }} properties shown</small>
              </span>
            </button>
          </div>
        </Transition>
      </div>
      <BaseButton variant="dark" icon="plus" :to="{ name: 'admin-property-new' }">Add property</BaseButton>
    </div>
  </div>

  <!-- Full-width filter panel. Stays open until the filter icon is clicked again. -->
  <div v-if="showFilterPanel" class="card pad filter-panel">
    <div class="filter-grid">
      <div class="field">
        <label for="filter-state">State</label>
        <MultiSelect id="filter-state" v-model="filters.states" :options="STATES" placeholder="All states" />
      </div>
      <div class="field">
        <label for="filter-type">Property type</label>
        <MultiSelect id="filter-type" v-model="filters.types" :options="PROPERTY_TYPES" placeholder="All types" />
      </div>
      <div class="field">
        <label for="filter-status">Status</label>
        <MultiSelect
          id="filter-status"
          v-model="filters.statuses"
          :options="PROPERTY_STATUSES"
          placeholder="All statuses"
        />
      </div>
      <div class="field">
        <label for="filter-visibility">Visibility</label>
        <MultiSelect
          id="filter-visibility"
          v-model="filters.visibility"
          :options="VISIBILITY_OPTIONS"
          placeholder="Enabled and disabled"
        />
      </div>
      <div class="field">
        <label for="filter-tag">Tag</label>
        <MultiSelect id="filter-tag" v-model="filters.tags" :options="TAG_OPTIONS" placeholder="Any tag" />
      </div>
    </div>
    <div class="filter-panel-footer">
      <span class="muted">{{ visibleProperties.length }} of {{ db.properties.length }} properties</span>
      <button type="button" class="clear-link" :disabled="activeFilterCount === 0" @click="clearFilters">
        Clear filters
      </button>
    </div>
  </div>

  <div class="card">
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>
              <button type="button" class="sort" @click="sortBy('property')">
                Property {{ sortArrow('property') }}
              </button>
            </th>
            <th>
              <button type="button" class="sort" @click="sortBy('type')">Type {{ sortArrow('type') }}</button>
            </th>
            <th>
              <button type="button" class="sort" @click="sortBy('price')">
                Package price {{ sortArrow('price') }}
              </button>
            </th>
            <th>
              <button type="button" class="sort" @click="sortBy('status')">Status {{ sortArrow('status') }}</button>
            </th>
            <th>Tags</th>
            <th>
              <button type="button" class="sort" @click="sortBy('verified')">
                Verified {{ sortArrow('verified') }}
              </button>
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="property in pagedProperties" :key="property.id" :class="{ inactive: !property.active }">
            <td class="loc cell-location">
              <b>
                {{ property.state }}, {{ property.suburb }}
                <span v-if="!property.active" class="tag t-grey inactive-tag">Disabled</span>
              </b>
              <span>{{ property.lot }}, {{ property.estate }}</span>
            </td>
            <td class="cell-type">{{ property.type }}</td>
            <td class="price cell-price">{{ formatPrice(packagePrice(property)) }}</td>
            <td class="cell-status">
              <!-- Coloured status pill. It is a real <select>, so clicking it opens the status list. -->
              <select
                class="status-pill"
                :class="statusColorClass(property.status)"
                :value="property.status"
                aria-label="Status"
                @change="changeStatus(property.id, $event.target.value)"
              >
                <option v-for="status in PROPERTY_STATUSES" :key="status">{{ status }}</option>
              </select>
            </td>
            <td class="cell-tags">
              <span v-for="tag in getTags(property)" :key="tag" class="tag t-grey tag-gap">{{ tag }}</span>
            </td>
            <td class="muted cell-verified" data-label="Verified">{{ formatDate(property.verified) }}</td>
            <td class="cell-actions">
              <div class="row actions">
                <BaseButton
                  small
                  icon-only
                  icon="eye"
                  label="View property"
                  :to="{ name: 'admin-property-detail', params: { id: property.id } }"
                />
                <BaseButton
                  small
                  icon-only
                  icon="edit"
                  label="Edit property"
                  :to="{ name: 'admin-property-detail', params: { id: property.id }, query: { edit: '1' } }"
                />
                <BaseButton
                  small
                  icon-only
                  icon="power"
                  :class="{ 'power-off': property.active }"
                  :label="property.active ? 'Disable property' : 'Enable property'"
                  @click="toggleActive(property)"
                />
                <BaseButton
                  small
                  icon-only
                  danger
                  icon="trash"
                  label="Delete property"
                  @click="deletingId = property.id"
                />
              </div>
            </td>
          </tr>

          <tr v-if="pagedProperties.length === 0" class="empty-row">
            <td colspan="7">
              <EmptyState title="No properties match" message="Try a different search or filter." />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <TablePagination v-model:page="page" v-model:page-size="pageSize" :total="sortedProperties.length" />
  </div>

  <ConfirmDialog
    v-if="deletingId"
    title="Delete this property?"
    :message="deleteMessage"
    confirm-label="Delete property"
    danger
    @confirm="confirmDelete"
    @cancel="deletingId = null"
  />

  <ConfirmDialog
    v-if="confirmation"
    :title="confirmation.title"
    :message="confirmation.message"
    :confirm-label="confirmation.confirmLabel"
    :danger="confirmation.danger"
    @confirm="confirmPending"
    @cancel="cancelPending"
  />
</template>

<style scoped>
/* Disabled (hidden from partners): greyed out, actions stay clear. */
tr.inactive td:not(.cell-actions) {
  opacity: 0.55;
}

.inactive-tag {
  margin-left: 6px;
  vertical-align: middle;
}

/* Power icon: green while enabled (click to disable), grey while disabled. */
.actions .power-off {
  color: var(--ok);
}

/* Menu opens with a short fade and slide. */
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

/* ---------- Import / Export menu ---------- */
.csv-dropdown {
  position: relative;
}

.chevron {
  width: 12px;
  height: 12px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.15s;
}

.chevron.up {
  transform: rotate(180deg);
}

.csv-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 290px;
  padding: 6px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  box-shadow: 0 16px 40px rgba(20, 22, 26, 0.14);
  z-index: 35;
}

.csv-menu button {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  border: 0;
  border-radius: 8px;
  background: none;
  text-align: left;
}

.csv-menu button:hover {
  background: var(--bg);
}

.csv-menu svg {
  flex: none;
  width: 18px;
  height: 18px;
  margin-top: 1px;
  fill: none;
  stroke: var(--ink2);
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.csv-menu b {
  display: block;
  font-size: 13.5px;
}

.csv-menu small {
  display: block;
  font-size: 12px;
  color: var(--muted);
}

/* ---------- Table ---------- */
.table-wrap table {
  min-width: 900px;
}

.tag-gap {
  margin-right: 4px;
}

.actions {
  gap: 2px;
  justify-content: flex-end;
}

/* ---------- Phones: each row becomes a card (list view) ---------- */
@media (max-width: 900px) {
  .table-wrap table {
    min-width: 0;
  }

  .data-table thead {
    display: none;
  }

  .data-table,
  .data-table tbody {
    display: block;
  }

  .data-table tbody tr {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 8px 12px;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid var(--line);
  }

  .data-table tbody tr:last-child {
    border-bottom: 0;
  }

  .data-table tbody td {
    padding: 0;
    border: 0;
  }

  .cell-location,
  .cell-tags,
  .cell-actions,
  .empty-row td {
    grid-column: 1 / -1;
  }

  .cell-price,
  .cell-verified {
    justify-self: end;
  }

  .cell-verified::before {
    content: attr(data-label) ' ';
  }

  .cell-tags:empty {
    display: none;
  }

  .cell-actions .actions {
    justify-content: flex-start;
  }
}
</style>
