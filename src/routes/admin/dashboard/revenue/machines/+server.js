import { sql } from '@vercel/postgres';
import { json, error } from '@sveltejs/kit';

export async function POST({ request }) {
	try {
		const { locationId, revenueMonth } = await request.json();

		if (!locationId) {
			throw error(400, 'Location ID is required');
		}

		// Get machines at this location
		const { rows: machines } = await sql`
			SELECT 
				m.id,
				m.name,
				m.machine_type,
				COALESCE(mr.revenue_amount, 0) as current_revenue,
				COALESCE(mr.plays_count, 0) as current_plays,
				COALESCE(mr.notes, '') as current_notes
			FROM machines m
			LEFT JOIN machine_revenue mr ON (
				m.id = mr.machine_id 
				AND mr.location_id = ${locationId}
				AND DATE_TRUNC('month', mr.revenue_month) = DATE_TRUNC('month', ${revenueMonth + '-01'}::date)
			)
			WHERE m.current_location_id = ${locationId}
			ORDER BY m.name
		`;

		console.log(`Found ${machines.length} machines for location ${locationId}`);
		
		return json({
			locationId,
			month: revenueMonth,
			machineCount: machines.length,
			machines
		});
	} catch (err) {
		console.error('Error getting machines for location:', err);
		throw error(500, 'Failed to get machines for location');
	}
}
