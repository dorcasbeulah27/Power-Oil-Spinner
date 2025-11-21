import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import EnvironmentPlugin from "vite-plugin-environment";

export default defineConfig({
  plugins: [
    react(),
    EnvironmentPlugin({
      VITE_API_BASE_URL: "https://poweroil-backend.onrender.com",
    }),
  ],

});
