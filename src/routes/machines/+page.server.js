import { createPool } from '@vercel/postgres';
import { sql } from '@vercel/postgres';

async function initialize() {
	const createTable = await sql`
    CREATE TABLE IF NOT EXISTS machines (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      status VARCHAR (255) NOT NULL,
      tags text[],
      image VARCHAR(255),
      total_plays int,
      purchase_date date,
      purchase_amount money,
      sell_date date,
      sell_amount money,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    `;

	console.log(`Created "machines" table`);

	const machines = await Promise.all([
		sql`
          INSERT INTO machines (name, status, tags, image)
          VALUES ('Deadpool Pro', 'Ready', '{"marvel", "modern", "ss", "pinball"}','https://imgproxy.pinside.com/enWY9KQpheASrQM4Xz1bu_5Q4geuH5Bd0hQpOBMjq6U/rs:fit:2048/q:85/fn:Pinside_archive_2701_2882162/aHR0cHM6Ly9vLnBpbnNpZGUuY29tLzQvOWYvZGQvNDlmZGQ0MDRmZWNkNDY4NWViNDg1MjAxY2RiNWFhNjc5YzdiMjlkNS5qcGc')
          ;
      `,
		sql`
          INSERT INTO machines (name, status, tags, image)
          VALUES ('Full House', 'Maintenance', '{"wild-west", "em", "vintage", "pinball"}', 'https://imgproxy.pinside.com/03BANg9G4iIusYkvRO5eHTLice-nIgcErdRoNvH0Xxk/rs:fit:2048/q:85/fn:Pinside_archive_1608_1000487/aHR0cHM6Ly9vLnBpbnNpZGUuY29tL2QvNTAvM2EvZDUwM2ExMGE1ZjIwZjRiMTI2NGQyOTZmNzk3OGI5NzM2ZTUxMTViMy5qcGc')
          ;
      `
	]);
	console.log(`Seeded ${machines.length} machines`);

	return {
		createTable,
		machines
	};
}

export async function load() {
	const db = createPool();
	const startTime = Date.now();

	try {
		const { rows: machines } = await db.query('SELECT * FROM machines');
		const duration = Date.now() - startTime;
		return {
			machines: machines,
			duration: duration
		};
	} catch (error) {
		if (error?.message === `relation "machines" does not exist`) {
			console.log('Table does not exist, creating and seeding it with dummy data now...');
			// Table is not created yet
			await initialize();
			const { rows: machines } = await db.query('SELECT * FROM machines');
			const duration = Date.now() - startTime;
			return {
				machines: machines,
				duration: duration
			};
		} else {
			throw error;
		}
	}
}
