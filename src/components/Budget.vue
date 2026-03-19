<script setup>
import { ref, computed } from 'vue'
import AddBudgetModal from './AddBudgetModal.vue'
import PgButton from './ui/PgButton.vue'
import PgCard from './ui/PgCard.vue'
import { useBudgets, useBudgetSummary } from '../composables/useBudgets.js'

const isBudgetModalOpen = ref(false)
const editingBudget = ref(null)

const { budgets, isLoading, deleteBudget } = useBudgets()
const { data: summary, isLoading: summaryLoading } = useBudgetSummary()

const budgetList = computed(() => budgets.value || [])
const activeDropdownId = ref(null)

function toggleDropdown(id) {
  activeDropdownId.value = activeDropdownId.value === id ? null : id
}

function closeDropdowns() {
  activeDropdownId.value = null
}

function handleEdit(budget) {
  editingBudget.value = budget
  isBudgetModalOpen.value = true
  closeDropdowns()
}

function handleDelete(id) {
  if (confirm('Are you sure you want to remove this budget?')) {
    deleteBudget(id)
  }
  closeDropdowns()
}

function openCreateModal() {
  editingBudget.value = null
  isBudgetModalOpen.value = true
}

const colorMap = {
  blue: { bg: 'bg-accent/20', text: 'text-accent', bar: 'bg-accent' },
  green: { bg: 'bg-quaternary/20', text: 'text-foreground', bar: 'bg-quaternary' },
  orange: { bg: 'bg-secondary/20', text: 'text-secondary', bar: 'bg-secondary' },
  amber: { bg: 'bg-secondary/20', text: 'text-secondary', bar: 'bg-secondary' },
  purple: { bg: 'bg-tertiary/20', text: 'text-foreground', bar: 'bg-tertiary' },
  pink: { bg: 'bg-accent/20', text: 'text-accent', bar: 'bg-accent' },
  teal: { bg: 'bg-quaternary/20', text: 'text-foreground', bar: 'bg-quaternary' },
  red: { bg: 'bg-danger/20', text: 'text-danger', bar: 'bg-danger' },
  emerald: { bg: 'bg-quaternary/20', text: 'text-foreground', bar: 'bg-quaternary' },
}

function getColor(c) { return colorMap[c] || colorMap.blue }
function barColor(b) {
  if (b.percentage >= 100) return 'bg-danger'
  if (b.percentage >= 90) return 'bg-danger'
  if (b.percentage >= 75) return 'bg-secondary'
  return getColor(b.category?.color).bar
}

function formatCurrency(val) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(val) || 0)
}
</script>

