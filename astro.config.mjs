import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: 'https://jsonformator.com',
  trailingSlash: 'never',
  output: "hybrid",

  integrations: [
    react()
  ],

  vite: {
    worker: {
      format: 'es'
    }
  },

  adapter: cloudflare()
});