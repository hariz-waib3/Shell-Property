<script setup>
import { computed } from 'vue'

// Pagination bar shown under a table: "Showing 1–50 of 129", rows-per-page, and page buttons.
//
//   <TablePagination v-model:page="page" v-model:page-size="pageSize" :total="rows.length" />
const props = defineProps({
  total: { type: Number, required: true },
  pageSizeOptions: { type: Array, default: () => [25, 50, 100] },
})

const page = defineModel('page', { type: Number, required: true })
const pageSize = defineModel('pageSize', { type: Number, required: true })

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / pageSize.value)))
const firstRow = computed(() => (props.total === 0 ? 0 : (page.value - 1) * pageSize.value + 1))
const lastRow = computed(() => Math.min(page.value * pageSize.value, props.total))

// Page numbers to show, with '…' for gaps: 1 … 4 5 6 … 20
const pageButtons = computed(() => {
  const last = totalPages.value
  const current = page.value
  const pages = []

  for (let n = 1; n <= last; n++) {
    const isNearCurrent = Math.abs(n - current) <= 1
    if (n === 1 || n === last || isNearCurrent) {
      pages.push(n)
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…')
    }
  }
  return pages
})

function goTo(n) {
  page.value = Math.min(Math.max(1, n), totalPages.value)
}

function changePageSize(event) {
  pageSize.value = Number(event.target.value)
  page.value = 1
}
</script>

<template>
  <div class="pagination">
    <span class="muted">Showing {{ firstRow }}–{{ lastRow }} of {{ total }}</span>

    <label class="page-size">
      Rows per page
      <select :value="pageSize" @change="changePageSize">
        <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
      </select>
    </label>

    <nav class="pages" aria-label="Pagination">
      <button type="button" :disabled="page === 1" aria-label="Previous page" @click="goTo(page - 1)">‹</button>
      <template v-for="(item, index) in pageButtons" :key="index">
        <span v-if="item === '…'" class="gap">…</span>
        <button
          v-else
          type="button"
          :class="{ current: item === page }"
          :aria-current="item === page ? 'page' : undefined"
          @click="goTo(item)"
        >
          {{ item }}
        </button>
      </template>
      <button type="button" :disabled="page === totalPages" aria-label="Next page" @click="goTo(page + 1)">›</button>
    </nav>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding: 12px 16px;
  border-top: 1px solid var(--line);
  font-size: 13px;
}

.page-size {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
}

.page-size select {
  height: 32px;
  padding-left: 10px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background-color: #fff;
}

.pages {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
}

.pages button {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: none;
  font-weight: 600;
  color: var(--ink2);
}

.pages button:hover:not(:disabled) {
  background: #efeee9;
}

.pages button.current {
  background: var(--ink);
  color: #fff;
}

.pages button:disabled {
  color: #c4c2bc;
  cursor: default;
}

.gap {
  padding: 0 4px;
  color: var(--muted);
}
</style>
