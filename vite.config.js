import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { uiAuthoringPlugin } from "./server/scenarioAuthoring.js";

const chatbotTarget = process.env.VITE_CHATBOT_TARGET || "http://127.0.0.1:8787";
const base = process.env.VITE_BASE_PATH || "/";

export default defineConfig({
  base,
  plugins: [react(), uiAuthoringPlugin()],
  server: {
    host: "0.0.0.0",
    port: 5174,
    strictPort: true,
    proxy: {
      "/chatbot": {
        target: chatbotTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/chatbot/, ""),
      },
    },
  },
});
