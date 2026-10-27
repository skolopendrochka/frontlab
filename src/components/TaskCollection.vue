<template>
  <div>
    <q-banner v-if="items.length === 0" rounded class="bg-deep-purple-1 text-deep-purple-10">
      <template #avatar>
        <q-icon name="spa" />
      </template>
      {{ hint }}
    </q-banner>

    <div v-else>
      <CheckRow
        v-for="item in items"
        :key="item.id"
        :item="item"
        @toggle="emit('toggle', $event)"
        @remove="emit('remove', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import CheckRow from 'src/components/TaskCard.vue';
import type { CheckItem } from 'src/types/task';

withDefaults(
  defineProps<{
    items: CheckItem[];
    hint?: string;
  }>(),
  { hint: 'Пока пусто.' },
);

const emit = defineEmits<{
  toggle: [id: number];
  remove: [id: number];
}>();
</script>
