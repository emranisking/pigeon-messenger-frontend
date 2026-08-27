/**
 * Debounced user search used by the "New Message" and "New Group"
 * modals. Both modals in the original app duplicated this logic
 * (searchUsersModal / searchUsersForGroup) with copy-pasted debounce
 * timers - consolidated here so there's one implementation to trust.
 */

import { ref } from 'vue'
import { api } from '../services/api'

export function useUserSearch() {
  const query = ref('')
  const results = ref([])
  const loading = ref(false)
  const error = ref('')
  let debounceTimer = null

  function search(value) {
    query.value = value
    clearTimeout(debounceTimer)

    if (!value.trim()) {
      results.value = []
      error.value = ''
      loading.value = false
      return
    }

    debounceTimer = setTimeout(async () => {
      loading.value = true
      error.value = ''
      try {
        results.value = (await api.searchUsers(value.trim())) || []
      } catch (err) {
        error.value = err.message || 'Search failed'
        results.value = []
      } finally {
        loading.value = false
      }
    }, 300)
  }

  function reset() {
    clearTimeout(debounceTimer)
    query.value = ''
    results.value = []
    error.value = ''
    loading.value = false
  }

  return { query, results, loading, error, search, reset }
}
