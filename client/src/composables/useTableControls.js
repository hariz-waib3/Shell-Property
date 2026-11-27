import { computed, ref, watch } from 'vue'

// Sorting and paging for a table, shared by the admin and partner property lists.
//
//   const { sortBy, sortArrow, sortedRows, page, pageSize, pagedRows } =
//     useTableControls(filteredRows, { sortValues, defaultSortKey: 'verified', resetOn: () => filters })
//
// sortValues maps a column key to a function that returns the value to sort by.
// descendingKeys are the columns that start with the biggest / newest first when clicked.
// resetOn returns the search / filter values; changing them goes back to page 1.
export function useTableControls(
  rows,
  { sortValues, defaultSortKey, descendingKeys = [], pageSize: size = 50, resetOn = () => null },
) {
  const sortKey = ref(defaultSortKey)
  const sortDirection = ref(descendingKeys.includes(defaultSortKey) ? 'desc' : 'asc')

  // Clicking the same column again flips the direction.
  function sortBy(key) {
    if (sortKey.value === key) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortDirection.value = descendingKeys.includes(key) ? 'desc' : 'asc'
    }
  }

  function sortArrow(key) {
    if (sortKey.value !== key) return ''
    return sortDirection.value === 'asc' ? '↑' : '↓'
  }

  const sortedRows = computed(() => {
    const getValue = sortValues[sortKey.value]
    const direction = sortDirection.value === 'asc' ? 1 : -1
    return [...rows.value].sort((a, b) => {
      const x = getValue(a)
      const y = getValue(b)
      if (x < y) return -1 * direction
      if (x > y) return 1 * direction
      return 0
    })
  })

  const page = ref(1)
  const pageSize = ref(size)

  const pagedRows = computed(() => {
    const start = (page.value - 1) * pageSize.value
    return sortedRows.value.slice(start, start + pageSize.value)
  })

  // New search, filter or sort: back to page 1.
  watch(
    [resetOn, sortKey, sortDirection],
    () => {
      page.value = 1
    },
    { deep: true },
  )

  // Rows removed (e.g. a delete): stay on this page, unless it no longer exists.
  watch(sortedRows, () => {
    const lastPage = Math.max(1, Math.ceil(sortedRows.value.length / pageSize.value))
    if (page.value > lastPage) page.value = lastPage
  })

  return { sortKey, sortDirection, sortBy, sortArrow, sortedRows, page, pageSize, pagedRows }
}
