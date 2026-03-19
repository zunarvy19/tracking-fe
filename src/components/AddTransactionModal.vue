<script setup>
import { ref, computed, watch } from 'vue'
import { useTransactions } from '../composables/useTransactions.js'
import { useCategories } from '../composables/useCategories.js'
import { useBudgets } from '../composables/useBudgets.js'
import PgCard from './ui/PgCard.vue'
import PgButton from './ui/PgButton.vue'

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
const { budgets } = useBudgets()

const isEditing = computed(() => !!props.initialData)
const isSaving = computed(() => isCreating.value || isUpdating.value)

const budgetCategoryIds = computed(() => {
  return new Set((budgets.value || []).map(b => b.category?.id))
})

const expenseCategories = computed(() => {
  return (categories.value || [])
    .filter(c => c.type === 'expense' || c.type === 'both')
    .filter(c => budgetCategoryIds.value.has(c.id))
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
  const cleanValue = e.target.value.replace(/\D/g, '')
  rawAmount.value = cleanValue
  displayAmount.value = formatNumber(cleanValue)
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
        class="fixed inset-0 bg-foreground/60 backdrop-blur-sm transition-opacity"
        @click="$emit('close')"
      ></div>
      
      <!-- Modal Container -->
      <div class="relative w-full max-w-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]">
        <PgCard class="flex flex-col h-full bg-white p-0 overflow-hidden w-full">
          
          <!-- Header -->
          <header class="flex items-center justify-between border-b-2 border-foreground px-6 py-4 bg-tertiary sticky top-0 z-10 shrink-0">
            <div class="flex items-center gap-3 text-foreground">
              <span class="material-symbols-outlined text-xl">account_balance_wallet</span>
              <h2 class="text-xl font-extrabold uppercase tracking-widest">{{ isEditing ? 'Edit Transaction' : 'Add Transaction' }}</h2>
            </div>
            <button @click="$emit('close')" class="flex items-center justify-center size-8 rounded-full hover:bg-white text-foreground transition-colors border-2 border-transparent hover:border-foreground pop-shadow-sm">
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
          </header>
          
          <!-- Scrollable Content -->
          <div class="overflow-y-auto custom-scrollbar flex-1 bg-white">
            <div class="p-6 space-y-8">
              <!-- Toggle -->
              <div class="flex justify-center">
                <div class="inline-flex h-12 items-center justify-center rounded-xl border-2 border-foreground bg-secondary/10 p-1 w-full max-w-sm pop-shadow-sm">
                  <button 
                    @click="transactionType = 'income'" 
                    :class="['flex h-full grow items-center justify-center rounded-lg px-4 transition-all font-extrabold uppercase tracking-widest text-sm border-2 border-transparent', transactionType === 'income' ? 'bg-quaternary border-foreground text-foreground pop-shadow-sm' : 'text-mutedForeground hover:text-foreground']"
                  >Income</button>
                  <button 
                    @click="transactionType = 'expense'" 
                    :class="['flex h-full grow items-center justify-center rounded-lg px-4 transition-all font-extrabold uppercase tracking-widest text-sm border-2 border-transparent', transactionType === 'expense' ? 'bg-accent border-foreground text-white pop-shadow-sm' : 'text-mutedForeground hover:text-foreground']"
                  >Expense</button>
                </div>
              </div>
              
              <!-- Amount Input -->
              <div class="flex flex-col items-center gap-2">
                <label class="text-foreground text-sm font-extrabold uppercase tracking-wider">Amount</label>
                <div class="relative w-full max-w-sm">
                  <div class="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                    <span class="text-foreground text-3xl font-extrabold">Rp</span>
                  </div>
                  <input :value="displayAmount" @input="handleAmountInput" inputmode="numeric" class="block w-full pl-14 pr-4 py-4 text-center text-5xl font-extrabold text-foreground bg-transparent border-b-4 border-foreground focus:border-accent focus:ring-0 placeholder-muted transition-colors tracking-tighter" placeholder="0" type="text"/>
                </div>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- Category Selection -->
                <div class="space-y-4">
                  <h3 class="text-foreground text-sm font-extrabold uppercase tracking-wider">Category</h3>
                  <div class="space-y-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                    <label v-for="cat in availableCategories" :key="cat.id" class="group flex items-center gap-3 p-3 rounded-xl border-2 border-foreground cursor-pointer hover:bg-secondary/10 transition-all pop-shadow-sm" :class="selectedCategoryId === cat.id ? 'bg-quaternary' : 'bg-white'">
                      <input v-model="selectedCategoryId" :value="cat.id" class="peer sr-only" name="category" type="radio"/>
                      <div :class="['flex size-10 items-center justify-center rounded-full border-2 border-foreground transition-colors shrink-0', selectedCategoryId === cat.id ? 'bg-accent text-white' : 'bg-muted text-foreground']">
                        <span class="material-symbols-outlined">{{ cat.icon }}</span>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-foreground font-extrabold text-sm truncate">{{ cat.name }}</p>
                        <p class="text-mutedForeground font-bold text-xs truncate">{{ cat.description }}</p>
                      </div>
                      <div :class="['size-6 rounded-full border-2 flex items-center justify-center shrink-0', selectedCategoryId === cat.id ? 'border-foreground bg-accent' : 'border-foreground bg-white']">
                        <span v-if="selectedCategoryId === cat.id" class="material-symbols-outlined text-white text-[16px]">check</span>
                      </div>
                    </label>
                  </div>
                </div>
                
                <!-- Date & Notes -->
                <div class="space-y-6">
                  <!-- Date Picker -->
                  <div class="space-y-3">
                    <h3 class="text-foreground text-sm font-extrabold uppercase tracking-wider">Date</h3>
                    <input v-model="transactionDate" type="date" class="w-full rounded-xl border-2 border-foreground bg-white px-4 py-3 text-sm font-bold text-foreground focus:border-accent focus:ring-0 pop-shadow-sm"/>
                  </div>
                  
                  <!-- Notes Field -->
                  <div class="space-y-3">
                    <label class="text-foreground text-sm font-extrabold uppercase tracking-wider" for="notes">Notes</label>
                    <div class="relative">
                      <textarea v-model="notes" class="w-full rounded-xl border-2 border-foreground bg-white px-4 py-3 text-sm font-bold text-foreground placeholder-mutedForeground focus:border-accent focus:ring-0 resize-none pop-shadow-sm" id="notes" placeholder="Add a note..." rows="4"></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Footer / Action Button -->
          <footer class="p-6 border-t-2 border-foreground bg-white shrink-0">
            <PgButton @click="handleSubmit" :disabled="isSaving || !rawAmount || !selectedCategoryId" class="w-full justify-center">
              <span v-if="isSaving" class="material-symbols-outlined animate-spin mr-2">sync</span>
              <span v-else class="material-symbols-outlined mr-2">check_circle</span>
              {{ isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Save Transaction') }}
            </PgButton>
          </footer>

        </PgCard>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
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
