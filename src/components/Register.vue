<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth.js'

const emit = defineEmits(['switch-to-login'])

const { signUp } = useAuth()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const isSubmitting = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

async function handleRegister() {
  error.value = ''

  if (!name.value || !email.value || !password.value || !confirmPassword.value) {
    error.value = 'Please fill in all fields'
    return
  }

  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  isSubmitting.value = true
  try {
    const result = await signUp(email.value, password.value, name.value)
    if (result.error) {
      error.value = result.error.message || 'Registration failed. Please try again.'
    } else {
      window.location.reload()
    }
  } catch (e) {
    error.value = e.message || 'Something went wrong. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 p-4 relative overflow-hidden">
    <!-- Background decorations -->
    <div class="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 animate-pulse"></div>
    <div class="absolute bottom-0 left-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>
    <div class="absolute top-1/3 right-1/4 w-48 h-48 bg-blue-400/5 rounded-full blur-2xl"></div>

    <div class="w-full max-w-md relative z-10">
      <!-- Logo & Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-white mb-4 shadow-lg shadow-primary/30">
          <span class="material-symbols-outlined text-3xl">account_balance_wallet</span>
        </div>
        <h1 class="text-3xl font-extrabold text-text-primary-light dark:text-text-primary-dark tracking-tight">Create account</h1>
        <p class="text-text-secondary-light dark:text-text-secondary-dark mt-2 text-sm font-medium">Start tracking your finances today</p>
      </div>

      <!-- Card -->
      <div class="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 p-8">
        <!-- Error Alert -->
        <div v-if="error" class="mb-6 flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 px-4 py-3 text-sm text-red-700 dark:text-red-300 animate-shake">
          <span class="material-symbols-outlined text-lg mt-0.5 shrink-0">error</span>
          <span>{{ error }}</span>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-5">
          <!-- Name -->
          <div>
            <label for="register-name" class="block text-sm font-semibold text-text-primary-light dark:text-text-primary-dark mb-1.5">Full Name</label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-text-secondary-light dark:text-text-secondary-dark pointer-events-none">person</span>
              <input
                id="register-name"
                v-model="name"
                type="text"
                placeholder="John Doe"
                autocomplete="name"
                class="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-text-primary-light dark:text-text-primary-dark placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
              />
            </div>
          </div>

          <!-- Email -->
          <div>
            <label for="register-email" class="block text-sm font-semibold text-text-primary-light dark:text-text-primary-dark mb-1.5">Email</label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-text-secondary-light dark:text-text-secondary-dark pointer-events-none">mail</span>
              <input
                id="register-email"
                v-model="email"
                type="email"
                placeholder="you@example.com"
                autocomplete="email"
                class="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-text-primary-light dark:text-text-primary-dark placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
              />
            </div>
          </div>

          <!-- Password -->
          <div>
            <label for="register-password" class="block text-sm font-semibold text-text-primary-light dark:text-text-primary-dark mb-1.5">Password</label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-text-secondary-light dark:text-text-secondary-dark pointer-events-none">lock</span>
              <input
                id="register-password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="At least 8 characters"
                autocomplete="new-password"
                class="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-text-primary-light dark:text-text-primary-dark placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors"
              >
                <span class="material-symbols-outlined text-lg">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="register-confirm-password" class="block text-sm font-semibold text-text-primary-light dark:text-text-primary-dark mb-1.5">Confirm Password</label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-text-secondary-light dark:text-text-secondary-dark pointer-events-none">lock</span>
              <input
                id="register-confirm-password"
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Repeat your password"
                autocomplete="new-password"
                class="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-text-primary-light dark:text-text-primary-dark placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors"
              >
                <span class="material-symbols-outlined text-lg">{{ showConfirmPassword ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none text-sm"
          >
            <svg v-if="isSubmitting" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <span v-if="isSubmitting">Creating account…</span>
            <span v-else>Create account</span>
          </button>
        </form>
      </div>

      <!-- Switch to login -->
      <p class="text-center mt-6 text-sm text-text-secondary-light dark:text-text-secondary-dark">
        Already have an account?
        <button @click="emit('switch-to-login')" class="text-primary hover:text-primary-hover font-semibold transition-colors ml-1">Sign in</button>
      </p>
    </div>
  </div>
</template>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
}
.animate-shake {
  animation: shake 0.4s ease-in-out;
}
</style>
