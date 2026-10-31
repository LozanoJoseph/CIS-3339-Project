// This file contains all frontend calls to the backend REST API.
import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_ROOT_API,
  headers: {
    'Content-Type': 'application/json'
  }
})

let unauthorizedHandler = null

// Allows main.js to connect the API layer to Pinia/router without creating
// a circular dependency between api.js and the login store.
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
}

export function setAuthHeader(token) {
  apiClient.defaults.headers.common.Authorization = `Bearer ${token}`
}

function removeAuthHeader() {
  delete apiClient.defaults.headers.common.Authorization
}

function parseNestedValidationMessage(message) {
  if (typeof message !== 'string') return null

  try {
    const parsed = JSON.parse(message)
    if (Array.isArray(parsed?.errors) && parsed.errors[0]?.msg) {
      return parsed.errors[0].msg
    }
  } catch {
    // The server message is ordinary text, which is already usable.
  }

  return message
}

function getApiErrorMessage(error) {
  // Axios does not provide error.response when the server cannot be reached.
  if (!error?.response) {
    return 'Unable to reach the server'
  }

  const body = error.response.data

  if (typeof body === 'string' && body.trim()) {
    return body.trim()
  }

  if (typeof body?.error === 'string' && body.error.trim()) {
    return body.error.trim()
  }

  if (typeof body?.message === 'string' && body.message.trim()) {
    return parseNestedValidationMessage(body.message.trim())
  }

  return 'The server could not complete the request'
}

// Centralized response/error handling for every API request.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = getApiErrorMessage(error)

    if (error?.response?.status === 401) {
      localStorage.removeItem('authToken')
      removeAuthHeader()

      if (typeof unauthorizedHandler === 'function') {
        unauthorizedHandler()
      }
    }

    return Promise.reject(new Error(message))
  }
)

// Login related API calls
export async function loginUser(username, password) {
  const response = await apiClient.post('/users/login', {
    username,
    password
  })

  const token = response.data.token
  localStorage.setItem('authToken', token)
  setAuthHeader(token)
  return token
}

export function logoutUser() {
  localStorage.removeItem('authToken')
  removeAuthHeader()
}

// Organization
export async function getOrgName() {
  const response = await apiClient.get('/org')
  return response.data
}

// Events
export async function getEvents() {
  const response = await apiClient.get('/events/')
  return response.data
}

export async function getEventById(id) {
  const response = await apiClient.get(`/events/id/${id}`)
  return response.data
}

export async function searchEvents(query) {
  const params = {}

  if (query.searchBy === 'name') {
    params.searchBy = 'name'
    params.name = query.name || ''
  } else if (query.searchBy === 'date') {
    params.searchBy = 'date'
    params.eventDate = query.eventDate || ''
  }

  const response = await apiClient.get('/events/search', { params })
  return response.data
}

export async function getClientEvents(id) {
  const response = await apiClient.get(`/events/client/${id}`)
  return response.data
}

export async function getNonClientEvents(id) {
  const response = await apiClient.get(`/events/client/${id}/not-registered`)
  return response.data
}

export async function getEventAttendees(id) {
  const response = await apiClient.get(`/events/attendees/${id}`)
  return response.data
}

export async function getEventsByServiceId(id) {
  const response = await apiClient.get(`/events/service/${id}`)
  return response.data
}

export async function createEvent(eventData) {
  const response = await apiClient.post('/events/', eventData)
  return response.data
}

export async function updateEvent(id, eventData) {
  const response = await apiClient.put(`/events/update/${id}`, eventData)
  return response.data
}

export async function registerAttendee(eventId, clientId) {
  const response = await apiClient.put(
    '/events/register',
    {},
    {
      params: {
        event: eventId,
        client: clientId
      }
    }
  )
  return response.data
}

export async function deregisterAttendee(eventId, clientId) {
  const response = await apiClient.put(
    '/events/deregister',
    {},
    {
      params: {
        event: eventId,
        client: clientId
      }
    }
  )
  return response.data
}

export async function deleteEvent(id) {
  const response = await apiClient.delete(`/events/${id}`)
  return response.data
}

export async function getAttendance() {
  const response = await apiClient.get('/events/attendance')
  return response.data
}

// Clients
export async function getClients() {
  const response = await apiClient.get('/clients')
  return response.data
}

export async function getClientById(id) {
  const response = await apiClient.get(`/clients/id/${id}`)
  return response.data
}

export async function searchClients(query) {
  const params = {}

  if (query.searchBy === 'name') {
    params.searchBy = 'name'
    params.firstName = query.firstName || ''
    params.lastName = query.lastName || ''
  } else if (query.searchBy === 'number') {
    params.searchBy = 'number'
    params.phoneNumber = query.phoneNumber || ''
  }

  const response = await apiClient.get('/clients/search', { params })
  return response.data
}

export async function createClient(newClient) {
  const response = await apiClient.post('/clients', newClient)
  return response.data
}

export async function updateClient(id, updatedClient) {
  const response = await apiClient.put(`/clients/update/${id}`, updatedClient)
  return response.data
}

export async function deleteClientbyId(id) {
  const response = await apiClient.delete(`/clients/${id}`)
  return response.data
}

export async function getClientsByZipCode() {
  const response = await apiClient.get('/clients/byzip')
  return response.data
}

// Services
export async function getServices() {
  const response = await apiClient.get('/services/')
  return response.data
}

export async function getServiceById(id) {
  const response = await apiClient.get(`/services/id/${id}`)
  return response.data
}

export async function searchServices(query) {
  const params = {
    searchBy: query.searchBy
  }

  if (query.searchBy === 'name') {
    params.name = query.name || ''
  } else if (query.searchBy === 'description') {
    params.description = query.description || ''
  }

  const response = await apiClient.get('/services/search', { params })
  return response.data
}

export async function createService(newService) {
  const response = await apiClient.post('/services', newService)
  return response.data
}

export async function updateService(id, updatedService) {
  const response = await apiClient.put(`/services/update/${id}`, updatedService)
  return response.data
}

export async function deleteService(id) {
  const response = await apiClient.delete(`/services/${id}`)
  return response.data
}
