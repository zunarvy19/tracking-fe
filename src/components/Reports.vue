<script setup>
import { ref, computed } from 'vue'
import PgCard from './ui/PgCard.vue'
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

// Playful Geometric Color Palette
const breakdownColors = ['#FF3366', '#FF9933', '#CCFF00', '#00E5FF', '#9B51E0', '#FFD700', '#1A1A1A', '#D946EF']
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
const monthlyNormalized = computed(() => {
  return monthlyItems.value.map(m => {
    const max = Math.max(Number(m.income), Number(m.expense), 1)
    return {
      ...m,
      incomePct: (Number(m.income) / max) * 100,
      expensePct: (Number(m.expense) / max) * 100
    }
  })
})

const largeTxList = computed(() => largeTx.value || [])
</script>

<template>
  <div class="flex-1 overflow-y-auto p-4 md:p-8">
    <div class="max-w-6xl mx-auto flex flex-col gap-10 pb-10">
      
      <!-- Header Area -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div class="flex flex-col gap-2">
          <h1 class="text-4xl font-extrabold tracking-tight text-foreground underline decoration-tertiary decoration-4 underline-offset-4">Reports &amp; Analytics</h1>
          <p class="text-mutedForeground font-bold tracking-wide mt-2">Overview of your financial health</p>
        </div>
        
        <!-- Filter Controls -->
        <div class="flex items-center gap-2 bg-white border-2 border-foreground p-1 rounded-xl shadow-solid-soft overflow-x-auto max-w-full">
          <button v-for="label in ['This Month', 'Last Month', '3 Months']" :key="label"
            @click="timeRange = label"
            :class="['px-6 py-2.5 rounded-lg text-sm font-extrabold uppercase tracking-widest whitespace-nowrap transition-all border-2 border-transparent', timeRange === label ? 'bg-accent text-white border-foreground pop-shadow-sm' : 'text-mutedForeground hover:text-foreground']"
          >{{ label }}</button>
        </div>
      </div>
      
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <template v-if="summaryLoading">
          <div v-for="i in 3" :key="i" class="bg-white rounded-xl p-6 border-2 border-foreground animate-pulse shadow-solid-soft">
            <div class="h-4 w-24 bg-muted rounded mb-4 border-2 border-foreground"></div>
            <div class="h-8 w-32 bg-muted rounded border-2 border-foreground"></div>
          </div>
        </template>
        <template v-else>
          <!-- Total Income -->
          <PgCard hoverEffect class="p-6 bg-tertiary flex flex-col justify-between h-full relative overflow-hidden group">
            <div class="absolute right-[-20px] top-[-20px] p-4 opacity-20 group-hover:opacity-30 transition-opacity group-hover:scale-110 duration-300">
              <span class="material-symbols-outlined text-[100px] text-foreground">payments</span>
            </div>
            <div class="flex flex-col gap-2 z-10 w-full"> 
              <span class="text-foreground text-xs font-extrabold uppercase tracking-widest bg-white border-2 border-foreground px-3 py-1 rounded-full self-start pop-shadow-sm">Total Income</span>
              <span class="text-foreground text-4xl font-extrabold tracking-tight mt-4">{{ formatCurrency(summary?.income) }}</span>
            </div>
            <div class="flex items-center gap-2 mt-6 z-10">
              <span :class="['text-xs font-extrabold px-3 py-1 rounded-full border-2 border-foreground pop-shadow-sm flex items-center gap-1', summary?.incomeTrend >= 0 ? 'bg-white text-secondary' : 'bg-danger text-white']">
                <span class="material-symbols-outlined text-[16px]">{{ summary?.incomeTrend >= 0 ? 'trending_up' : 'trending_down' }}</span>
                {{ summary?.incomeTrend >= 0 ? '+' : '' }}{{ summary?.incomeTrend }}%
              </span>
              <span class="text-foreground font-bold tracking-wider text-xs uppercase">vs last month</span>
            </div>
          </PgCard>
          
          <!-- Total Expenses -->
          <PgCard hoverEffect class="p-6 bg-accent flex flex-col justify-between h-full relative overflow-hidden group">
            <div class="absolute right-[-20px] top-[-20px] p-4 opacity-20 group-hover:opacity-30 transition-opacity group-hover:scale-110 duration-300">
              <span class="material-symbols-outlined text-[100px] text-black">credit_card</span>
            </div>
            <div class="flex flex-col gap-2 z-10 w-full">
              <span class="text-foreground text-xs font-extrabold uppercase tracking-widest bg-white border-2 border-foreground px-3 py-1 rounded-full self-start pop-shadow-sm">Total Expenses</span>
              <span class="text-foreground text-4xl font-extrabold tracking-tight mt-4">{{ formatCurrency(summary?.expense) }}</span>
            </div>
            <div class="flex items-center gap-2 mt-6 z-10">
              <span :class="['text-xs font-extrabold px-3 py-1 rounded-full border-2 border-foreground pop-shadow-sm flex items-center gap-1', summary?.expenseTrend <= 0 ? 'bg-secondary text-white' : 'bg-white text-danger']">
                <span class="material-symbols-outlined text-[16px]">{{ summary?.expenseTrend <= 0 ? 'trending_down' : 'trending_up' }}</span>
                {{ summary?.expenseTrend >= 0 ? '+' : '' }}{{ summary?.expenseTrend }}%
              </span>
              <span class="text-foreground font-bold tracking-wider text-xs uppercase">vs last month</span>
            </div>
          </PgCard>
          
          <!-- Net Savings -->
          <PgCard hoverEffect class="p-6 bg-secondary flex flex-col justify-between h-full relative overflow-hidden group">
            <div class="absolute right-[-20px] top-[-20px] p-4 opacity-20 group-hover:opacity-30 transition-opacity group-hover:scale-110 duration-300">
              <span class="material-symbols-outlined text-[100px] text-white">savings</span>
            </div>
            <div class="flex flex-col gap-2 z-10 w-full">
              <span class="text-foreground text-xs font-extrabold uppercase tracking-widest bg-white border-2 border-foreground px-3 py-1 rounded-full self-start pop-shadow-sm">Net Savings</span>
              <span class="text-white text-4xl font-extrabold tracking-tight mt-4">{{ formatCurrency(summary?.savings) }}</span>
            </div>
            <div class="flex items-center gap-2 mt-6 z-10">
              <span :class="['text-xs font-extrabold px-3 py-1 rounded-full border-2 border-foreground pop-shadow-sm flex items-center gap-1', summary?.savingsTrend >= 0 ? 'bg-white text-secondary' : 'bg-white text-danger']">
                <span class="material-symbols-outlined text-[16px]">{{ summary?.savingsTrend >= 0 ? 'trending_up' : 'trending_down' }}</span>
                {{ summary?.savingsTrend >= 0 ? '+' : '' }}{{ summary?.savingsTrend }}%
              </span>
              <span class="text-white font-bold tracking-wider text-xs uppercase">vs last month</span>
            </div>
          </PgCard>
        </template>
      </div>
      
      <!-- Charts Main Area -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Expense Breakdown Donut Chart -->
        <PgCard class="p-6 bg-white flex flex-col">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-foreground text-xl font-extrabold uppercase tracking-widest underline decoration-quaternary decoration-4 underline-offset-4">Expense Breakdown</h2>
          </div>
          
          <div v-if="breakdownLoading" class="flex justify-center items-center h-48 animate-pulse">
            <div class="w-48 h-48 rounded-full border-4 border-foreground bg-muted"></div>
          </div>
          <div v-else class="flex flex-col md:flex-row items-center gap-10 justify-center">
            <div class="relative w-48 h-48 flex-shrink-0 animate-fade-in-up">
              <!-- Geometric drop shadow for the donut -->
              <div class="absolute inset-0 rounded-full border-4 border-foreground transform translate-x-2 translate-y-2 bg-black"></div>
              
              <svg class="w-full h-full transform -rotate-90 relative z-10 bg-white rounded-full border-4 border-foreground" viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="transparent" r="40" stroke="#f1f5f9" stroke-width="12"></circle>
                <circle v-for="(seg, i) in donutSegments" :key="i" class="donut-segment drop-shadow-sm" cx="50" cy="50" fill="transparent" r="40" :stroke="seg.color" :stroke-dasharray="seg.dashArray" :stroke-dashoffset="seg.dashOffset" stroke-width="12" :style="{ transform: `rotate(${seg.rotation}deg)`, transformOrigin: '50% 50%' }"></circle>
              </svg>
              <div class="absolute inset-0 flex items-center justify-center flex-col pointer-events-none z-20">
                <span class="text-xs text-mutedForeground font-extrabold uppercase tracking-widest mt-2">Total</span>
                <span class="text-xl font-extrabold text-foreground">{{ formatShort(totalExpense) }}</span>
              </div>
            </div>
            
            <!-- Legend -->
            <div class="flex flex-col gap-4 w-full max-w-[200px]">
              <div v-for="(item, i) in breakdownItems" :key="i" class="flex items-center justify-between bg-muted/20 p-2 rounded-lg border-2 border-transparent hover:border-foreground transition-all">
                <div class="flex items-center gap-3">
                  <div class="w-4 h-4 rounded-md border-2 border-foreground" :style="{ backgroundColor: breakdownColors[i % breakdownColors.length] }"></div>
                  <span class="text-sm font-extrabold text-foreground">{{ item.category }}</span>
                </div>
                <span class="text-sm font-extrabold tracking-wider text-mutedForeground">{{ item.percentage }}%</span>
              </div>
            </div>
          </div>
        </PgCard>
        
        <!-- Monthly Comparison Bar Chart -->
        <PgCard class="p-6 bg-white flex flex-col">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-foreground text-xl font-extrabold uppercase tracking-widest underline decoration-secondary decoration-4 underline-offset-4">Monthly Comparison</h2>
            <div class="flex items-center gap-4">
              <span class="flex items-center gap-1.5 text-xs font-extrabold tracking-widest uppercase text-foreground">
                <span class="w-3 h-3 rounded-full border-2 border-foreground bg-accent"></span> Income
              </span>
              <span class="flex items-center gap-1.5 text-xs font-extrabold tracking-widest uppercase text-foreground">
                <span class="w-3 h-3 rounded-full border-2 border-foreground bg-quaternary"></span> Expense
              </span>
            </div>
          </div>
          
          <div v-if="monthlyLoading" class="flex-1 flex items-end justify-between gap-4 h-56 animate-pulse">
            <div v-for="i in 5" :key="i" class="flex flex-col items-center gap-3 w-full">
              <div class="flex items-end gap-1.5 h-full w-full justify-center">
                <div class="w-4 md:w-6 border-2 border-foreground bg-muted" :style="{ height: `${20 + i * 10}%` }"></div>
                <div class="w-4 md:w-6 border-2 border-foreground bg-muted" :style="{ height: `${15 + i * 8}%` }"></div>
              </div>
            </div>
          </div>
          <div v-else class="flex-1 flex items-end justify-between gap-4 h-56 px-2 relative animate-fade-in-up">
            <!-- Grid Lines -->
            <div class="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
              <div v-for="i in 5" :key="i" class="border-t-2 border-dashed border-foreground opacity-20 w-full h-px"></div>
            </div>
            
            <div v-for="(m, i) in monthlyNormalized" :key="i" class="flex flex-col items-center gap-3 z-10 w-full group">
              <div class="flex items-end gap-1.5 h-full w-full justify-center">
                <div class="w-3 md:w-8 bg-accent border-2 border-foreground rounded-t-sm relative transition-transform group-hover:scale-105 transform origin-bottom" :style="{ height: `${m.incomePct}%` }">
                  <div class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-foreground text-white font-bold text-[10px] py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 pop-shadow-sm">
                    {{ formatCurrency(m.income) }}
                  </div>
                </div>
                <div class="w-3 md:w-8 bg-quaternary border-2 border-foreground rounded-t-sm relative transition-transform group-hover:scale-105 transform origin-bottom" :style="{ height: `${m.expensePct}%` }">
                  <div class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-foreground text-white font-bold text-[10px] py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 pop-shadow-sm">
                    {{ formatCurrency(m.expense) }}
                  </div>
                </div>
              </div>
              <span class="text-xs font-extrabold uppercase tracking-widest bg-muted/30 px-2 py-1 rounded-md border border-transparent group-hover:border-foreground transition-colors overflow-hidden text-clip">{{ m.month }}</span>
            </div>
          </div>
        </PgCard>
      </div>
      
      <!-- Recent Large Transactions Data Table -->
      <PgCard class="p-6 bg-white overflow-hidden">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-foreground text-xl font-extrabold uppercase tracking-widest underline decoration-accent decoration-4 underline-offset-4">Recent Large Transactions</h2>
        </div>
        
        <div v-if="largeTxLoading" class="space-y-4 animate-pulse">
          <div v-for="i in 3" :key="i" class="flex items-center gap-4 py-4 border-b-2 border-muted">
            <div class="w-12 h-12 rounded-full border-2 border-foreground bg-muted"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 w-32 border-2 border-foreground bg-muted rounded"></div>
              <div class="h-3 w-20 border-2 border-foreground bg-muted rounded"></div>
            </div>
            <div class="h-4 w-24 border-2 border-foreground bg-muted rounded"></div>
          </div>
        </div>
        <div v-else class="overflow-x-auto custom-scrollbar pb-2">
          <table class="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr class="border-b-4 border-foreground">
                <th class="pb-3 text-xs font-extrabold text-foreground uppercase tracking-widest pl-2">Transaction</th>
                <th class="pb-3 text-xs font-extrabold text-foreground uppercase tracking-widest">Category</th>
                <th class="pb-3 text-xs font-extrabold text-foreground uppercase tracking-widest">Date</th>
                <th class="pb-3 text-xs font-extrabold text-foreground uppercase tracking-widest text-right pr-2">Amount</th>
              </tr>
            </thead>
            <tbody class="text-sm font-bold text-foreground divide-y-2 divide-foreground">
              <tr v-for="tx in largeTxList" :key="tx.id" class="group hover:bg-quaternary/20 transition-colors">
                <td class="py-5 pl-2">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full border-2 border-foreground bg-tertiary flex items-center justify-center text-foreground pop-shadow-sm transition-transform group-hover:scale-110">
                      <span class="material-symbols-outlined text-[24px]">{{ tx.category?.icon || 'receipt' }}</span>
                    </div>
                    <div class="flex flex-col">
                      <span class="font-extrabold text-base tracking-tight">{{ tx.description }}</span>
                    </div>
                  </div>
                </td>
                <td class="py-5">
                  <span class="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest border-2 border-foreground bg-white pop-shadow-sm">{{ tx.category?.name || 'N/A' }}</span>
                </td>
                <td class="py-5 uppercase tracking-widest text-xs font-extrabold">{{ formatDate(tx.date) }}</td>
                <td :class="['py-5 text-right font-extrabold text-lg tracking-tight pr-2', tx.type === 'income' ? 'text-secondary' : 'text-foreground']">
                  {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
                </td>
              </tr>
              <tr v-if="largeTxList.length === 0">
                <td colspan="4" class="py-12 text-center text-mutedForeground font-extrabold uppercase tracking-widest">
                  <div class="flex flex-col items-center justify-center gap-3">
                    <span class="material-symbols-outlined text-5xl">receipt_long</span>
                    No transactions found for this period.
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </PgCard>
      
    </div>
  </div>
</template>

<style scoped>
.donut-segment {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.donut-segment:hover {
  stroke-width: 16;
  filter: drop-shadow(0 0 4px rgba(0,0,0,0.3));
  cursor: pointer;
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.custom-scrollbar::-webkit-scrollbar {
  height: 8px;
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
