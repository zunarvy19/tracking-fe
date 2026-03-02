<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentView: {
    type: String,
    default: 'dashboard'
  }
})

const title = computed(() => {
  if (props.currentView === 'transactions') return 'Transactions'
  if (props.currentView === 'budget') return 'Budget Management'
  if (props.currentView === 'reports') return 'Reports & Analytics'
  if (props.currentView === 'settings') return 'Settings & Management'
  return 'FinanceTracker'
})
</script>

<template>
  <header class="flex items-center justify-between border-b border-border-light bg-surface-light px-6 py-4 dark:border-border-dark dark:bg-surface-dark lg:hidden">
    <div class="flex items-center gap-3">
      <div v-show="currentView === 'dashboard'" class="flex h-8 w-8 items-center justify-center rounded bg-primary text-white">
        <span class="material-symbols-outlined text-lg">account_balance_wallet</span>
      </div>
      <button v-show="currentView !== 'dashboard'" class="text-text-secondary-light hover:text-text-primary-light dark:text-text-secondary-dark dark:hover:text-white transition-colors">
        <span class="material-symbols-outlined">menu</span>
      </button>
      <span class="font-bold text-text-primary-light dark:text-text-primary-dark">{{ title }}</span>
    </div>
    
    <!-- Right side toggle icon / avatar -->
    <button v-if="currentView === 'dashboard'" class="text-text-primary-light dark:text-text-primary-dark">
      <span class="material-symbols-outlined">menu</span>
    </button>
    <div v-else class="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 bg-cover bg-center" data-alt="User Avatar Small" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuDkjeyPlsbOvBnXSf4aHd27a04rJ98HOJ7pr3Y-ufCR_PyowqVNxZcXZn3R0hdfGK4JxZZC6yBqmzkUxkPVl2QwRJxjBuWHWotnZE5_D4M_D11qsMOE6JFLFNElOGzQXEiwMMj6Y33p_zhJWXQHlgCSs7-NqPgPwTZPRpyykXVmrif49OR_vbTBf2GyaEtglVj0NYBNh7UAaLAeSf1DV4Z72fO7yJtKBJoIPZkhpFYfTGMSpb7OMHngUvkh368JeUUtrlw-Yvu7-KU');"></div>
  </header>
</template>
