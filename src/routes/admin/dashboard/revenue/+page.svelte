<script>
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import RevenueChart from '$lib/RevenueChart.svelte';

	export let data;
	export let form;

	let selectedLocation = '';
	let selectedMonth = data.currentMonth;
	let machines = [];
	let loading = false;
	let activeTab = 'entry'; // 'entry', 'monthly', 'yearly'

	// Load machines when location or month changes
	async function loadMachines() {
		if (!selectedLocation || !selectedMonth) {
			machines = [];
			formValues = {}; // Clear form values when no location/month selected
			return;
		}

		loading = true;
		try {
			const response = await fetch('/admin/dashboard/revenue/machines', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					locationId: selectedLocation,
					revenueMonth: selectedMonth
				})
			});

			if (response.ok) {
				const result = await response.json();
				machines = result.machines || [];
				// Clear form values when machines change to prevent stale data
				formValues = {};
			} else {
				console.error('HTTP error:', response.status, response.statusText);
				machines = [];
				formValues = {};
			}
		} catch (error) {
			console.error('Error loading machines:', error);
			machines = [];
			formValues = {};
		} finally {
			loading = false;
		}
	}

	function formatCurrency(amount) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount || 0);
	}

	function formatMonth(monthStr) {
		return new Date(monthStr + '-01').toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long'
		});
	}

	// Store form values reactively
	let formValues = {};

	// Calculate totals for current form
	$: totalRevenue = machines.reduce((sum, machine) => {
		return sum + (parseFloat(formValues[`machine_${machine.id}_revenue`] || machine.current_revenue) || 0);
	}, 0);

	$: totalFCAAmount = machines.reduce((sum, machine) => {
		return sum + (parseFloat(formValues[`machine_${machine.id}_fca`] || machine.current_fca) || 0);
	}, 0);

	$: totalLocationAmount = machines.reduce((sum, machine) => {
		return sum + (parseFloat(formValues[`machine_${machine.id}_location`] || machine.current_location_amount) || 0);
	}, 0);

	// Auto-calculate revenue splits when total revenue changes
	function calculateRevenueSplits(machineId, newRevenueValue) {
		const machine = machines.find(m => m.id === machineId);

		if (newRevenueValue > 0 && machine?.revenue_split) {
			const fcaAmount = (newRevenueValue * machine.revenue_split / 100);
			const locationAmount = newRevenueValue - fcaAmount;

			formValues[`machine_${machineId}_fca`] = fcaAmount.toFixed(2);
			formValues[`machine_${machineId}_location`] = locationAmount.toFixed(2);
		}
	}

	// Handle revenue input changes
	function handleRevenueChange(event, machineId) {
		const value = event.target.value;
		formValues[`machine_${machineId}_revenue`] = value;
		calculateRevenueSplits(machineId, parseFloat(value) || 0);
	}

	// Handle manual split adjustments
	function handleSplitChange(event, machineId, field) {
		const value = event.target.value;
		formValues[`machine_${machineId}_${field}`] = value;

		// Update total revenue if splits change
		const fcaAmount = parseFloat(formValues[`machine_${machineId}_fca`] || 0);
		const locationAmount = parseFloat(formValues[`machine_${machineId}_location`] || 0);
		const totalSplit = fcaAmount + locationAmount;

		if (totalSplit !== parseFloat(formValues[`machine_${machineId}_revenue`] || 0)) {
			formValues[`machine_${machineId}_revenue`] = totalSplit.toFixed(2);
		}
	}

	// Handle input changes for all fields
	function handleInputChange(event, machineId, field) {
		formValues[`machine_${machineId}_${field}`] = event.target.value;
	}
</script>

<svelte:head>
	<title>Revenue Management - Admin Dashboard</title>
</svelte:head>

