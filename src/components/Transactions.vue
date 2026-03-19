<script setup>
import { ref, computed, reactive, watch } from 'vue'
import AddTransactionModal from './AddTransactionModal.vue'
import { useTransactions, useExportTransactionsCsv } from '../composables/useTransactions.js'
import PgButton from './ui/PgButton.vue'
import PgCard from './ui/PgCard.vue'

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
    blue: { bg: 'bg-accent', text: 'text-white' },
    orange: { bg: 'bg-secondary', text: 'text-white' },
    green: { bg: 'bg-quaternary', text: 'text-foreground' },
    emerald: { bg: 'bg-quaternary', text: 'text-foreground' },
    purple: { bg: 'bg-tertiary', text: 'text-foreground' },
    teal: { bg: 'bg-quaternary', text: 'text-foreground' },
    pink: { bg: 'bg-accent', text: 'text-white' },
    red: { bg: 'bg-danger', text: 'text-white' },
  }
  return colorMap[tx.category?.color] || colorMap.blue
}

function formatAmount(tx) {
  const val = formatCurrency(tx.amount)
  return tx.type === 'income' ? `+${val}` : `-${val}`
}

function amountClass(tx) {
  return tx.type === 'income' ? 'text-secondary' : 'text-foreground'
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatCurrency(val) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(val) || 0)
}

