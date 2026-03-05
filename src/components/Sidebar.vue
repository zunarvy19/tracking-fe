<script setup>
import { useAuth } from '../composables/useAuth.js'

const props = defineProps({
  currentView: {
    type: String,
    required: true
  },
  isMobileOpen: {
    type: Boolean,
    default: false
  }
})
defineEmits(['navigate', 'close'])

const { user, signOut } = useAuth()

async function handleSignOut() {
  await signOut()
  window.location.reload()
}

const navItems = [
  { key: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
  { key: 'transactions', icon: 'receipt_long', label: 'Transactions' },
  { key: 'budget', icon: 'pie_chart', label: 'Budget' },
  { key: 'reports', icon: 'bar_chart', label: 'Reports' },
]

const systemItems = [
  { key: 'settings', icon: 'settings', label: 'Settings' },
]
</script>

<template>
  <!-- Desktop Sidebar (unchanged) -->
  <aside class="hidden w-64 flex-col border-r border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark lg:flex transition-colors duration-200">
    <!-- Brand -->
    <div class="flex items-center gap-3 px-6 py-6 border-b border-border-light dark:border-border-dark">
      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
        <span class="material-symbols-outlined text-2xl">account_balance_wallet</span>
      </div>
      <div>
        <h1 class="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">CuanTrack</h1>
        <p class="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">v2.1.0</p>
      </div>
    </div>
    <!-- Navigation Links -->
    <nav class="flex-1 flex flex-col gap-1 px-4 py-4">
      <a 
        v-for="item in navItems" :key="item.key"
        @click.prevent="$emit('navigate', item.key)"
        :class="['group flex items-center gap-3 rounded-lg px-4 py-3 transition-all cursor-pointer', currentView === item.key ? 'bg-primary/10 text-primary dark:text-primary-content dark:bg-primary/20' : 'text-text-secondary-light hover:bg-slate-100 hover:text-text-primary-light dark:text-text-secondary-dark dark:hover:bg-slate-800 dark:hover:text-text-primary-dark']"
      >
        <span :class="['material-symbols-outlined', currentView === item.key ? 'fill-1' : '']">{{ item.icon }}</span>
        <span :class="currentView === item.key ? 'font-semibold' : 'font-medium'">{{ item.label }}</span>
      </a>
      <div class="px-3 py-2">
        <p class="text-xs font-semibold text-muted-light dark:text-muted-dark uppercase tracking-wider mb-2">System</p>
        <a 
          v-for="item in systemItems" :key="item.key"
          @click.prevent="$emit('navigate', item.key)"
          :class="['group flex items-center gap-3 rounded-lg px-4 py-3 transition-all cursor-pointer', currentView === item.key ? 'bg-primary/10 text-primary dark:text-primary-content dark:bg-primary/20' : 'text-text-secondary-light hover:bg-slate-100 hover:text-text-primary-light dark:text-text-secondary-dark dark:hover:bg-slate-800 dark:hover:text-text-primary-dark']"
        >
          <span :class="['material-symbols-outlined', currentView === item.key ? 'fill-1' : '']">{{ item.icon }}</span>
          <span :class="currentView === item.key ? 'font-semibold' : 'font-medium'">{{ item.label }}</span>
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

  <!-- Mobile Sidebar Overlay -->
  <Teleport to="body">
    <Transition name="mobile-sidebar">
      <div v-if="isMobileOpen" class="fixed inset-0 z-50 lg:hidden">
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          @click="$emit('close')"
        ></div>
        
        <!-- Sidebar Panel -->
        <aside class="absolute inset-y-0 left-0 w-72 flex flex-col bg-surface-light dark:bg-surface-dark shadow-2xl transform transition-transform">
          <!-- Brand + Close -->
          <div class="flex items-center justify-between px-6 py-6 border-b border-border-light dark:border-border-dark">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                <span class="material-symbols-outlined text-2xl">account_balance_wallet</span>
              </div>
              <div>
                <h1 class="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">CuanTrack</h1>
                <p class="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">v2.1.0</p>
              </div>
            </div>
            <button @click="$emit('close')" class="text-text-secondary-light hover:text-text-primary-light dark:text-text-secondary-dark dark:hover:text-white transition-colors rounded-full p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Navigation Links -->
          <nav class="flex-1 flex flex-col gap-1 px-4 py-4 overflow-y-auto">
            <a 
              v-for="item in navItems" :key="item.key"
              @click.prevent="$emit('navigate', item.key)"
              :class="['group flex items-center gap-3 rounded-lg px-4 py-3 transition-all cursor-pointer', currentView === item.key ? 'bg-primary/10 text-primary dark:text-primary-content dark:bg-primary/20' : 'text-text-secondary-light hover:bg-slate-100 hover:text-text-primary-light dark:text-text-secondary-dark dark:hover:bg-slate-800 dark:hover:text-text-primary-dark']"
            >
              <span :class="['material-symbols-outlined', currentView === item.key ? 'fill-1' : '']">{{ item.icon }}</span>
              <span :class="currentView === item.key ? 'font-semibold' : 'font-medium'">{{ item.label }}</span>
            </a>
            <div class="px-3 py-2">
              <p class="text-xs font-semibold text-muted-light dark:text-muted-dark uppercase tracking-wider mb-2">System</p>
              <a 
                v-for="item in systemItems" :key="item.key"
                @click.prevent="$emit('navigate', item.key)"
                :class="['group flex items-center gap-3 rounded-lg px-4 py-3 transition-all cursor-pointer', currentView === item.key ? 'bg-primary/10 text-primary dark:text-primary-content dark:bg-primary/20' : 'text-text-secondary-light hover:bg-slate-100 hover:text-text-primary-light dark:text-text-secondary-dark dark:hover:bg-slate-800 dark:hover:text-text-primary-dark']"
              >
                <span :class="['material-symbols-outlined', currentView === item.key ? 'fill-1' : '']">{{ item.icon }}</span>
                <span :class="currentView === item.key ? 'font-semibold' : 'font-medium'">{{ item.label }}</span>
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
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Mobile sidebar transition */
.mobile-sidebar-enter-active,
.mobile-sidebar-leave-active {
  transition: opacity 0.3s ease;
}
.mobile-sidebar-enter-active aside,
.mobile-sidebar-leave-active aside {
  transition: transform 0.3s ease;
}
.mobile-sidebar-enter-from,
.mobile-sidebar-leave-to {
  opacity: 0;
}
.mobile-sidebar-enter-from aside,
.mobile-sidebar-leave-to aside {
  transform: translateX(-100%);
}
</style>
