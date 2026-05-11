// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import unocss from '@unocss/astro';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), sitemap(), unocss()],
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Inter',
      cssVariable: '--font-inter',
      weights: ['300', '400', '500', '600', '700', '800', '900'],
    },
    {
      provider: fontProviders.google(),
      name: 'Noto Sans JP',
      cssVariable: '--font-noto-sans-jp',
      weights: ['400', '700'],
    },
  ],
});