import { sql } from '@vercel/postgres';
import { fail, redirect } from '@sveltejs/kit';
import { uploadImage, deleteImage } from '$lib/imageUpload.js';

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
		const imageFile = data.get('image');
		const description = data.get('description');
		const initial_cost = data.get('initial_cost');
		const purchase_date = data.get('purchase_date');
		const current_location_id = data.get('current_location_id');
		const visible_on_site = data.get('visible_on_site') === 'on';
		const display_order = data.get('display_order');
		const notes = data.get('notes');

		if (!name) {
			return fail(400, { error: 'Machine name is required' });
		}

		try {
			// First create the machine to get an ID
			const { rows } = await sql`
				INSERT INTO machines (
					name, manufacturer, year_manufactured, machine_type, status, 
					description, initial_cost, purchase_date, current_location_id,
					visible_on_site, display_order, notes, location_start_date
				)
				VALUES (
					${name}, ${manufacturer}, ${year_manufactured || null}, ${machine_type}, ${status},
					${description}, ${initial_cost || null}, ${purchase_date || null}, 
					${current_location_id || null}, ${visible_on_site}, ${display_order || 0}, ${notes},
					${current_location_id ? new Date().toISOString().split('T')[0] : null}
				)
				RETURNING id
			`;

			const machineId = rows[0].id;
			let imageUrl = null;

			// Handle image upload if provided
			if (imageFile && imageFile instanceof File && imageFile.size > 0) {
				try {
					imageUrl = await uploadImage(imageFile, 'machines', machineId);
					
					// Update the machine with the image URL
					await sql`
						UPDATE machines 
						SET image_url = ${imageUrl}
						WHERE id = ${machineId}
					`;
				} catch (imageError) {
					console.error('Error uploading image:', imageError);
					// Don't fail the entire operation if image upload fails
				}
			}

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
		const imageFile = data.get('image');
		const description = data.get('description');
		const initial_cost = data.get('initial_cost');
		const purchase_date = data.get('purchase_date');
		const current_location_id = data.get('current_location_id');
		const visible_on_site = data.get('visible_on_site') === 'on';
		const display_order = data.get('display_order');
		const notes = data.get('notes');

		console.log('Update request data:', {
			id,
			name,
			imageFile: imageFile instanceof File ? `File: ${imageFile.name}` : imageFile,
			current_location_id
		});

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

			// Handle image upload if a new image is provided
			if (imageFile && imageFile instanceof File && imageFile.size > 0) {
				try {
					console.log('Uploading new image for machine:', id);
					// Delete old image if it exists
					if (imageUrl) {
						await deleteImage(imageUrl);
					}
					
					// Upload new image
					imageUrl = await uploadImage(imageFile, 'machines', id);
					console.log('Image uploaded successfully:', imageUrl);
				} catch (imageError) {
					console.error('Error handling image:', imageError);
					return fail(500, { error: `Image upload failed: ${imageError.message}` });
				}
			}

			console.log('Updating machine with data:', {
				name,
				manufacturer,
				machine_type,
				status,
				imageUrl,
				current_location_id
			});

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
					current_location_id = ${current_location_id || null},
					visible_on_site = ${visible_on_site},
					display_order = ${display_order || 0},
					notes = ${notes},
					location_start_date = ${locationChanged && current_location_id ? new Date().toISOString().split('T')[0] : currentLocationStartDate},
					updated_at = CURRENT_TIMESTAMP
				WHERE id = ${id}
			`;

			console.log('Machine updated successfully');
			return { success: true, message: 'Machine updated successfully' };
		} catch (error) {
			console.error('Error updating machine:', error);
			return fail(500, { error: `Failed to update machine: ${error.message}` });
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
