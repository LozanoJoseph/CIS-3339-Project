<!-- This view shows a list of services. Users can search for services and click on a service to be redirected to another component that displays the service's details -->
<template>
  <main>
    <div>
      <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
        Find Services
      </h1>
    </div>

    <div class="px-10 pt-20">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <h2 class="text-2xl font-bold">Search Service By</h2>
        <div class="flex flex-col">
          <select
            v-model="searchBy"
            class="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="Service Name">Service Name</option>
            <option value="Service Description">Service Description</option>
          </select>
        </div>

        <div v-if="searchBy === 'Service Name'" class="flex flex-col">
          <label class="block">
            <input
              v-model="name"
              type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Enter service name"
              @keyup.enter="handleSubmitForm"
            />
          </label>
        </div>

        <div v-if="searchBy === 'Service Description'" class="flex flex-col">
          <label class="block">
            <input
              v-model="description"
              type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Enter service description"
              @keyup.enter="handleSubmitForm"
            />
          </label>
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
            Search Service
          </button>
        </div>
      </div>
    </div>

    <hr class="mt-10 mb-10" />

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
      <div class="ml-10">
        <h2 class="text-2xl font-bold">List of Services</h2>
        <h3 class="italic">Click table row to view service details</h3>
      </div>

      <div class="flex flex-col col-span-2">
        <div
          v-if="loading"
          class="p-6 text-center font-semibold text-gray-600 bg-gray-50 rounded shadow"
        >
          Loading services...
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

        <div v-else-if="!services || services.length === 0" class="p-6 text-center text-gray-600">
          No services found.
        </div>

        <DataTable
          v-else
          :columns="serviceColumns"
          :rows="services"
          @row-click="service => router.push({ name: 'servicedetails', params: { id: service._id } })"
        />
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from '../components/DataTable.vue'
import { getServices, searchServices } from '../api/api'
import { useApi } from '../composables/useApi'

const router = useRouter()

const serviceColumns = [
  {
    label: 'Service Name',
    key: 'name'
  },
  {
    label: 'Service Description',
    key: 'description'
  }
]

const searchBy = ref('')
const name = ref('')
const description = ref('')

let currentRequest = () => getServices()
const { data: services, loading, error, execute } = useApi(() => currentRequest())

onMounted(loadData)

function resetSearch() {
  searchBy.value = ''
  name.value = ''
  description.value = ''
}

async function loadData() {
  resetSearch()
  currentRequest = () => getServices()
  await execute()
}

async function handleSubmitForm() {
  if (searchBy.value === 'Service Name' && name.value) {
    const query = {
      searchBy: 'name',
      name: name.value
    }

    currentRequest = () => searchServices(query)
    await execute()
  } else if (searchBy.value === 'Service Description' && description.value) {
    const query = {
      searchBy: 'description',
      description: description.value
    }

    currentRequest = () => searchServices(query)
    await execute()
  }
}
</script>
