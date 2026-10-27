import { boot } from 'quasar/wrappers';
import { dumpFault } from 'src/utils/faults';
import { bootTelemetry } from 'src/utils/telemetry';

export default boot(() => {
  bootTelemetry();

  window.addEventListener('unhandledrejection', (event) => {
    dumpFault({ kind: 'transport', text: 'Необработанная ошибка' }, 'unhandledrejection');
    if (import.meta.env.DEV) {
      console.error(event.reason);
    }
  });

  window.addEventListener('error', (event) => {
    dumpFault({ kind: 'transport', text: event.message }, 'window.error');
  });
});
