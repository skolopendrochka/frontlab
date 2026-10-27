<template>
  <q-breadcrumbs class="q-mb-md" gutter="sm" active-color="primary">
    <q-breadcrumbs-el icon="checklist" :to="{ name: 'home' }" label="Checkly" />
    <q-breadcrumbs-el
      v-for="item in trail"
      :key="item.label"
      :label="item.label"
      :to="item.to"
    />
  </q-breadcrumbs>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const trail = computed(() =>
  route.matched
    .filter((record) => record.meta.crumb)
    .map((record) => ({
      label: String(record.meta.crumb),
      to: record.path,
    })),
);
</script>
