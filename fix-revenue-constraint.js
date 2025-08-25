import { sql } from '@vercel/postgres';
import 'dotenv/config';

/**
 * Fix the unique constraint on machine_revenue table
 * Change from (machine_id, location_id, revenue_month) to (machine_id, location_id, revenue_date)
 */
async function fixRevenueConstraint() {
	try {
		console.log('Fixing revenue constraint...');

		// First, check if the old constraint exists
		const { rows: constraints } = await sql`
			SELECT constraint_name 
			FROM information_schema.table_constraints 
			WHERE table_name = 'machine_revenue' 
			AND constraint_type = 'UNIQUE'
		`;

		console.log('Current constraints:', constraints);

		// Drop the old constraint if it exists
		if (constraints.length > 0) {
			const constraintName = constraints[0].constraint_name;
			console.log(`Dropping constraint: ${constraintName}`);
			
			// Since we know the exact constraint name, we can drop it directly
			await sql`ALTER TABLE machine_revenue DROP CONSTRAINT machine_revenue_machine_id_location_id_revenue_month_key`;
		}

		// Add the new constraint
		console.log('Adding new constraint on (machine_id, location_id, revenue_date)');
		await sql`
			ALTER TABLE machine_revenue 
			ADD CONSTRAINT machine_revenue_unique_entry 
			UNIQUE (machine_id, location_id, revenue_date)
		`;

		console.log('Revenue constraint fixed successfully');
		return { success: true };
	} catch (error) {
		console.error('Error fixing revenue constraint:', error);
		throw error;
	}
}

// Run fix if called directly
fixRevenueConstraint()
	.then(() => {
		console.log('Constraint fix completed successfully');
		process.exit(0);
	})
	.catch((error) => {
		console.error('Constraint fix failed:', error);
		process.exit(1);
	});
