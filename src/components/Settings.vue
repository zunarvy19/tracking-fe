<script setup>
import { ref, computed } from 'vue'
import { useUser } from '../composables/useUser.js'
import { useAuth } from '../composables/useAuth.js'

const { profile, isLoading, updateProfile, isUpdating, deleteAccount, isDeleting } = useUser()
const { user } = useAuth()

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
    <div class="max-w-5xl mx-auto flex flex-col gap-8 pb-10">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div class="flex flex-col gap-1">
          <h1 class="text-text-primary-light dark:text-white text-3xl md:text-4xl font-extrabold tracking-tight">Settings &amp; Management</h1>
          <p class="text-text-secondary-light dark:text-slate-400 text-base">Manage your account preferences, local storage, and sync status.</p>
        </div>
      </div>
      
      <!-- Content Grid -->
      <div class="grid gap-8">
        
        <!-- Profile Section -->
        <section class="bg-surface-light dark:bg-surface-dark rounded-xl shadow-subtle border border-border-light dark:border-border-dark overflow-hidden">
          <div class="px-6 py-5 border-b border-border-light dark:border-border-dark flex justify-between items-center">
            <h2 class="text-lg font-bold text-text-primary-light dark:text-white">Profile Settings</h2>
            <span class="px-2.5 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-semibold flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Active
            </span>
          </div>
          
          <div v-if="isLoading" class="p-6 animate-pulse space-y-6">
            <div class="flex items-center gap-6">
              <div class="h-24 w-24 rounded-full bg-slate-200 dark:bg-slate-700"></div>
              <div class="space-y-2">
                <div class="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div class="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
            </div>
          </div>
          <div v-else class="p-6">
            <div class="flex flex-col sm:flex-row items-center gap-6">
              
              <!-- Avatar -->
              <div class="relative group">
                <div class="h-24 w-24 rounded-full bg-primary flex items-center justify-center shadow-md ring-4 ring-white dark:ring-slate-800">
                  <span class="text-white text-3xl font-bold">{{ (profileData?.name || 'U')[0].toUpperCase() }}</span>
                </div>
                <button aria-label="Edit photo" class="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors">
                  <span class="material-symbols-outlined text-[18px]">edit</span>
                </button>
              </div>
              
              <!-- User Info -->
              <div class="flex-1 text-center sm:text-left space-y-1">
                <h3 class="text-xl font-bold text-text-primary-light dark:text-white">{{ profileData?.name || 'User' }}</h3>
                <p class="text-text-secondary-light dark:text-slate-400">{{ profileData?.email }}</p>
                <div class="pt-2 flex gap-3 justify-center sm:justify-start">
                  <button @click="handleSaveProfile" :disabled="isUpdating" class="px-4 py-2 bg-primary text-white border border-primary rounded-lg text-sm font-semibold shadow-sm hover:bg-blue-600 transition-colors disabled:opacity-50">
                    {{ isUpdating ? 'Saving...' : 'Save Changes' }}
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Form Fields -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-8 border-t border-border-light dark:border-border-dark">
              <div class="space-y-2">
                <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Display Name</label>
                <input v-model="displayName" class="w-full px-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-900 text-text-primary-light dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" type="text"/>
              </div>
              
              <div class="space-y-2">
                <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Default Currency</label>
                <div class="relative">
                  <select v-model="defaultCurrency" class="w-full px-4 py-2.5 pr-10 rounded-lg border border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-900 text-text-primary-light dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all">
                    <option value="IDR">IDR (Rp)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                  <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary-light pointer-events-none">expand_more</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <!-- Storage & Sync Section -->
        <section class="bg-surface-light dark:bg-surface-dark rounded-xl shadow-subtle border border-border-light dark:border-border-dark overflow-hidden">
          <div class="px-6 py-5 border-b border-border-light dark:border-border-dark flex justify-between items-center">
            <div class="flex items-center gap-3">
              <h2 class="text-lg font-bold text-text-primary-light dark:text-white">Data &amp; Storage</h2>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 uppercase tracking-wide">Beta</span>
            </div>
          </div>
          
          <div class="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 space-y-6">
              <div class="space-y-3">
                <div class="flex justify-between items-end">
                  <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300">Local Storage Usage (IndexedDB)</h3>
                  <span class="text-xs font-medium text-text-secondary-light dark:text-slate-400">Connected to cloud</span>
                </div>
                <div class="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div class="h-full bg-primary w-[15%]" title="Transactions"></div>
                  <div class="h-full bg-indigo-400 w-[8%]" title="Images"></div>
                  <div class="h-full bg-emerald-400 w-[5%]" title="Cache"></div>
                </div>
              </div>
            </div>
            
            <!-- Sync Status Card -->
            <div class="lg:col-span-1">
              <div class="bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-800/50 rounded-xl p-5 border border-border-light dark:border-border-dark shadow-sm h-full flex flex-col">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="font-bold text-text-primary-light dark:text-white">Cloud Sync</h3>
                  <span class="material-symbols-outlined text-green-500">cloud_done</span>
                </div>
                <div class="flex-1 flex flex-col justify-center items-center text-center space-y-2 py-4">
                  <div class="w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-1">
                    <span class="material-symbols-outlined text-3xl text-green-500">check_circle</span>
                  </div>
                  <p class="text-sm font-medium text-text-primary-light dark:text-white">Everything is up to date</p>
                  <p class="text-xs text-text-secondary-light dark:text-slate-400">Last synced: Just now</p>
                </div>
                <button class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-700 border border-border-light dark:border-border-dark text-slate-700 dark:text-slate-200 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 active:scale-[0.98] transition-all mt-auto group">
                  <span class="material-symbols-outlined text-[20px] group-hover:animate-spin">sync</span>
                  Force Sync
                </button>
              </div>
            </div>
          </div>
        </section>
        
        <!-- Danger Zone -->
        <section class="bg-surface-light dark:bg-surface-dark rounded-xl shadow-subtle border border-red-200 dark:border-red-900/30 overflow-hidden">
          <div class="px-6 py-5 border-b border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
            <h2 class="text-lg font-bold text-red-600 dark:text-red-400">Danger Zone</h2>
          </div>
          <div class="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 class="text-sm font-bold text-text-primary-light dark:text-white">Delete Account</h3>
              <p class="text-sm text-text-secondary-light dark:text-slate-400 mt-1">Once you delete your account, there is no going back. Please be certain.</p>
            </div>
            <button @click="handleDeleteAccount" :disabled="isDeleting" class="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors whitespace-nowrap disabled:opacity-50">
              {{ isDeleting ? 'Deleting...' : 'Delete Account' }}
            </button>
          </div>
        </section>
        
      </div>
    </div>
  </div>
</template>
