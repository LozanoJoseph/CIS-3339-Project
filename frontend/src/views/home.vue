<!-- This is the home view - which shows a dashboard -->
<template>
  <main>
    <div>
      <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
        Dashboard
      </h1>
      <br />

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div class="ml-10"></div>
        <div class="flex flex-col col-span-2">
          <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
            Events Attendance
          </h1>

          <div
            v-if="attendanceLoading"
            class="mt-10 p-6 text-center font-semibold text-gray-600 bg-gray-50 rounded shadow"
          >
            Loading attendance data...
          </div>

          <div
            v-else-if="attendanceError"
            class="mt-10 p-6 text-center bg-red-50 border border-red-200 rounded shadow"
          >
            <p class="font-semibold text-red-800">{{ attendanceError }}</p>
            <button
              class="mt-4 px-4 py-2 bg-red-700 text-white rounded"
              type="button"
              @click="loadAttendance"
            >
              Retry
            </button>
          </div>

          <template v-else>
            <div v-if="!recentEvents.length" class="flex justify-center mt-10">
              No events found.
            </div>

            <table v-else class="min-w-full shadow-md rounded mt-10">
              <thead class="bg-gray-50 text-xl">
                <tr class="p-4 text-left">
                  <th class="p-4 text-left">Event Name</th>
                  <th class="p-4 text-left">Event Date</th>
                  <th class="p-4 text-left">Number of Attendees</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-300">
                <tr
                  v-for="event in recentEvents"
                  :key="event._id"
                  class="cursor-pointer"
                  @click="editEvent(event._id)"
                >
                  <td class="p-2 text-left">{{ event.name }}</td>
                  <td class="p-2 text-left">{{ formatDate(event.date) }}</td>
                  <td class="p-2 text-left">{{ event.attendees.length }}</td>
                </tr>
              </tbody>
            </table>

            <AttendanceChart
              v-if="recentEvents.length"
              :label="labels"
              :chart-data="chartData"
            ></AttendanceChart>
          </template>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div class="ml-10"></div>
        <div class="flex flex-col col-span-2">
          <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
            Clients by Zip Code
          </h1>

          <div
            v-if="zipLoading"
            class="mt-10 p-6 text-center font-semibold text-gray-600 bg-gray-50 rounded shadow"
          >
            Loading client ZIP data...
          </div>

          <div
            v-else-if="zipError"
            class="mt-10 p-6 text-center bg-red-50 border border-red-200 rounded shadow"
          >
            <p class="font-semibold text-red-800">{{ zipError }}</p>
            <button
              class="mt-4 px-4 py-2 bg-red-700 text-white rounded"
              type="button"
              @click="loadZipData"
            >
              Retry
            </button>
          </div>

          <template v-else>
            <div v-if="!zips.length" class="flex justify-center mt-10">
              No clients found.
            </div>

            <table v-else class="min-w-full shadow-md rounded mt-10">
              <thead class="bg-gray-50 text-xl">
                <tr class="p-4 text-left">
                  <th class="p-4 text-left">Zip Number</th>
                  <th class="p-4 text-left">Client Count</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-300">
                <tr v-for="zip in zips" :key="zip._id">
                  <td class="p-2 text-left">{{ zip._id }}</td>
                  <td class="p-2 text-left">{{ zip.count }}</td>
                </tr>
              </tbody>
            </table>

            <div v-if="zips.length" class="flex justify-center mt-10">
              <ZipChart :label="zipLabels" :chart-data="zipChartData"></ZipChart>
            </div>
          </template>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import AttendanceChart from '../components/barChart.vue'
import ZipChart from '../components/donutZipChart.vue'
import { getAttendance, getClientsByZipCode } from '../api/api'
import { useApi } from '../composables/useApi'

const router = useRouter()

const {
  data: attendanceData,
  loading: attendanceLoading,
  error: attendanceError,
  execute: loadAttendance
} = useApi(() => getAttendance())

const {
  data: zipData,
  loading: zipLoading,
  error: zipError,
  execute: loadZipData
} = useApi(() => getClientsByZipCode())

const recentEvents = computed(() => attendanceData.value || [])
const zips = computed(() => zipData.value || [])

const labels = computed(() =>
  recentEvents.value.map((item) => `${item.name} (${formatDate(item.date)})`)
)

const chartData = computed(() =>
  recentEvents.value.map((item) => item.attendees.length)
)

const zipLabels = computed(() => zips.value.map((item) => item._id))
const zipChartData = computed(() => zips.value.map((item) => item.count))

onMounted(() => {
  loadAttendance()
  loadZipData()
})

function editEvent(eventId) {
  router.push({ name: 'eventdetails', params: { id: eventId } })
}

function formatDate(date) {
  const isoDate = new Date(date)
  const year = isoDate.getUTCFullYear()
  const month = String(isoDate.getUTCMonth() + 1).padStart(2, '0')
  const day = String(isoDate.getUTCDate()).padStart(2, '0')

  return `${month}/${day}/${year}`
}
</script>
