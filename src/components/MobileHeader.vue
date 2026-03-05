<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentView: {
    type: String,
    default: 'dashboard'
  }
})
defineEmits(['toggle-menu'])

const title = computed(() => {
  if (props.currentView === 'transactions') return 'Transactions'
  if (props.currentView === 'budget') return 'Budget Management'
  if (props.currentView === 'reports') return 'Reports & Analytics'
  if (props.currentView === 'settings') return 'Settings & Management'
  return 'CuanTrack'
})
</script>

<template>
  <header class="flex items-center justify-between border-b border-border-light bg-surface-light px-6 py-4 dark:border-border-dark dark:bg-surface-dark lg:hidden">
    <div class="flex items-center gap-3">
      <div  class="flex h-8 w-8 items-center justify-center rounded bg-primary text-white">
        <span class="material-symbols-outlined text-lg">account_balance_wallet</span>
      </div>
      <button v-show="currentView !== 'dashboard' && currentView !== 'settings' && currentView !== 'budget' && currentView !== 'reports' && currentView !== 'transactions'  " @click="$emit('toggle-menu')" class="text-text-secondary-light hover:text-text-primary-light dark:text-text-secondary-dark dark:hover:text-white transition-colors">
        <span class="material-symbols-outlined">menu</span>
      </button>
      <span class="font-bold text-text-primary-light dark:text-text-primary-dark">{{ title }}</span>
    </div>
    
    <!-- Right side toggle icon -->
    <button v-show="currentView === 'transactions' || currentView === 'budget' || currentView === 'reports' || currentView === 'settings' || currentView === 'dashboard' " @click="$emit('toggle-menu')" class="text-text-primary-light dark:text-text-primary-dark">
      <span class="material-symbols-outlined">menu</span>
    </button>
  </header>
</template>
