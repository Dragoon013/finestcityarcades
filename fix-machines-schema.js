import { sql } from '@vercel/postgres';
import { config } from 'dotenv';
import fs from 'fs';

// Load environment variables
config();

async function fixMachinesSchema() {
	try {
		console.log('Starting machines schema fix...');
	
		// Add the image_url column if it doesn't exist
		console.log('Adding image_url column...');
		try {
			await sql`ALTER TABLE machines ADD COLUMN image_url VARCHAR(500)`;
			console.log('Added image_url column successfully');
		} catch (error) {
			if (error.message.includes('already exists')) {
				console.log('image_url column already exists');
			} else {
				console.error('Error adding image_url column:', error);
				throw error;
			}
		}
		
		console.log('Schema fix completed successfully!');
		return true;
	} catch (error) {
		console.error('Error fixing machines schema:', error);
		throw error;
	}
}

async function main() {
	try {
		await fixMachinesSchema();
		console.log('All fixes completed successfully!');
		process.exit(0);
	} catch (error) {
		console.error('Failed to fix schema:', error);
		process.exit(1);
	}
}

main();
