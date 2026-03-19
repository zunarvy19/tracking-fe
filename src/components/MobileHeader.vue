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
  if (props.currentView === 'tutorial') return 'Panduan Aplikasi'
  return 'CuanTrack'
})
</script>

<template>
  <header class="flex items-center justify-between border-b-2 border-foreground bg-white px-6 py-4 lg:hidden sticky top-0 z-40 pop-shadow">
    <div class="flex items-center gap-3">
      <div class="flex h-10 w-10 items-center justify-center rounded-full bg-accent border-2 border-foreground text-white">
        <span class="material-symbols-outlined text-xl">account_balance_wallet</span>
      </div>
      <button v-show="currentView !== 'dashboard' && currentView !== 'settings' && currentView !== 'budget' && currentView !== 'reports' && currentView !== 'transactions' && currentView !== 'tutorial'  " @click="$emit('toggle-menu')" class="text-foreground hover:bg-muted p-1 rounded-full transition-colors border-2 border-transparent hover:border-foreground">
        <span class="material-symbols-outlined">menu</span>
      </button>
      <span class="font-extrabold text-foreground tracking-tight text-lg">{{ title }}</span>
    </div>
    
    <!-- Right side toggle icon -->
    <button v-show="currentView === 'transactions' || currentView === 'budget' || currentView === 'reports' || currentView === 'settings' || currentView === 'tutorial' || currentView === 'dashboard' " @click="$emit('toggle-menu')" class="text-foreground hover:bg-tertiary p-2 rounded-xl transition-colors border-2 border-transparent hover:border-foreground hover:pop-shadow">
      <span class="material-symbols-outlined text-2xl">grid_view</span>
    </button>
  </header>
</template>
