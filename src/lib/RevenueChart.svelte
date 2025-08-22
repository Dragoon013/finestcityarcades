<script>
	export let data = [];
	export let title = 'Revenue Chart';
	export let type = 'bar'; // 'bar' or 'line'

	let chartContainer;
	
	function formatCurrency(amount) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount || 0);
	}

	function formatMonth(monthStr) {
		return new Date(monthStr + '-01').toLocaleDateString('en-US', {
			month: 'short',
			year: 'numeric'
		});
	}

	// Calculate max value for scaling
	$: maxValue = Math.max(...data.map(d => d.value || d.total_revenue || 0));
	$: chartHeight = 200;
</script>

<div class="revenue-chart">
	<h4 class="text-lg font-medium text-gray-900 mb-4">{title}</h4>
	
	{#if data.length > 0}
		<div class="chart-container" bind:this={chartContainer}>
			{#if type === 'bar'}
				<!-- Bar Chart -->
				<div class="flex items-end justify-between h-48 bg-gray-50 p-4 rounded-lg">
					{#each data as item, index}
						{@const value = item.value || item.total_revenue || 0}
						{@const height = maxValue > 0 ? (value / maxValue) * chartHeight : 0}
						<div class="flex flex-col items-center flex-1 mx-1">
							<div class="text-xs text-gray-600 mb-1">
								{formatCurrency(value)}
							</div>
							<div 
								class="bg-indigo-500 rounded-t w-full min-h-[4px] transition-all duration-300"
								style="height: {height}px"
								title="{item.label || formatMonth(item.month)}: {formatCurrency(value)}"
							></div>
							<div class="text-xs text-gray-500 mt-2 text-center">
								{item.label || formatMonth(item.month?.toISOString?.()?.slice(0, 7) || item.month)}
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<!-- Line Chart (Simple) -->
				<div class="relative h-48 bg-gray-50 p-4 rounded-lg">
					<svg class="w-full h-full" viewBox="0 0 400 200">
						{#each data as item, index}
							{@const value = item.value || item.total_revenue || 0}
							{@const x = (index / (data.length - 1)) * 380 + 10}
							{@const y = maxValue > 0 ? 190 - ((value / maxValue) * 180) : 190}
							
							<!-- Data points -->
							<circle 
								cx={x} 
								cy={y} 
								r="4" 
								fill="#4f46e5"
								title="{item.label || formatMonth(item.month)}: {formatCurrency(value)}"
							/>
							
							<!-- Connect lines -->
							{#if index < data.length - 1}
								{@const nextValue = data[index + 1].value || data[index + 1].total_revenue || 0}
								{@const nextX = ((index + 1) / (data.length - 1)) * 380 + 10}
								{@const nextY = maxValue > 0 ? 190 - ((nextValue / maxValue) * 180) : 190}
								<line 
									x1={x} 
									y1={y} 
									x2={nextX} 
									y2={nextY} 
									stroke="#4f46e5" 
									stroke-width="2"
								/>
							{/if}
						{/each}
					</svg>
					
					<!-- Labels -->
					<div class="flex justify-between mt-2">
						{#each data as item}
							<div class="text-xs text-gray-500 text-center flex-1">
								{item.label || formatMonth(item.month?.toISOString?.()?.slice(0, 7) || item.month)}
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{:else}
		<div class="text-center py-8 bg-gray-50 rounded-lg">
			<p class="text-sm text-gray-500">No data available for chart</p>
		</div>
	{/if}
</div>

<style>
	.revenue-chart {
		@apply w-full;
	}
	
	.chart-container {
		@apply w-full;
	}
</style>
