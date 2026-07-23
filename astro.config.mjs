import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://jsonformator.com',
  trailingSlash: 'never',
  output: 'static',
  integrations: [
    react()
  ],
  vite: {
    worker: {
      format: 'es'
    }
  }
});
