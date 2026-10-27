import { store } from 'quasar/wrappers';
import { createPinia } from 'pinia';

export default store(() => createPinia());

export { useIdentityStore } from './sessionStore';
export { usePaletteStore } from './lookStore';
export { useChecklistStore } from './taskStore';
