<script setup>
defineProps({ title: { type: String, default: '' } })
const emit = defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="emit('close')">
      <div class="modal" role="dialog" aria-modal="true" :aria-label="title">
        <div class="modal-header">
          <h3>{{ title }}</h3>
          <button class="modal-close" type="button" @click="emit('close')" aria-label="Close">&times;</button>
        </div>
        <div class="modal-body">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.modal {
  background: var(--bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 480px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}
.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
.modal-header h3 {
  font-size: 18px;
  font-weight: 700;
}
.modal-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
}
.modal-close:hover {
  background: var(--border);
}
.modal-body {
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1;
}

/* Bug fix vs the original: a centered dialog is awkward to reach on a
   phone and can clip on very short viewports. Below 640px we turn it
   into a bottom sheet that's anchored to the thumb and respects the
   iOS home-indicator safe area. */
@media (max-width: 640px) {
  .modal-overlay {
    align-items: flex-end;
    padding: 0;
  }
  .modal {
    max-width: 100%;
    max-height: 90vh;
    border-radius: var(--radius-md) var(--radius-md) 0 0;
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>
