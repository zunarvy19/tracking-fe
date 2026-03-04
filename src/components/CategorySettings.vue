<script setup>
import { ref, computed } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { useCategories } from '../composables/useCategories.js'

const { user } = useAuth()
const { categories, isLoading, createCategory, updateCategory, deleteCategory, isCreating, isUpdating, isDeleting } = useCategories()

const isSuperadmin = computed(() => user.value?.role === 'superadmin')

// Derived categories based on role and ownership
const displayCategories = computed(() => {
  if (!categories.value) return []
  return [...categories.value].sort((a, b) => {
    // Show system defaults first, then user's own categories sorted alphabetically
    if (a.isDefault && !b.isDefault) return -1
    if (!a.isDefault && b.isDefault) return 1
    return a.name.localeCompare(b.name)
  })
})

const isEditing = ref(false)
const currentEditId = ref(null)

const formData = ref({
  name: '',
  description: '',
  icon: 'category',
  color: 'blue',
  type: 'expense'
})

const colorOptions = [
  'blue', 'purple', 'emerald', 'teal', 'green', 'orange', 'red', 'yellow', 'indigo', 'pink', 'slate'
]

function resetForm() {
  formData.value = {
    name: '',
    description: '',
    icon: 'category',
    color: 'blue',
    type: 'expense'
  }
  isEditing.value = false
  currentEditId.value = null
}

function handleEdit(category) {
  formData.value = {
    name: category.name,
    description: category.description || '',
    icon: category.icon,
    color: category.color,
    type: category.type
  }
  isEditing.value = true
  currentEditId.value = category.id
}

function handleSubmit() {
  if (isEditing.value && currentEditId.value) {
    updateCategory({ id: currentEditId.value, data: { ...formData.value } })
  } else {
    createCategory({ ...formData.value })
  }
  resetForm()
}

function handleDelete(id) {
  if (confirm('Are you sure you want to delete this category? This will affect your past transactions linked to it.')) {
    deleteCategory(id)
  }
}

// Check if a user is allowed to edit/delete a given category
function canManage(category) {
  if (category.isDefault) {
    return isSuperadmin.value // Only superadmins can manage default categories
  }
  return true // Users can manage their own categories
}

// Format icon color to Tailwind classes
const colorClasses = {
  blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  teal: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
  green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
  indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
  pink: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
  slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
}
</script>

