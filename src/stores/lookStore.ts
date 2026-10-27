import { acceptHMRUpdate, defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { Dark } from 'quasar';
import { usePersist } from 'src/composables/usePersist';
import type { ColorMode, LookSnapshot, ToastPayload } from 'src/types/look';

const KEY = 'checkly-palette';

const empty: LookSnapshot = {
  mode: 'day',
  menuOpen: true,
};

export const usePaletteStore = defineStore('palette', () => {
  const snapshot = usePersist<LookSnapshot>(KEY, empty);
  const toast = ref<ToastPayload | null>(null);

  const mode = computed(() => snapshot.value.mode);
  const night = computed(() => snapshot.value.mode === 'night');

  function applyMode(next: ColorMode): void {
    snapshot.value = { ...snapshot.value, mode: next };
    Dark.set(next === 'night');
  }

  function flipMode(): void {
    applyMode(snapshot.value.mode === 'night' ? 'day' : 'night');
  }

  function pushToast(payload: ToastPayload): void {
    toast.value = payload;
  }

  function clearToast(): void {
    toast.value = null;
  }

  applyMode(snapshot.value.mode);

  return { mode, night, toast, applyMode, flipMode, pushToast, clearToast };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePaletteStore, import.meta.hot));
}
