<script setup>
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
  <div class="relative overflow-hidden rounded-xl bg-surface-light p-6 shadow-sm ring-1 ring-border-light dark:bg-surface-dark dark:ring-border-dark transition-shadow hover:shadow-md">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">{{ title }}</h3>
      <span :class="['material-symbols-outlined rounded-full p-1.5', iconBgClass, iconTextClass]">{{ icon }}</span>
    </div>
    <div class="flex items-baseline gap-2">
      <span class="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">{{ amount }}</span>
    </div>
    <div class="mt-4 flex items-center gap-2">
      <span :class="['flex items-center text-sm font-medium', isPositive ? 'text-success' : 'text-danger']">
        <span class="material-symbols-outlined -ml-1 text-base">{{ isPositive ? 'trending_up' : 'trending_down' }}</span>
        {{ trend }}
      </span>
      <span class="text-sm text-text-secondary-light dark:text-text-secondary-dark">{{ trendText }}</span>
    </div>
  </div>
</template>
