<script setup>
import { computed } from 'vue'
import { useUiStore } from '../../stores/ui'

const ui = useUiStore()

const label = computed(
  () =>
    ({
      connecting: 'Connecting...',
      connected: 'Connected',
      disconnected: 'Disconnected. Reconnecting...'
    }[ui.connectionStatus] || '')
)

const visible = computed(() => !!label.value)
</script>

<template>
  <div v-if="visible" class="connection-bar" :class="ui.connectionStatus" role="status">
    {{ label }}
  </div>
</template>

<style scoped>
.connection-bar {
  padding: 6px 16px;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  flex-shrink: 0;
}
.connection-bar.connecting {
  background: #fff3cd;
  color: #856404;
}
.connection-bar.disconnected {
  background: #f8d7da;
  color: #721c24;
}
.connection-bar.connected {
  background: #d4edda;
  color: #155724;
  animation: fadeOut 2s forwards;
  animation-delay: 1.5s;
}
@keyframes fadeOut {
  to {
    opacity: 0;
    height: 0;
    padding: 0;
    overflow: hidden;
  }
}
</style>
