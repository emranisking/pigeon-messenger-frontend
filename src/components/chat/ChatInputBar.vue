<script setup>
import { ref, nextTick, computed } from 'vue'
import { useChatStore } from '../../stores/chat'

const chat = useChatStore()
const text = ref('')
const textareaRef = ref(null)

const canSend = computed(() => text.value.trim().length > 0)

function autoGrow() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

function send() {
  const content = text.value.trim()
  if (!content) return
  const ok = chat.sendMessage(content)
  if (ok) {
    text.value = ''
    nextTick(autoGrow)
  }
}
</script>

<template>
  <div class="chat-input-area">
    <div class="chat-input-wrap">
      <textarea
        ref="textareaRef"
        v-model="text"
        class="chat-input"
        placeholder="Aa"
        rows="1"
        @input="autoGrow"
        @keydown="handleKeydown"
      />
    </div>
    <button class="btn-send" type="button" :disabled="!canSend" title="Send" @click="send">
      <svg viewBox="0 0 24 24">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.chat-input-area {
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-top: 1px solid var(--border-light);
  flex-shrink: 0;
  background: var(--bg);
  /* Bug fix: keep the input clear of the home-indicator / gesture bar
     on notched phones instead of being partially hidden under it. */
  padding-bottom: calc(10px + env(safe-area-inset-bottom));
}
.chat-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 0 12px;
  min-height: 36px;
}
.chat-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 8px 4px;
  /* Bug fix: iOS Safari auto-zooms the page when a focused input has
     font-size < 16px. The original used 15px, causing an unwanted
     zoom-in every time someone tapped the message box on iPhone. */
  font-size: 16px;
  color: var(--text-primary);
  outline: none;
  resize: none;
  max-height: 120px;
  line-height: 1.35;
  font-family: inherit;
}
.btn-send {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: none;
  color: var(--primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.btn-send:hover:not(:disabled) {
  background: var(--primary-light);
}
.btn-send:disabled {
  color: var(--text-tertiary);
  cursor: not-allowed;
}
.btn-send svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}
</style>
