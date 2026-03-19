<script setup>
import PgCard from './ui/PgCard.vue'

defineProps({
  title: String,
  icon: String,
  amount: String,
  trend: String,
  trendText: String,
  isPositive: Boolean,
  iconBgClass: String,
  iconTextClass: String
})
</script>

<template>
  <PgCard hoverEffect class="relative overflow-hidden p-6 bg-white">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-sm font-extrabold uppercase tracking-widest text-mutedForeground">{{ title }}</h3>
      <div :class="['flex items-center justify-center shrink-0 h-10 w-10 rounded-full border-2 border-foreground pop-shadow-sm', iconBgClass, iconTextClass]">
        <span class="material-symbols-outlined text-xl">{{ icon }}</span>
      </div>
    </div>
    <div class="flex items-baseline gap-2">
      <span class="text-3xl font-extrabold text-foreground tracking-tight">{{ amount }}</span>
    </div>
    <div class="mt-4 flex items-center gap-2">
      <span :class="['flex items-center text-xs font-bold px-2 py-0.5 rounded-full border-2 border-foreground', isPositive ? 'bg-quaternary text-foreground' : 'bg-secondary text-white']">
        <span class="material-symbols-outlined -ml-1 text-base mr-0.5">{{ isPositive ? 'trending_up' : 'trending_down' }}</span>
        {{ trend }}
      </span>
      <span class="text-sm font-bold text-mutedForeground">{{ trendText }}</span>
    </div>
  </PgCard>
</template>
