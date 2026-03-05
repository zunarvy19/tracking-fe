<script setup>
import { ref, computed } from 'vue'
import { useTransactions } from '../composables/useTransactions.js'
import { useCategories } from '../composables/useCategories.js'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  initialData: {
    type: Object,
    default: null
  }
})
const emit = defineEmits(['close'])

const { createTransactionAsync, updateTransactionAsync, isCreating, isUpdating } = useTransactions()
const { categories } = useCategories()

const isEditing = computed(() => !!props.initialData)
const isSaving = computed(() => isCreating.value || isUpdating.value)

const expenseCategories = computed(() => {
  return (categories.value || []).filter(c => c.type === 'expense' || c.type === 'both')
})
const incomeCategories = computed(() => {
  return (categories.value || []).filter(c => c.type === 'income' || c.type === 'both')
})

const transactionType = ref('expense')
const rawAmount = ref('')
const displayAmount = ref('')
const selectedCategoryId = ref('')
const notes = ref('')
const transactionDate = ref(new Date().toISOString().split('T')[0])

const availableCategories = computed(() => {
  return transactionType.value === 'income' ? incomeCategories.value : expenseCategories.value
})

function resetForm() {
  rawAmount.value = ''
  displayAmount.value = ''
  selectedCategoryId.value = ''
  notes.value = ''
  transactionDate.value = new Date().toISOString().split('T')[0]
  transactionType.value = 'expense'
}

import { watch } from 'vue'

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.initialData) {
      transactionType.value = props.initialData.type || 'expense'
      rawAmount.value = props.initialData.amount || ''
      displayAmount.value = formatNumber(rawAmount.value)
      selectedCategoryId.value = props.initialData.categoryId || props.initialData.category?.id || ''
      notes.value = props.initialData.notes || ''
      transactionDate.value = props.initialData.date ? new Date(props.initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    } else {
      resetForm()
    }
  }
})

function formatNumber(value) {
  if (!value) return ''
  return new Intl.NumberFormat('id-ID').format(value)
}

function handleAmountInput(e) {
  // Remove all non-digit characters (including manually typed dots)
  const cleanValue = e.target.value.replace(/\D/g, '')
  rawAmount.value = cleanValue
  displayAmount.value = formatNumber(cleanValue)
  // Sync back to input to handle manual dot/non-digit input
  e.target.value = displayAmount.value
}

