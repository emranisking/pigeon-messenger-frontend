import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const userId = ref(localStorage.getItem('userId') || null)
  const username = ref(localStorage.getItem('username') || null)

  const isAuthenticated = computed(() => !!token.value && !!userId.value)
  const currentUser = computed(() =>
    userId.value ? { id: userId.value, username: username.value || 'User' } : null
  )

  function persist(data) {
    token.value = data.token
    userId.value = data.userId
    username.value = data.username
    localStorage.setItem('token', data.token)
    localStorage.setItem('userId', data.userId)
    localStorage.setItem('username', data.username)
  }

  async function login(usernameInput, password) {
    const data = await api.login(usernameInput, password)
    persist(data)
    return data
  }

  async function register(usernameInput, password) {
    const data = await api.register(usernameInput, password)
    persist(data)
    return data
  }

  function logout() {
    token.value = null
    userId.value = null
    username.value = null
    localStorage.clear()
  }

  return { token, userId, username, isAuthenticated, currentUser, login, register, logout }
})
