import { sequence } from '@sveltejs/kit/hooks';

// Configure CSRF protection to allow same-origin form submissions
export const handle = sequence(
	async ({ event, resolve }) => {
		// Disable CSRF protection for development
		if (event.url.pathname.startsWith('/admin')) {
			return resolve(event, {
				transformPageChunk: ({ html }) => html
			});
		}
		
		return resolve(event);
	}
);
