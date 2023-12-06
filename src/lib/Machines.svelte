<script>
	import ms from 'ms';
	/**
	 * @type {{id: string, name: string, status: string, image: string, createdAt: string}[]}
	 */
	export let machines;
	/**
	 * @type {number}
	 */
	export let duration;

	/**
	 * @param {string | number | Date} timestamp
	 * @param {undefined} [timeOnly]
	 */
	function timeAgo(timestamp, timeOnly) {
		if (!timestamp) return 'never';
		return `${ms(Date.now() - new Date(timestamp).getTime())}${timeOnly ? '' : ' ago'}`;
	}
	function refreshPage() {
		location.reload();
	}
</script>

<div
	class="w-full max-w-xl p-12 mx-auto rounded-lg shadow-xl dark:bg-white/10 bg-white/30 ring-1 ring-gray-900/5 backdrop-blur-lg"
>
	<div class="flex items-center justify-between mb-4">
		<div class="space-y-1">
			<h2 class="text-xl font-semibold">Machines</h2>
			<p class="text-sm text-gray-500">
				Fetched {machines.length} machines in {duration ? duration : 'unknown'} ms
			</p>
		</div>
		<button on:click={refreshPage}>Refresh Page</button>
	</div>
	<div class="divide-y divide-gray-900/5">
		{#each machines as machine (machine.id)}
			<div class="flex items-center justify-between py-3">
				<div class="flex items-center space-x-4">
					<img
						src={machine.image}
						alt={machine.name}
						width={48}
						height={48}
						class="rounded-full ring-1 ring-gray-900/5"
					/>
					<div class="space-y-1">
						<p class="font-medium leading-none">{machine.name}</p>
						<p class="text-sm text-gray-500">{machine.status}</p>
					</div>
				</div>
				<p class="text-sm text-gray-500">{timeAgo(machine.createdAt)}</p>
			</div>
		{/each}
	</div>
</div>