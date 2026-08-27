<template>
  <div class="chat-empty">
    <div class="chat-empty-icon">
      <svg viewBox="0 0 200 200" width="48" height="48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <ellipse cx="100" cy="110" rx="35" ry="45" fill="var(--primary)" />
        <circle cx="100" cy="65" r="28" fill="var(--primary)" />
        <circle cx="108" cy="60" r="5" fill="#1a202c" />
        <circle cx="109" cy="58" r="2" fill="white" />
        <path d="M 115 65 L 130 63 L 115 68 Z" fill="#8b7355" />
        <ellipse cx="100" cy="88" rx="42" ry="8" fill="none" stroke="#d4a574" stroke-width="3" />
        <rect x="85" y="82" width="30" height="14" rx="7" fill="#8b7355" stroke="#d4a574" stroke-width="1.5" />
        <line x1="115" y1="89" x2="125" y2="92" stroke="#8b7355" stroke-width="2" />
        <path d="M 125 90 L 128 88 L 125 94 Z" fill="#8b7355" />
        <ellipse cx="70" cy="110" rx="15" ry="30" fill="var(--primary)" opacity="0.8" />
        <ellipse cx="130" cy="110" rx="15" ry="30" fill="var(--primary)" opacity="0.8" />
        <rect x="40" y="145" width="120" height="8" rx="4" fill="#8b7355" stroke="#6b5345" stroke-width="1" />
      </svg>
    </div>
    <h3>Your Messages</h3>
    <p>Send private messages to a friend</p>
  </div>
</template>

<style scoped>
.chat-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  gap: 16px;
  padding: 24px;
  text-align: center;
}
.chat-empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}
.chat-empty h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}
.chat-empty p {
  font-size: 14px;
}
</style>
