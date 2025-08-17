import { createAdminUser } from './auth.js';
import { initializeDatabase, seedInitialData } from './db/schema.js';

async function setupAdmin() {
	try {
		console.log('Initializing database...');
		await initializeDatabase();
		await seedInitialData();
		
		console.log('Creating admin user...');
		const admin = await createAdminUser('admin', 'admin@finestcityarcades.com', 'admin123');
		console.log('Admin user created:', admin);
		
		console.log('Setup complete!');
		console.log('You can now login with:');
		console.log('Username: admin');
		console.log('Password: admin123');
		
	} catch (error) {
		if (error.message.includes('already exists')) {
			console.log('Admin user already exists');
		} else {
			console.error('Setup error:', error);
		}
	}
}

setupAdmin();
