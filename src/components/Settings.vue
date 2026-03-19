<script setup>
import { ref, computed } from 'vue'
import { useUser } from '../composables/useUser.js'
import { useAuth } from '../composables/useAuth.js'
import { useStorage } from '../composables/useStorage.js'
import CategorySettings from './CategorySettings.vue'
import PgButton from './ui/PgButton.vue'
import PgCard from './ui/PgCard.vue'

const { profile, isLoading, updateProfile, isUpdating, deleteAccount, isDeleting } = useUser()
const { user } = useAuth()
const {
  storageUsage,
  cacheEntries,
  cacheSize,
  isOnline,
  timeAgo,
  isSyncing,
  forceSyncAll,
  clearCache,
} = useStorage()

const displayName = ref('')
const defaultCurrency = ref('IDR')

// Sync form fields when profile loads
const profileData = computed(() => {
  if (profile.value) {
    displayName.value = profile.value.preferences?.displayName || profile.value.name || ''
    defaultCurrency.value = profile.value.preferences?.defaultCurrency || 'IDR'
  }
  return profile.value
})

function handleSaveProfile() {
  updateProfile({
    name: displayName.value,
    displayName: displayName.value,
    defaultCurrency: defaultCurrency.value,
  })
}

function handleDeleteAccount() {
  if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
    deleteAccount()
  }
}
</script>

