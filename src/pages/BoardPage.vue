<template>
  <q-page>
    <div class="row items-center q-mb-md">
      <div>
        <div class="text-h5">Чек-лист</div>
        <div class="text-caption text-grey-7">Закрыто {{ list.progress }}% пунктов</div>
      </div>
      <q-space />
      <q-chip color="deep-purple-1" text-color="deep-purple-10">осталось {{ list.leftover }}</q-chip>
    </div>

    <q-linear-progress
      :value="list.progress / 100"
      color="secondary"
      track-color="deep-purple-1"
      class="q-mb-lg rounded-borders"
      size="10px"
    />

    <q-banner v-if="list.message" class="bg-red-1 text-negative q-mb-md" rounded>
      {{ list.message }}
    </q-banner>

    <NewEntryForm />

    <q-input v-model="query" outlined dense clearable class="q-mb-md" label="Поиск пункта">
      <template #prepend>
        <q-icon name="filter_alt" />
      </template>
    </q-input>

    <q-tabs
      v-model="filter"
      dense
      class="q-mb-md"
      active-color="primary"
      indicator-color="secondary"
      align="left"
    >
      <q-tab v-for="item in tabs" :key="item.name" :name="item.name" :label="item.label" />
    </q-tabs>

    <CheckPanel :items="visible" :hint="emptyHint" @toggle="onToggle" @remove="onRemove" />
  </q-page>
</template>

<script setup lang="ts">
import NewEntryForm from 'src/components/TaskComposer.vue';
import CheckPanel from 'src/components/TaskCollection.vue';
import { useCheckQuery } from 'src/composables/useTaskQuery';
import { useChecklistStore } from 'src/stores/taskStore';

const list = useChecklistStore();
const { filter, query, visible, emptyHint, tabs } = useCheckQuery();

function onToggle(id: number): void {
  void list.toggle(id);
}

function onRemove(id: number): void {
  void list.remove(id);
}
</script>
