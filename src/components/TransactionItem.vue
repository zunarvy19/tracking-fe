<script setup>
defineProps({
  title: String,
  subtitle: String,
  amount: String,
  amountClass: {
    type: String,
    default: 'text-foreground'
  },
  method: String,
  icon: String,
  iconBgClass: String,
  iconTextClass: String
})
</script>

<template>
  <div class="group flex flex-col gap-4 px-6 py-4 transition-colors hover:bg-muted sm:flex-row sm:items-center sm:justify-between">
    <div class="flex items-center gap-4">
      <div :class="['flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-foreground pop-shadow-sm', iconBgClass, iconTextClass]">
        <span class="material-symbols-outlined text-foreground">{{ icon }}</span>
      </div>
      <div>
        <p class="font-extrabold text-foreground">{{ title }}</p>
        <p class="text-sm font-bold text-mutedForeground">{{ subtitle }}</p>
      </div>
    </div>
    <div class="text-right">
      <p :class="['font-extrabold text-lg', amountClass]">{{ amount }}</p>
      <p class="text-sm font-bold text-mutedForeground">{{ method }}</p>
    </div>
  </div>
</template>
