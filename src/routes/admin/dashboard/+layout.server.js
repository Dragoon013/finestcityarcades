import { redirect } from '@sveltejs/kit';
import { getUserFromToken } from '$lib/auth.js';

export async function load({ cookies }) {
	const token = cookies.get('auth_token');
	
	console.log('Dashboard layout - checking auth token:', token ? 'present' : 'missing');
	
	if (!token) {
		console.log('No token found, redirecting to login');
		throw redirect(302, '/admin/login');
	}
	
	const user = await getUserFromToken(token);
	
	console.log('User from token:', user ? `${user.username} (${user.role})` : 'null');
	
	if (!user) {
		console.log('Invalid token, redirecting to login');
		throw redirect(302, '/admin/login');
	}
	
	return {
		user
	};
}
