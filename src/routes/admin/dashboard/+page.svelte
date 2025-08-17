<script>
	export let data;
	
	function formatCurrency(amount) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount);
	}
	
	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString();
	}
</script>

<div class="px-4 py-6 sm:px-0">
	<div class="border-4 border-dashed border-gray-200 rounded-lg p-6">
		<h1 class="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
		
		{#if data.error}
			<div class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
				<div class="text-sm text-red-700">{data.error}</div>
			</div>
		{/if}

		<!-- Statistics Cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
			<!-- Total Machines -->
			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<div class="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
								<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
								</svg>
							</div>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Total Machines</dt>
								<dd class="text-lg font-medium text-gray-900">{data.stats.machines.total_machines}</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>

			<!-- Available Machines -->
			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<div class="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
								<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
								</svg>
							</div>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Available</dt>
								<dd class="text-lg font-medium text-gray-900">{data.stats.machines.available_machines}</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>

			<!-- Deployed Machines -->
			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<div class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
								<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
								</svg>
							</div>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Deployed</dt>
								<dd class="text-lg font-medium text-gray-900">{data.stats.machines.deployed_machines}</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>

			<!-- Monthly Revenue -->
			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<div class="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
								<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
								</svg>
							</div>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">This Month</dt>
								<dd class="text-lg font-medium text-gray-900">{formatCurrency(data.stats.revenue.current_month_revenue)}</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Recent Machines and Top Performers -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- Recent Machines -->
			<div class="bg-white shadow rounded-lg">
				<div class="px-4 py-5 sm:p-6">
					<h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Machines</h3>
					<div class="flow-root">
						<ul class="-my-5 divide-y divide-gray-200">
							{#each data.recentMachines as machine}
								<li class="py-4">
									<div class="flex items-center space-x-4">
										<div class="flex-shrink-0">
											{#if machine.image}
												<img class="h-8 w-8 rounded object-cover" src={machine.image} alt={machine.name} />
											{:else}
												<div class="h-8 w-8 rounded bg-gray-300 flex items-center justify-center">
													<svg class="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
													</svg>
												</div>
											{/if}
										</div>
										<div class="flex-1 min-w-0">
											<p class="text-sm font-medium text-gray-900 truncate">{machine.name}</p>
											<p class="text-sm text-gray-500 truncate">
												{machine.location_name || 'No location'} • {machine.status}
											</p>
										</div>
										<div class="flex-shrink-0 text-sm text-gray-500">
											{formatDate(machine.created_at)}
										</div>
									</div>
								</li>
							{:else}
								<li class="py-4 text-sm text-gray-500">No machines found</li>
							{/each}
						</ul>
					</div>
					<div class="mt-6">
						<a href="/admin/dashboard/machines" class="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
							View all machines
						</a>
					</div>
				</div>
			</div>

			<!-- Top Performing Machines -->
			<div class="bg-white shadow rounded-lg">
				<div class="px-4 py-5 sm:p-6">
					<h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Top Performers This Month</h3>
					<div class="flow-root">
						<ul class="-my-5 divide-y divide-gray-200">
							{#each data.topMachines as machine}
								<li class="py-4">
									<div class="flex items-center space-x-4">
										<div class="flex-1 min-w-0">
											<p class="text-sm font-medium text-gray-900 truncate">{machine.name}</p>
											<p class="text-sm text-gray-500 truncate">{machine.location_name}</p>
										</div>
										<div class="flex-shrink-0 text-sm font-medium text-green-600">
											{formatCurrency(machine.revenue_amount)}
										</div>
									</div>
								</li>
							{:else}
								<li class="py-4 text-sm text-gray-500">No revenue data for this month</li>
							{/each}
						</ul>
					</div>
					<div class="mt-6">
						<a href="/admin/dashboard/revenue" class="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
							View revenue details
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
