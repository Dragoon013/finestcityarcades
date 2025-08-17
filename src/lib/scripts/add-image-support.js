import { sql } from '@vercel/postgres';

export async function addImageSupport() {
	try {
		console.log('Adding image support to database...');
		
		// Create location_images table for multiple images per location
		await sql`
			CREATE TABLE IF NOT EXISTS location_images (
				id SERIAL PRIMARY KEY,
				location_id INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
				image_url VARCHAR(500) NOT NULL,
				image_name VARCHAR(255),
				display_order INTEGER DEFAULT 0,
				created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
			);
		`;
		console.log('Created location_images table');
		
		// Add index for better performance
		await sql`CREATE INDEX IF NOT EXISTS idx_location_images_location ON location_images(location_id);`;
		await sql`CREATE INDEX IF NOT EXISTS idx_location_images_order ON location_images(location_id, display_order);`;
		
		// Check if machines table needs image_url column (to replace the old image column)
		const { rows: machineColumns } = await sql`
			SELECT column_name 
			FROM information_schema.columns 
			WHERE table_name = 'machines' 
			AND table_schema = 'public'
		`;
		
		const columnNames = machineColumns.map(col => col.column_name);
		
		// If we don't have image_url column, add it
		if (!columnNames.includes('image_url')) {
			await sql`ALTER TABLE machines ADD COLUMN image_url VARCHAR(500)`;
			console.log('Added image_url column to machines table');
			
			// Copy existing image data to image_url if it exists
			if (columnNames.includes('image')) {
				await sql`UPDATE machines SET image_url = image WHERE image IS NOT NULL`;
				console.log('Migrated existing image data to image_url column');
			}
		}
		
		console.log('Image support added successfully!');
		return true;
	} catch (error) {
		console.error('Error adding image support:', error);
		throw error;
	}
}
