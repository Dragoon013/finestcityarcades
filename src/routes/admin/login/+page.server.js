import { fail, redirect } from '@sveltejs/kit';
import { authenticateUser, generateToken, setAuthCookie } from '$lib/auth.js';

export const actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const username = data.get('username');
		const password = data.get('password');

		console.log('Login attempt for username:', username);

		if (!username || !password) {
			return fail(400, {
				error: 'Username and password are required',
				username
			});
		}

		try {
			const user = await authenticateUser(username, password);
			
			console.log('Authentication result:', user ? `Success for ${user.username}` : 'Failed');
			
			if (!user) {
				return fail(400, {
					error: 'Invalid username or password',
					username
				});
			}

			const token = generateToken(user);
			console.log('Generated token:', token ? 'Success' : 'Failed');
			
			setAuthCookie(cookies, token);
			console.log('Cookie set, redirecting to dashboard');

			throw redirect(302, '/admin/dashboard');
		} catch (error) {
			if (error.status === 302) {
				console.log('Redirect caught, re-throwing');
				throw error; // Re-throw redirect
			}
			
			console.error('Login error:', error);
			return fail(500, {
				error: 'An error occurred during login',
				username
			});
		}
	}
};