<template>
  <div class="flex-1 overflow-y-auto p-4 md:p-8">
    <div class="max-w-6xl mx-auto flex flex-col gap-10 pb-10">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div class="flex flex-col gap-2">
          <h1 class="text-4xl font-extrabold tracking-tight text-foreground underline decoration-tertiary decoration-4 underline-offset-4">Budget Management</h1>
          <p class="text-mutedForeground font-bold tracking-wide mt-2">Track your monthly spending limits</p>
        </div>
        <PgButton @click="openCreateModal" class="flex items-center gap-2">
          <span class="material-symbols-outlined text-xl">add_circle</span>
          Add Budget
        </PgButton>
      </div>
      
      <!-- Progress Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <template v-if="summaryLoading">
          <div v-for="i in 3" :key="i" class="bg-white rounded-xl p-6 border-2 border-foreground animate-pulse shadow-solid-soft">
            <div class="h-10 w-10 bg-muted rounded-full mb-4 border-2 border-foreground"></div>
            <div class="h-4 w-24 bg-muted rounded mb-2"></div>
            <div class="h-8 w-32 bg-muted rounded"></div>
          </div>
        </template>
        <template v-else>
          <PgCard hoverEffect class="p-6 bg-white relative overflow-hidden">
            <div class="flex justify-between items-start mb-4">
              <div class="p-2 border-2 border-foreground rounded-full bg-accent pop-shadow-sm text-white">
                <span class="material-symbols-outlined text-[28px]">account_balance</span>
              </div>
              <span class="flex items-center gap-1 text-xs font-bold text-foreground bg-tertiary border-2 border-foreground px-3 py-1 rounded-full uppercase tracking-widest pop-shadow-sm">Monthly</span>
            </div>
            <div>
              <p class="text-mutedForeground font-extrabold text-xs uppercase tracking-widest mt-4">Total Budgeted</p>
              <h3 class="text-3xl font-extrabold text-foreground tracking-tight mt-1">{{ formatCurrency(summary?.totalBudgeted) }}</h3>
            </div>
          </PgCard>
          
          <PgCard hoverEffect class="p-6 bg-white relative overflow-hidden">
            <div class="flex justify-between items-start mb-4">
              <div class="p-2 border-2 border-foreground rounded-full bg-secondary pop-shadow-sm text-white">
                <span class="material-symbols-outlined text-[28px]">shopping_cart</span>
              </div>
              <span class="flex items-center gap-1 text-xs font-bold text-foreground bg-quaternary border-2 border-foreground px-3 py-1 rounded-full uppercase tracking-widest pop-shadow-sm">{{ summary?.percentageUsed || 0 }}% Used</span>
            </div>
            <div>
              <p class="text-mutedForeground font-extrabold text-xs uppercase tracking-widest mt-4">Total Spent</p>
              <h3 class="text-3xl font-extrabold text-foreground tracking-tight mt-1">{{ formatCurrency(summary?.totalSpent) }}</h3>
            </div>
          </PgCard>
          
          <PgCard hoverEffect class="p-6 bg-white relative overflow-hidden">
            <div class="flex justify-between items-start mb-4">
              <div class="p-2 border-2 border-foreground rounded-full bg-quaternary pop-shadow-sm text-foreground">
                <span class="material-symbols-outlined text-[28px]">savings</span>
              </div>
              <span class="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest pop-shadow-sm border-2 border-foreground" :class="Number(summary?.remaining) >= 0 ? 'bg-secondary text-white' : 'bg-danger text-white'">
                {{ Number(summary?.remaining) >= 0 ? 'Safe' : 'Over' }}
              </span>
            </div>
            <div>
              <p class="text-mutedForeground font-extrabold text-xs uppercase tracking-widest mt-4">Remaining Balance</p>
              <h3 class="text-3xl font-extrabold mt-1 tracking-tight" :class="Number(summary?.remaining) >= 0 ? 'text-secondary' : 'text-danger'">{{ formatCurrency(summary?.remaining) }}</h3>
            </div>
          </PgCard>
        </template>
      </div>
      
      <!-- Budget Categories -->
      <div class="flex flex-col gap-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-extrabold tracking-tight text-foreground uppercase">Budget Categories</h2>
        </div>
        
        <!-- Loading -->
        <template v-if="isLoading">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="i in 4" :key="i" class="bg-white border-2 border-foreground rounded-xl p-6 shadow-solid-soft animate-pulse">
              <div class="flex gap-3 mb-4">
                <div class="w-10 h-10 bg-muted rounded-full border-2 border-foreground"></div>
                <div class="space-y-2">
                  <div class="h-4 w-24 bg-muted rounded"></div>
                  <div class="h-3 w-32 bg-muted rounded"></div>
                </div>
              </div>
              <div class="h-4 w-full bg-muted border-2 border-foreground rounded-full"></div>
            </div>
          </div>
        </template>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PgCard v-for="b in budgetList" :key="b.id" hoverEffect class="p-6 bg-white flex flex-col justify-between">
            <div class="flex justify-between items-start mb-6">
              <div class="flex items-center gap-4">
                <div :class="['w-12 h-12 rounded-full border-2 border-foreground flex items-center justify-center pop-shadow-sm', getColor(b.category?.color).bg, getColor(b.category?.color).text]">
                  <span class="material-symbols-outlined text-2xl">{{ b.category?.icon || 'category' }}</span>
                </div>
                <div>
                  <h3 class="font-extrabold text-foreground tracking-tight text-lg">{{ b.category?.name }}</h3>
                  <p class="text-xs font-bold text-mutedForeground">{{ b.category?.description }}</p>
                </div>
              </div>
              <div class="relative">
                <button @click.prevent="toggleDropdown(b.id)" @blur="setTimeout(() => closeDropdowns(), 150)" class="text-mutedForeground hover:text-foreground hover:bg-muted p-1 rounded-full transition-colors border-2 border-transparent hover:border-foreground focus:outline-none">
                  <span class="material-symbols-outlined">more_vert</span>
                </button>
                <div v-show="activeDropdownId === b.id" class="absolute right-0 top-10 w-40 bg-white border-2 border-foreground rounded-xl pop-shadow py-2 z-10 font-bold">
                  <button @click="handleEdit(b)" class="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-tertiary flex items-center gap-3 transition-colors">
                    <span class="material-symbols-outlined text-[18px]">edit</span>
                    Edit
                  </button>
                  <button @click="handleDelete(b.id)" class="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10 flex items-center gap-3 transition-colors">
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                    Delete
                  </button>
                </div>
              </div>
            </div>
            
            <div class="flex justify-between items-end mb-3">
              <span class="text-2xl font-extrabold text-foreground tracking-tight">{{ formatCurrency(b.spent) }} <span class="text-sm font-bold text-mutedForeground tracking-normal">/ {{ formatCurrency(b.amount) }}</span></span>
              <span :class="['text-sm font-extrabold rounded-full px-2 py-0.5 border-2 border-foreground pop-shadow-sm', b.percentage >= 100 ? 'bg-danger text-white' : b.percentage >= 75 ? 'bg-secondary text-white' : 'bg-primary text-white']">{{ b.percentage }}%</span>
            </div>
            
            <div class="w-full bg-white border-2 border-foreground rounded-full h-4 overflow-hidden pop-shadow-sm p-0.5">
              <div :class="[barColor(b), 'h-full rounded-full transition-all border-r-2 border-foreground']" :style="{ width: Math.min(b.percentage, 100) + '%' }"></div>
            </div>
            
            <div class="mt-4 flex justify-between text-xs font-bold text-mutedForeground">
              <span :class="b.percentage >= 100 ? 'text-danger font-extrabold uppercase' : 'uppercase'">
                <span v-if="b.percentage > 100">Overspent: {{ formatCurrency(Math.abs(Number(b.remaining))) }}</span>
                <span v-else-if="b.percentage === 100">No more budget left</span>
                <span v-else>Left: {{ formatCurrency(b.remaining) }}</span>
              </span>
              <span :class="b.percentage >= 100 ? 'text-danger font-extrabold uppercase' : 'uppercase'">{{ b.statusLabel }}</span>
            </div>
          </PgCard>
        </div>
        
        <button @click="openCreateModal" class="w-full border-4 border-dashed border-foreground rounded-2xl p-6 flex items-center justify-center gap-3 text-mutedForeground hover:text-foreground hover:border-accent hover:bg-accent/10 hover:shadow-solid-soft transition-all group font-extrabold tracking-widest uppercase">
          <span class="material-symbols-outlined group-hover:scale-125 transition-transform">add</span>
          <span>Create New Budget</span>
        </button>
      </div>
    </div>
    
    <AddBudgetModal 
      :isOpen="isBudgetModalOpen" 
      :initialData="editingBudget"
      @close="isBudgetModalOpen = false" 
    />
  </div>
</template>
