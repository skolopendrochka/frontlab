import { configure } from 'quasar/wrappers';
import { fileURLToPath } from 'node:url';

function resolvePublicPath(): string {
  if (process.env.VITE_BASE_PATH) return process.env.VITE_BASE_PATH;
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
  return repo ? `/${repo}/` : '/';
}

export default configure(() => ({
  boot: ['http', 'errors'],
  css: ['app.scss'],
  extras: ['roboto-font', 'material-icons'],
  build: {
    vueRouterMode: 'hash',
    publicPath: resolvePublicPath(),
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    env: {
      API_URL: process.env.VITE_API_URL ?? '/api',
      SENTRY_DSN: process.env.VITE_SENTRY_DSN ?? '',
    },
    sourcemap: false,
    minify: 'esbuild',
  },
  devServer: {
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, ''),
      },
    },
  },
  framework: {
    config: {
      brand: {
        primary: '#6d28d9',
        secondary: '#f97316',
        accent: '#db2777',
        dark: '#1e1b4b',
      },
    },
    plugins: ['Notify', 'Dark', 'Dialog'],
  },
  animations: ['fadeIn', 'fadeOut'],
}));
