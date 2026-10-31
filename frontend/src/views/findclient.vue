<!-- This view displays a list of clients. The user can search for clients, and click on a client to redirect to another component to view that client's information -->
<template>
  <main>
    <div>
      <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
        Find Client
      </h1>
    </div>

    <div class="px-10 pt-20">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <h2 class="text-2xl font-bold">Search Client By</h2>
        <div class="flex flex-col">
          <select
            v-model="searchBy"
            class="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="Client Name">Client Name</option>
            <option value="Client Number">Client Number</option>
          </select>
        </div>

        <div v-if="searchBy === 'Client Name'" class="flex flex-col">
          <label class="block">
            <input
              v-model="firstName"
              type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Enter first name"
              @keyup.enter="handleSubmitForm"
            />
          </label>
        </div>

        <div v-if="searchBy === 'Client Name'" class="flex flex-col">
          <label class="block">
            <input
              v-model="lastName"
              type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Enter last name"
              @keyup.enter="handleSubmitForm"
            />
          </label>
        </div>

        <div v-if="searchBy === 'Client Number'" class="flex flex-col">
          <input
            v-model="phoneNumber"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            type="text"
            placeholder="Enter Client Phone Number"
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
            Search Client
          </button>
        </div>
      </div>
    </div>

    <hr class="mt-10 mb-10" />

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
      <div class="ml-10">
        <h2 class="text-2xl font-bold">List of Clients</h2>
        <h3 class="italic">Click table row to view client details</h3>
      </div>

      <div class="flex flex-col col-span-2">
        <div
          v-if="loading"
          class="p-6 text-center font-semibold text-gray-600 bg-gray-50 rounded shadow"
        >
          Loading clients...
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

        <div v-else-if="!clients || clients.length === 0" class="p-6 text-center text-gray-600">
          No clients found.
        </div>

        <DataTable
          v-else
          :columns="clientColumns"
          :rows="clients"
          @row-click="client => router.push({ name: 'clientdetails', params: { id: client._id } })"
        />
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from '../components/DataTable.vue'
import { getClients, searchClients } from '../api/api'
import { useApi } from '../composables/useApi'

const router = useRouter()

const clientColumns = [
  {
    label: 'Name',
    key: 'name',
    render: (client) => `${client.firstName} ${client.lastName}`
  },
  {
    label: 'Phone number',
    key: 'phoneNumber',
    render: (client) => client.phoneNumber?.primary || ''
  },
  {
    label: 'City',
    key: 'city',
    render: (client) => client.address?.city || ''
  }
]

const searchBy = ref('')
const firstName = ref('')
const lastName = ref('')
const phoneNumber = ref('')

let currentRequest = () => getClients()
const { data: clients, loading, error, execute } = useApi(() => currentRequest())

onMounted(loadData)

function resetSearch() {
  searchBy.value = ''
  firstName.value = ''
  lastName.value = ''
  phoneNumber.value = ''
}

async function loadData() {
  resetSearch()
  currentRequest = () => getClients()
  await execute()
}

async function handleSubmitForm() {
  if (searchBy.value === 'Client Name' && (firstName.value || lastName.value)) {
    const query = {
      searchBy: 'name',
      firstName: firstName.value,
      lastName: lastName.value
    }

    currentRequest = () => searchClients(query)
    await execute()
  } else if (searchBy.value === 'Client Number' && phoneNumber.value) {
    const query = {
      searchBy: 'number',
      phoneNumber: phoneNumber.value
    }

    currentRequest = () => searchClients(query)
    await execute()
  }
}
</script>
