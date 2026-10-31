import { ref } from 'vue'

/**
 * Shared async request state for frontend API calls.
 *
 * @param {Function} apiCall function that returns a Promise for the API result
 * @returns {{ data: import('vue').Ref, loading: import('vue').Ref<boolean>, error: import('vue').Ref<string|null>, execute: Function }}
 */
export function useApi(apiCall) {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function execute() {
    loading.value = true
    error.value = null
    data.value = null

    try {
      const result = await apiCall()
      data.value = result
      return result
    } catch (err) {
      // API failures are normalized by the Axios response interceptor.
      error.value = err?.message || 'Request failed'
      return null
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, execute }
}
