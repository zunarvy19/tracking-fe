<template>
  <div
    :class="[
      'bg-card border-2 border-foreground rounded-xl shadow-solid-soft transition-transform duration-300 ease-bounce-pop',
      hoverEffect ? 'hover:-rotate-1 hover:scale-[1.02]' : '',
      $attrs.class
    ]"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script setup>
defineProps({
  hoverEffect: {
    type: Boolean,
    default: false
  }
})
</script>
