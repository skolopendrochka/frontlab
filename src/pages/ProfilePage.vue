<template>
  <q-page>
    <div class="text-h5 q-mb-md">Параметры</div>

    <q-list bordered class="rounded-borders q-mb-md">
      <q-item>
        <q-item-section>
          <q-item-label>Профиль</q-item-label>
          <q-item-label v-if="account" caption>{{ account.name }} · {{ account.email }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-separator />
      <q-item>
        <q-item-section>
          <q-item-label>Тема</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle
            :model-value="night"
            label="Ночной режим"
            color="primary"
            @update:model-value="palette.applyMode($event ? 'night' : 'day')"
          />
        </q-item-section>
      </q-item>
      <q-separator />
      <q-item>
        <q-item-section>
          <q-item-label>Тосты</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle
            :model-value="prefs.toastEnabled"
            color="secondary"
            @update:model-value="identity.patchPrefs({ toastEnabled: $event })"
          />
        </q-item-section>
      </q-item>
    </q-list>

    <q-btn outline color="negative" icon="meeting_room" label="Выйти из аккаунта" @click="exit" />
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { usePaletteStore } from 'src/stores/lookStore';
import { useIdentityStore } from 'src/stores/sessionStore';

const router = useRouter();
const palette = usePaletteStore();
const identity = useIdentityStore();
const { account, prefs } = storeToRefs(identity);
const { night } = storeToRefs(palette);

function exit(): void {
  identity.leave();
  void router.push({ name: 'auth' });
}
</script>
