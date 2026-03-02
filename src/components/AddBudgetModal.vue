<script setup>
import { ref, computed } from 'vue'
import { useBudgets } from '../composables/useBudgets.js'
import { useCategories } from '../composables/useCategories.js'

defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const { createBudgetAsync, isCreating } = useBudgets()
const { categories } = useCategories()

const expenseCategories = computed(() => {
  return (categories.value || []).filter(c => c.type === 'expense' || c.type === 'both')
})

const budgetAmount = ref('')
const selectedCategoryId = ref('')
const period = ref('monthly')

function resetForm() {
  budgetAmount.value = ''
  selectedCategoryId.value = ''
  period.value = 'monthly'
}

async function handleSubmit() {
  if (!budgetAmount.value || !selectedCategoryId.value) return
  
  try {
    await createBudgetAsync({
      categoryId: selectedCategoryId.value,
      amount: budgetAmount.value,
      period: period.value,
    })
    resetForm()
    emit('close')
  } catch (e) {
    console.error('Failed to create budget:', e)
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div 
        class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        @click="$emit('close')"
      ></div>
      
      <!-- Modal Content -->
      <div class="relative bg-surface-light dark:bg-surface-dark w-full max-w-md rounded-xl shadow-2xl border border-border-light dark:border-border-dark flex flex-col overflow-hidden animate-fade-in-up">
        
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-5 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark z-10">
          <h2 class="text-xl font-bold text-text-primary-light dark:text-white">Create New Budget</h2>
          <button 
            @click="$emit('close')" 
            class="text-text-secondary-light hover:text-text-primary-light dark:text-slate-400 dark:hover:text-white transition-colors rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span class="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>
        
        <!-- Body -->
        <div class="p-6 flex flex-col gap-6 max-h-[calc(100vh-160px)] overflow-y-auto bg-surface-light dark:bg-surface-dark">
          
          <!-- Amount -->
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-text-secondary-light dark:text-slate-400">Budget Amount</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-slate-500 text-2xl font-semibold">Rp</span>
              <input v-model="budgetAmount" class="w-full pl-14 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg text-3xl font-bold text-text-primary-light dark:text-white placeholder-slate-300 dark:placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="0" type="number"/>
            </div>
          </div>
          
          <!-- Category -->
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-text-secondary-light dark:text-slate-400">Category</label>
            <div class="relative">
              <select v-model="selectedCategoryId" class="w-full pl-10 pr-10 py-3 bg-surface-light dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg text-sm font-medium text-text-primary-light dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer">
                <option value="">Select a category</option>
                <option v-for="cat in expenseCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
              <div class="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-light pointer-events-none flex items-center">
                <span class="material-symbols-outlined text-[20px]">category</span>
              </div>
              <div class="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary-light pointer-events-none flex items-center">
                <span class="material-symbols-outlined text-[20px]">expand_more</span>
              </div>
            </div>
          </div>
          
          <!-- Time Period -->
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-text-secondary-light dark:text-slate-400">Time Period</label>
            <div class="grid grid-cols-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
              <button @click="period = 'monthly'" :class="['py-2 px-4 rounded-md text-sm font-semibold transition-all', period === 'monthly' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm border border-border-light dark:border-border-dark' : 'text-text-secondary-light dark:text-slate-400 hover:text-text-primary-light dark:hover:text-white']">Monthly</button>
              <button @click="period = 'weekly'" :class="['py-2 px-4 rounded-md text-sm font-medium transition-all', period === 'weekly' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm border border-border-light dark:border-border-dark' : 'text-text-secondary-light dark:text-slate-400 hover:text-text-primary-light dark:hover:text-white']">Weekly</button>
            </div>
          </div>
          
        </div>
        
        <!-- Footer -->
        <div class="px-6 py-5 bg-slate-50 dark:bg-slate-900/50 border-t border-border-light dark:border-border-dark flex justify-end gap-3 z-10">
          <button 
            @click="$emit('close')" 
            class="px-5 py-2.5 rounded-lg text-sm font-medium text-text-secondary-light dark:text-slate-400 hover:text-text-primary-light dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button @click="handleSubmit" :disabled="isCreating || !budgetAmount || !selectedCategoryId" class="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover shadow-sm shadow-primary/20 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            <span class="material-symbols-outlined text-[18px]" :class="isCreating ? 'animate-spin' : ''">{{ isCreating ? 'sync' : 'check' }}</span>
            {{ isCreating ? 'Saving...' : 'Save Budget' }}
          </button>
        </div>
        
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
