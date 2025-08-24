import { sql } from '@vercel/postgres';
import { json, error } from '@sveltejs/kit';

export async function POST({ request }) {
	try {
		const { locationId, revenueMonth } = await request.json();

		if (!locationId) {
			throw error(400, 'Location ID is required');
		}

		// Get machines at this location and location revenue split
		// Filter out machines that were sold before the selected month
		const { rows: machines } = await sql`
			SELECT
				m.id,
				m.name,
				m.machine_type,
				COALESCE(mr.revenue_date, ${revenueMonth + '-01'}) as current_date,
				COALESCE(mr.revenue_amount, 0) as current_revenue,
				COALESCE(mr.fca_amount, 0) as current_fca,
				COALESCE(mr.location_amount, 0) as current_location_amount,
				COALESCE(mr.notes, '') as current_notes,
				l.revenue_split,
				l.contact_name
			FROM machines m
			LEFT JOIN machine_revenue mr ON (
				m.id = mr.machine_id
				AND mr.location_id = ${locationId}
				AND DATE_TRUNC('month', mr.revenue_date) = DATE_TRUNC('month', ${revenueMonth + '-01'}::date)
			)
			JOIN locations l ON m.current_location_id = l.id
			WHERE m.current_location_id = ${locationId}
				AND (m.sale_date IS NULL OR m.sale_date >= ${revenueMonth + '-01'}::date)
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
