// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  
  integrations: [react(), sitemap(), icon()],

  fonts: [
    {
      provider: fontProviders.google(),
      name: "Newsreader",
      cssVariable: "--font-display",
      weights: ["300", "400", "500", "600", "700", "800", "900"],
    },
    {
      provider: fontProviders.google(),
      name: "Inter",
      cssVariable: "--font-body",
      weights: ["300", "400", "500", "600", "700", "800", "900"],
    },
    {
      provider: fontProviders.google(),
      name: "JetBrains Mono",
      cssVariable: "--font-body",
      weights: ["300", "400", "500", "600", "700", "800", "900"],
    },
    {
      provider: fontProviders.google(),
      name: "Kiwi Maru",
      cssVariable: "--font-jp",
      weights: ["400", "700"],
    },
  ],
});
