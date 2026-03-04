<script setup>
import { ref, computed, reactive, watch } from 'vue'
import AddTransactionModal from './AddTransactionModal.vue'
import { useTransactions, useExportTransactionsCsv } from '../composables/useTransactions.js'

const isTransactionModalOpen = ref(false)
const selectedTransaction = ref(null)

const filters = reactive({
  page: 1,
  limit: 7,
  category: '',
  status: '',
  startDate: '',
  endDate: '',
})

const periodFilter = ref('this_month')

watch(periodFilter, (val) => {
  const now = new Date()
  filters.page = 1
  if (val === 'this_month') {
    filters.startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    filters.endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
  } else if (val === 'last_month') {
    filters.startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
    filters.endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]
  } else if (val === 'last_3_months') {
    filters.startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().split('T')[0]
    filters.endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
  } else if (val === 'this_year') {
    filters.startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]
    filters.endDate = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0]
  }
}, { immediate: true })

const { transactions: txData, isLoading, deleteTransactionAsync } = useTransactions(filters)
const exportCsv = useExportTransactionsCsv()

const transactionList = computed(() => txData.value?.data || [])
const pagination = computed(() => txData.value?.pagination || { page: 1, total: 0, totalPages: 1 })

function goToPage(p) {
  filters.page = p
}

function openAddModal() {
  selectedTransaction.value = null
  isTransactionModalOpen.value = true
}

function openEditModal(tx) {
  selectedTransaction.value = tx
  isTransactionModalOpen.value = true
}

function closeTransactionModal() {
  isTransactionModalOpen.value = false
  setTimeout(() => { selectedTransaction.value = null }, 200)
}

async function handleDelete(id) {
  if (confirm('Are you sure you want to delete this transaction?')) {
    try {
      await deleteTransactionAsync(id)
    } catch (e) {
      console.error('Failed to delete transaction:', e)
    }
  }
}

function getCategoryIcon(tx) {
  return tx.category?.icon || 'receipt'
}

function getCategoryColor(tx) {
  const colorMap = {
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
    orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
    green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
    emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
    teal: { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-600 dark:text-teal-400' },
    pink: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-600 dark:text-pink-400' },
    red: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
  }
  return colorMap[tx.category?.color] || colorMap.blue
}

function formatAmount(tx) {
  const val = formatCurrency(tx.amount)
  return tx.type === 'income' ? `+${val}` : `-${val}`
}

function amountClass(tx) {
  return tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatCurrency(val) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(val) || 0)
}