<template>
  <div class="flex-1 overflow-y-auto p-4 md:p-8">
    <div class="max-w-5xl mx-auto flex flex-col gap-10 pb-10">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div class="flex flex-col gap-2">
          <h1 class="text-4xl font-extrabold tracking-tight text-foreground underline decoration-tertiary decoration-4 underline-offset-4">Settings &amp; Management</h1>
          <p class="text-mutedForeground font-bold tracking-wide mt-2">Manage your account preferences, and sync status.</p>
        </div>
      </div>
      
      <!-- Content Grid -->
      <div class="grid gap-8">
        
        <!-- Profile Section -->
        <PgCard class="p-0 overflow-hidden bg-white">
          <div class="px-6 py-5 border-b-2 border-foreground bg-quaternary/20 flex justify-between items-center">
            <h2 class="text-xl font-extrabold text-foreground uppercase tracking-widest">Profile Settings</h2>
            <span class="px-3 py-1 rounded-full bg-white border-2 border-foreground text-foreground text-xs font-extrabold uppercase tracking-widest flex items-center gap-2 pop-shadow-sm">
              <span class="w-2 h-2 rounded-full border border-foreground bg-success animate-pulse"></span>
              Active
            </span>
          </div>
          
          <div v-if="isLoading" class="p-6 animate-pulse space-y-6">
            <div class="flex items-center gap-6">
              <div class="h-24 w-24 rounded-full border-2 border-foreground bg-muted"></div>
              <div class="space-y-2">
                <div class="h-5 w-32 bg-muted rounded border-2 border-foreground"></div>
                <div class="h-4 w-48 bg-muted rounded border-2 border-foreground"></div>
              </div>
            </div>
          </div>
          <div v-else class="p-6">
            <div class="flex flex-col sm:flex-row items-center gap-8">
              
              <!-- Avatar -->
              <div class="relative group">
                <div class="h-28 w-28 rounded-full border-4 border-foreground bg-primary flex items-center justify-center pop-shadow-sm">
                  <span class="text-white text-4xl font-extrabold">{{ (profileData?.name || 'U')[0].toUpperCase() }}</span>
                </div>
              </div>
              
              <!-- User Info -->
              <div class="flex-1 text-center sm:text-left space-y-2">
                <h3 class="text-2xl font-extrabold text-foreground tracking-tight">{{ profileData?.name || 'User' }}</h3>
                <p class="text-mutedForeground font-bold tracking-wide">{{ profileData?.email }}</p>
                <div class="pt-4 flex gap-3 justify-center sm:justify-start">
                  <PgButton @click="handleSaveProfile" :disabled="isUpdating" variant="primary">
                    {{ isUpdating ? 'Saving...' : 'Save Changes' }}
                  </PgButton>
                </div>
              </div>
            </div>
            
            <!-- Form Fields -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 pt-8 border-t-2 border-foreground border-dashed">
              <div class="space-y-2">
                <label class="text-xs font-extrabold uppercase tracking-widest text-foreground">Display Name</label>
                <input v-model="displayName" class="w-full px-4 py-3 rounded-xl border-2 border-foreground bg-white text-foreground font-bold focus:outline-none focus:ring-0 focus:border-accent transition-all pop-shadow-sm" type="text"/>
              </div>
              
              <div class="space-y-2">
                <label class="text-xs font-extrabold uppercase tracking-widest text-foreground">Default Currency</label>
                <div class="relative">
                  <select v-model="defaultCurrency" class="w-full px-4 py-3 pr-10 rounded-xl border-2 border-foreground bg-white text-foreground font-extrabold uppercase tracking-widest appearance-none focus:outline-none focus:ring-0 focus:border-accent transition-all pop-shadow-sm cursor-pointer">
                    <option value="IDR">IDR (Rp)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                  <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-foreground font-extrabold pointer-events-none">expand_more</span>
                </div>
              </div>
            </div>
          </div>
        </PgCard>
        
        <!-- Storage & Sync Section -->
        <PgCard class="p-0 overflow-hidden bg-white hidden">
          <div class="px-6 py-5 border-b-2 border-foreground bg-quaternary/20 flex justify-between items-center">
            <div class="flex items-center gap-4">
              <h2 class="text-xl font-extrabold text-foreground uppercase tracking-widest">Data &amp; Storage</h2>
              <span :class="[
                'px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest flex items-center gap-2 border-2 border-foreground pop-shadow-sm bg-white',
                isOnline
                  ? 'text-foreground'
                  : 'text-danger'
              ]">
                <span :class="[
                  'w-2 h-2 rounded-full border border-foreground',
                  isOnline ? 'bg-success animate-pulse' : 'bg-danger'
                ]"></span>
                {{ isOnline ? 'Online' : 'Offline' }}
              </span>
            </div>
          </div>
          
          <div class="p-6 grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div class="lg:col-span-2 space-y-8">
              <div class="space-y-4">
                <div class="flex justify-between items-end">
                  <h3 class="text-sm font-extrabold uppercase tracking-widest text-foreground">Local Storage Usage (IndexedDB)</h3>
                  <span class="text-xs font-bold text-mutedForeground tracking-wide">{{ cacheEntries }} cached entries &middot; {{ cacheSize }}</span>
                </div>
                <div class="h-6 w-full bg-muted rounded-full overflow-hidden flex border-2 border-foreground shadow-solid-soft relative">
                  <div
                    class="h-full bg-accent transition-all duration-500 border-r-2 border-foreground"
                    :style="{ width: Math.min(storageUsage.percent, 100) + '%' }"
                    title="Used Storage"
                  ></div>
                  <!-- highlight shine -->
                  <div class="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent pointer-events-none"></div>
                </div>
                <div class="flex justify-between text-xs font-extrabold uppercase tracking-widest text-mutedForeground">
                  <span>{{ storageUsage.percent }}% used</span>
                  <span>{{ cacheSize }} used</span>
                </div>
              </div>
              
              <!-- Clear Cache -->
              <PgButton @click="clearCache" variant="ghost" class="gap-2 border-dashed">
                <span class="material-symbols-outlined text-[20px]">delete_sweep</span>
                Clear Local Cache
              </PgButton>
            </div>
            
            <!-- Sync Status Card -->
            <div class="lg:col-span-1">
              <div class="bg-secondary rounded-xl p-5 border-2 border-foreground pop-shadow-sm h-full flex flex-col relative overflow-hidden group">
                <div class="absolute right-[-20px] top-[-20px] p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span class="material-symbols-outlined text-[100px] text-white">cloud_sync</span>
                </div>
                <div class="flex items-center justify-between mb-4 z-10">
                  <h3 class="font-extrabold uppercase tracking-widest text-white">Cloud Sync</h3>
                  <span :class="['material-symbols-outlined font-extrabold', isOnline ? 'text-white' : 'text-danger']">
                    {{ isOnline ? 'cloud_done' : 'cloud_off' }}
                  </span>
                </div>
                <div class="flex-1 flex flex-col justify-center items-center text-center space-y-3 py-4 z-10">
                  <div :class="[
                    'w-20 h-20 rounded-full border-4 border-foreground flex items-center justify-center mb-2 pop-shadow-sm',
                    isOnline ? 'bg-white' : 'bg-muted'
                  ]">
                    <span :class="[
                      'material-symbols-outlined text-4xl',
                      isOnline ? 'text-success' : 'text-danger'
                    ]">{{ isOnline ? 'check_circle' : 'cloud_off' }}</span>
                  </div>
                  <p class="text-base font-extrabold tracking-tight text-white">
                    {{ isOnline ? 'Connected to server' : 'You are offline' }}
                  </p>
                  <p class="text-xs font-bold tracking-widest uppercase text-white/80">Last synced: {{ timeAgo }}</p>
                </div>
                <PgButton
                  @click="forceSyncAll"
                  :disabled="isSyncing || !isOnline"
                  variant="primary"
                  class="mt-auto z-10 w-full group-hover:bg-white group-hover:text-secondary group-hover:border-foreground"
                >
                  <span :class="['material-symbols-outlined text-[20px]', isSyncing ? 'animate-spin' : 'group-hover:animate-spin']">sync</span>
                  {{ isSyncing ? 'Syncing...' : 'Force Sync' }}
                </PgButton>
              </div>
            </div>
          </div>
        </PgCard>
        
        <!-- Category Settings -->
        <!-- only admin can see this -->
        <CategorySettings />
        
        <!-- Danger Zone -->
        <PgCard class="p-0 overflow-hidden bg-white border-danger">
          <div class="px-6 py-5 border-b-2 border-danger bg-danger/10">
            <h2 class="text-xl font-extrabold text-danger uppercase tracking-widest">Danger Zone</h2>
          </div>
          <div class="p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 class="text-lg font-extrabold text-foreground tracking-tight">Delete Account</h3>
              <p class="text-sm font-bold tracking-wide text-mutedForeground mt-2">Once you delete your account, there is no going back. Please be certain.</p>
            </div>
            <button @click="handleDeleteAccount" :disabled="isDeleting" class="px-6 py-3 bg-danger text-white rounded-xl border-2 border-foreground font-extrabold uppercase tracking-widest shadow-solid-soft hover:shadow-solid hover:-translate-y-1 hover:-translate-x-1 active:shadow-none active:translate-y-0 active:translate-x-0 transition-all whitespace-nowrap disabled:opacity-50">
              {{ isDeleting ? 'Deleting...' : 'Delete Account' }}
            </button>
          </div>
        </PgCard>
        
      </div>
    </div>
  </div>
</template>
