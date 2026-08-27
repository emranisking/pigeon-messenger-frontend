import { defineStore } from 'pinia'
import { ref } from 'vue'

let toastSeq = 0

export const useUiStore = defineStore('ui', () => {
  // '' | 'connecting' | 'connected' | 'disconnected'
  const connectionStatus = ref('')

  const toasts = ref([])
  const showNewChatModal = ref(false)
  const showNewGroupModal = ref(false)

  function setConnectionStatus(status) {
    connectionStatus.value = status
  }

  function pushToast(message, type = 'info', timeout = 3500) {
    const id = ++toastSeq
    toasts.value.push({ id, message, type })
    if (timeout) {
      setTimeout(() => dismissToast(id), timeout)
    }
    return id
  }

  function dismissToast(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return {
    connectionStatus,
    toasts,
    showNewChatModal,
    showNewGroupModal,
    setConnectionStatus,
    pushToast,
    dismissToast
  }
})