async function handleSubmit() {
  if (!rawAmount.value || !selectedCategoryId.value) return
  
  try {
    const payload = {
      type: transactionType.value,
      amount: rawAmount.value,
      categoryId: selectedCategoryId.value,
      description: availableCategories.value.find(c => c.id === selectedCategoryId.value)?.name || 'Transaction',
      notes: notes.value,
      date: transactionDate.value,
    }

    if (isEditing.value) {
      await updateTransactionAsync({ id: props.initialData.id, data: payload })
    } else {
      await createTransactionAsync(payload)
    }
    resetForm()
    emit('close')
  } catch (e) {
    console.error('Failed to save transaction:', e)
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div 
        aria-hidden="true" 
        class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        @click="$emit('close')"
      ></div>
      
      <!-- Modal Container -->
      <div class="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]">
        
        <!-- Header -->
        <header class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-white dark:bg-slate-900 sticky top-0 z-10">
            <div class="flex items-center gap-3 text-slate-900 dark:text-white">
                <span class="material-symbols-outlined text-primary">account_balance_wallet</span>
                <h2 class="text-lg font-bold leading-tight">{{ isEditing ? 'Edit Transaction' : 'Add Transaction' }}</h2>
            </div>
            <button @click="$emit('close')" class="flex items-center justify-center size-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                <span class="material-symbols-outlined">close</span>
            </button>
        </header>
        
        <!-- Scrollable Content -->
        <div class="overflow-y-auto custom-scrollbar flex-1">
            <div class="p-6 space-y-6">
                <!-- Toggle -->
                <div class="flex justify-center">
                    <div class="inline-flex h-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 p-1 w-full max-w-sm">
                        <button 
                          @click="transactionType = 'income'" 
                          :class="['flex h-full grow items-center justify-center rounded-md px-4 transition-all font-medium text-sm', transactionType === 'income' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 dark:text-slate-400']"
                        >Income</button>
                        <button 
                          @click="transactionType = 'expense'" 
                          :class="['flex h-full grow items-center justify-center rounded-md px-4 transition-all font-medium text-sm', transactionType === 'expense' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 dark:text-slate-400']"
                        >Expense</button>
                    </div>
                </div>
                
                    <!-- Amount Input -->
                <div class="flex flex-col items-center gap-2">
                    <label class="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wide">Amount</label>
                    <div class="relative w-full max-w-sm">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span class="text-slate-400 text-3xl font-bold">Rp</span>
                        </div>
                        <input :value="displayAmount" @input="handleAmountInput" inputmode="numeric" class="block w-full pl-14 pr-4 py-4 text-center text-4xl font-bold text-slate-900 dark:text-white bg-transparent border-b-2 border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-0 placeholder-slate-200 dark:placeholder-slate-700 transition-colors" placeholder="0" type="text"/>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <!-- Category Selection -->
                    <div class="space-y-3">
                        <h3 class="text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wider">Category</h3>
                        <div class="space-y-2 max-h-[320px] overflow-y-auto pr-2">
                            <label v-for="cat in availableCategories" :key="cat.id" class="group flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all" :class="selectedCategoryId === cat.id ? 'border-primary bg-blue-50/50 dark:bg-blue-900/20' : ''">
                                <input v-model="selectedCategoryId" :value="cat.id" class="peer sr-only" name="category" type="radio"/>
                                <div :class="['flex size-10 items-center justify-center rounded-lg transition-colors', selectedCategoryId === cat.id ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300']">
                                    <span class="material-symbols-outlined">{{ cat.icon }}</span>
                                </div>
                                <div class="flex-1">
                                    <p class="text-slate-900 dark:text-white font-semibold text-sm">{{ cat.name }}</p>
                                    <p class="text-slate-500 dark:text-slate-400 text-xs">{{ cat.description }}</p>
                                </div>
                                <div :class="['size-5 rounded-full border-2 flex items-center justify-center', selectedCategoryId === cat.id ? 'border-primary bg-primary' : 'border-slate-300 dark:border-slate-600']">
                                    <span v-if="selectedCategoryId === cat.id" class="material-symbols-outlined text-white text-[14px]">check</span>
                                </div>
                            </label>
                        </div>
                    </div>
                    
                    <!-- Date & Notes -->
                    <div class="space-y-6">
                        <!-- Date Picker -->
                        <div class="space-y-3">
                            <h3 class="text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wider">Date</h3>
                            <input v-model="transactionDate" type="date" class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary"/>
                        </div>
                        
                        <!-- Notes Field -->
                        <div class="space-y-3">
                            <label class="text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wider" for="notes">Notes</label>
                            <div class="relative">
                                <textarea v-model="notes" class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary resize-none" id="notes" placeholder="Add a note..." rows="3"></textarea>
                                <span class="material-symbols-outlined absolute right-3 bottom-3 text-slate-400 text-[18px]">edit_note</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Footer / Action Button -->
        <footer class="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <button @click="handleSubmit" :disabled="isSaving || !rawAmount || !selectedCategoryId" class="w-full h-12 bg-primary hover:bg-blue-600 text-white font-bold rounded-lg shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed">
                <span class="material-symbols-outlined" :class="isSaving ? 'animate-spin' : 'group-hover:animate-pulse'">{{ isSaving ? 'sync' : 'check_circle' }}</span>
                {{ isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Save Transaction') }}
            </button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 20px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(107, 114, 128, 0.8);
}
</style>
