<script setup>
import { ref, computed } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { useCategories } from '../composables/useCategories.js'
import PgCard from './ui/PgCard.vue'
import PgButton from './ui/PgButton.vue'
import PgInput from './ui/PgInput.vue'

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
  blue: 'bg-accent text-white',
  purple: 'bg-tertiary text-foreground',
  emerald: 'bg-quaternary text-foreground',
  teal: 'bg-quaternary text-foreground',
  green: 'bg-quaternary text-foreground',
  orange: 'bg-secondary text-white',
  red: 'bg-danger text-white',
  yellow: 'bg-secondary text-white',
  indigo: 'bg-accent text-white',
  pink: 'bg-accent text-white',
  slate: 'bg-muted text-foreground'
}
</script>

<template>
  <PgCard class="p-0 overflow-hidden bg-white">
    <!-- Header -->
    <div class="px-6 py-5 border-b-2 border-foreground bg-accent/10">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-extrabold text-foreground flex items-center gap-3 uppercase tracking-widest">
            Categories Configuration
            <span v-if="isSuperadmin" class="bg-primary px-3 py-1 text-[10px] rounded border-2 border-foreground text-white font-extrabold tracking-widest uppercase pop-shadow-sm">Admin</span>
          </h2>
          <p class="text-sm font-bold tracking-wide text-mutedForeground mt-2">
            Manage your budget categories. {{ isSuperadmin ? 'You have elevated permissions to modify system defaults.' : 'System defaults cannot be deleted.' }}
          </p>
        </div>
      </div>
    </div>

    <div class="p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
      
      <!-- Category Editor Form -->
      <div class="lg:col-span-1 lg:border-r-2 border-foreground lg:pr-10 border-dashed border-b-2 lg:border-b-0 pb-10 lg:pb-0">
        <h3 class="font-extrabold text-xl tracking-tight text-foreground underline decoration-secondary decoration-4 underline-offset-4 mb-8">
          {{ isEditing ? 'Edit Category' : 'Create Custom Category' }}
        </h3>
        
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Name Input -->
          <PgInput
            id="category-name"
            label="Category Name"
            type="text"
            v-model="formData.name"
            placeholder="e.g. Groceries"
            required
          />

          <!-- Description Input -->
          <PgInput
            id="category-description"
            label="Description (Optional)"
            type="text"
            v-model="formData.description"
            placeholder="e.g. Food and dining out"
          />

          <div class="grid grid-cols-2 gap-6">
            <!-- Icon Input -->
            <div class="space-y-2">
              <label class="text-xs font-extrabold uppercase tracking-widest text-foreground flex items-center gap-2">
                Icon 
                <a href="https://fonts.google.com/icons?selected=Material+Symbols+Outlined" target="_blank" class="text-accent hover:text-primary transition-colors hover:-translate-y-0.5 transform inline-block" title="Search Material Symbols"><span class="material-symbols-outlined text-[16px]">open_in_new</span></a>
              </label>
              <div class="relative">
                <input 
                  v-model="formData.icon" 
                  required
                  class="w-full px-4 py-3 pl-12 rounded-xl border-2 border-foreground bg-white text-foreground font-bold focus:outline-none focus:ring-0 focus:border-accent transition-all pop-shadow-sm" 
                  type="text" 
                />
                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-foreground font-extrabold pointer-events-none">{{ formData.icon || 'category' }}</span>
              </div>
            </div>

            <!-- Type Input -->
            <div class="space-y-2">
              <label class="text-xs font-extrabold uppercase tracking-widest text-foreground">Type</label>
              <div class="relative">
                <select v-model="formData.type" class="w-full px-4 py-3 pr-10 rounded-xl border-2 border-foreground bg-white text-foreground font-extrabold uppercase tracking-widest appearance-none focus:outline-none focus:ring-0 focus:border-accent transition-all pop-shadow-sm cursor-pointer">
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                  <option value="both">Both</option>
                </select>
                <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-foreground font-extrabold pointer-events-none">expand_more</span>
              </div>
            </div>
          </div>

          <!-- Color Picker -->
          <div class="space-y-3 pt-4">
            <label class="text-xs font-extrabold uppercase tracking-widest text-foreground">Theme Color</label>
            <div class="flex flex-wrap gap-4">
              <button 
                v-for="color in colorOptions" :key="color"
                type="button"
                @click="formData.color = color"
                :class="[
                  'w-8 h-8 rounded-full border-2 focus:outline-none transition-all',
                  formData.color === color ? 'border-foreground scale-125 pop-shadow-sm' : 'border-black/20 hover:scale-110 hover:border-foreground',
                  colorClasses[color] ? colorClasses[color].split(' ')[0] : 'bg-muted' 
                ]"
                :title="color"
              ></button>
            </div>
          </div>

          <div class="pt-8 flex gap-4">
            <PgButton 
              type="submit" 
              :disabled="isCreating || isUpdating"
              variant="primary"
              class="flex-1"
            >
              {{ isEditing ? (isUpdating ? 'Saving...' : 'Update') : (isCreating ? 'Adding...' : 'Add Category') }}
            </PgButton>
            <PgButton 
              v-if="isEditing" 
              type="button" 
              @click="resetForm"
              variant="ghost"
              class="w-auto"
            >
              Cancel
            </PgButton>
          </div>
        </form>
      </div>

      <!-- Categories List -->
      <div class="lg:col-span-2">
        <div class="flex justify-between items-center mb-8">
          <h3 class="font-extrabold text-xl tracking-tight text-foreground underline decoration-quaternary decoration-4 underline-offset-4">Active Categories</h3>
          <span class="text-xs font-extrabold uppercase tracking-widest text-foreground bg-white border-2 border-foreground px-3 py-1 rounded-full pop-shadow-sm">
            {{ displayCategories.length }} Total
          </span>
        </div>

        <div v-if="isLoading" class="space-y-4">
          <div v-for="i in 5" :key="i" class="h-20 bg-muted border-2 border-foreground rounded-xl animate-pulse"></div>
        </div>

        <div v-else-if="displayCategories.length === 0" class="text-center py-16 text-mutedForeground font-extrabold uppercase tracking-widest border-2 border-dashed border-foreground rounded-xl bg-muted/20">
          <span class="material-symbols-outlined text-6xl mb-4">category</span>
          <p>No categories found.</p>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar pb-8">
          <div 
            v-for="cat in displayCategories" 
            :key="cat.id"
            :class="[
              'group relative p-4 rounded-xl border-2 flex items-center gap-4 transition-all',
              currentEditId === cat.id 
                ? 'border-foreground bg-primary/10 pop-shadow-sm scale-[1.02]' 
                : 'border-foreground bg-white hover:bg-quaternary/10 shadow-solid-soft hover:shadow-solid hover:-translate-y-1 hover:-translate-x-1'
            ]"
          >
            <!-- Category Icon -->
            <div :class="['w-12 h-12 rounded-xl border-2 border-foreground pop-shadow-sm flex items-center justify-center shrink-0', colorClasses[cat.color] || 'bg-muted text-foreground']">
              <span class="material-symbols-outlined text-[24px]">{{ cat.icon }}</span>
            </div>

            <!-- Category Info -->
            <div class="flex-1 min-w-0 pr-16 text-left">
              <div class="flex items-center gap-2">
                <p class="text-base font-extrabold text-foreground truncate tracking-tight">{{ cat.name }}</p>
                <!-- Render tags -->
                <span v-if="cat.isDefault" class="px-2 py-0.5 rounded-md border-2 border-foreground bg-white text-foreground text-[9px] font-extrabold uppercase tracking-widest shrink-0" title="System Masterdata">System</span>
              </div>
              <p v-if="cat.description" class="text-xs font-bold text-mutedForeground truncate mt-1 tracking-wide">
                {{ cat.description }}
              </p>
            </div>

            <!-- Actions Menu (Show on Hover) -->
            <div class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
              <template v-if="canManage(cat)">
                <button 
                  @click="handleEdit(cat)"
                  class="w-10 h-10 rounded-lg flex items-center justify-center border-2 border-transparent hover:border-foreground bg-white hover:bg-accent text-mutedForeground hover:text-white transition-all pop-shadow-sm"
                  title="Edit Category"
                >
                  <span class="material-symbols-outlined text-[20px]">edit</span>
                </button>
                <button 
                  @click="handleDelete(cat.id)"
                  :disabled="isDeleting"
                  class="w-10 h-10 rounded-lg flex items-center justify-center border-2 border-transparent hover:border-foreground bg-white hover:bg-danger text-mutedForeground hover:text-white transition-all pop-shadow-sm disabled:opacity-50"
                  title="Delete Category"
                >
                  <span class="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </template>
              <template v-else>
                 <span class="material-symbols-outlined text-[20px] text-mutedForeground mr-2 font-extrabold" title="Viewing Mode Only">lock</span>
              </template>
            </div>

          </div>
        </div>

      </div>
    </div>
  </PgCard>
</template>

<style scoped>
/* Custom slim scrollbar for the categories list */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: var(--color-foreground);
  border-radius: 4px;
  border: 2px solid white;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-accent);
}
</style>
