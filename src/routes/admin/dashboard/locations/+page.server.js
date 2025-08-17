import { sql } from '@vercel/postgres';
import { fail } from '@sveltejs/kit';

export async function load() {
	try {
		// Get all locations with machine count
		const { rows: locations } = await sql`
			SELECT 
				l.*,
				COUNT(m.id) as machine_count
			FROM locations l
			LEFT JOIN machines m ON l.id = m.current_location_id
			GROUP BY l.id
			ORDER BY l.name
		`;

		return {
			locations
		};
	} catch (error) {
		console.error('Error loading locations:', error);
		return {
			locations: [],
			error: 'Failed to load locations'
		};
	}
}

export const actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name');
		const type = data.get('type');
		const address = data.get('address');
		const city = data.get('city');
		const state = data.get('state');
		const zip_code = data.get('zip_code');
		const contact_name = data.get('contact_name');
		const contact_phone = data.get('contact_phone');
		const contact_email = data.get('contact_email');
		const revenue_split = data.get('revenue_split');
		const notes = data.get('notes');
		const active = data.get('active') === 'on';

		if (!name || !type) {
			return fail(400, { error: 'Location name and type are required' });
		}

		try {
			await sql`
				INSERT INTO locations (
					name, type, address, city, state, zip_code,
					contact_name, contact_phone, contact_email,
					revenue_split, notes, active
				)
				VALUES (
					${name}, ${type}, ${address}, ${city}, ${state}, ${zip_code},
					${contact_name}, ${contact_phone}, ${contact_email},
					${revenue_split || null}, ${notes}, ${active}
				)
			`;

			return { success: true, message: 'Location created successfully' };
		} catch (error) {
			console.error('Error creating location:', error);
			return fail(500, { error: 'Failed to create location' });
		}
	},

	update: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id');
		const name = data.get('name');
		const type = data.get('type');
		const address = data.get('address');
		const city = data.get('city');
		const state = data.get('state');
		const zip_code = data.get('zip_code');
		const contact_name = data.get('contact_name');
		const contact_phone = data.get('contact_phone');
		const contact_email = data.get('contact_email');
		const revenue_split = data.get('revenue_split');
		const notes = data.get('notes');
		const active = data.get('active') === 'on';

		if (!id || !name || !type) {
			return fail(400, { error: 'Location ID, name, and type are required' });
		}

		try {
			await sql`
				UPDATE locations SET
					name = ${name},
					type = ${type},
					address = ${address},
					city = ${city},
					state = ${state},
					zip_code = ${zip_code},
					contact_name = ${contact_name},
					contact_phone = ${contact_phone},
					contact_email = ${contact_email},
					revenue_split = ${revenue_split || null},
					notes = ${notes},
					active = ${active},
					updated_at = CURRENT_TIMESTAMP
				WHERE id = ${id}
			`;

			return { success: true, message: 'Location updated successfully' };
		} catch (error) {
			console.error('Error updating location:', error);
			return fail(500, { error: 'Failed to update location' });
		}
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id');

		if (!id) {
			return fail(400, { error: 'Location ID is required' });
		}

		try {
			// First, remove this location from any machines that reference it
			await sql`
				UPDATE machines 
				SET current_location_id = NULL 
				WHERE current_location_id = ${id}
			`;

			// Then delete the location
			await sql`DELETE FROM locations WHERE id = ${id}`;
			
			return { success: true, message: 'Location deleted successfully' };
		} catch (error) {
			console.error('Error deleting location:', error);
			return fail(500, { error: 'Failed to delete location' });
		}
	}
};
