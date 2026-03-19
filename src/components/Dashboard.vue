<script setup>
import { ref, computed } from 'vue'
import StatCard from './StatCard.vue'
import TransactionItem from './TransactionItem.vue'
import AddTransactionModal from './AddTransactionModal.vue'
import PgButton from './ui/PgButton.vue'
import PgCard from './ui/PgCard.vue'
import { useDashboardStats, useRecentTransactions } from '../composables/useDashboard.js'
import { useAuth } from '../composables/useAuth.js'
import { usePWA } from '../composables/usePWA.js'

const isTransactionModalOpen = ref(false)
const { isInstallable, promptInstall } = usePWA()

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
      iconBgClass: 'bg-accent',
      iconTextClass: 'text-white'
    },
    {
      title: 'Income',
      icon: 'arrow_downward',
      amount: formatCurrency(stats.value.income),
      trend: `${stats.value.incomeTrend >= 0 ? '+' : ''}${stats.value.incomeTrend}%`,
      trendText: 'vs last month',
      isPositive: stats.value.incomeTrend >= 0,
      iconBgClass: 'bg-quaternary',
      iconTextClass: 'text-foreground'
    },
    {
      title: 'Expense',
      icon: 'arrow_upward',
      amount: formatCurrency(stats.value.expense),
      trend: `${stats.value.expenseTrend >= 0 ? '+' : ''}${stats.value.expenseTrend}%`,
      trendText: 'vs last month',
      isPositive: stats.value.expenseTrend <= 0,
      iconBgClass: 'bg-secondary',
      iconTextClass: 'text-white'
    },
    {
      title: 'Saving',
      icon: 'account_balance',
      amount: formatCurrency(stats.value.saving),
      trend: `${stats.value.savingTrend >= 0 ? '+' : ''}${stats.value.savingTrend}%`,
      trendText: 'from last month',
      isPositive: stats.value.savingTrend >= 0,
      iconBgClass: 'bg-tertiary',
      iconTextClass: 'text-foreground'
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
      amountClass: isIncome ? 'text-quaternary' : 'text-foreground',
      method: t.paymentMethod || '',
      icon: t.category?.icon || 'receipt',
      iconBgClass: 'accent',
      iconTextClass: 'text-white'
    }
  })
})

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(value) || 0)
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// console.log(stats)
</script>

<template>
  <div class="mx-auto w-full max-w-6xl space-y-12 px-6 py-12 relative">
    
    <!-- Decorative squiggle (bg only) -->
    <div class="absolute top-0 right-10 -z-10 text-tertiary opacity-40">
      <svg width="200" height="40" viewBox="0 0 200 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 20C20 0 40 40 60 20C80 0 100 40 120 20C140 0 160 40 180 20C200 0 200 20 200 20" stroke="currentColor" stroke-width="8" stroke-linecap="round"/>
      </svg>
    </div>

    <!-- Header Section -->
    <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 class="text-4xl font-extrabold tracking-tight text-foreground underline decoration-tertiary decoration-4 underline-offset-4">Dashboard</h2>
        <div class="flex items-center gap-3 mt-4 text-sm font-bold text-mutedForeground">
          <span class="uppercase tracking-widest">Welcome back, {{ user?.name || 'User' }}</span>
          <span class="h-2 w-2 rounded-full bg-foreground"></span>
          <div class="flex items-center gap-1 text-secondary">
            <span class="material-symbols-outlined text-lg">cloud_done</span>
            <span>SYNCED</span>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <!-- <PgButton variant="secondary" class="gap-2 shrink-0">
          <span class="material-symbols-outlined text-xl">download</span>
          Export
        </PgButton> -->
        <PgButton @click="isTransactionModalOpen = true" class="gap-2 shrink-0">
          <span class="material-symbols-outlined text-xl">add</span>
          New Transaction
        </PgButton>
      </div>
    </div>

    <!-- A2HS Banner -->
    <div v-if="isInstallable" class="relative flex overflow-hidden rounded-xl bg-accent p-6 text-white shadow-solid-soft hidden border-2 border-foreground">
      <div class="bg-pattern absolute inset-0 opacity-10 bg-dot-pattern"></div>
      <div class="relative z-10 flex w-full flex-col justify-between gap-6 md:flex-row md:items-center">
        <div class="flex items-start gap-4">
          <div class="hidden rounded-full bg-white text-accent p-3 border-2 border-foreground sm:block">
            <span class="material-symbols-outlined text-3xl">install_mobile</span>
          </div>
          <div>
            <h3 class="text-xl font-extrabold">Install App for Offline Mode</h3>
            <p class="mt-1 max-w-xl text-sm font-medium">Add CuanTrack to your home screen for quick access, push notifications, and full offline capabilities.</p>
          </div>
        </div>
        <PgButton variant="secondary" @click="promptInstall" class="bg-white text-foreground hover:bg-tertiary shrink-0">
          Add to Home Screen
        </PgButton>
      </div>
    </div>

    <!-- Financial Stats Grid -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <template v-if="statsLoading">
        <div v-for="i in 4" :key="i" class="rounded-xl bg-white p-6 border-2 border-foreground animate-pulse shadow-solid-soft">
          <div class="h-4 w-24 bg-muted rounded mb-4"></div>
          <div class="h-8 w-32 bg-muted rounded mb-4"></div>
          <div class="h-4 w-16 bg-muted rounded"></div>
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
    <PgCard class="p-0 bg-white">
      <div class="flex items-center justify-between border-b-2 border-foreground px-6 py-4 bg-tertiary rounded-t-xl">
        <h3 class="font-extrabold text-foreground uppercase tracking-widest">Recent Transactions</h3>
      </div>
      <div class="divide-y-2 divide-foreground">
        <template v-if="txLoading">
          <div v-for="i in 3" :key="i" class="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between opacity-50">
            <div class="flex items-center gap-4 w-full">
              <div class="h-12 w-12 shrink-0 rounded-full border-2 border-foreground bg-muted animate-pulse"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 w-32 rounded bg-muted animate-pulse"></div>
                <div class="h-3 w-48 rounded bg-muted animate-pulse"></div>
              </div>
            </div>
            <div class="flex flex-col items-end space-y-2 w-24">
              <div class="h-4 w-16 rounded bg-muted animate-pulse"></div>
              <div class="h-3 w-12 rounded bg-muted animate-pulse"></div>
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
          <div v-if="transactionItems.length === 0" class="px-6 py-12 text-center text-mutedForeground">
            <span class="material-symbols-outlined text-6xl mb-4 text-muted shrink-0 block mx-auto">receipt_long</span>
            <p class="font-bold text-lg">No transactions yet.</p>
            <p class="text-sm">Add your first one!</p>
          </div>
        </template>
      </div>
    </PgCard>

    <AddTransactionModal 
      :isOpen="isTransactionModalOpen" 
      @close="isTransactionModalOpen = false" 
    />
  </div>
</template>
