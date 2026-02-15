import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// Vite configuration for localhost development
export default defineConfig(() => ({
  server: {
    host: "localhost",
    port: 5173,
    open: true, // Automatically open browser
  },
  plugins: [react()], // Streamlined for local development
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
