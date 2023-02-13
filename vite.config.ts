/// <reference types="vitest" />
/// <reference types="vite/client" />

import react from "@vitejs/plugin-react";
import { readFileSync } from "fs";
import { defineConfig, UserConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({command, mode}) => {
	const config: UserConfig = {
		plugins: [react()],
		build: {
			outDir: "./.local/vite-build",
			rollupOptions: {
				input: "./web-app/main.tsx",
				output: {
					// Remove hashes from file name so we have an easier time including them
					entryFileNames: "[name].js",
					assetFileNames: "[name][extname]",
				},
			}
		},
		test: {
			globals: true,
			environment: "jsdom",
			setupFiles: "./web-app/test/setup.ts",
			coverage: {
				provider: "c8",
				reportsDirectory: "./.local/coverage"
			}
		}
	};

	// Only read SSL related files if needed.
	if (command == "serve" && mode != "test") {
		config.server = {
			host: "127.0.0.1",
			https: {
				key: readFileSync("./.local/ssl.key"),
				cert: readFileSync("./.local/ssl.cer"),
			}
		};
	}

	return config;
});
