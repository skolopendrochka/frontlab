<template>
  <q-item class="q-py-md rounded-borders q-mb-sm bg-white" :class="{ 'opacity-60': item.done }">
    <q-item-section avatar>
      <q-checkbox :model-value="item.done" color="primary" @update:model-value="emit('toggle', item.id)" />
    </q-item-section>
    <q-item-section>
      <q-item-label :class="{ 'text-strike text-grey-6': item.done }">{{ item.title }}</q-item-label>
      <q-item-label caption>
        {{ dueLabel }}
      </q-item-label>
    </q-item-section>
    <q-item-section side>
      <q-btn
        flat
        round
        dense
        icon="close"
        color="negative"
        aria-label="Убрать"
        @click="emit('remove', item.id)"
      />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CheckItem } from 'src/types/task';

const props = defineProps<{
  item: CheckItem;
}>();

const emit = defineEmits<{
  toggle: [id: number];
  remove: [id: number];
}>();

const dueLabel = computed(() => {
  if (!props.item.dueAt) return 'Без срока';
  return `Срок: ${new Date(props.item.dueAt).toLocaleDateString('ru-RU')}`;
});
</script>
