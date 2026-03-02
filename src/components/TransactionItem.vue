<script setup>
defineProps({
  title: String,
  subtitle: String,
  amount: String,
  amountClass: {
    type: String,
    default: 'text-text-primary-light dark:text-text-primary-dark'
  },
  method: String,
  icon: String,
  iconBgClass: String,
  iconTextClass: String
})
</script>

<template>
  <div class="group flex flex-col gap-4 px-6 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 sm:flex-row sm:items-center sm:justify-between">
    <div class="flex items-center gap-4">
      <div :class="['flex h-12 w-12 shrink-0 items-center justify-center rounded-full', iconBgClass, iconTextClass]">
        <span class="material-symbols-outlined">{{ icon }}</span>
      </div>
      <div>
        <p class="font-medium text-text-primary-light dark:text-text-primary-dark">{{ title }}</p>
        <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark">{{ subtitle }}</p>
      </div>
    </div>
    <div class="text-right">
      <p :class="['font-bold', amountClass]">{{ amount }}</p>
      <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark">{{ method }}</p>
    </div>
  </div>
</template>
