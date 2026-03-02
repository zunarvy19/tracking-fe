<script setup>
import { ref, computed } from 'vue'
import { useReportSummary, useExpenseBreakdown, useMonthlyComparison, useLargeTransactions } from '../composables/useReports.js'

const periodMap = { 'This Month': 'this_month', 'Last Month': 'last_month', '3 Months': '3_months' }
const timeRange = ref('This Month')
const period = computed(() => periodMap[timeRange.value] || 'this_month')

const { data: summary, isLoading: summaryLoading } = useReportSummary(period)
const { data: breakdown, isLoading: breakdownLoading } = useExpenseBreakdown(period)
const { data: monthlyData, isLoading: monthlyLoading } = useMonthlyComparison()
const { data: largeTx, isLoading: largeTxLoading } = useLargeTransactions(period)

function formatCurrency(val) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(val) || 0)
}
function formatShort(val) {
  const n = Number(val) || 0
  if (n >= 1000000) return `${(n/1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n/1000).toFixed(1)}k`
  return n.toString()
}
function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const breakdownColors = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']
const breakdownItems = computed(() => breakdown.value || [])

// Generate SVG donut from breakdown data
const donutSegments = computed(() => {
  const items = breakdownItems.value
  if (!items.length) return []
  const circumference = 2 * Math.PI * 40 // ~251.2
  let rotation = 0
  return items.map((item, i) => {
    const pct = item.percentage / 100
    const dashArray = circumference
    const dashOffset = circumference * (1 - pct)
    const segment = { dashArray, dashOffset, rotation, color: breakdownColors[i % breakdownColors.length] }
    rotation += pct * 360
    return segment
  })
})

const totalExpense = computed(() => {
  if (!breakdown.value) return '0'
  return breakdown.value.reduce((s, b) => s + Number(b.amount), 0)
})

// Monthly comparison chart
const monthlyItems = computed(() => monthlyData.value || [])
const maxMonthly = computed(() => {
  return Math.max(...monthlyItems.value.flatMap(m => [Number(m.income), Number(m.expense)]), 1)
})

const largeTxList = computed(() => largeTx.value || [])
</script>

