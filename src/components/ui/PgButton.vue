<template>
  <button
    :class="[
      'inline-flex items-center justify-center font-bold tracking-wide transition-all duration-300 ease-bounce-pop px-6 py-3',
      // Primary Candy Button
      variant === 'primary' 
        ? 'bg-accent text-white border-2 border-foreground rounded-full pop-shadow hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-y-0.5 active:translate-x-0.5' 
        : '',
      // Secondary Button
      variant === 'secondary'
        ? 'bg-transparent text-foreground border-2 border-foreground rounded-full hover:bg-tertiary hover:-translate-y-0.5 active:translate-y-px transition-transform'
        : '',
      // Ghost Button
      variant === 'ghost'
        ? 'bg-transparent text-foreground hover:bg-muted rounded-full'
        : '',
      // Sizes
      size === 'sm' ? 'text-sm px-4 py-2' : '',
      size === 'lg' ? 'text-lg px-8 py-4' : '',
      $attrs.class
    ]"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary' // 'primary' | 'secondary' | 'ghost'
  },
  size: {
    type: String,
    default: 'md' // 'sm' | 'md' | 'lg'
  }
})
</script>
