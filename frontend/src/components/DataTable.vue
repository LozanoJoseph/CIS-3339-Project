<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  columns: {
    type: Array,
    required: true
  },
  rows: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['row-click'])

const currentPage = ref(1)
const rowsPerPage = 10
const sortKey = ref(null)
const sortDirection = ref(null)

const sortedRows = computed(() => {
  if (!sortKey.value || !sortDirection.value) {
    return [...props.rows]
  }

  return [...props.rows].sort((a, b) => {
    const column = props.columns.find((column) => column.key === sortKey.value)

    const getValue = (row) => {
      const rawValue = row[column.key]

      if (rawValue !== undefined && rawValue !== null && typeof rawValue !== 'object') {
        return rawValue
      }

      return column.render ? column.render(row) : rawValue
    }

    const aValue = getValue(a)
    const bValue = getValue(b)

    if (aValue == null) return 1
    if (bValue == null) return -1

    const comparison = String(aValue).localeCompare(String(bValue), undefined, {
      numeric: true,
      sensitivity: 'base'
    })

    return sortDirection.value === 'asc' ? comparison : -comparison
  })
})

function sortBy(column) {
  if (sortKey.value !== column.key) {
    sortKey.value = column.key
    sortDirection.value = 'asc'
  } else if (sortDirection.value === 'asc') {
    sortDirection.value = 'desc'
  } else if (sortDirection.value === 'desc') {
    sortKey.value = null
    sortDirection.value = null
  }
}

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(sortedRows.value.length / rowsPerPage))
})

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage
  const end = start + rowsPerPage

  return sortedRows.value.slice(start, end)
})

const startRow = computed(() => {
  if (sortedRows.value.length === 0) return 0
  return (currentPage.value - 1) * rowsPerPage + 1
})

const endRow = computed(() => {
  return Math.min(currentPage.value * rowsPerPage, sortedRows.value.length)
})

function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

watch(
  () => props.rows,
  () => {
    currentPage.value = 1
  },
  { deep: true }
)
</script>
<template>
  <div>
    <table class="min-w-full shadow-md rounded">
      <thead class="bg-gray-50 text-xl">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            class="p-4 text-left cursor-pointer select-none"
            @click="sortBy(column)"
          >
            {{ column.label }}

            <span v-if="sortKey === column.key && sortDirection === 'asc'">
              ↑
            </span>

            <span v-else-if="sortKey === column.key && sortDirection === 'desc'">
              ↓
            </span>
          </th>
        </tr>
      </thead>

      <tbody class="divide-y divide-gray-300">
        <tr v-if="paginatedRows.length === 0">
          <td :colspan="columns.length" class="p-4 text-center">
            No results
          </td>
        </tr>

        <tr
          v-for="(row, index) in paginatedRows"
          v-else
          :key="row._id || row.id || index"
          class="cursor-pointer hover:bg-gray-100"
          @click="emit('row-click', row)"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            class="p-2 text-left"
          >
            {{ column.render ? column.render(row) : row[column.key] }}
          </td>
        </tr>
      </tbody>
    </table>

    <div class="flex items-center justify-between mt-4">
      <p>
        Showing {{ startRow }}-{{ endRow }} of {{ sortedRows.length }}
      </p>

      <button
        type="button"
        class="border border-red-700 text-red-700 rounded px-3 py-1 disabled:opacity-50"
        :disabled="currentPage === 1"
        @click="previousPage"
      >
        Previous
      </button>

      <span>
        Page {{ currentPage }} of {{ totalPages }}
      </span>

      <button
        type="button"
        class="border border-red-700 text-red-700 rounded px-3 py-1 disabled:opacity-50"
        :disabled="currentPage === totalPages"
        @click="nextPage"
      >
        Next
      </button>
    </div>
  </div>
</template>