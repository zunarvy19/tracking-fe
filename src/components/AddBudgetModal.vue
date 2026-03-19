<script setup>
import { ref, computed, watch } from 'vue'
import { useBudgets } from '../composables/useBudgets.js'
import { useCategories } from '../composables/useCategories.js'
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

const { createBudgetAsync, updateBudgetAsync, isCreating, isUpdating } = useBudgets()
const { categories } = useCategories()

const isSaving = computed(() => isCreating.value || isUpdating.value)
const isEditing = computed(() => !!props.initialData)

const expenseCategories = computed(() => {
  return (categories.value || []).filter(c => c.type === 'expense' || c.type === 'both')
})

const rawAmount = ref('')
const displayAmount = ref('')
const selectedCategoryId = ref('')
const period = ref('monthly')

function resetForm() {
  rawAmount.value = ''
  displayAmount.value = ''
  selectedCategoryId.value = ''
  period.value = 'monthly'
}

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.initialData) {
      rawAmount.value = props.initialData.amount || ''
      displayAmount.value = formatNumber(rawAmount.value)
      selectedCategoryId.value = props.initialData.categoryId || props.initialData.category?.id || ''
      period.value = props.initialData.period || 'monthly'
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
      categoryId: selectedCategoryId.value,
      amount: rawAmount.value,
      period: period.value,
    }

    if (isEditing.value) {
      await updateBudgetAsync({ id: props.initialData.id, data: payload })
    } else {
      await createBudgetAsync(payload)
    }
    resetForm()
    emit('close')
  } catch (e) {
    console.error('Failed to save budget:', e)
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div 
        class="absolute inset-0 bg-foreground/60 backdrop-blur-sm transition-opacity" 
        @click="$emit('close')"
      ></div>
      
      <!-- Modal Content -->
      <PgCard class="relative bg-white w-full max-w-md p-0 flex flex-col overflow-hidden animate-fade-in-up">
        
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-5 border-b-2 border-foreground bg-tertiary z-10">
          <h2 class="text-xl font-extrabold text-foreground uppercase tracking-widest">{{ isEditing ? 'Edit Budget' : 'Add Budget' }}</h2>
          <button 
            @click="$emit('close')" 
            class="text-foreground hover:bg-white transition-colors rounded-full p-1 border-2 border-transparent hover:border-foreground pop-shadow-sm flex items-center justify-center size-8"
          >
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        
        <!-- Body -->
        <div class="p-6 flex flex-col gap-8 max-h-[calc(100vh-160px)] overflow-y-auto custom-scrollbar bg-white">
          
          <!-- Amount -->
          <div class="flex flex-col items-center gap-2">
            <label class="text-xs font-extrabold uppercase tracking-widest text-mutedForeground">Budget Amount</label>
            <div class="relative w-full max-w-xs mt-2">
              <div class="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                <span class="text-foreground text-3xl font-extrabold">Rp</span>
              </div>
              <input :value="displayAmount" @input="handleAmountInput" inputmode="numeric" class="block w-full pl-14 pr-4 py-3 text-center text-4xl font-extrabold text-foreground bg-transparent border-b-4 border-foreground focus:border-accent focus:ring-0 placeholder-muted transition-colors tracking-tighter" placeholder="0" type="text"/>
            </div>
          </div>
          
          <!-- Category -->
          <div class="flex flex-col gap-3">
            <label class="text-xs font-extrabold uppercase tracking-widest text-foreground">Category</label>
            <div class="space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
              <label v-for="cat in expenseCategories" :key="cat.id" class="group flex items-center gap-3 p-3 rounded-xl border-2 border-foreground cursor-pointer hover:bg-secondary/10 transition-all pop-shadow-sm" :class="selectedCategoryId === cat.id ? 'bg-quaternary' : 'bg-white'">
                <input v-model="selectedCategoryId" :value="cat.id" class="peer sr-only" name="category" type="radio"/>
                <div :class="['flex size-10 items-center justify-center rounded-full border-2 border-foreground transition-colors shrink-0', selectedCategoryId === cat.id ? 'bg-accent text-white' : 'bg-muted text-foreground']">
                  <span class="material-symbols-outlined">{{ cat.icon }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-foreground font-extrabold text-sm truncate">{{ cat.name }}</p>
                </div>
                <div :class="['size-6 rounded-full border-2 flex items-center justify-center shrink-0', selectedCategoryId === cat.id ? 'border-foreground bg-accent' : 'border-foreground bg-white']">
                  <span v-if="selectedCategoryId === cat.id" class="material-symbols-outlined text-white text-[16px]">check</span>
                </div>
              </label>
            </div>
            <!-- If no categories matching expense/both available, alert the user -->
            <div v-if="expenseCategories.length === 0" class="text-center p-4 border-2 border-foreground rounded-xl bg-muted">
              <p class="text-sm font-bold text-mutedForeground">No expense categories found.</p>
            </div>
          </div>
          
          <!-- Time Period -->
          <div class="flex flex-col gap-2">
            <label class="text-xs font-extrabold uppercase tracking-widest text-foreground text-center">Time Period</label>
            <div class="flex justify-center mt-2">
              <div class="inline-flex h-12 items-center justify-center rounded-xl border-2 border-foreground bg-secondary/10 p-1 w-full max-w-xs pop-shadow-sm">
                <button 
                  @click="period = 'monthly'" 
                  :class="['flex h-full grow items-center justify-center rounded-lg px-4 transition-all font-extrabold uppercase tracking-widest text-xs border-2 border-transparent', period === 'monthly' ? 'bg-accent border-foreground text-white pop-shadow-sm' : 'text-mutedForeground hover:text-foreground']"
                >Monthly</button>
                <button 
                  @click="period = 'weekly'" 
                  :class="['flex h-full grow items-center justify-center rounded-lg px-4 transition-all font-extrabold uppercase tracking-widest text-xs border-2 border-transparent', period === 'weekly' ? 'bg-accent border-foreground text-white pop-shadow-sm' : 'text-mutedForeground hover:text-foreground']"
                >Weekly</button>
              </div>
            </div>
          </div>
          
        </div>
        
        <!-- Footer -->
        <div class="px-6 py-5 bg-white border-t-2 border-foreground flex justify-end gap-4 z-10 shrink-0">
          <PgButton variant="ghost" @click="$emit('close')">Cancel</PgButton>
          <PgButton @click="handleSubmit" :disabled="isSaving || !rawAmount || !selectedCategoryId" class="flex-1 justify-center">
            <span v-if="isSaving" class="material-symbols-outlined animate-spin mr-2">sync</span>
            <span v-else class="material-symbols-outlined mr-2">check_circle</span>
            {{ isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Save Budget') }}
          </PgButton>
        </div>
        
      </PgCard>
    </div>
  </Teleport>
</template>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

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
