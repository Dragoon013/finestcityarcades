import { vitePreprocess } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			runtime: 'nodejs20.x'
		}),
		csrf: {
			checkOrigin: false
		},
		// Increase body size limit for file uploads (20MB)
		bodySize: {
			max: 20 * 1024 * 1024
		}
	},

	preprocess: [vitePreprocess({})]
};

export default config;
