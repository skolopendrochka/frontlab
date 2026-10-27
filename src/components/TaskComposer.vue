<template>
  <q-card flat bordered class="q-mb-lg">
    <q-card-section>
      <form class="row q-col-gutter-sm items-end" @submit.prevent="submit">
        <div class="col-12 col-md">
          <q-input
            v-model="title"
            outlined
            dense
            label="Новый пункт чек-листа"
            :error="!!issues.title"
            @blur="checkField('title', title)"
          />
          <HintLine :text="issues.title" />
        </div>
        <div class="col-12 col-sm-auto">
          <q-input v-model="dueAt" outlined dense type="date" label="Срок" style="min-width: 180px" />
        </div>
        <div class="col-auto">
          <q-btn
            type="submit"
            color="primary"
            unelevated
            icon="add_task"
            label="В список"
            :disable="!title.trim()"
            :loading="busy"
          />
        </div>
      </form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import HintLine from 'src/components/FieldHint.vue';
import { useFormSchema } from 'src/composables/useFormSchema';
import { newTaskSchema } from 'src/utils/schemas';
import { useChecklistStore } from 'src/stores/taskStore';
import { usePaletteStore } from 'src/stores/lookStore';

const list = useChecklistStore();
const palette = usePaletteStore();
const { busy } = storeToRefs(list);
const { issues, check, checkField, resetIssues } = useFormSchema(newTaskSchema);

const title = ref('');
const dueAt = ref('');

async function submit(): Promise<void> {
  resetIssues();
  if (!check({ title: title.value })) return;
  const result = await list.add({
    title: title.value,
    dueAt: dueAt.value || null,
  });
  if (result.ok) {
    title.value = '';
    dueAt.value = '';
    palette.pushToast({ tone: 'positive', text: 'Пункт добавлен в чек-лист' });
  }
}
</script>
