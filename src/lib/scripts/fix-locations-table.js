import { sql } from '@vercel/postgres';

export async function fixLocationsTable() {
	try {
		console.log('Fixing locations table...');
		
		// First, get any existing locations data to preserve it
		let existingLocations = [];
		try {
			const { rows } = await sql`SELECT * FROM locations`;
			existingLocations = rows;
			console.log(`Found ${existingLocations.length} existing locations to preserve`);
		} catch (error) {
			console.log('No existing locations table or data found');
		}
		
		// Drop the existing locations table
		await sql`DROP TABLE IF EXISTS locations CASCADE`;
		console.log('Dropped existing locations table');
		
		// Create new locations table with correct schema
		await sql`
			CREATE TABLE locations (
				id SERIAL PRIMARY KEY,
				name VARCHAR(255) NOT NULL,
				type VARCHAR(100),
				address TEXT,
				city VARCHAR(255),
				state VARCHAR(100),
				zip_code VARCHAR(20),
				contact_name VARCHAR(255),
				contact_phone VARCHAR(50),
				contact_email VARCHAR(255),
				revenue_split DECIMAL(5,2),
				notes TEXT,
				active BOOLEAN DEFAULT true,
				created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
			);
		`;
		console.log('Created new locations table with correct schema');
		
		// Restore existing data if any, mapping old column names to new ones
		for (const location of existingLocations) {
			await sql`
				INSERT INTO locations (
					id, name, type, address, city, state, zip_code, 
					contact_name, contact_phone, contact_email, 
					revenue_split, notes, active, created_at, updated_at
				)
				VALUES (
					${location.id}, 
					${location.name}, 
					${location.type || null},
					${location.address || null}, 
					${location.city || null},
					${location.state || null},
					${location.zip_code || null},
					${location.contact_name || location.contact_person || null}, 
					${location.contact_phone || null}, 
					${location.contact_email || null},
					${location.revenue_split || null},
					${location.notes || null},
					${location.active !== false}, 
					${location.created_at}, 
					${location.updated_at || location.created_at}
				)
			`;
		}
		
		// Reset sequence if we had existing data
		if (existingLocations.length > 0) {
			const maxId = Math.max(...existingLocations.map(l => l.id));
			await sql`SELECT setval('locations_id_seq', ${maxId})`;
			console.log(`Restored ${existingLocations.length} locations and reset sequence to ${maxId}`);
		}
		
		// Add some seed data if no locations exist
		if (existingLocations.length === 0) {
			await sql`
				INSERT INTO locations (name, type, address, city, state, zip_code, contact_name, contact_phone, contact_email, revenue_split)
				VALUES 
					('Main Warehouse', 'warehouse', '123 Storage St', 'San Diego', 'CA', '92101', 'John Manager', '555-0101', 'warehouse@finestcityarcades.com', 0),
					('Downtown Bar & Grill', 'bar', '456 Main St', 'San Diego', 'CA', '92102', 'Sarah Owner', '555-0102', 'sarah@downtownbar.com', 50),
					('Retro Gaming Lounge', 'arcade', '789 Arcade Ave', 'San Diego', 'CA', '92103', 'Mike Operator', '555-0103', 'mike@retrogaming.com', 60)
			`;
			console.log('Added seed locations');
		}
		
		console.log('Locations table fixed successfully!');
		return true;
	} catch (error) {
		console.error('Error fixing locations table:', error);
		throw error;
	}
}
