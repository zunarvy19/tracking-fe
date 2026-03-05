<script setup>
import { ref, computed } from 'vue'
import AddBudgetModal from './AddBudgetModal.vue'
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
  blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-primary', bar: 'bg-primary' },
  green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-success', bar: 'bg-emerald-500' },
  orange: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600', bar: 'bg-amber-500' },
  amber: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600', bar: 'bg-amber-500' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600', bar: 'bg-purple-500' },
  pink: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-500', bar: 'bg-pink-500' },
  teal: { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-600', bar: 'bg-teal-500' },
  red: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-500', bar: 'bg-red-500' },
  emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600', bar: 'bg-emerald-500' },
}

function getColor(c) { return colorMap[c] || colorMap.blue }
function barColor(b) {
  if (b.percentage >= 100) return 'bg-red-500'
  if (b.percentage >= 90) return 'bg-red-500'
  if (b.percentage >= 75) return 'bg-amber-500'
  return getColor(b.category?.color).bar
}

function formatCurrency(val) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(val) || 0)
}
</script>

<template>
  <div class="flex-1 overflow-y-auto p-4 md:p-8">
    <div class="max-w-6xl mx-auto flex flex-col gap-8 pb-10">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div class="flex flex-col gap-1">
          <h1 class="text-text-primary-light dark:text-white text-3xl md:text-4xl font-extrabold tracking-tight">Budget Management</h1>
          <p class="text-text-secondary-light dark:text-slate-400 text-base">Track your monthly spending limits</p>
        </div>
        <button @click="openCreateModal" class="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-blue-500/20 transition-all active:scale-95">
          <span class="material-symbols-outlined text-[20px]">add_circle</span>
          <span class="font-semibold text-sm">Add Budget</span>
        </button>
      </div>
      
      <!-- Progress Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <template v-if="summaryLoading">
          <div v-for="i in 3" :key="i" class="bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-soft border border-border-light dark:border-border-dark animate-pulse">
            <div class="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4"></div>
            <div class="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
            <div class="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </template>
        <template v-else>
          <div class="bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-soft border border-border-light dark:border-border-dark relative overflow-hidden">
            <div class="flex justify-between items-start mb-4">
              <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-primary">
                <span class="material-symbols-outlined text-[28px]">account_balance</span>
              </div>
              <span class="flex items-center gap-1 text-xs font-medium text-text-secondary-light dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">Monthly</span>
            </div>
            <div>
              <p class="text-text-secondary-light dark:text-slate-400 text-sm font-medium">Total Budgeted</p>
              <h3 class="text-3xl font-bold text-text-primary-light dark:text-white mt-1">{{ formatCurrency(summary?.totalBudgeted) }}</h3>
            </div>
          </div>
          
          <div class="bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-soft border border-border-light dark:border-border-dark relative overflow-hidden">
            <div class="flex justify-between items-start mb-4">
              <div class="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600">
                <span class="material-symbols-outlined text-[28px]">shopping_cart</span>
              </div>
              <span class="flex items-center gap-1 text-xs font-medium text-text-secondary-light bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">{{ summary?.percentageUsed || 0 }}% Used</span>
            </div>
            <div>
              <p class="text-text-secondary-light dark:text-slate-400 text-sm font-medium">Total Spent</p>
              <h3 class="text-3xl font-bold text-text-primary-light dark:text-white mt-1">{{ formatCurrency(summary?.totalSpent) }}</h3>
            </div>
          </div>
          
          <div class="bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-soft border border-border-light dark:border-border-dark relative overflow-hidden">
            <div class="flex justify-between items-start mb-4">
              <div class="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-success">
                <span class="material-symbols-outlined text-[28px]">savings</span>
              </div>
              <span class="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 px-2 py-1 rounded-full">
                {{ Number(summary?.remaining) >= 0 ? 'Safe' : 'Over' }}
              </span>
            </div>
            <div>
              <p class="text-text-secondary-light dark:text-slate-400 text-sm font-medium">Remaining Balance</p>
              <h3 class="text-3xl font-bold text-success mt-1">{{ formatCurrency(summary?.remaining) }}</h3>
            </div>
          </div>
        </template>
      </div>
      
      <!-- Budget Categories -->
      <div class="flex flex-col gap-6">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-text-primary-light dark:text-white">Budget Categories</h2>
        </div>
        
        <!-- Loading -->
        <template v-if="isLoading">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="i in 4" :key="i" class="bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-soft border border-border-light dark:border-border-dark animate-pulse">
              <div class="flex gap-3 mb-4">
                <div class="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                <div class="space-y-2">
                  <div class="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div class="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              </div>
              <div class="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            </div>
          </div>
        </template>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="b in budgetList" :key="b.id" class="bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-soft border border-border-light dark:border-border-dark hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start mb-4">
              <div class="flex items-center gap-3">
                <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', getColor(b.category?.color).bg, getColor(b.category?.color).text]">
                  <span class="material-symbols-outlined">{{ b.category?.icon || 'category' }}</span>
                </div>
                <div>
                  <h3 class="font-bold text-text-primary-light dark:text-white">{{ b.category?.name }}</h3>
                  <p class="text-xs text-text-secondary-light">{{ b.category?.description }}</p>
                </div>
              </div>
              <div class="relative">
                <button @click.prevent="toggleDropdown(b.id)" @blur="setTimeout(() => closeDropdowns(), 150)" class="text-text-secondary-light hover:text-primary transition-colors focus:outline-none">
                  <span class="material-symbols-outlined">more_vert</span>
                </button>
                <div v-show="activeDropdownId === b.id" class="absolute right-0 top-6 w-36 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-border-light dark:border-border-dark py-1 z-10">
                  <button @click="handleEdit(b)" class="w-full text-left px-4 py-2 text-sm text-text-primary-light dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                    <span class="material-symbols-outlined text-[16px]">edit</span>
                    Edit
                  </button>
                  <button @click="handleDelete(b.id)" class="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                    <span class="material-symbols-outlined text-[16px]">delete</span>
                    Delete
                  </button>
                </div>
              </div>
            </div>
            <div class="flex justify-between items-end mb-2">
              <span class="text-2xl font-bold text-text-primary-light dark:text-white">{{ formatCurrency(b.spent) }} <span class="text-sm font-normal text-text-secondary-light">/ {{ formatCurrency(b.amount) }}</span></span>
              <span :class="['text-sm font-bold', b.percentage >= 100 ? 'text-red-500' : b.percentage >= 75 ? 'text-amber-500' : getColor(b.category?.color).text]">{{ b.percentage }}%</span>
            </div>
            <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
              <div :class="[barColor(b), 'h-3 rounded-full transition-all']" :style="{ width: Math.min(b.percentage, 100) + '%' }"></div>
            </div>
            <div class="mt-3 flex justify-between text-xs text-text-secondary-light">
              <span :class="b.percentage >= 100 ? 'text-red-500 font-medium' : ''">
                {{ b.percentage >= 100 ? `Overspent: ${formatCurrency(Math.abs(Number(b.remaining)))}` : `Left: ${formatCurrency(b.remaining)}` }}
              </span>
              <span :class="b.percentage >= 100 ? 'text-red-500 font-bold' : ''">{{ b.statusLabel }}</span>
            </div>
          </div>
        </div>
        
        
        <button @click="openCreateModal" class="w-full border-2 border-dashed border-border-light dark:border-border-dark rounded-xl p-4 flex items-center justify-center gap-2 text-text-secondary-light hover:text-primary hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
          <span class="material-symbols-outlined group-hover:scale-110 transition-transform">add</span>
          <span class="font-medium">Create New Budget</span>
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
