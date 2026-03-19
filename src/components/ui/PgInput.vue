<template>
  <div class="flex flex-col gap-1 w-full">
    <label v-if="label" class="text-xs font-bold uppercase tracking-widest text-foreground">
      {{ label }}
    </label>
    <div class="relative flex items-center">
      <div v-if="$slots.icon" class="absolute left-3 text-mutedForeground">
        <slot name="icon" />
      </div>
      <input
        v-model="model"
        :type="type"
        :class="[
          'w-full bg-input text-foreground border-2 border-[#CBD5E1] rounded-lg px-4 py-3 placeholder:text-mutedForeground transition-all duration-200 focus:outline-none focus:border-accent focus:shadow-[4px_4px_0px_0px_#8B5CF6]',
          $slots.icon ? 'pl-10' : '',
          $attrs.class
        ]"
        v-bind="$attrs"
      />
    </div>
    <p v-if="error" class="text-sm font-medium text-danger mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
const model = defineModel()
defineProps({
  label: String,
  type: {
    type: String,
    default: 'text'
  },
  error: String
})
</script>