function statusBadge(status) {
  if (status === 'completed') return { class: 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20', dot: 'bg-green-600 dark:bg-green-400', label: 'Completed' }
  if (status === 'pending') return { class: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20', dot: '', icon: 'sync', label: 'Pending Sync' }
  return { class: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20', dot: '', icon: 'sync', label: 'Syncing' }
}

async function handleExportCsv() {
  const csv = await exportCsv.mutateAsync(filters)
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'transactions.csv'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="flex-1 overflow-y-auto p-4 lg:p-8">
    <div class="mx-auto max-w-6xl space-y-6">
      
      <!-- Header Section -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Transaction History</h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">View and manage all your income and expenses.</p>
        </div>
        <div class="flex items-center gap-2">
          <button @click="handleExportCsv" class="inline-flex items-center justify-center gap-2 rounded-lg bg-surface-light px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-surface-dark dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800">
            <span class="material-symbols-outlined text-[20px]">file_download</span>
            <span class="hidden sm:inline">Export CSV</span>
          </button>
          <button @click="openAddModal" class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900">
            <span class="material-symbols-outlined text-[20px]">add</span>
            <span class="hidden sm:inline">Add Transaction</span>
          </button>
        </div>
      </div>
      
      <!-- Filters -->
      <div class="sticky top-0 z-10 -mx-4 bg-background-light/95 px-4 py-2 backdrop-blur dark:bg-background-dark/95 lg:-mx-8 lg:px-8">
        <div class="flex flex-wrap items-center gap-3">
          <div class="relative group">
            <select v-model="periodFilter" class="appearance-none cursor-pointer rounded-lg border-0 bg-white py-2 pl-4 pr-10 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-primary dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700">
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="last_3_months">Last 3 Months</option>
              <option value="this_year">This Year</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <span class="material-symbols-outlined text-[20px]">expand_more</span>
            </div>
          </div>
          
          <div class="relative group">
            <select v-model="filters.status" class="appearance-none cursor-pointer rounded-lg border-0 bg-white py-2 pl-4 pr-10 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-primary dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700">
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="syncing">Syncing</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <span class="material-symbols-outlined text-[20px]">expand_more</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Transactions List Card -->
      <div class="overflow-hidden rounded-xl border border-slate-200 bg-surface-light shadow-card dark:border-slate-800 dark:bg-surface-dark">
        <div class="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
          <!-- Table Header -->
          <div class="hidden grid-cols-12 gap-4 bg-slate-50 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800/50 dark:text-slate-400 lg:grid">
            <div class="col-span-2">Date</div>
            <div class="col-span-3">Description</div>
            <div class="col-span-2">Category</div>
            <div class="col-span-2">Status</div>
            <div class="col-span-2 text-right">Amount</div>
            <div class="col-span-1 text-center">Actions</div>
          </div>
          
          <!-- Loading -->
          <template v-if="isLoading">
            <div v-for="i in 5" :key="i" class="px-6 py-4 animate-pulse flex items-center gap-4">
              <div class="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div class="h-3 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
              <div class="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          </template>
          
          <!-- List Items -->
          <template v-else>
            <div v-for="tx in transactionList" :key="tx.id" class="group grid grid-cols-1 gap-4 px-6 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 lg:grid-cols-12 lg:items-center lg:py-3">
              <div class="flex items-center justify-between lg:col-span-2 lg:block">
                <span class="text-sm font-medium text-slate-900 dark:text-slate-200">{{ formatDate(tx.date) }}</span>
              </div>
              <div class="lg:col-span-3">
                <div class="flex items-center gap-3">
                  <div :class="['flex h-10 w-10 shrink-0 items-center justify-center rounded-full', getCategoryColor(tx).bg, getCategoryColor(tx).text]">
                    <span class="material-symbols-outlined">{{ getCategoryIcon(tx) }}</span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-slate-900 dark:text-white">{{ tx.description }}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400 lg:hidden">{{ tx.category?.name || 'Uncategorized' }}</p>
                  </div>
                </div>
              </div>
              <div class="hidden lg:col-span-2 lg:block">
                <span class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                  {{ tx.category?.name || 'Uncategorized' }}
                </span>
              </div>
              <div class="flex items-center justify-between lg:col-span-2 lg:justify-start">
                <span :class="['inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', statusBadge(tx.status).class]">
                  <span v-if="statusBadge(tx.status).dot" :class="['h-1.5 w-1.5 rounded-full', statusBadge(tx.status).dot]"></span>
                  <span v-if="statusBadge(tx.status).icon" :class="['material-symbols-outlined text-[14px]', tx.status === 'pending' ? 'animate-pulse' : '']">{{ statusBadge(tx.status).icon }}</span>
                  {{ statusBadge(tx.status).label }}
                </span>
              </div>
              <div class="flex items-center justify-between lg:col-span-2 lg:justify-end">
                <span class="lg:hidden text-sm text-slate-500">Amount</span>
                <span :class="['text-sm font-bold', amountClass(tx)]">{{ formatAmount(tx) }}</span>
              </div>
              <div class="flex items-center justify-end lg:col-span-1 lg:justify-center gap-2">
                <button @click="openEditModal(tx)" class="text-slate-400 hover:text-primary dark:text-slate-500 dark:hover:text-primary transition-colors" title="Edit">
                  <span class="material-symbols-outlined text-[20px]">edit</span>
                </button>
                <button @click="handleDelete(tx.id)" class="text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-500 transition-colors" title="Delete">
                  <span class="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            </div>
            
            <div v-if="transactionList.length === 0" class="px-6 py-12 text-center text-slate-500">
              <span class="material-symbols-outlined text-4xl mb-2">receipt_long</span>
              <p>No transactions found.</p>
            </div>
          </template>
        </div>
        
        <!-- Footer / Pagination -->
        <div v-if="pagination.total > 0" class="border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/50 sm:px-6">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-sm text-slate-700 dark:text-slate-300">
              Showing <span class="font-medium">{{ (pagination.page - 1) * filters.limit + 1 }}</span> to <span class="font-medium">{{ Math.min(pagination.page * filters.limit, pagination.total) }}</span> of <span class="font-medium">{{ pagination.total }}</span> results
            </p>
            <div class="flex items-center justify-center gap-2">
              <button @click="goToPage(pagination.page - 1)" :disabled="pagination.page <= 1" class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700">
                <span class="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <template v-for="p in pagination.totalPages" :key="p">
                <button v-if="p <= 3 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 1" @click="goToPage(p)" :class="p === pagination.page ? 'inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white' : 'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'">
                  {{ p }}
                </button>
                <span v-else-if="p === 4 || p === pagination.totalPages - 1" class="text-slate-500">...</span>
              </template>
              <button @click="goToPage(pagination.page + 1)" :disabled="pagination.page >= pagination.totalPages" class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700">
                <span class="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="h-8"></div>
    
    <AddTransactionModal 
      :isOpen="isTransactionModalOpen" 
      :initialData="selectedTransaction"
      @close="closeTransactionModal" 
    />
  </div>
</template>
