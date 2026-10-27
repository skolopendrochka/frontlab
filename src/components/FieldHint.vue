<template>
  <p v-if="text" class="text-negative text-caption q-mt-xs q-mb-none" role="alert">
    {{ text }}
  </p>
</template>

<script setup lang="ts">
defineProps<{
  text?: string;
}>();
</script>
