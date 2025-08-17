import { sql } from '@vercel/postgres';
import { initializeDatabase } from '$lib/db/schema.js';

export async function load() {
	try {
		// Initialize database if needed
		await initializeDatabase();

		// Get dashboard statistics
		const [machinesStats, locationsStats, revenueStats] = await Promise.all([
			// Machine statistics
			sql`
				SELECT 
					COUNT(*) as total_machines,
					COUNT(CASE WHEN status = 'available' THEN 1 END) as available_machines,
					COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as maintenance_machines,
					COUNT(CASE WHEN status = 'deployed' THEN 1 END) as deployed_machines,
					COUNT(CASE WHEN visible_on_site = true THEN 1 END) as visible_machines
				FROM machines
			`,
			
			// Location statistics
			sql`
				SELECT 
					COUNT(*) as total_locations,
					COUNT(CASE WHEN active = true THEN 1 END) as active_locations
				FROM locations
			`,
			
			// Revenue statistics for current month
			sql`
				SELECT 
					COALESCE(SUM(revenue_amount), 0) as current_month_revenue,
					COUNT(DISTINCT machine_id) as revenue_generating_machines
				FROM machine_revenue 
				WHERE revenue_month = DATE_TRUNC('month', CURRENT_DATE)
			`
		]);

		// Get recent machines
		const { rows: recentMachines } = await sql`
			SELECT m.*, l.name as location_name
			FROM machines m
			LEFT JOIN locations l ON m.current_location_id = l.id
			ORDER BY m.created_at DESC
			LIMIT 5
		`;

		// Get top performing machines this month
		const { rows: topMachines } = await sql`
			SELECT m.name, mr.revenue_amount, l.name as location_name
			FROM machine_revenue mr
			JOIN machines m ON mr.machine_id = m.id
			JOIN locations l ON mr.location_id = l.id
			WHERE mr.revenue_month = DATE_TRUNC('month', CURRENT_DATE)
			ORDER BY mr.revenue_amount DESC
			LIMIT 5
		`;

		return {
			stats: {
				machines: machinesStats.rows[0],
				locations: locationsStats.rows[0],
				revenue: revenueStats.rows[0]
			},
			recentMachines,
			topMachines
		};
	} catch (error) {
		console.error('Dashboard load error:', error);
		return {
			stats: {
				machines: { total_machines: 0, available_machines: 0, maintenance_machines: 0, deployed_machines: 0, visible_machines: 0 },
				locations: { total_locations: 0, active_locations: 0 },
				revenue: { current_month_revenue: 0, revenue_generating_machines: 0 }
			},
			recentMachines: [],
			topMachines: [],
			error: 'Failed to load dashboard data'
		};
	}
}
