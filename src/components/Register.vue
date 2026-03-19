<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import PgButton from './ui/PgButton.vue'
import PgInput from './ui/PgInput.vue'
import PgCard from './ui/PgCard.vue'

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
  <div class="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden bg-dot-pattern">
    <!-- Playful Background decorations -->
    <div class="absolute top-0 right-0 w-80 h-80 bg-quaternary rounded-full border-4 border-foreground pop-shadow translate-x-1/3 -translate-y-1/3"></div>
    <div class="absolute bottom-10 left-10 w-48 h-48 bg-accent rounded-full border-4 border-foreground pop-shadow"></div>

    <div class="w-full max-w-md relative z-10 my-8">
      <!-- Logo & Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary border-4 border-foreground pop-shadow mb-6">
          <span class="material-symbols-outlined text-4xl text-white">account_balance_wallet</span>
        </div>
        <h1 class="text-4xl font-extrabold text-foreground tracking-tight underline decoration-quaternary decoration-4 underline-offset-4">Create account</h1>
        <p class="text-mutedForeground mt-4 font-medium text-lg">Start tracking your finances today</p>
      </div>

      <!-- Card -->
      <PgCard class="p-8 bg-white" hoverEffect>
        <!-- Error Alert -->
        <div v-if="error" class="mb-6 flex items-start gap-3 rounded-xl bg-red-50 border-2 border-danger px-4 py-3 text-sm text-danger font-bold pop-shadow animate-shake">
          <span class="material-symbols-outlined text-lg mt-0.5 shrink-0">error</span>
          <span>{{ error }}</span>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-6">
          <PgInput
            id="register-name"
            v-model="name"
            type="text"
            label="Full Name"
            placeholder="John Doe"
            autocomplete="name"
          >
            <template #icon>
              <span class="material-symbols-outlined text-xl">person</span>
            </template>
          </PgInput>

          <PgInput
            id="register-email"
            v-model="email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            autocomplete="email"
          >
            <template #icon>
              <span class="material-symbols-outlined text-xl">mail</span>
            </template>
          </PgInput>

          <PgInput
            id="register-password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            label="Password"
            placeholder="At least 8 characters"
            autocomplete="new-password"
          >
            <template #icon>
              <span class="material-symbols-outlined text-xl">lock</span>
            </template>
          </PgInput>

          <PgInput
            id="register-confirm-password"
            v-model="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            label="Confirm Password"
            placeholder="Repeat your password"
            autocomplete="new-password"
          >
            <template #icon>
              <span class="material-symbols-outlined text-xl">lock</span>
            </template>
          </PgInput>

          <PgButton
            type="submit"
            :disabled="isSubmitting"
            class="w-full mt-2"
          >
            <span v-if="isSubmitting">Creating account…</span>
            <span v-else>Register</span>
            <span v-if="!isSubmitting" class="material-symbols-outlined ml-2 bg-white text-accent rounded-full w-6 h-6 flex items-center justify-center text-sm">rocket_launch</span>
          </PgButton>
        </form>
      </PgCard>

      <!-- Switch to login -->
      <PgCard class="mt-6 p-4 text-center bg-quaternary border-2 border-foreground pop-shadow cursor-pointer transition-transform hover:-translate-y-1" @click="emit('switch-to-login')">
        <p class="text-sm font-bold text-foreground">
          Already have an account?
          <button class="underline decoration-2 underline-offset-2 hover:text-white transition-colors ml-1">Sign in</button>
        </p>
      </PgCard>
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
