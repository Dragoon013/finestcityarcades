import { sql } from '@vercel/postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function addNotesColumn() {
	try {
		// Check if notes column exists
		const { rows } = await sql`
			SELECT column_name 
			FROM information_schema.columns 
			WHERE table_name = 'machines' 
			AND column_name = 'notes'
		`;

		if (rows.length === 0) {
			// Add notes column if it doesn't exist
			await sql`
				ALTER TABLE machines 
				ADD COLUMN notes TEXT
			`;
			console.log('✅ Added notes column to machines table');
		} else {
			console.log('✅ Notes column already exists');
		}

		// Also check and add description column if missing
		const { rows: descRows } = await sql`
			SELECT column_name 
			FROM information_schema.columns 
			WHERE table_name = 'machines' 
			AND column_name = 'description'
		`;

		if (descRows.length === 0) {
			await sql`
				ALTER TABLE machines 
				ADD COLUMN description TEXT
			`;
			console.log('✅ Added description column to machines table');
		} else {
			console.log('✅ Description column already exists');
		}

		// Check and add display_order column if missing
		const { rows: orderRows } = await sql`
			SELECT column_name 
			FROM information_schema.columns 
			WHERE table_name = 'machines' 
			AND column_name = 'display_order'
		`;

		if (orderRows.length === 0) {
			await sql`
				ALTER TABLE machines 
				ADD COLUMN display_order INTEGER DEFAULT 0
			`;
			console.log('✅ Added display_order column to machines table');
		} else {
			console.log('✅ Display_order column already exists');
		}

		console.log('✅ Database schema update completed successfully');
	} catch (error) {
		console.error('❌ Error updating database schema:', error);
		throw error;
	}
}

// Run the migration
addNotesColumn().catch(console.error);
