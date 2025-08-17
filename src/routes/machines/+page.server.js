import { sql } from '@vercel/postgres';
import { initializeDatabase } from '$lib/db/schema.js';

export async function load() {
	const startTime = Date.now();

	try {
		// Initialize database if needed
		await initializeDatabase();

		// Get machines that are visible on the public site
		const { rows: machines } = await sql`
			SELECT m.*, l.name as location_name
			FROM machines m
			LEFT JOIN locations l ON m.current_location_id = l.id
			WHERE m.visible_on_site = true
			ORDER BY m.display_order ASC, m.created_at DESC
		`;
		
		const duration = Date.now() - startTime;
		return {
			machines: machines,
			duration: duration
		};
	} catch (error) {
		console.error('Error loading machines:', error);
		const duration = Date.now() - startTime;
		return {
			machines: [],
			duration: duration,
			error: 'Failed to load machines'
		};
	}
}
