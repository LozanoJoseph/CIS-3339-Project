<!-- This view displays a list of events. Users can search for events, and click on an event to be redirected to another component to view that event's details -->
<template>
  <main>
    <div>
      <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
        List of Events
      </h1>
    </div>

    <div class="px-10 pt-20">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <h2 class="text-2xl font-bold">Search Event By</h2>
        <div class="flex flex-col">
          <select
            v-model="searchBy"
            class="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="Event Name">Event Name</option>
            <option value="Event Date">Event Date</option>
          </select>
        </div>

        <div v-if="searchBy === 'Event Name'" class="flex flex-col">
          <label class="block">
            <input
              v-model="name"
              type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Enter event name"
              @keyup.enter="handleSubmitForm"
            />
          </label>
        </div>

        <div v-if="searchBy === 'Event Date'" class="flex flex-col">
          <input
            v-model="eventDate"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            type="date"
            @keyup.enter="handleSubmitForm"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div></div>
        <div></div>
        <div class="mt-5 grid-cols-2">
          <button
            class="mr-10 border border-red-700 bg-white text-red-700 rounded"
            type="button"
            :disabled="loading"
            @click="loadData"
          >
            Clear Search
          </button>
          <button
            class="bg-red-700 text-white rounded"
            type="button"
            :disabled="loading"
            @click="handleSubmitForm"
          >
            Search Event
          </button>
        </div>
      </div>
    </div>

    <hr class="mt-10 mb-10" />

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
      <div class="ml-10">
        <h2 class="text-2xl font-bold">List of Events</h2>
        <h3 class="italic">Click table row to view event details</h3>
      </div>

      <div class="flex flex-col col-span-2">
        <div
          v-if="loading"
          class="p-6 text-center font-semibold text-gray-600 bg-gray-50 rounded shadow"
        >
          Loading events...
        </div>

        <div
          v-else-if="error"
          class="p-6 text-center bg-red-50 border border-red-200 rounded shadow"
        >
          <p class="font-semibold text-red-800">{{ error }}</p>
          <button
            class="mt-4 px-4 py-2 bg-red-700 text-white rounded"
            type="button"
            @click="execute"
          >
            Retry
          </button>
        </div>

        <div v-else-if="!events || events.length === 0" class="p-6 text-center text-gray-600">
          No events found.
        </div>

        <DataTable
          v-else
          :columns="eventColumns"
          :rows="events"
          @row-click="event => router.push({ name: 'eventdetails', params: { id: event._id } })"
        />
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from '../components/DataTable.vue'
import { getEvents, searchEvents } from '../api/api'
import { useApi } from '../composables/useApi'

const router = useRouter()

const eventColumns = [
  {
    label: 'Event Name',
    key: 'name'
  },
  {
    label: 'Event Date',
    key: 'date',
    render: (event) => formatDate(event.date)
  },
  {
    label: 'Event Address',
    key: 'address',
    render: (event) => event.address?.line1 || ''
  }
]

const searchBy = ref('')
const name = ref('')
const eventDate = ref('')

let currentRequest = () => getEvents()
const { data: events, loading, error, execute } = useApi(() => currentRequest())

onMounted(loadData)

function resetSearch() {
  searchBy.value = ''
  name.value = ''
  eventDate.value = ''
}

async function loadData() {
  resetSearch()
  currentRequest = () => getEvents()
  await execute()
}

async function handleSubmitForm() {
  if (searchBy.value === 'Event Name' && name.value) {
    const query = {
      searchBy: 'name',
      name: name.value
    }

    currentRequest = () => searchEvents(query)
    await execute()
  } else if (searchBy.value === 'Event Date' && eventDate.value) {
    const selectedDate = new Date(eventDate.value)
    const formattedDate = selectedDate.toISOString().substring(0, 10)
    const query = {
      searchBy: 'date',
      eventDate: formattedDate
    }

    currentRequest = () => searchEvents(query)
    await execute()
  }
}

function formatDate(date) {
  const isoDate = new Date(date)
  const year = isoDate.getUTCFullYear()
  const month = String(isoDate.getUTCMonth() + 1).padStart(2, '0')
  const day = String(isoDate.getUTCDate()).padStart(2, '0')

  return `${month}/${day}/${year}`
}
</script>
