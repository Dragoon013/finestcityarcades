import { sql } from '@vercel/postgres';
import { fail, redirect } from '@sveltejs/kit';
import { deleteImage } from '$lib/imageUpload.js';

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
		const imageUrl = data.get('image_url'); // Now we receive the URL from client-side upload
		const description = data.get('description');
		const initial_cost = data.get('initial_cost');
		const purchase_date = data.get('purchase_date');
		const sale_date = data.get('sale_date');
		const sale_amount = data.get('sale_amount');
		const current_location_id = data.get('current_location_id');
		const visible_on_site = data.get('visible_on_site') === 'on';
		const display_order = data.get('display_order');
		const notes = data.get('notes');

		if (!name) {
			return fail(400, { error: 'Machine name is required' });
		}

		try {
			// Create the machine with the image URL
			await sql`
				INSERT INTO machines (
					name, manufacturer, year_manufactured, machine_type, status, 
					description, initial_cost, purchase_date, sale_date, sale_amount,
					current_location_id, visible_on_site, display_order, notes, 
					location_start_date, image_url
				)
				VALUES (
					${name}, ${manufacturer}, ${year_manufactured || null}, ${machine_type}, ${status},
					${description}, ${initial_cost || null}, ${purchase_date || null}, 
					${sale_date || null}, ${sale_amount || null},
					${current_location_id || null}, ${visible_on_site}, ${display_order || 0}, ${notes},
					${current_location_id ? new Date().toISOString().split('T')[0] : null}, ${imageUrl || null}
				)
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
		const newImageUrl = data.get('image_url'); // New image URL from client-side upload
		const description = data.get('description');
		const initial_cost = data.get('initial_cost');
		const purchase_date = data.get('purchase_date');
		const sale_date = data.get('sale_date');
		const sale_amount = data.get('sale_amount');
		const current_location_id = data.get('current_location_id');
		const visible_on_site = data.get('visible_on_site') === 'on';
		const display_order = data.get('display_order');
		const notes = data.get('notes');

		if (!id || !name) {
			return fail(400, { error: 'Machine ID and name are required' });
		}

		try {
			// Get current machine data including existing image and location_start_date
			const { rows: currentMachine } = await sql`
				SELECT current_location_id, image_url, location_start_date FROM machines WHERE id = ${id}
			`;

			if (currentMachine.length === 0) {
				return fail(404, { error: 'Machine not found' });
			}

			const locationChanged = currentMachine[0]?.current_location_id != current_location_id;
			let imageUrl = currentMachine[0]?.image_url;
			const currentLocationStartDate = currentMachine[0]?.location_start_date;

			// Handle new image URL if provided
			if (newImageUrl && newImageUrl !== imageUrl) {
				// Delete old image if it exists and is different
				if (imageUrl) {
					try {
						await deleteImage(imageUrl);
					} catch (deleteError) {
						console.error('Error deleting old image:', deleteError);
						// Don't fail the operation if old image cleanup fails
					}
				}
				imageUrl = newImageUrl;
			}

			await sql`
				UPDATE machines SET
					name = ${name},
					manufacturer = ${manufacturer},
					year_manufactured = ${year_manufactured || null},
					machine_type = ${machine_type},
					status = ${status},
					image_url = ${imageUrl},
					description = ${description},
					initial_cost = ${initial_cost || null},
					purchase_date = ${purchase_date || null},
					sale_date = ${sale_date || null},
					sale_amount = ${sale_amount || null},
					current_location_id = ${current_location_id || null},
					visible_on_site = ${visible_on_site},
					display_order = ${display_order || 0},
					notes = ${notes},
					location_start_date = ${locationChanged && current_location_id ? new Date().toISOString().split('T')[0] : currentLocationStartDate},
					updated_at = CURRENT_TIMESTAMP
				WHERE id = ${id}
			`;

			return { success: true, message: 'Machine updated successfully' };
		} catch (error) {
			console.error('Error updating machine:', error);
			const errorMessage = error instanceof Error ? error.message : 'Failed to update machine';
			return fail(500, { error: errorMessage });
		}
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id');

		if (!id) {
			return fail(400, { error: 'Machine ID is required' });
		}

		try {
			// Get machine data to clean up image
			const { rows: machine } = await sql`
				SELECT image_url FROM machines WHERE id = ${id}
			`;

			// Delete the machine
			await sql`DELETE FROM machines WHERE id = ${id}`;

			// Clean up image if it exists
			if (machine.length > 0 && machine[0].image_url) {
				try {
					await deleteImage(machine[0].image_url);
				} catch (imageError) {
					console.error('Error deleting image:', imageError);
					// Don't fail the operation if image cleanup fails
				}
			}

			return { success: true, message: 'Machine deleted successfully' };
		} catch (error) {
			console.error('Error deleting machine:', error);
			return fail(500, { error: 'Failed to delete machine' });
		}
	}
};
