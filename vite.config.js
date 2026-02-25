import { defineConfig } from "vite";

export default defineConfig({
  base: "/sansuapp/",
  server: {
    host: true,
    port: 5173,
  },
});