function statusBadge(status) {
  if (status === 'completed') return { class: 'bg-quaternary text-foreground border-2 border-foreground', dot: 'bg-foreground', label: 'Completed' }
  if (status === 'pending') return { class: 'bg-secondary text-white border-2 border-foreground', dot: '', icon: 'sync', label: 'Pending Sync' }
  return { class: 'bg-accent text-white border-2 border-foreground', dot: '', icon: 'sync', label: 'Syncing' }
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
    <div class="mx-auto max-w-6xl space-y-8 pb-10">
      
      <!-- Header Section -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 class="text-4xl font-extrabold tracking-tight text-foreground underline decoration-tertiary decoration-4 underline-offset-4">Transaction History</h2>
          <p class="mt-2 text-mutedForeground font-bold tracking-wide">View and manage all your income and expenses.</p>
        </div>
        <div class="flex items-center gap-4">
          <PgButton variant="secondary" @click="handleExportCsv" class="gap-2">
            <span class="material-symbols-outlined text-xl">file_download</span>
            <span class="hidden sm:inline">Export CSV</span>
          </PgButton>
          <PgButton @click="openAddModal" class="gap-2">
            <span class="material-symbols-outlined text-xl">add_circle</span>
            <span class="hidden sm:inline">Add Transaction</span>
          </PgButton>
        </div>
      </div>
      
      <!-- Filters -->
      <div class="sticky top-0 z-10 -mx-4 bg-background/95 px-4 py-4 backdrop-blur lg:-mx-8 lg:px-8 border-b-2 border-foreground mb-4">
        <div class="flex flex-wrap items-center gap-4">
          <div class="relative group">
            <select v-model="periodFilter" class="appearance-none cursor-pointer rounded-xl border-2 border-foreground bg-white py-2 pl-4 pr-10 text-sm font-extrabold uppercase tracking-widest text-foreground pop-shadow-sm focus:outline-none focus:ring-0 focus:border-accent transition-colors">
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="last_3_months">Last 3 Months</option>
              <option value="this_year">This Year</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-foreground">
              <span class="material-symbols-outlined text-[20px]">expand_more</span>
            </div>
          </div>
          
          <div class="relative group">
            <select v-model="filters.status" class="appearance-none cursor-pointer rounded-xl border-2 border-foreground bg-white py-2 pl-4 pr-10 text-sm font-extrabold uppercase tracking-widest text-foreground pop-shadow-sm focus:outline-none focus:ring-0 focus:border-accent transition-colors">
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="syncing">Syncing</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-foreground">
              <span class="material-symbols-outlined text-[20px]">expand_more</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Transactions List Card -->
      <PgCard class="p-0 overflow-hidden bg-white">
        <div class="min-w-full divide-y-2 divide-foreground">
          <!-- Table Header -->
          <div class="hidden grid-cols-12 gap-4 bg-tertiary px-6 py-4 text-xs font-extrabold uppercase tracking-widest text-foreground lg:grid">
            <div class="col-span-2">Date</div>
            <div class="col-span-3">Description</div>
            <div class="col-span-2">Category</div>
            <div class="col-span-2">Status</div>
            <div class="col-span-2 text-right">Amount</div>
            <div class="col-span-1 text-center">Actions</div>
          </div>
          
          <!-- Loading -->
          <template v-if="isLoading">
            <div v-for="i in 5" :key="i" class="px-6 py-6 animate-pulse flex items-center gap-4 border-b-2 border-foreground">
              <div class="h-10 w-10 rounded-full border-2 border-foreground bg-muted"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 w-32 bg-muted rounded border-2 border-foreground"></div>
                <div class="h-3 w-48 bg-muted rounded border-2 border-foreground"></div>
              </div>
              <div class="h-4 w-20 bg-muted rounded border-2 border-foreground"></div>
            </div>
          </template>
          
          <!-- List Items -->
          <template v-else>
            <div v-for="tx in transactionList" :key="tx.id" class="group grid grid-cols-1 gap-4 px-6 py-6 transition-colors hover:bg-secondary/5 lg:grid-cols-12 lg:items-center">
              <div class="flex items-center justify-between lg:col-span-2 lg:block">
                <span class="text-sm font-extrabold text-foreground tracking-wide">{{ formatDate(tx.date) }}</span>
              </div>
              <div class="lg:col-span-3">
                <div class="flex items-center gap-4">
                  <div :class="['flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-foreground pop-shadow-sm', getCategoryColor(tx).bg, getCategoryColor(tx).text]">
                    <span class="material-symbols-outlined text-[24px]">{{ getCategoryIcon(tx) }}</span>
                  </div>
                  <div>
                    <p class="text-base font-extrabold text-foreground tracking-tight">{{ tx.description }}</p>
                    <p class="text-xs font-bold text-mutedForeground lg:hidden tracking-wider uppercase mt-1">{{ tx.category?.name || 'Uncategorized' }}</p>
                  </div>
                </div>
              </div>
              <div class="hidden lg:col-span-2 lg:block">
                <span class="inline-flex items-center rounded-full bg-white border-2 border-foreground px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-foreground pop-shadow-sm">
                  {{ tx.category?.name || 'Uncategorized' }}
                </span>
              </div>
              <div class="flex items-center justify-between lg:col-span-2 lg:justify-start">
                <span :class="['inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-widest pop-shadow-sm', statusBadge(tx.status).class]">
                  <span v-if="statusBadge(tx.status).dot" :class="['h-2 w-2 rounded-full', statusBadge(tx.status).dot]"></span>
                  <span v-if="statusBadge(tx.status).icon" :class="['material-symbols-outlined text-[14px]', tx.status === 'pending' ? 'animate-pulse' : '']">{{ statusBadge(tx.status).icon }}</span>
                  {{ statusBadge(tx.status).label }}
                </span>
              </div>
              <div class="flex items-center justify-between lg:col-span-2 lg:justify-end">
                <span class="lg:hidden text-xs font-extrabold uppercase tracking-widest text-mutedForeground">Amount</span>
                <span :class="['text-lg font-extrabold tracking-tight', amountClass(tx)]">{{ formatAmount(tx) }}</span>
              </div>
              <div class="flex items-center justify-end lg:col-span-1 lg:justify-center gap-3">
                <button @click="openEditModal(tx)" class="text-mutedForeground hover:text-foreground transition-transform hover:scale-110 focus:outline-none" title="Edit">
                  <span class="material-symbols-outlined text-[24px]">edit_square</span>
                </button>
                <button @click="handleDelete(tx.id)" class="text-mutedForeground hover:text-danger transition-transform hover:scale-110 focus:outline-none" title="Delete">
                  <span class="material-symbols-outlined text-[24px]">delete</span>
                </button>
              </div>
            </div>
            
            <div v-if="transactionList.length === 0" class="px-6 py-16 text-center text-mutedForeground">
              <span class="material-symbols-outlined text-5xl mb-4">receipt_long</span>
              <p class="font-extrabold tracking-wider uppercase">No transactions found.</p>
            </div>
          </template>
        </div>
        
        <!-- Footer / Pagination -->
        <div v-if="pagination.total > 0" class="border-t-2 border-foreground bg-quaternary/30 px-6 py-4">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-sm font-bold text-foreground">
              Showing <span class="font-extrabold">{{ (pagination.page - 1) * filters.limit + 1 }}</span> to <span class="font-extrabold">{{ Math.min(pagination.page * filters.limit, pagination.total) }}</span> of <span class="font-extrabold">{{ pagination.total }}</span> results
            </p>
            <div class="flex items-center justify-center gap-2">
              <button @click="goToPage(pagination.page - 1)" :disabled="pagination.page <= 1" class="inline-flex h-10 w-10 items-center justify-center rounded-lg border-2 border-foreground bg-white text-foreground hover:bg-secondary/10 disabled:opacity-50 transition-colors pop-shadow-sm focus:outline-none active:translate-y-px active:shadow-none">
                <span class="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <template v-for="p in pagination.totalPages" :key="p">
                <button v-if="p <= 3 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 1" @click="goToPage(p)" :class="p === pagination.page ? 'inline-flex h-10 w-10 items-center justify-center rounded-lg border-2 border-foreground bg-accent text-white font-extrabold pop-shadow-sm' : 'inline-flex h-10 w-10 items-center justify-center rounded-lg border-2 border-foreground bg-white text-foreground font-extrabold hover:bg-secondary/10 transition-colors pop-shadow-sm focus:outline-none active:translate-y-px active:shadow-none'">
                  {{ p }}
                </button>
                <span v-else-if="p === 4 || p === pagination.totalPages - 1" class="text-foreground font-extrabold px-1">...</span>
              </template>
              <button @click="goToPage(pagination.page + 1)" :disabled="pagination.page >= pagination.totalPages" class="inline-flex h-10 w-10 items-center justify-center rounded-lg border-2 border-foreground bg-white text-foreground hover:bg-secondary/10 disabled:opacity-50 transition-colors pop-shadow-sm focus:outline-none active:translate-y-px active:shadow-none">
                <span class="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </PgCard>
    </div>
    
    <AddTransactionModal 
      :isOpen="isTransactionModalOpen" 
      :initialData="selectedTransaction"
      @close="closeTransactionModal" 
    />
  </div>
</template>