<template>
  <div class="flex-1 overflow-y-auto p-4 md:p-8">
    <div class="max-w-6xl mx-auto flex flex-col gap-8 pb-10">
      
      <!-- Header Area -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div class="flex flex-col gap-1">
          <h1 class="text-text-primary-light dark:text-white text-3xl md:text-4xl font-extrabold tracking-tight">Reports &amp; Analytics</h1>
          <p class="text-text-secondary-light dark:text-slate-400 text-base">Overview of your financial health</p>
        </div>
        
        <!-- Filter Controls -->
        <div class="flex items-center gap-2 bg-white dark:bg-surface-dark p-1 rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-x-auto max-w-full">
          <button v-for="label in ['This Month', 'Last Month', '3 Months']" :key="label"
            @click="timeRange = label"
            :class="['px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors', timeRange === label ? 'bg-slate-100 dark:bg-slate-800 text-text-primary-light dark:text-white shadow-sm' : 'text-text-secondary-light dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800']"
          >{{ label }}</button>
        </div>
      </div>
      
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <template v-if="summaryLoading">
          <div v-for="i in 3" :key="i" class="bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-border-light dark:border-border-dark animate-pulse">
            <div class="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
            <div class="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </template>
        <template v-else>
          <!-- Total Income -->
          <div class="bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-border-light dark:border-border-dark flex flex-col justify-between h-full relative overflow-hidden group">
            <div class="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span class="material-symbols-outlined text-[80px] text-primary">payments</span>
            </div>
            <div class="flex flex-col gap-1 z-10">
              <span class="text-text-secondary-light dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Total Income</span>
              <span class="text-text-primary-light dark:text-white text-3xl font-bold tracking-tight">{{ formatCurrency(summary?.income) }}</span>
            </div>
            <div class="flex items-center gap-1 mt-4 z-10">
              <span :class="['text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1', summary?.incomeTrend >= 0 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger']">
                <span class="material-symbols-outlined text-[14px]">{{ summary?.incomeTrend >= 0 ? 'trending_up' : 'trending_down' }}</span>
                {{ summary?.incomeTrend >= 0 ? '+' : '' }}{{ summary?.incomeTrend }}%
              </span>
              <span class="text-text-secondary-light dark:text-slate-500 text-xs">vs last month</span>
            </div>
          </div>
          
          <!-- Total Expenses -->
          <div class="bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-border-light dark:border-border-dark flex flex-col justify-between h-full relative overflow-hidden group">
            <div class="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span class="material-symbols-outlined text-[80px] text-danger">credit_card</span>
            </div>
            <div class="flex flex-col gap-1 z-10">
              <span class="text-text-secondary-light dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Total Expenses</span>
              <span class="text-text-primary-light dark:text-white text-3xl font-bold tracking-tight">{{ formatCurrency(summary?.expense) }}</span>
            </div>
            <div class="flex items-center gap-1 mt-4 z-10">
              <span :class="['text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1', summary?.expenseTrend <= 0 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger']">
                <span class="material-symbols-outlined text-[14px]">{{ summary?.expenseTrend <= 0 ? 'trending_down' : 'trending_up' }}</span>
                {{ summary?.expenseTrend >= 0 ? '+' : '' }}{{ summary?.expenseTrend }}%
              </span>
              <span class="text-text-secondary-light dark:text-slate-500 text-xs">vs last month</span>
            </div>
          </div>
          
          <!-- Net Savings -->
          <div class="bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-border-light dark:border-border-dark flex flex-col justify-between h-full relative overflow-hidden group">
            <div class="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span class="material-symbols-outlined text-[80px] text-emerald-500">savings</span>
            </div>
            <div class="flex flex-col gap-1 z-10">
              <span class="text-text-secondary-light dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Net Savings</span>
              <span class="text-text-primary-light dark:text-white text-3xl font-bold tracking-tight">{{ formatCurrency(summary?.savings) }}</span>
            </div>
            <div class="flex items-center gap-1 mt-4 z-10">
              <span :class="['text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1', summary?.savingsTrend >= 0 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger']">
                <span class="material-symbols-outlined text-[14px]">{{ summary?.savingsTrend >= 0 ? 'trending_up' : 'trending_down' }}</span>
                {{ summary?.savingsTrend >= 0 ? '+' : '' }}{{ summary?.savingsTrend }}%
              </span>
              <span class="text-text-secondary-light dark:text-slate-500 text-xs">vs last month</span>
            </div>
          </div>
        </template>
      </div>
      
      <!-- Charts Main Area -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Expense Breakdown Donut Chart -->
        <div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6 flex flex-col">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-text-primary-light dark:text-white text-lg font-bold">Expense Breakdown</h2>
          </div>
          
          <div v-if="breakdownLoading" class="flex justify-center items-center h-48 animate-pulse">
            <div class="w-48 h-48 rounded-full bg-slate-200 dark:bg-slate-700"></div>
          </div>
          <div v-else class="flex flex-col md:flex-row items-center gap-8 justify-center">
            <div class="relative w-48 h-48 flex-shrink-0">
              <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle class="dark:stroke-slate-800" cx="50" cy="50" fill="transparent" r="40" stroke="#f1f5f9" stroke-width="12"></circle>
                <circle v-for="(seg, i) in donutSegments" :key="i" class="donut-segment" cx="50" cy="50" fill="transparent" r="40" :stroke="seg.color" :stroke-dasharray="seg.dashArray" :stroke-dashoffset="seg.dashOffset" stroke-width="12" :style="{ transform: `rotate(${seg.rotation}deg)`, transformOrigin: '50% 50%' }"></circle>
              </svg>
              <div class="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span class="text-xs text-text-secondary-light dark:text-slate-400">Total</span>
                <span class="text-xl font-bold text-text-primary-light dark:text-white">{{ formatShort(totalExpense) }}</span>
              </div>
            </div>
            
            <!-- Legend -->
            <div class="flex flex-col gap-3 w-full max-w-[200px]">
              <div v-for="(item, i) in breakdownItems" :key="i" class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: breakdownColors[i % breakdownColors.length] }"></div>
                  <span class="text-sm text-text-secondary-light dark:text-slate-300">{{ item.category }}</span>
                </div>
                <span class="text-sm font-semibold text-text-primary-light dark:text-white">{{ item.percentage }}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Monthly Comparison Bar Chart -->
        <div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6 flex flex-col">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-text-primary-light dark:text-white text-lg font-bold">Monthly Comparison</h2>
            <div class="flex items-center gap-2">
              <span class="flex items-center gap-1 text-xs text-text-secondary-light dark:text-slate-400">
                <span class="w-2 h-2 rounded-full bg-primary"></span> Income
              </span>
              <span class="flex items-center gap-1 text-xs text-text-secondary-light dark:text-slate-400">
                <span class="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700"></span> Expense
              </span>
            </div>
          </div>
          
          <div v-if="monthlyLoading" class="flex-1 flex items-end justify-between gap-2 h-48 animate-pulse">
            <div v-for="i in 5" :key="i" class="flex flex-col items-center gap-2 w-full">
              <div class="flex items-end gap-1 h-full w-full justify-center">
                <div class="w-4 bg-slate-200 dark:bg-slate-700 rounded-t-sm" :style="{ height: `${20 + i * 10}%` }"></div>
                <div class="w-4 bg-slate-200 dark:bg-slate-700 rounded-t-sm" :style="{ height: `${15 + i * 8}%` }"></div>
              </div>
            </div>
          </div>
          <div v-else class="flex-1 flex items-end justify-between gap-2 h-48 px-2 relative">
            <!-- Grid Lines -->
            <div class="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
              <div v-for="i in 5" :key="i" class="border-t border-dashed border-border-light dark:border-border-dark w-full h-px"></div>
            </div>
            
            <div v-for="(m, i) in monthlyItems" :key="i" class="flex flex-col items-center gap-2 z-10 w-full">
              <div class="flex items-end gap-1 h-full w-full justify-center">
                <div class="w-2 md:w-4 bg-primary rounded-t-sm relative group" :style="{ height: `${(Number(m.income) / maxMonthly) * 100}%` }">
                  <div class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {{ formatCurrency(m.income) }}
                  </div>
                </div>
                <div class="w-2 md:w-4 bg-slate-200 dark:bg-slate-700 rounded-t-sm" :style="{ height: `${(Number(m.expense) / maxMonthly) * 100}%` }"></div>
              </div>
              <span :class="['text-xs', i === monthlyItems.length - 1 ? 'font-semibold text-primary' : 'text-text-secondary-light dark:text-slate-400']">{{ m.month }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Recent Large Transactions Data Table -->
      <div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-text-primary-light dark:text-white text-lg font-bold">Recent Large Transactions</h2>
        </div>
        
        <div v-if="largeTxLoading" class="space-y-4 animate-pulse">
          <div v-for="i in 3" :key="i" class="flex items-center gap-3 py-4">
            <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div class="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
            <div class="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-border-light dark:border-border-dark">
                <th class="pb-3 text-xs font-semibold text-text-secondary-light dark:text-slate-500 uppercase tracking-wider pl-2">Transaction</th>
                <th class="pb-3 text-xs font-semibold text-text-secondary-light dark:text-slate-500 uppercase tracking-wider">Category</th>
                <th class="pb-3 text-xs font-semibold text-text-secondary-light dark:text-slate-500 uppercase tracking-wider">Date</th>
                <th class="pb-3 text-xs font-semibold text-text-secondary-light dark:text-slate-500 uppercase tracking-wider text-right pr-2">Amount</th>
              </tr>
            </thead>
            <tbody class="text-sm text-text-primary-light dark:text-slate-300">
              <tr v-for="tx in largeTxList" :key="tx.id" class="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td class="py-4 pl-2">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-text-secondary-light">
                      <span class="material-symbols-outlined text-[20px]">{{ tx.category?.icon || 'receipt' }}</span>
                    </div>
                    <div class="flex flex-col">
                      <span class="font-medium text-text-primary-light dark:text-white">{{ tx.description }}</span>
                    </div>
                  </div>
                </td>
                <td class="py-4">
                  <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-text-secondary-light">{{ tx.category?.name || 'N/A' }}</span>
                </td>
                <td class="py-4 text-text-secondary-light">{{ formatDate(tx.date) }}</td>
                <td :class="['py-4 text-right font-medium pr-2', tx.type === 'income' ? 'text-success' : 'text-text-primary-light dark:text-white']">
                  {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
                </td>
              </tr>
              <tr v-if="largeTxList.length === 0">
                <td colspan="4" class="py-8 text-center text-slate-500">No transactions found for this period.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  </div>
</template>

<style scoped>
.donut-segment {
  transition: all 0.3s ease;
}
.donut-segment:hover {
  opacity: 0.8;
  cursor: pointer;
}
</style>
