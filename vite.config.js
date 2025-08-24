import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	server: {
		// Increase the body size limit for file uploads
		hmr: {
			clientPort: process.env.HMR_HOST ? 443 : 5173,
		}
	}
});
