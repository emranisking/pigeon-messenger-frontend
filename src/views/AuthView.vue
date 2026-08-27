<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const mode = ref('login') // 'login' | 'register'

const loginUsername = ref('')
const loginPassword = ref('')
const loginError = ref('')
const loginLoading = ref(false)

const registerUsername = ref('')
const registerPassword = ref('')
const registerConfirm = ref('')
const registerError = ref('')
const registerLoading = ref(false)

function switchMode(next) {
  mode.value = next
  loginError.value = ''
  registerError.value = ''
}

async function handleLogin() {
  if (!loginUsername.value || !loginPassword.value) {
    loginError.value = 'Please fill in all fields'
    return
  }
  loginError.value = ''
  loginLoading.value = true
  try {
    await auth.login(loginUsername.value.trim(), loginPassword.value)
  } catch (err) {
    loginError.value = err.message || 'Login failed'
  } finally {
    loginLoading.value = false
  }
}

async function handleRegister() {
  if (!registerUsername.value || !registerPassword.value || !registerConfirm.value) {
    registerError.value = 'Please fill in all fields'
    return
  }
  if (registerPassword.value !== registerConfirm.value) {
    registerError.value = 'Passwords do not match'
    return
  }
  if (registerPassword.value.length < 6) {
    registerError.value = 'Password must be at least 6 characters'
    return
  }
  registerError.value = ''
  registerLoading.value = true
  try {
    await auth.register(registerUsername.value.trim(), registerPassword.value)
  } catch (err) {
    registerError.value = err.message || 'Registration failed'
  } finally {
    registerLoading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-logo">
          <svg viewBox="0 0 200 200" width="64" height="64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <ellipse cx="100" cy="110" rx="35" ry="45" fill="#4a5568" />
            <circle cx="100" cy="65" r="28" fill="#555d6e" />
            <circle cx="108" cy="60" r="5" fill="#1a202c" />
            <circle cx="109" cy="58" r="2" fill="white" />
            <path d="M 115 65 L 130 63 L 115 68 Z" fill="#8b7355" />
            <ellipse cx="100" cy="88" rx="42" ry="8" fill="none" stroke="#d4a574" stroke-width="3" />
            <rect x="85" y="82" width="30" height="14" rx="7" fill="#8b7355" stroke="#d4a574" stroke-width="1.5" />
            <rect x="92" y="87" width="6" height="5" rx="1" fill="#d4a574" />
            <path d="M 94 87 Q 94 85 96 85 Q 98 85 98 87" stroke="#d4a574" stroke-width="1" fill="none" />
            <line x1="115" y1="89" x2="125" y2="92" stroke="#8b7355" stroke-width="2" />
            <path d="M 125 90 L 128 88 L 125 94 Z" fill="#8b7355" />
            <ellipse cx="70" cy="110" rx="15" ry="30" fill="#3a4556" opacity="0.8" />
            <ellipse cx="130" cy="110" rx="15" ry="30" fill="#3a4556" opacity="0.8" />
            <rect x="40" y="145" width="120" height="8" rx="4" fill="#8b7355" stroke="#6b5345" stroke-width="1" />
          </svg>
          <h1>PIGEON</h1>
        </div>

        <form v-if="mode === 'login'" class="auth-form" @submit.prevent="handleLogin">
          <h2>Log In</h2>
          <div class="form-group">
            <input v-model="loginUsername" type="text" placeholder="Username" required autocomplete="username" />
          </div>
          <div class="form-group">
            <input
              v-model="loginPassword"
              type="password"
              placeholder="Password"
              required
              autocomplete="current-password"
            />
          </div>
          <div class="form-error">{{ loginError }}</div>
          <button type="submit" class="btn-primary" :disabled="loginLoading">
            <span v-if="!loginLoading">Log In</span>
            <span v-else class="btn-loader" />
          </button>
          <div class="auth-switch">
            Don't have an account? <a href="#" @click.prevent="switchMode('register')">Create one</a>
          </div>
        </form>

        <form v-else class="auth-form" @submit.prevent="handleRegister">
          <h2>Create Account</h2>
          <div class="form-group">
            <input
              v-model="registerUsername"
              type="text"
              placeholder="Username"
              required
              autocomplete="username"
              minlength="3"
              maxlength="50"
            />
          </div>
          <div class="form-group">
            <input
              v-model="registerPassword"
              type="password"
              placeholder="Password"
              required
              autocomplete="new-password"
              minlength="6"
            />
          </div>
          <div class="form-group">
            <input
              v-model="registerConfirm"
              type="password"
              placeholder="Confirm Password"
              required
              autocomplete="new-password"
            />
          </div>
          <div class="form-error">{{ registerError }}</div>
          <button type="submit" class="btn-primary" :disabled="registerLoading">
            <span v-if="!registerLoading">Sign Up</span>
            <span v-else class="btn-loader" />
          </button>
          <div class="auth-switch">
            Already have an account? <a href="#" @click.prevent="switchMode('login')">Log in</a>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary) 0%, #00c6ff 100%);
  min-height: 100dvh;
  overflow-y: auto;
  padding: 20px 0;
}
.auth-container {
  width: 100%;
  max-width: 420px;
  padding: 20px;
}
.auth-card {
  background: var(--bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: 40px 32px;
}
.auth-logo {
  text-align: center;
  margin-bottom: 32px;
}
.auth-logo svg {
  margin-bottom: 8px;
}
.auth-logo h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.5px;
}
.auth-form h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 24px;
}
.form-group {
  margin-bottom: 16px;
}
.form-group input {
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  /* Bug fix: was 15px in the original, which triggers iOS Safari's
     auto-zoom on focus. 16px avoids that on the login screen too. */
  font-size: 16px;
  color: var(--text-primary);
  background: var(--bg);
  outline: none;
}
.form-group input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(0, 132, 255, 0.15);
}
.form-error {
  color: var(--danger);
  font-size: 13px;
  margin-bottom: 12px;
  min-height: 18px;
  text-align: center;
}
.btn-primary {
  width: 100%;
  padding: 12px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.btn-primary:hover {
  background: var(--primary-hover);
}
.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.btn-loader {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.auth-switch {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: var(--text-secondary);
}
.auth-switch a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
}
.auth-switch a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 32px 20px;
  }
}
</style>
