import { config } from 'dotenv';
import { fixLocationsTable } from './src/lib/fix-locations-table.js';

// Load environment variables
config();

async function main() {
	try {
		console.log('Starting location table fix...');
		await fixLocationsTable();
		console.log('Location table fix completed successfully!');
		process.exit(0);
	} catch (error) {
		console.error('Failed to fix location table:', error);
		process.exit(1);
	}
}

main();
