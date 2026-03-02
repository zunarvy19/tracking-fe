<script setup>
import { useAuth } from '../composables/useAuth.js'

defineProps({
  currentView: {
    type: String,
    required: true
  }
})
defineEmits(['navigate'])

const { user, signOut, isAuthenticated } = useAuth()

async function handleSignOut() {
  await signOut()
  window.location.reload()
}
</script>

<template>
  <aside class="hidden w-64 flex-col border-r border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark lg:flex transition-colors duration-200">
    <!-- Brand -->
    <div class="flex items-center gap-3 px-6 py-6 border-b border-border-light dark:border-border-dark">
      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
        <span class="material-symbols-outlined text-2xl">account_balance_wallet</span>
      </div>
      <div>
        <h1 class="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">FinanceTracker</h1>
        <p class="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">v2.1.0</p>
      </div>
    </div>
    <!-- Navigation Links -->
    <nav class="flex-1 flex flex-col gap-1 px-4 py-4">
      <a 
        @click.prevent="$emit('navigate', 'dashboard')"
        :class="['group flex items-center gap-3 rounded-lg px-4 py-3 transition-all cursor-pointer', currentView === 'dashboard' ? 'bg-primary/10 text-primary dark:text-primary-content dark:bg-primary/20' : 'text-text-secondary-light hover:bg-slate-100 hover:text-text-primary-light dark:text-text-secondary-dark dark:hover:bg-slate-800 dark:hover:text-text-primary-dark']"
      >
        <span :class="['material-symbols-outlined', currentView === 'dashboard' ? 'fill-1' : '']">dashboard</span>
        <span :class="currentView === 'dashboard' ? 'font-semibold' : 'font-medium'">Dashboard</span>
      </a>
      <a 
        @click.prevent="$emit('navigate', 'transactions')"
        :class="['group flex items-center gap-3 rounded-lg px-4 py-3 transition-all cursor-pointer', currentView === 'transactions' ? 'bg-primary/10 text-primary dark:text-primary-content dark:bg-primary/20' : 'text-text-secondary-light hover:bg-slate-100 hover:text-text-primary-light dark:text-text-secondary-dark dark:hover:bg-slate-800 dark:hover:text-text-primary-dark']"
      >
        <span :class="['material-symbols-outlined', currentView === 'transactions' ? 'fill-1' : '']">receipt_long</span>
        <span :class="currentView === 'transactions' ? 'font-semibold' : 'font-medium'">Transactions</span>
      </a>
      <a 
        @click.prevent="$emit('navigate', 'budget')"
        :class="['group flex items-center gap-3 rounded-lg px-4 py-3 transition-all cursor-pointer', currentView === 'budget' ? 'bg-primary/10 text-primary dark:text-primary-content dark:bg-primary/20' : 'text-text-secondary-light hover:bg-slate-100 hover:text-text-primary-light dark:text-text-secondary-dark dark:hover:bg-slate-800 dark:hover:text-text-primary-dark']"
      >
        <span :class="['material-symbols-outlined', currentView === 'budget' ? 'fill-1' : '']">pie_chart</span>
        <span :class="currentView === 'budget' ? 'font-semibold' : 'font-medium'">Budget</span>
      </a>
      <a 
        @click.prevent="$emit('navigate', 'reports')"
        :class="['group flex items-center gap-3 rounded-lg px-4 py-3 transition-all cursor-pointer', currentView === 'reports' ? 'bg-primary/10 text-primary dark:text-primary-content dark:bg-primary/20' : 'text-text-secondary-light hover:bg-slate-100 hover:text-text-primary-light dark:text-text-secondary-dark dark:hover:bg-slate-800 dark:hover:text-text-primary-dark']"
      >
        <span :class="['material-symbols-outlined', currentView === 'reports' ? 'fill-1' : '']">bar_chart</span>
        <span :class="currentView === 'reports' ? 'font-semibold' : 'font-medium'">Reports</span>
      </a>
      <div class="px-3 py-2">
        <p class="text-xs font-semibold text-muted-light dark:text-muted-dark uppercase tracking-wider mb-2">System</p>
        <a 
          @click.prevent="$emit('navigate', 'settings')"
          :class="['group flex items-center gap-3 rounded-lg px-4 py-3 transition-all cursor-pointer', currentView === 'settings' ? 'bg-primary/10 text-primary dark:text-primary-content dark:bg-primary/20' : 'text-text-secondary-light hover:bg-slate-100 hover:text-text-primary-light dark:text-text-secondary-dark dark:hover:bg-slate-800 dark:hover:text-text-primary-dark']"
        >
          <span :class="['material-symbols-outlined', currentView === 'settings' ? 'fill-1' : '']">settings</span>
          <span :class="currentView === 'settings' ? 'font-semibold' : 'font-medium'">Settings</span>
        </a>
        <a class="group flex items-center gap-3 rounded-lg px-4 py-3 text-text-secondary-light hover:bg-slate-100 hover:text-text-primary-light dark:text-text-secondary-dark dark:hover:bg-slate-800 dark:hover:text-text-primary-dark transition-all cursor-pointer mt-1" href="#">
          <span class="material-symbols-outlined group-hover:text-primary transition-colors">help</span>
          <span class="font-medium">Support</span>
        </a>
      </div>
    </nav>
    <!-- User Profile Snippet -->
    <div class="border-t border-border-light dark:border-border-dark p-4">
      <div class="flex items-center gap-3 rounded-lg bg-slate-50 dark:bg-slate-800 p-3 transition-colors">
        <div class="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
          {{ (user?.name || 'U')[0].toUpperCase() }}
        </div>
        <div class="flex flex-col overflow-hidden">
          <span class="truncate text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">{{ user?.name || 'User' }}</span>
          <span class="truncate text-xs text-text-secondary-light dark:text-text-secondary-dark">{{ user?.email || 'Not signed in' }}</span>
        </div>
        <button @click="handleSignOut" class="ml-auto text-text-secondary-light hover:text-primary dark:text-text-secondary-dark dark:hover:text-primary transition-colors" title="Sign out">
          <span class="material-symbols-outlined text-xl">logout</span>
        </button>
      </div>
    </div>
  </aside>
</template>