<div class="px-4 py-6 sm:px-0">
	<div class="mb-6">
		<h1 class="text-2xl font-bold text-gray-900">Revenue Management</h1>
		<p class="mt-1 text-sm text-gray-600">Track and analyze machine revenue across all locations</p>
	</div>

	{#if form?.error}
		<div class="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
			<div class="text-sm text-red-700">{form.error}</div>
		</div>
	{/if}

	{#if form?.success}
		<div class="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
			<div class="text-sm text-green-700">{form.message}</div>
		</div>
	{/if}

	<!-- Tab Navigation -->
	<div class="border-b border-gray-200 mb-6">
		<nav class="-mb-px flex space-x-8">
			<button
				class="py-2 px-1 border-b-2 font-medium text-sm {activeTab === 'entry' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
				on:click={() => activeTab = 'entry'}
			>
				Revenue Entry
			</button>
			<button
				class="py-2 px-1 border-b-2 font-medium text-sm {activeTab === 'monthly' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
				on:click={() => activeTab = 'monthly'}
			>
				Monthly View
			</button>
			<button
				class="py-2 px-1 border-b-2 font-medium text-sm {activeTab === 'yearly' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
				on:click={() => activeTab = 'yearly'}
			>
				Yearly Overview
			</button>
		</nav>
	</div>

	{#if activeTab === 'entry'}
		<!-- Revenue Entry Form -->
		<div class="bg-white shadow rounded-lg">
			<div class="px-4 py-5 sm:p-6">
				<h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Enter Revenue Data</h3>
				
				<!-- Location and Month Selection -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
					<div>
						<label for="location" class="block text-sm font-medium text-gray-700">Location</label>
						<select
							id="location"
							bind:value={selectedLocation}
							on:change={loadMachines}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
						>
							<option value="">Select a location...</option>
							{#each data.locations as location}
								<option value={location.id}>{location.name}</option>
							{/each}
						</select>
					</div>
					<div>
						<label for="month" class="block text-sm font-medium text-gray-700">Month</label>
						<input
							type="month"
							id="month"
							bind:value={selectedMonth}
							on:change={loadMachines}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
						/>
					</div>
				</div>

				{#if loading}
					<div class="text-center py-4">
						<div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
						<span class="ml-2 text-sm text-gray-600">Loading machines...</span>
					</div>
				{:else if machines.length > 0}
					<form method="POST" action="?/addRevenue" use:enhance>
						<input type="hidden" name="location_id" value={selectedLocation} />
						<input type="hidden" name="revenue_month" value={selectedMonth} />

						<div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
							<table class="min-w-full divide-y divide-gray-300">
								<thead class="bg-gray-50">
									<tr>
										<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Machine</th>
										<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Type</th>
										<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
										<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Revenue ($)</th>
										<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">FCA</th>
										<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{machines[0]?.contact_name || 'Location'}</th>
										<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Notes</th>
									</tr>
								</thead>
								<tbody class="bg-white divide-y divide-gray-200">
									{#each machines as machine}
										<tr>
											<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
												{machine.name}
											</td>
											<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												{machine.machine_type}
											</td>
											<td class="px-6 py-4 whitespace-nowrap">
												<input
													type="date"
													name="machine_{machine.id}_date"
													value={machine.current_date}
													class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
												/>
											</td>
											<td class="px-6 py-4 whitespace-nowrap">
												<input
													type="number"
													name="machine_{machine.id}_revenue"
													value={formValues[`machine_${machine.id}_revenue`] || machine.current_revenue}
													step="0.01"
													min="0"
													on:input={(e) => handleRevenueChange(e, machine.id)}
													class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
													placeholder="0.00"
												/>
											</td>
											<td class="px-6 py-4 whitespace-nowrap">
												<input
													type="number"
													name="machine_{machine.id}_fca"
													value={formValues[`machine_${machine.id}_fca`] || machine.current_fca}
													step="0.01"
													min="0"
													on:input={(e) => handleSplitChange(e, machine.id, 'fca')}
													class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
													placeholder="0.00"
												/>
											</td>
											<td class="px-6 py-4 whitespace-nowrap">
												<input
													type="number"
													name="machine_{machine.id}_location"
													value={formValues[`machine_${machine.id}_location`] || machine.current_location_amount}
													step="0.01"
													min="0"
													on:input={(e) => handleSplitChange(e, machine.id, 'location')}
													class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
													placeholder="0.00"
												/>
											</td>
											<td class="px-6 py-4 whitespace-nowrap">
												<input
													type="text"
													name="machine_{machine.id}_notes"
													value={formValues[`machine_${machine.id}_notes`] || machine.current_notes}
													on:input={(e) => handleInputChange(e, machine.id, 'notes')}
													class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
													placeholder="Optional notes..."
												/>
											</td>
										</tr>
									{/each}
								</tbody>
								<tfoot class="bg-gray-50">
									<tr>
										<td colspan="3" class="px-6 py-3 text-sm font-medium text-gray-900">Totals:</td>
										<td class="px-6 py-3 text-sm font-medium text-gray-900">{formatCurrency(totalRevenue)}</td>
										<td class="px-6 py-3 text-sm font-medium text-gray-900">{formatCurrency(totalFCAAmount)}</td>
										<td class="px-6 py-3 text-sm font-medium text-gray-900">{formatCurrency(totalLocationAmount)}</td>
										<td class="px-6 py-3"></td>
									</tr>
								</tfoot>
							</table>
						</div>

						<div class="mt-6 flex justify-end">
							<button
								type="submit"
								class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
							>
								Save Revenue Data
							</button>
						</div>
					</form>
				{:else if selectedLocation && selectedMonth}
					<div class="text-center py-8">
						<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
						</svg>
						<h3 class="mt-2 text-sm font-medium text-gray-900">No machines found</h3>
						<p class="mt-1 text-sm text-gray-500">No machines are currently deployed at this location.</p>
					</div>
				{:else}
					<div class="text-center py-8">
						<p class="text-sm text-gray-500">Select a location and month to begin entering revenue data.</p>
					</div>
				{/if}
			</div>
		</div>

	{:else if activeTab === 'monthly'}
		<!-- Monthly View -->
		<div class="bg-white shadow rounded-lg">
			<div class="px-4 py-5 sm:p-6">
				<h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Current Month Revenue</h3>
				
				{#if data.currentMonthRevenue.length > 0}
					<div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
						<table class="min-w-full divide-y divide-gray-300">
							<thead class="bg-gray-50">
								<tr>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Machine</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Location</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Revenue</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Plays</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Avg per Play</th>
								</tr>
							</thead>
							<tbody class="bg-white divide-y divide-gray-200">
								{#each data.currentMonthRevenue as entry}
									<tr>
										<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
											{entry.machine_name}
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{entry.location_name}
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{formatCurrency(entry.revenue_amount)}
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{entry.plays_count || 0}
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{entry.plays_count > 0 ? formatCurrency(entry.revenue_amount / entry.plays_count) : '-'}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else}
					<div class="text-center py-8">
						<p class="text-sm text-gray-500">No revenue data for the current month yet.</p>
					</div>
				{/if}
			</div>
		</div>

	{:else if activeTab === 'yearly'}
		<!-- Yearly Overview -->
		<div class="space-y-6">
			<!-- Top 5 Machines -->
			<div class="bg-white shadow rounded-lg">
				<div class="px-4 py-5 sm:p-6">
					<h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Top 5 Earning Machines This Year</h3>
					
					{#if data.topMachines.length > 0}
						<div class="space-y-3">
							{#each data.topMachines as machine, index}
								<div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
									<div class="flex items-center space-x-3">
										<div class="flex-shrink-0">
											<span class="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium">
												{index + 1}
											</span>
										</div>
										<div>
											<p class="text-sm font-medium text-gray-900">{machine.machine_name}</p>
											<p class="text-sm text-gray-500">{machine.location_name}</p>
										</div>
									</div>
									<div class="text-right">
										<p class="text-sm font-medium text-gray-900">{formatCurrency(machine.total_revenue)}</p>
										<p class="text-sm text-gray-500">{machine.total_plays || 0} plays</p>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-sm text-gray-500">No revenue data available for this year.</p>
					{/if}
				</div>
			</div>

			<!-- Location Performance -->
			<div class="bg-white shadow rounded-lg">
				<div class="px-4 py-5 sm:p-6">
					<h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Location Performance</h3>
					
					{#if data.locationSummary.length > 0}
						<div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
							<table class="min-w-full divide-y divide-gray-300">
								<thead class="bg-gray-50">
									<tr>
										<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Location</th>
										<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Machines</th>
										<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Total Revenue</th>
										<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Avg per Machine</th>
									</tr>
								</thead>
								<tbody class="bg-white divide-y divide-gray-200">
									{#each data.locationSummary as location}
										<tr>
											<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
												{location.location_name}
											</td>
											<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												{location.machine_count}
											</td>
											<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												{formatCurrency(location.total_revenue)}
											</td>
											<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												{formatCurrency(location.avg_revenue)}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{:else}
						<p class="text-sm text-gray-500">No location performance data available.</p>
					{/if}
				</div>
			</div>

			<!-- Monthly Trend Chart -->
			{#if data.yearlyRevenue.length > 0}
				<div class="bg-white shadow rounded-lg">
					<div class="px-4 py-5 sm:p-6">
						<RevenueChart 
							data={data.yearlyRevenue} 
							title="Monthly Revenue Trend" 
							type="bar" 
						/>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
