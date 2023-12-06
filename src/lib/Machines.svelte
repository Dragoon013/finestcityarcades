<script>
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

</script>

	<div class="flex items-center justify-between mb-4">
		<div class="space-y-1">
			<h2 class="text-xl font-semibold">Machines</h2>
			<p class="text-sm text-gray-500">
				Fetched {machines.length} machines in {duration ? duration : 'unknown'} ms
			</p>
		</div>
	</div>
	<div class="flex w-full">
		{#each machines as machine (machine.id)}

		<div class="card w-96 bg-base-100 shadow-xl">
			<figure><img src={machine.image} alt={machine.name} /></figure>
			<div class="card-body">
			  <h2 class="card-title">{machine.name}</h2>
			  <p>This is a description about a pinball machine</p>
			  <div class="card-actions justify-end">
				<button class="btn btn-primary">Reserve Now</button>
			  </div>
			</div>
		  </div>
		  <div class="divider divider-horizontal"></div>
		{/each}
	</div>

	<style>
	 .card-body{
		color: white;
	}
	</style>