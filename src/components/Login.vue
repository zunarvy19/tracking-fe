<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import PgButton from './ui/PgButton.vue'
import PgInput from './ui/PgInput.vue'
import PgCard from './ui/PgCard.vue'

const emit = defineEmits(['switch-to-register'])

const { signIn } = useAuth()

const email = ref('')
const password = ref('')
const error = ref('')
const isSubmitting = ref(false)
const showPassword = ref(false)

async function handleLogin() {
  error.value = ''

  if (!email.value || !password.value) {
    error.value = 'Please fill in all fields'
    return
  }

  isSubmitting.value = true
  try {
    const result = await signIn(email.value, password.value)
    if (result.error) {
      error.value = result.error.message || 'Invalid email or password'
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
    <div class="absolute top-10 left-10 w-64 h-64 bg-tertiary rounded-full border-4 border-foreground pop-shadow lg:w-96 lg:h-96"></div>
    <div class="absolute bottom-10 right-10 w-48 h-48 bg-secondary rounded-[40%_60%_70%_30%/40%_50%_60%_50%] border-4 border-foreground pop-shadow lg:w-80 lg:h-80"></div>

    <div class="w-full max-w-md relative z-10">
      <!-- Logo & Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent border-4 border-foreground pop-shadow mb-6">
          <span class="material-symbols-outlined text-4xl text-white">account_balance_wallet</span>
        </div>
        <h1 class="text-4xl font-extrabold text-foreground tracking-tight underline decoration-secondary decoration-4 underline-offset-4">Welcome back</h1>
        <p class="text-mutedForeground mt-4 font-medium text-lg">Sign in to your CuanTrack account</p>
      </div>

      <!-- Card -->
      <PgCard class="p-8 bg-white" hoverEffect>
        <!-- Error Alert -->
        <div v-if="error" class="mb-6 flex items-start gap-3 rounded-xl bg-red-50 border-2 border-danger px-4 py-3 text-sm text-danger font-bold pop-shadow animate-shake">
          <span class="material-symbols-outlined text-lg mt-0.5 shrink-0">error</span>
          <span>{{ error }}</span>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <PgInput
            id="login-email"
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
            id="login-password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            label="Password"
            placeholder="Enter your password"
            autocomplete="current-password"
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
            <span v-if="isSubmitting">Signing in…</span>
            <span v-else>Let's Go!</span>
            <span v-if="!isSubmitting" class="material-symbols-outlined ml-2 bg-white text-accent rounded-full w-6 h-6 flex items-center justify-center text-sm">arrow_forward</span>
          </PgButton>
        </form>
      </PgCard>

      <!-- Switch to register -->
      <PgCard class="mt-6 p-4 text-center bg-tertiary border-2 border-foreground pop-shadow cursor-pointer transition-transform hover:-translate-y-1" @click="emit('switch-to-register')">
        <p class="text-sm font-bold text-foreground">
          Don't have an account?
          <button class="underline decoration-2 underline-offset-2 hover:text-white transition-colors ml-1">Create one here!</button>
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
