import { sql } from '@vercel/postgres';
import 'dotenv/config';
/**
 * Migration script to update revenue schema:
 * 1. Add specific date field for revenue entries
 * 2. Remove plays_count column
 * 3. Add FCA revenue split column
 * 4. Add location contact revenue split column
 */
export async function updateRevenueSchema() {
	try {
		console.log('Starting revenue schema update...');

		// Add new columns to machine_revenue table
		await sql`
			ALTER TABLE machine_revenue 
			ADD COLUMN IF NOT EXISTS revenue_date DATE,
			ADD COLUMN IF NOT EXISTS fca_amount DECIMAL(10,2) DEFAULT 0,
			ADD COLUMN IF NOT EXISTS location_amount DECIMAL(10,2) DEFAULT 0
		`;

		// Update existing records to use revenue_date (copy from revenue_month)
		await sql`
			UPDATE machine_revenue 
			SET revenue_date = revenue_month 
			WHERE revenue_date IS NULL
		`;

		// Make revenue_date NOT NULL after populating existing records
		await sql`
			ALTER TABLE machine_revenue 
			ALTER COLUMN revenue_date SET NOT NULL
		`;

		// Create index for better performance on revenue_date
		await sql`
			CREATE INDEX IF NOT EXISTS idx_revenue_date ON machine_revenue(revenue_date)
		`;

		// Update existing records to calculate splits based on location revenue_split
		await sql`
			UPDATE machine_revenue 
			SET 
				fca_amount = ROUND(revenue_amount * (l.revenue_split / 100), 2),
				location_amount = ROUND(revenue_amount * ((100 - l.revenue_split) / 100), 2)
			FROM locations l 
			WHERE machine_revenue.location_id = l.id 
			AND (machine_revenue.fca_amount = 0 OR machine_revenue.location_amount = 0)
			AND l.revenue_split IS NOT NULL
		`;

		console.log('Revenue schema updated successfully');
		return { success: true };
	} catch (error) {
		console.error('Error updating revenue schema:', error);
		throw error;
	}
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	updateRevenueSchema()
		.then(() => {
			console.log('Migration completed successfully');
			process.exit(0);
		})
		.catch((error) => {
			console.error('Migration failed:', error);
			process.exit(1);
		});
}
