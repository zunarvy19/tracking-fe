<script setup>
import { ref, computed } from 'vue'
import StatCard from './StatCard.vue'
import TransactionItem from './TransactionItem.vue'
import AddTransactionModal from './AddTransactionModal.vue'
import { useDashboardStats, useRecentTransactions } from '../composables/useDashboard.js'
import { useAuth } from '../composables/useAuth.js'

const isTransactionModalOpen = ref(false)

const { data: stats, isLoading: statsLoading } = useDashboardStats()
const { data: recentTransactions, isLoading: txLoading } = useRecentTransactions()
const { user } = useAuth()

const statCards = computed(() => {
  if (!stats.value) return []
  return [
    {
      title: 'Total Balance',
      icon: 'account_balance',
      amount: formatCurrency(stats.value.balance),
      trend: `${stats.value.balanceTrend >= 0 ? '+' : ''}${stats.value.balanceTrend}%`,
      trendText: 'from last month',
      isPositive: stats.value.balanceTrend >= 0,
      iconBgClass: 'bg-slate-100 dark:bg-slate-800',
      iconTextClass: 'text-slate-600 dark:text-slate-400'
    },
    {
      title: 'Income',
      icon: 'arrow_downward',
      amount: formatCurrency(stats.value.income),
      trend: `${stats.value.incomeTrend >= 0 ? '+' : ''}${stats.value.incomeTrend}%`,
      trendText: 'vs last month',
      isPositive: stats.value.incomeTrend >= 0,
      iconBgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconTextClass: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      title: 'Expense',
      icon: 'arrow_upward',
      amount: formatCurrency(stats.value.expense),
      trend: `${stats.value.expenseTrend >= 0 ? '+' : ''}${stats.value.expenseTrend}%`,
      trendText: 'vs last month',
      isPositive: stats.value.expenseTrend <= 0,
      iconBgClass: 'bg-rose-100 dark:bg-rose-900/30',
      iconTextClass: 'text-rose-600 dark:text-rose-400'
    }
  ]
})

const transactionItems = computed(() => {
  if (!recentTransactions.value) return []
  return recentTransactions.value.map(t => {
    const isIncome = t.type === 'income'
    return {
      title: t.description,
      subtitle: `${formatDate(t.date)} • ${t.category?.name || 'Uncategorized'}`,
      amount: `${isIncome ? '+' : '-'}${formatCurrency(t.amount)}`,
      amountClass: isIncome ? 'text-success' : 'text-text-primary-light dark:text-text-primary-dark',
      method: t.paymentMethod || '',
      icon: t.category?.icon || 'receipt',
      iconBgClass: `bg-${t.category?.color || 'slate'}-100 dark:bg-${t.category?.color || 'slate'}-900/30`,
      iconTextClass: `text-${t.category?.color || 'slate'}-600 dark:text-${t.category?.color || 'slate'}-400`
    }
  })
})

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(value) || 0)
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div class="mx-auto w-full max-w-7xl space-y-8 px-6 py-8">
    <!-- Header Section -->
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">Dashboard</h2>
        <div class="flex items-center gap-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
          <span>Welcome back, {{ user?.name || 'User' }}</span>
          <span class="h-1 w-1 rounded-full bg-border-dark"></span>
          <div class="flex items-center gap-1 text-success">
            <span class="material-symbols-outlined text-sm">cloud_done</span>
            <span> synced</span>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button class="flex items-center gap-2 rounded-lg border border-border-light bg-surface-light px-4 py-2 text-sm font-medium text-text-primary-light shadow-sm hover:bg-slate-50 dark:border-border-dark dark:bg-surface-dark dark:text-text-primary-dark dark:hover:bg-slate-800 transition-colors">
          <span class="material-symbols-outlined text-lg">download</span>
          Export
        </button>
        <button @click="isTransactionModalOpen = true" class="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-hover transition-colors">
          <span class="material-symbols-outlined text-lg">add</span>
          Add Transaction
        </button>
      </div>
    </div>

    <!-- A2HS Banner -->
    <div class="relative flex overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg">
      <div class="bg-pattern absolute inset-0 opacity-10" data-alt="Abstract dotted background pattern" style="background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 20px 20px;"></div>
      <div class="relative z-10 flex w-full flex-col justify-between gap-6 md:flex-row md:items-center">
        <div class="flex items-start gap-4">
          <div class="hidden rounded-lg bg-white/20 p-3 backdrop-blur-sm sm:block">
            <span class="material-symbols-outlined text-3xl">install_mobile</span>
          </div>
          <div>
            <h3 class="text-lg font-bold">Install App for Offline Mode</h3>
            <p class="mt-1 max-w-xl text-sm text-blue-100">Add CuanTrack to your home screen for quick access, push notifications, and full offline capabilities.</p>
          </div>
        </div>
        <button class="shrink-0 whitespace-nowrap rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-blue-600 shadow hover:bg-blue-50 transition-colors">
          Add to Home Screen
        </button>
      </div>
    </div>

    <!-- Financial Stats Grid -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <template v-if="statsLoading">
        <div v-for="i in 3" :key="i" class="rounded-xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm ring-1 ring-border-light dark:ring-border-dark animate-pulse">
          <div class="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
          <div class="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </template>
      <StatCard
        v-else
        v-for="(card, index) in statCards"
        :key="index"
        :title="card.title"
        :icon="card.icon"
        :amount="card.amount"
        :trend="card.trend"
        :trendText="card.trendText"
        :isPositive="card.isPositive"
        :iconBgClass="card.iconBgClass"
        :iconTextClass="card.iconTextClass"
      />
    </div>

    <!-- Recent Transactions Section -->
    <div class="rounded-xl bg-surface-light shadow-sm ring-1 ring-border-light dark:bg-surface-dark dark:ring-border-dark">
      <div class="flex items-center justify-between border-b border-border-light px-6 py-4 dark:border-border-dark">
        <h3 class="font-bold text-text-primary-light dark:text-text-primary-dark">Recent Transactions</h3>
        <!-- <a class="text-sm font-medium text-primary hover:text-primary-hover hover:underline dark:text-blue-400 cursor-pointer" href="">View All</a> -->
      </div>
      <div class="divide-y divide-border-light dark:divide-border-dark">
        <template v-if="txLoading">
          <div v-for="i in 3" :key="i" class="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between opacity-50">
            <div class="flex items-center gap-4 w-full">
              <div class="h-12 w-12 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                <div class="h-3 w-48 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              </div>
            </div>
            <div class="flex flex-col items-end space-y-2 w-24">
              <div class="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              <div class="h-3 w-12 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            </div>
          </div>
        </template>
        <template v-else>
          <TransactionItem
            v-for="(item, index) in transactionItems"
            :key="index"
            :title="item.title"
            :subtitle="item.subtitle"
            :amount="item.amount"
            :amountClass="item.amountClass"
            :method="item.method"
            :icon="item.icon"
            :iconBgClass="item.iconBgClass"
            :iconTextClass="item.iconTextClass"
          />
          <div v-if="transactionItems.length === 0" class="px-6 py-8 text-center text-text-secondary-light dark:text-text-secondary-dark">
            <span class="material-symbols-outlined text-4xl mb-2">receipt_long</span>
            <p>No transactions yet. Add your first one!</p>
          </div>
        </template>
      </div>
    </div>

    <AddTransactionModal 
      :isOpen="isTransactionModalOpen" 
      @close="isTransactionModalOpen = false" 
    />
  </div>
</template>
