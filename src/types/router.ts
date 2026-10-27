import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    heading?: string;
    crumb?: string;
    private?: boolean;
    publicOnly?: boolean;
  }
}
