import { sql } from '@vercel/postgres';

export async function initializeDatabase() {
	try {
		// Create locations table
		await sql`
			CREATE TABLE IF NOT EXISTS locations (
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

		// Check if machines table exists and get its structure
		const { rows: tableExists } = await sql`
			SELECT EXISTS (
				SELECT FROM information_schema.tables 
				WHERE table_schema = 'public' 
				AND table_name = 'machines'
			);
		`;

		if (!tableExists[0].exists) {
			// Create new machines table
			await sql`
				CREATE TABLE machines (
					id SERIAL PRIMARY KEY,
					name VARCHAR(255) NOT NULL,
					manufacturer VARCHAR(255),
					year_manufactured INTEGER,
					machine_type VARCHAR(100) DEFAULT 'pinball',
					status VARCHAR(100) NOT NULL DEFAULT 'available',
					tags text[],
					image VARCHAR(500),
					description TEXT,
					
					-- Financial tracking
					initial_cost DECIMAL(10,2),
					purchase_date DATE,
					sale_date DATE,
					sale_amount DECIMAL(10,2),
					
					-- Current location
					current_location_id INTEGER REFERENCES locations(id),
					location_start_date DATE,
					
					-- Operational stats
					total_plays INTEGER DEFAULT 0,
					last_maintenance_date DATE,
					next_maintenance_due DATE,
					
					-- Display settings
					featured BOOLEAN DEFAULT false,
					display_order INTEGER DEFAULT 0,
					visible_on_site BOOLEAN DEFAULT true,
					
					created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
					updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
				);
			`;
		} else {
			// For existing table, let's backup data and recreate with new structure
			console.log('Backing up existing machines data...');
			
			// Get existing machines data
			const { rows: existingMachines } = await sql`SELECT * FROM machines`;
			
			// Drop the old table
			await sql`DROP TABLE IF EXISTS machines CASCADE`;
			
			// Create new table with full structure
			await sql`
				CREATE TABLE machines (
					id SERIAL PRIMARY KEY,
					name VARCHAR(255) NOT NULL,
					manufacturer VARCHAR(255),
					year_manufactured INTEGER,
					machine_type VARCHAR(100) DEFAULT 'pinball',
					status VARCHAR(100) NOT NULL DEFAULT 'available',
					tags text[],
					image VARCHAR(500),
					description TEXT,
					
					-- Financial tracking
					initial_cost DECIMAL(10,2),
					purchase_date DATE,
					sale_date DATE,
					sale_amount DECIMAL(10,2),
					
					-- Current location
					current_location_id INTEGER REFERENCES locations(id),
					location_start_date DATE,
					
					-- Operational stats
					total_plays INTEGER DEFAULT 0,
					last_maintenance_date DATE,
					next_maintenance_due DATE,
					
					-- Display settings
					featured BOOLEAN DEFAULT false,
					display_order INTEGER DEFAULT 0,
					visible_on_site BOOLEAN DEFAULT true,
					
					created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
					updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
				);
			`;
			
			// Restore existing data with new structure
			for (const machine of existingMachines) {
				await sql`
					INSERT INTO machines (
						id, name, status, tags, image, total_plays, purchase_date, 
						machine_type, visible_on_site, created_at
					)
					VALUES (
						${machine.id}, ${machine.name}, ${machine.status}, 
						${machine.tags || []}, ${machine.image}, ${machine.total_plays || 0}, 
						${machine.purchase_date}, 'pinball', true, ${machine.createdat || machine.created_at}
					)
				`;
			}
			
			// Reset sequence to continue from max ID
			if (existingMachines.length > 0) {
				const maxId = Math.max(...existingMachines.map(m => m.id));
				await sql`SELECT setval('machines_id_seq', ${maxId})`;
			}
			
			console.log(`Restored ${existingMachines.length} machines with new structure`);
		}

		// Create revenue tracking table
		await sql`
			CREATE TABLE IF NOT EXISTS machine_revenue (
				id SERIAL PRIMARY KEY,
				machine_id INTEGER NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
				location_id INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
				revenue_month DATE NOT NULL, -- First day of the month
				revenue_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
				plays_count INTEGER DEFAULT 0,
				notes TEXT,
				created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
				UNIQUE(machine_id, location_id, revenue_month)
			);
		`;

		// Create expenses tracking table
		await sql`
			CREATE TABLE IF NOT EXISTS machine_expenses (
				id SERIAL PRIMARY KEY,
				machine_id INTEGER NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
				expense_date DATE NOT NULL,
				expense_type VARCHAR(100) NOT NULL, -- 'maintenance', 'repair', 'transport', 'other'
				amount DECIMAL(10,2) NOT NULL,
				description TEXT,
				vendor VARCHAR(255),
				receipt_url VARCHAR(500),
				created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
			);
		`;

		// Create admin users table for authentication
		await sql`
			CREATE TABLE IF NOT EXISTS admin_users (
				id SERIAL PRIMARY KEY,
				username VARCHAR(100) UNIQUE NOT NULL,
				email VARCHAR(255) UNIQUE NOT NULL,
				password_hash VARCHAR(255) NOT NULL,
				role VARCHAR(50) DEFAULT 'admin',
				active BOOLEAN DEFAULT true,
				last_login TIMESTAMP WITH TIME ZONE,
				created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
			);
		`;

		// Create indexes for better performance
		await sql`CREATE INDEX IF NOT EXISTS idx_machines_location ON machines(current_location_id);`;
		await sql`CREATE INDEX IF NOT EXISTS idx_machines_status ON machines(status);`;
		await sql`CREATE INDEX IF NOT EXISTS idx_machines_visible ON machines(visible_on_site);`;
		await sql`CREATE INDEX IF NOT EXISTS idx_revenue_month ON machine_revenue(revenue_month);`;
		await sql`CREATE INDEX IF NOT EXISTS idx_revenue_machine ON machine_revenue(machine_id);`;
		await sql`CREATE INDEX IF NOT EXISTS idx_revenue_location ON machine_revenue(location_id);`;

		console.log('Database schema initialized successfully');
		return true;
	} catch (error) {
		console.error('Error initializing database:', error);
		throw error;
	}
}

export async function seedInitialData() {
	try {
		// Check if we already have locations
		const { rows: existingLocations } = await sql`SELECT COUNT(*) as count FROM locations`;
		
		if (existingLocations[0].count === '0') {
			// Seed initial locations
			await sql`
				INSERT INTO locations (name, type, address, city, state, zip_code, contact_name, contact_phone, contact_email, revenue_split)
				VALUES 
					('Main Warehouse', 'warehouse', '123 Storage St', 'San Diego', 'CA', '92101', 'John Manager', '555-0101', 'warehouse@finestcityarcades.com', 0),
					('Downtown Bar & Grill', 'bar', '456 Main St', 'San Diego', 'CA', '92102', 'Sarah Owner', '555-0102', 'sarah@downtownbar.com', 50),
					('Retro Gaming Lounge', 'arcade', '789 Arcade Ave', 'San Diego', 'CA', '92103', 'Mike Operator', '555-0103', 'mike@retrogaming.com', 60)
			`;
			console.log('Seeded initial locations');
		}

		// Check if we need to migrate existing machines
		const { rows: existingMachines } = await sql`
			SELECT COUNT(*) as count FROM machines WHERE current_location_id IS NULL
		`;
		
		if (existingMachines[0].count > '0') {
			// Get the warehouse location ID
			const { rows: warehouse } = await sql`
				SELECT id FROM locations WHERE name = 'Main Warehouse' LIMIT 1
			`;
			
			if (warehouse.length > 0) {
				// Update existing machines to be at warehouse
				await sql`
					UPDATE machines 
					SET current_location_id = ${warehouse[0].id},
						location_start_date = CURRENT_DATE,
						visible_on_site = true
					WHERE current_location_id IS NULL
				`;
				console.log('Updated existing machines with warehouse location');
			}
		}

		return true;
	} catch (error) {
		console.error('Error seeding initial data:', error);
		throw error;
	}
}
