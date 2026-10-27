export function bootTelemetry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  if (import.meta.env.DEV) {
    console.info('[telemetry] mock DSN attached');
  }
}

export function reportException(error: unknown, place?: string): void {
  if (import.meta.env.DEV) {
    console.error('[telemetry]', place ?? 'exception', error);
  }
}
