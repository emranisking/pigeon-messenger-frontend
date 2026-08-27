<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from './stores/auth'
import AuthView from './views/AuthView.vue'
import MessengerView from './views/MessengerView.vue'
import ToastContainer from './components/common/ToastContainer.vue'

const auth = useAuthStore()

// The API layer can't reach into Pinia directly (to avoid a circular
// import), so it dispatches a DOM event on 401/403 instead. We listen
// here and log the user out, which flips the view back to AuthView.
function handleUnauthorized() {
  auth.logout()
}

onMounted(() => {
  window.addEventListener('auth:unauthorized', handleUnauthorized)
})

onBeforeUnmount(() => {
  window.removeEventListener('auth:unauthorized', handleUnauthorized)
})
</script>

<template>
  <MessengerView v-if="auth.isAuthenticated" />
  <AuthView v-else />
  <ToastContainer />
</template>
