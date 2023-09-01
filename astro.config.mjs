import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  site: "https://astro-soundboard.vercel.app/",
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  redirects: {
    "/": "/boards/",
  },
  output: "server",
  adapter: vercel(),
  vite: {
    ssr: {
      noExternal: ["@uploadthing/react"],
    },
  },
});
