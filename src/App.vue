<script setup>
import { ref } from 'vue'
import { useAuth } from './composables/useAuth.js'

import Login from './components/Login.vue'
import Register from './components/Register.vue'
import Sidebar from './components/Sidebar.vue'
import MobileHeader from './components/MobileHeader.vue'
import Dashboard from './components/Dashboard.vue'
import Transactions from './components/Transactions.vue'
import Budget from './components/Budget.vue'
import Reports from './components/Reports.vue'
import Settings from './components/Settings.vue'

const { isAuthenticated, isLoading } = useAuth()

const currentView = ref('dashboard')
const authView = ref('login') // 'login' or 'register'
</script>

<template>
  <!-- Loading state -->
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
    <div class="flex flex-col items-center gap-4">
      <div class="relative">
        <div class="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-slate-700"></div>
        <div class="absolute inset-0 w-12 h-12 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
      </div>
      <p class="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">Loading…</p>
    </div>
  </div>

  <!-- Auth pages (unauthenticated) -->
  <template v-else-if="!isAuthenticated">
    <Login v-if="authView === 'login'" @switch-to-register="authView = 'register'" />
    <Register v-else @switch-to-login="authView = 'login'" />
  </template>

  <!-- Main app (authenticated) -->
  <div v-else class="flex min-h-screen w-full overflow-hidden">
    <Sidebar :currentView="currentView" @navigate="currentView = $event" />
    <main class="flex h-screen flex-1 flex-col overflow-y-auto bg-background-light dark:bg-background-dark relative">
      <MobileHeader :currentView="currentView" />
      <Dashboard v-if="currentView === 'dashboard'" />
      <Transactions v-else-if="currentView === 'transactions'" />
      <Budget v-else-if="currentView === 'budget'" />
      <Reports v-else-if="currentView === 'reports'" />
      <Settings v-else-if="currentView === 'settings'" />
    </main>
  </div>
</template>
