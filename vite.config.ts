/// <reference types="vitest" />
/// <reference types="vite/client" />

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	build: {
		outDir: "target/classes/static/",
		// https://vitejs.dev/guide/backend-integration.html
		rollupOptions: {
			input: "src/main/react/main.tsx",
			output: {
				// Remove hashes from file name so we have an easier time including them
				entryFileNames: "[name].js",
				assetFileNames: "[name][extname]",
			},
		},
		emptyOutDir: false,
	},
	server: {
		host: "127.0.0.1",
	},
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: "./src/main/react/test/setup.ts",
	},
});
