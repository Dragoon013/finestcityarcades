import { sql } from '@vercel/postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function addSaleColumns() {
	try {
		console.log('Adding sale_date and sale_amount columns to machines table...');

		// Check if columns already exist
		const { rows: columns } = await sql`
			SELECT column_name 
			FROM information_schema.columns 
			WHERE table_name = 'machines' 
			AND table_schema = 'public'
			AND column_name IN ('sale_date', 'sale_amount');
		`;

		const existingColumns = columns.map(row => row.column_name);
		
		// Add sale_date column if it doesn't exist
		if (!existingColumns.includes('sale_date')) {
			await sql`
				ALTER TABLE machines 
				ADD COLUMN sale_date DATE;
			`;
			console.log('✓ Added sale_date column');
		} else {
			console.log('✓ sale_date column already exists');
		}

		// Add sale_amount column if it doesn't exist
		if (!existingColumns.includes('sale_amount')) {
			await sql`
				ALTER TABLE machines 
				ADD COLUMN sale_amount DECIMAL(10,2);
			`;
			console.log('✓ Added sale_amount column');
		} else {
			console.log('✓ sale_amount column already exists');
		}

		// Verify the columns were added
		const { rows: finalColumns } = await sql`
			SELECT column_name, data_type, is_nullable
			FROM information_schema.columns 
			WHERE table_name = 'machines' 
			AND table_schema = 'public'
			AND column_name IN ('sale_date', 'sale_amount')
			ORDER BY column_name;
		`;

		console.log('\nFinal column status:');
		finalColumns.forEach(col => {
			console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
		});

		console.log('\n✅ Sale columns migration completed successfully!');
		
	} catch (error) {
		console.error('❌ Error adding sale columns:', error);
		throw error;
	}
}

// Run the migration
addSaleColumns()
	.then(() => {
		console.log('Migration script finished');
		process.exit(0);
	})
	.catch((error) => {
		console.error('Migration failed:', error);
		process.exit(1);
	});
