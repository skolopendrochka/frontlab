<template>
  <q-layout view="hHh lpr fFf" class="checkly-shell">
    <q-header class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>Checkly</q-toolbar-title>
        <q-tabs :model-value="tab" dense align="left" class="q-mr-md" indicator-color="secondary">
          <q-route-tab :to="{ name: 'home' }" name="home" icon="checklist" label="Список" />
          <q-route-tab :to="{ name: 'options' }" name="options" icon="tune" label="Параметры" />
        </q-tabs>
        <q-btn
          flat
          round
          :icon="palette.night ? 'wb_sunny' : 'nights_stay'"
          aria-label="Тема"
          @click="palette.flipMode"
        />
        <q-btn flat round icon="meeting_room" aria-label="Выход" @click="exit" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <div class="q-pa-lg" style="max-width: 860px; margin: 0 auto">
        <TrailNav />
        <router-view />
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import TrailNav from 'src/components/PathCrumbs.vue';
import { usePaletteStore } from 'src/stores/lookStore';
import { useIdentityStore } from 'src/stores/sessionStore';
import { useChecklistStore } from 'src/stores/taskStore';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const palette = usePaletteStore();
const identity = useIdentityStore();
const list = useChecklistStore();

const tab = computed(() => (route.name === 'options' ? 'options' : 'home'));

watch(
  () => palette.toast,
  (payload) => {
    if (!payload) return;
    $q.notify({
      type: payload.tone,
      message: payload.text,
      actions: payload.action
        ? [{ label: payload.action.caption, color: 'white', handler: payload.action.run }]
        : undefined,
    });
    palette.clearToast();
  },
);

function exit(): void {
  identity.leave();
  list.setMessage(null);
  void router.push({ name: 'auth' });
}
</script>
