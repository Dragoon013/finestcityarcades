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
		}
	},

	preprocess: [vitePreprocess({})]
};

export default config;
