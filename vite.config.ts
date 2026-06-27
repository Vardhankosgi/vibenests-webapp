import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  // Workaround for EPERM when Vite tries to write its temp/bundled config into node_modules.
  // Using a dedicated writable cache folder avoids the blocked .vite-temp path.
  cacheDir: 'tmp/vite-cache',
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'https://api.vibenests.in',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
