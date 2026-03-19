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
  { key: 'tutorial', icon: 'school', label: 'Tutorial' },
]
</script>

<template>
  <!-- Desktop Sidebar -->
  <aside class="hidden w-64 flex-col border-r-2 border-foreground bg-secondary/10 lg:flex transition-colors duration-200">
    <!-- Brand -->
    <div class="flex items-center gap-3 px-6 py-6 border-b-2 border-foreground bg-white">
      <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent border-2 border-foreground pop-shadow text-white">
        <span class="material-symbols-outlined text-2xl">account_balance_wallet</span>
      </div>
      <div>
        <h1 class="text-xl font-extrabold text-foreground tracking-tight underline decoration-secondary decoration-2">CuanTrack</h1>
        <p class="text-xs font-bold text-mutedForeground tracking-widest uppercase mt-1">v2.1.0</p>
      </div>
    </div>
    <!-- Navigation Links -->
    <nav class="flex-1 flex flex-col gap-2 py-4 pl-0 pr-4">
      <a 
        v-for="item in navItems" :key="item.key"
        @click.prevent="$emit('navigate', item.key)"
        :class="[
          'group flex items-center gap-3 px-6 py-3 transition-transform cursor-pointer border-y-2 border-r-2 border-transparent font-bold text-sm tracking-wide',
          currentView === item.key 
            ? 'bg-accent text-white border-foreground rounded-r-2xl pop-shadow-active translate-x-1' 
            : 'text-mutedForeground hover:bg-white hover:border-foreground hover:rounded-r-2xl hover:text-foreground hover:pop-shadow hover:translate-x-1'
        ]"
      >
        <span :class="['material-symbols-outlined', currentView === item.key ? 'text-white' : 'group-hover:text-accent']">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </a>
      
      <div class="py-2 mt-4 pl-0 pr-4">
        <p class="text-xs font-bold text-mutedForeground uppercase tracking-widest mb-3 px-6">System</p>
        <a 
          v-for="item in systemItems" :key="item.key"
          @click.prevent="$emit('navigate', item.key)"
          :class="[
            'group flex items-center gap-3 px-6 py-3 transition-transform cursor-pointer border-y-2 border-r-2 border-transparent font-bold text-sm tracking-wide',
            currentView === item.key 
              ? 'bg-tertiary text-foreground border-foreground rounded-r-2xl pop-shadow-active translate-x-1' 
              : 'text-mutedForeground hover:bg-white hover:border-foreground hover:rounded-r-2xl hover:text-foreground hover:pop-shadow hover:translate-x-1'
          ]"
        >
          <span :class="['material-symbols-outlined', currentView === item.key ? 'text-foreground' : 'group-hover:text-tertiary']">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </a>
      </div>
    </nav>
    <!-- User Profile Snippet -->
    <div class="border-t-2 border-foreground p-4 bg-white">
      <div class="flex items-center gap-3 rounded-xl border-2 border-foreground bg-card p-3 pop-shadow-sm transition-colors">
        <div class="h-10 w-10 shrink-0 rounded-full bg-quaternary border-2 border-foreground flex items-center justify-center text-foreground font-extrabold text-lg">
          {{ (user?.name || 'U')[0].toUpperCase() }}
        </div>
        <div class="flex flex-col overflow-hidden">
          <span class="truncate text-sm font-extrabold text-foreground">{{ user?.name || 'User' }}</span>
          <span class="truncate text-xs font-semibold text-mutedForeground">{{ user?.email || 'Not signed in' }}</span>
        </div>
        <button @click="handleSignOut" class="ml-auto text-mutedForeground hover:text-danger hover:scale-110 active:scale-95 transition-all p-1" title="Sign out">
          <span class="material-symbols-outlined text-2xl">logout</span>
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
          class="absolute inset-0 bg-foreground/60 backdrop-blur-sm transition-opacity"
          @click="$emit('close')"
        ></div>
        
        <!-- Sidebar Panel -->
        <aside class="absolute inset-y-0 left-0 w-80 flex flex-col bg-background border-r-2 border-foreground shadow-[16px_0_0_0_#1E293B] transform transition-transform">
          <!-- Brand + Close -->
          <div class="flex items-center justify-between px-6 py-6 border-b-2 border-foreground bg-white">
            <div class="flex items-center gap-3">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent border-2 border-foreground text-white pop-shadow-sm">
                <span class="material-symbols-outlined text-2xl">account_balance_wallet</span>
              </div>
              <div>
                <h1 class="text-xl font-extrabold text-foreground tracking-tight underline decoration-secondary decoration-2">CuanTrack</h1>
              </div>
            </div>
            <button @click="$emit('close')" class="text-foreground hover:bg-muted border-2 border-transparent hover:border-foreground rounded-full p-1.5 transition-colors">
              <span class="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          <!-- Navigation Links -->
          <nav class="flex-1 flex flex-col gap-2 py-4 pl-0 pr-4 overflow-y-auto">
            <a 
              v-for="item in navItems" :key="item.key"
              @click.prevent="$emit('navigate', item.key)"
              :class="[
                'group flex items-center gap-3 px-6 py-4 transition-transform cursor-pointer border-y-2 border-r-2 border-transparent font-bold text-sm tracking-wide',
                currentView === item.key 
                  ? 'bg-accent text-white border-foreground rounded-r-2xl pop-shadow-active translate-x-1' 
                  : 'text-mutedForeground hover:bg-white hover:border-foreground hover:rounded-r-2xl hover:text-foreground hover:pop-shadow hover:translate-x-1'
              ]"
            >
              <span class="material-symbols-outlined">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </a>
            
            <div class="py-2 mt-4 pl-0 pr-4">
              <p class="text-xs font-bold text-mutedForeground uppercase tracking-widest mb-3 px-6">System</p>
              <a 
                v-for="item in systemItems" :key="item.key"
                @click.prevent="$emit('navigate', item.key)"
                :class="[
                  'group flex items-center gap-3 px-6 py-4 transition-transform cursor-pointer border-y-2 border-r-2 border-transparent font-bold text-sm tracking-wide',
                  currentView === item.key 
                    ? 'bg-tertiary text-foreground border-foreground rounded-r-2xl pop-shadow-active translate-x-1' 
                    : 'text-mutedForeground hover:bg-white hover:border-foreground hover:rounded-r-2xl hover:text-foreground hover:pop-shadow hover:translate-x-1'
                ]"
              >
                <span class="material-symbols-outlined">{{ item.icon }}</span>
                <span>{{ item.label }}</span>
              </a>
            </div>
          </nav>

          <!-- User Profile Snippet -->
          <div class="border-t-2 border-foreground p-4 bg-white">
            <div class="flex items-center gap-3 rounded-xl border-2 border-foreground bg-card p-3 pop-shadow-sm">
              <div class="h-10 w-10 shrink-0 rounded-full bg-quaternary border-2 border-foreground flex items-center justify-center text-foreground font-extrabold text-lg">
                {{ (user?.name || 'U')[0].toUpperCase() }}
              </div>
              <div class="flex flex-col overflow-hidden">
                <span class="truncate text-sm font-extrabold text-foreground">{{ user?.name || 'User' }}</span>
                <span class="truncate text-xs font-semibold text-mutedForeground">{{ user?.email || 'Not signed in' }}</span>
              </div>
              <button @click="handleSignOut" class="ml-auto text-mutedForeground hover:text-danger hover:scale-110 active:scale-95 transition-all p-1">
                <span class="material-symbols-outlined text-2xl">logout</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.mobile-sidebar-enter-active,
.mobile-sidebar-leave-active {
  transition: opacity 0.3s ease;
}
.mobile-sidebar-enter-active aside,
.mobile-sidebar-leave-active aside {
  transition: transform 0.3s ease-in-out;
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
