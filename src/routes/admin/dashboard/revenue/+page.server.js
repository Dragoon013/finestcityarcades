import { sql } from '@vercel/postgres';
import { fail } from '@sveltejs/kit';

export async function load() {
	try {
		// Get all active locations
		const { rows: locations } = await sql`
			SELECT id, name FROM locations WHERE active = true ORDER BY name
		`;

		// Get current month and year
		const now = new Date();
		const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');

		// Get current month revenue data
		const { rows: currentMonthRevenue } = await sql`
			SELECT 
				mr.machine_id,
				mr.location_id,
				mr.revenue_amount,
				mr.plays_count,
				mr.notes,
				m.name as machine_name,
				l.name as location_name
			FROM machine_revenue mr
			JOIN machines m ON mr.machine_id = m.id
			JOIN locations l ON mr.location_id = l.id
			WHERE DATE_TRUNC('month', mr.revenue_month) = DATE_TRUNC('month', CURRENT_DATE)
			ORDER BY l.name, m.name
		`;

		// Get yearly revenue summary
		const { rows: yearlyRevenue } = await sql`
			SELECT 
				DATE_TRUNC('month', revenue_month) as month,
				SUM(revenue_amount) as total_revenue,
				SUM(plays_count) as total_plays
			FROM machine_revenue
			WHERE EXTRACT(YEAR FROM revenue_month) = EXTRACT(YEAR FROM CURRENT_DATE)
			GROUP BY DATE_TRUNC('month', revenue_month)
			ORDER BY month
		`;

		// Get top 5 machines for current year
		const { rows: topMachines } = await sql`
			SELECT 
				m.name as machine_name,
				l.name as location_name,
				SUM(mr.revenue_amount) as total_revenue,
				SUM(mr.plays_count) as total_plays
			FROM machine_revenue mr
			JOIN machines m ON mr.machine_id = m.id
			JOIN locations l ON mr.location_id = l.id
			WHERE EXTRACT(YEAR FROM mr.revenue_month) = EXTRACT(YEAR FROM CURRENT_DATE)
			GROUP BY m.id, m.name, l.name
			ORDER BY total_revenue DESC
			LIMIT 5
		`;

		// Get location performance summary
		const { rows: locationSummary } = await sql`
			SELECT 
				l.name as location_name,
				COUNT(DISTINCT mr.machine_id) as machine_count,
				SUM(mr.revenue_amount) as total_revenue,
				AVG(mr.revenue_amount) as avg_revenue
			FROM machine_revenue mr
			JOIN locations l ON mr.location_id = l.id
			WHERE EXTRACT(YEAR FROM mr.revenue_month) = EXTRACT(YEAR FROM CURRENT_DATE)
			GROUP BY l.id, l.name
			ORDER BY total_revenue DESC
		`;

		return {
			locations,
			currentMonth,
			currentMonthRevenue,
			yearlyRevenue,
			topMachines,
			locationSummary
		};
	} catch (error) {
		console.error('Error loading revenue data:', error);
		return {
			locations: [],
			currentMonth: '',
			currentMonthRevenue: [],
			yearlyRevenue: [],
			topMachines: [],
			locationSummary: [],
			error: 'Failed to load revenue data'
		};
	}
}

export const actions = {
	addRevenue: async ({ request }) => {
		const data = await request.formData();
		const locationId = data.get('location_id');
		const revenueMonth = data.get('revenue_month');
		const machineRevenues = [];

		// Parse machine revenue data from form
		for (const [key, value] of data.entries()) {
			if (key.startsWith('machine_') && key.endsWith('_revenue')) {
				const machineId = key.replace('machine_', '').replace('_revenue', '');
				const revenue = parseFloat(value) || 0;
				const plays = parseInt(data.get(`machine_${machineId}_plays`)) || 0;
				const notes = data.get(`machine_${machineId}_notes`) || '';

				if (revenue > 0) {
					machineRevenues.push({
						machineId: parseInt(machineId),
						revenue,
						plays,
						notes
					});
				}
			}
		}

		if (!locationId || !revenueMonth || machineRevenues.length === 0) {
			return fail(400, { error: 'Location, month, and at least one machine revenue entry are required' });
		}

		try {
			// Insert or update revenue records
			for (const machineRev of machineRevenues) {
				await sql`
					INSERT INTO machine_revenue (
						machine_id, location_id, revenue_month, revenue_amount, plays_count, notes
					)
					VALUES (
						${machineRev.machineId}, ${locationId}, ${revenueMonth + '-01'}, 
						${machineRev.revenue}, ${machineRev.plays}, ${machineRev.notes}
					)
					ON CONFLICT (machine_id, location_id, revenue_month)
					DO UPDATE SET
						revenue_amount = EXCLUDED.revenue_amount,
						plays_count = EXCLUDED.plays_count,
						notes = EXCLUDED.notes,
						updated_at = CURRENT_TIMESTAMP
				`;
			}

			return { success: true, message: `Revenue data saved for ${machineRevenues.length} machines` };
		} catch (error) {
			console.error('Error saving revenue data:', error);
			return fail(500, { error: 'Failed to save revenue data' });
		}
	},

};