<template>
  <section class="bg-surface-light dark:bg-surface-dark rounded-xl shadow-subtle border border-border-light dark:border-border-dark overflow-hidden">
    <!-- Header -->
    <div class="px-6 py-5 border-b border-border-light dark:border-border-dark">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-bold text-text-primary-light dark:text-white flex items-center gap-2">
            Categories Configuration
            <span v-if="isSuperadmin" class="bg-primary px-2 py-0.5 text-[10px] rounded text-white font-bold tracking-widest uppercase">Admin</span>
          </h2>
          <p class="text-sm text-text-secondary-light dark:text-slate-400 mt-1">
            Manage your budget categories. {{ isSuperadmin ? 'You have elevated permissions to modify system defaults.' : 'System defaults cannot be deleted.' }}
          </p>
        </div>
      </div>
    </div>

    <div class="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Category Editor Form -->
      <div class="lg:col-span-1 border-r-0 lg:border-r border-border-light dark:border-border-dark lg:pr-8">
        <h3 class="font-bold text-text-primary-light dark:text-white mb-4">
          {{ isEditing ? 'Edit Category' : 'Create Custom Category' }}
        </h3>
        
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Name Input -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">Category Name</label>
            <input 
              v-model="formData.name" 
              required
              class="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-900 text-sm text-text-primary-light dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all pb-2" 
              type="text" 
              placeholder="e.g. Groceries"
            />
          </div>

          <!-- Description Input -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">Description <span class="text-slate-400 font-normal">(Optional)</span></label>
            <input 
              v-model="formData.description" 
              class="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-900 text-sm text-text-primary-light dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
              type="text" 
              placeholder="e.g. Food and dining out"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- Icon Input -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                Icon 
                <a href="https://fonts.google.com/icons?selected=Material+Symbols+Outlined" target="_blank" class="text-primary hover:underline" title="Search Material Symbols"><span class="material-symbols-outlined text-[12px]">open_in_new</span></a>
              </label>
              <div class="relative">
                <input 
                  v-model="formData.icon" 
                  required
                  class="w-full px-3 py-2 pl-[38px] rounded-lg border border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-900 text-sm text-text-primary-light dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                  type="text" 
                />
                <span class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">{{ formData.icon || 'category' }}</span>
              </div>
            </div>

            <!-- Type Input -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">Type</label>
              <select v-model="formData.type" class="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-900 text-sm text-text-primary-light dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all">
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>

          <!-- Color Picker -->
          <div class="space-y-2 pt-2">
            <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">Theme Color</label>
            <div class="flex flex-wrap gap-2">
              <button 
                v-for="color in colorOptions" :key="color"
                type="button"
                @click="formData.color = color"
                :class="[
                  'w-6 h-6 rounded-full border-2 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-300 dark:focus:ring-offset-slate-800 transition-all',
                  formData.color === color ? 'border-primary scale-110 shadow-sm' : 'border-transparent hover:scale-105',
                  colorClasses[color] ? colorClasses[color].split(' ')[0] : 'bg-slate-200' 
                ]"
                :title="color"
              ></button>
            </div>
          </div>

          <div class="pt-4 flex gap-2">
            <button 
              type="submit" 
              :disabled="isCreating || isUpdating"
              class="flex-1 px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
            >
              {{ isEditing ? (isUpdating ? 'Saving...' : 'Update') : (isCreating ? 'Adding...' : 'Add Category') }}
            </button>
            <button 
              v-if="isEditing" 
              type="button" 
              @click="resetForm"
              class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <!-- Categories List -->
      <div class="lg:col-span-2">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-text-primary-light dark:text-white">Active Categories</h3>
          <span class="text-xs font-medium text-text-secondary-light dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            {{ displayCategories.length }} Total
          </span>
        </div>

        <div v-if="isLoading" class="space-y-3">
          <div v-for="i in 5" :key="i" class="h-16 bg-slate-100 dark:bg-slate-800/50 rounded-xl animate-pulse"></div>
        </div>

        <div v-else-if="displayCategories.length === 0" class="text-center py-12 text-text-secondary-light dark:text-slate-400">
          <span class="material-symbols-outlined text-4xl mb-2 opacity-50">category</span>
          <p class="text-sm">No categories found.</p>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          <div 
            v-for="cat in displayCategories" 
            :key="cat.id"
            :class="[
              'group relative p-3 rounded-xl border flex items-center gap-3 transition-all',
              currentEditId === cat.id 
                ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                : 'border-border-light dark:border-border-dark bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
            ]"
          >
            <!-- Category Icon -->
            <div :class="['w-10 h-10 rounded-lg flex items-center justify-center shrink-0', colorClasses[cat.color] || 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300']">
              <span class="material-symbols-outlined">{{ cat.icon }}</span>
            </div>

            <!-- Category Info -->
            <div class="flex-1 min-w-0 pr-16 text-left">
              <div class="flex items-center gap-1.5">
                <p class="text-sm font-bold text-text-primary-light dark:text-white truncate">{{ cat.name }}</p>
                <!-- Render tags -->
                <span v-if="cat.isDefault" class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider shrink-0" title="System Masterdata">System</span>
              </div>
              <p v-if="cat.description" class="text-xs text-text-secondary-light dark:text-slate-400 truncate mt-0.5">
                {{ cat.description }}
              </p>
            </div>

            <!-- Actions Menu (Show on Hover) -->
            <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-800 pl-2 rounded-l-lg shadow-[[-10px_0_10px_rgba(255,255,255,1)]] dark:shadow-[[-10px_0_10px_rgba(30,41,59,1)]]">
              <template v-if="canManage(cat)">
                <button 
                  @click="handleEdit(cat)"
                  class="w-7 h-7 rounded-md flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-primary dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
                  title="Edit Category"
                >
                  <span class="material-symbols-outlined text-[16px]">edit</span>
                </button>
                <button 
                  @click="handleDelete(cat.id)"
                  :disabled="isDeleting"
                  class="w-7 h-7 rounded-md flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 dark:text-slate-400 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                  title="Delete Category"
                >
                  <span class="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </template>
              <template v-else>
                 <span class="material-symbols-outlined text-[16px] text-slate-300 dark:text-slate-600 mr-2" title="Viewing Mode Only">lock</span>
              </template>
            </div>

          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<style scoped>
/* Custom slim scrollbar for the categories list */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1; /* slate-300 */
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #475569; /* slate-600 */
}
</style>
