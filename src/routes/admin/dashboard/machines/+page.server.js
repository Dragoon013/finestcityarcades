import { sql } from '@vercel/postgres';
import { fail, redirect } from '@sveltejs/kit';

export async function load() {
	try {
		// Get all machines with location info
		const { rows: machines } = await sql`
			SELECT m.*, l.name as location_name
			FROM machines m
			LEFT JOIN locations l ON m.current_location_id = l.id
			ORDER BY m.created_at DESC
		`;

		// Get all locations for the form
		const { rows: locations } = await sql`
			SELECT id, name FROM locations WHERE active = true ORDER BY name
		`;

		return {
			machines,
			locations
		};
	} catch (error) {
		console.error('Error loading machines:', error);
		return {
			machines: [],
			locations: [],
			error: 'Failed to load machines'
		};
	}
}

export const actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name');
		const manufacturer = data.get('manufacturer');
		const year_manufactured = data.get('year_manufactured');
		const machine_type = data.get('machine_type') || 'pinball';
		const status = data.get('status') || 'available';
		const image = data.get('image');
		const description = data.get('description');
		const initial_cost = data.get('initial_cost');
		const purchase_date = data.get('purchase_date');
		const current_location_id = data.get('current_location_id');
		const visible_on_site = data.get('visible_on_site') === 'on';
		const featured = data.get('featured') === 'on';

		if (!name) {
			return fail(400, { error: 'Machine name is required' });
		}

		try {
			const { rows } = await sql`
				INSERT INTO machines (
					name, manufacturer, year_manufactured, machine_type, status, 
					image, description, initial_cost, purchase_date, current_location_id,
					visible_on_site, featured, location_start_date
				)
				VALUES (
					${name}, ${manufacturer}, ${year_manufactured || null}, ${machine_type}, ${status},
					${image}, ${description}, ${initial_cost || null}, ${purchase_date || null}, 
					${current_location_id || null}, ${visible_on_site}, ${featured},
					${current_location_id ? 'CURRENT_DATE' : null}
				)
				RETURNING id
			`;

			return { success: true, message: 'Machine created successfully' };
		} catch (error) {
			console.error('Error creating machine:', error);
			return fail(500, { error: 'Failed to create machine' });
		}
	},

	update: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id');
		const name = data.get('name');
		const manufacturer = data.get('manufacturer');
		const year_manufactured = data.get('year_manufactured');
		const machine_type = data.get('machine_type');
		const status = data.get('status');
		const image = data.get('image');
		const description = data.get('description');
		const initial_cost = data.get('initial_cost');
		const purchase_date = data.get('purchase_date');
		const current_location_id = data.get('current_location_id');
		const visible_on_site = data.get('visible_on_site') === 'on';
		const featured = data.get('featured') === 'on';

		if (!id || !name) {
			return fail(400, { error: 'Machine ID and name are required' });
		}

		try {
			// Check if location changed
			const { rows: currentMachine } = await sql`
				SELECT current_location_id FROM machines WHERE id = ${id}
			`;

			const locationChanged = currentMachine[0]?.current_location_id != current_location_id;

			await sql`
				UPDATE machines SET
					name = ${name},
					manufacturer = ${manufacturer},
					year_manufactured = ${year_manufactured || null},
					machine_type = ${machine_type},
					status = ${status},
					image = ${image},
					description = ${description},
					initial_cost = ${initial_cost || null},
					purchase_date = ${purchase_date || null},
					current_location_id = ${current_location_id || null},
					visible_on_site = ${visible_on_site},
					featured = ${featured},
					location_start_date = ${locationChanged && current_location_id ? 'CURRENT_DATE' : 'location_start_date'},
					updated_at = CURRENT_TIMESTAMP
				WHERE id = ${id}
			`;

			return { success: true, message: 'Machine updated successfully' };
		} catch (error) {
			console.error('Error updating machine:', error);
			return fail(500, { error: 'Failed to update machine' });
		}
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id');

		if (!id) {
			return fail(400, { error: 'Machine ID is required' });
		}

		try {
			await sql`DELETE FROM machines WHERE id = ${id}`;
			return { success: true, message: 'Machine deleted successfully' };
		} catch (error) {
			console.error('Error deleting machine:', error);
			return fail(500, { error: 'Failed to delete machine' });
		}
	}
};
