<script>
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	/** @type {import('./$types').PageData} */
	export let data;

	/** @type {import('./$types').ActionData} */
	export let form;

	let showAddForm = false;
	let editingMachine = null;
	let loading = false;

	function toggleAddForm() {
		showAddForm = !showAddForm;
		editingMachine = null;
	}

	function editMachine(machine) {
		editingMachine = machine;
		showAddForm = true;
	}

	function cancelEdit() {
		showAddForm = false;
		editingMachine = null;
	}
</script>

<svelte:head>
	<title>Machines - Finest City Arcades Admin</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<h1 class="text-2xl font-bold text-gray-900">Machine Management</h1>
		<button
			on:click={toggleAddForm}
			class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
		>
			{showAddForm ? 'Cancel' : 'Add New Machine'}
		</button>
	</div>

	{#if form?.error}
		<div class="rounded-md bg-red-50 p-4">
			<div class="text-sm text-red-700">{form.error}</div>
		</div>
	{/if}

	{#if form?.success}
		<div class="rounded-md bg-green-50 p-4">
			<div class="text-sm text-green-700">{form.success}</div>
		</div>
	{/if}

	<!-- Add/Edit Form -->
	{#if showAddForm}
		<div class="bg-white shadow rounded-lg p-6">
			<h2 class="text-lg font-medium text-gray-900 mb-4">
				{editingMachine ? 'Edit Machine' : 'Add New Machine'}
			</h2>
			
			<form 
				method="POST" 
				action={editingMachine ? '?/update' : '?/create'}
				use:enhance={() => {
					loading = true;
					return async ({ result, update }) => {
						loading = false;
						if (result.type === 'success') {
							showAddForm = false;
							editingMachine = null;
							await invalidateAll();
						}
						await update();
					};
				}}
				class="space-y-4"
			>
				{#if editingMachine}
					<input type="hidden" name="id" value={editingMachine.id} />
				{/if}

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="name" class="block text-sm font-medium text-gray-700">Machine Name</label>
						<input
							type="text"
							id="name"
							name="name"
							value={editingMachine?.name || ''}
							required
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
						/>
					</div>

					<div>
						<label for="machine_type" class="block text-sm font-medium text-gray-700">Type</label>
						<select
							id="machine_type"
							name="machine_type"
							value={editingMachine?.machine_type || ''}
							required
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
						>
							<option value="">Select Type</option>
							<option value="pinball">Pinball</option>
							<option value="arcade">Arcade</option>
							<option value="redemption">Redemption</option>
							<option value="crane">Crane</option>
							<option value="other">Other</option>
						</select>
					</div>

					<div>
						<label for="manufacturer" class="block text-sm font-medium text-gray-700">Manufacturer</label>
						<input
							type="text"
							id="manufacturer"
							name="manufacturer"
							value={editingMachine?.manufacturer || ''}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
						/>
					</div>

					<div>
						<label for="year_manufactured" class="block text-sm font-medium text-gray-700">Year</label>
						<input
							type="number"
							id="year_manufactured"
							name="year_manufactured"
							value={editingMachine?.year_manufactured || ''}
							min="1900"
							max="2030"
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
						/>
					</div>

					<div>
						<label for="initial_cost" class="block text-sm font-medium text-gray-700">Initial Cost ($)</label>
						<input
							type="number"
							id="initial_cost"
							name="initial_cost"
							value={editingMachine?.initial_cost || ''}
							step="0.01"
							min="0"
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
						/>
					</div>

					<div>
						<label for="purchase_date" class="block text-sm font-medium text-gray-700">Purchase Date</label>
						<input
							type="date"
							id="purchase_date"
							name="purchase_date"
							value={editingMachine?.purchase_date ? new Date(editingMachine.purchase_date).toISOString().split('T')[0] : ''}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
						/>
					</div>

					<div>
						<label for="current_location_id" class="block text-sm font-medium text-gray-700">Location</label>
						<select
							id="current_location_id"
							name="current_location_id"
							value={editingMachine?.current_location_id || ''}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
						>
							<option value="">Select Location</option>
							{#each data.locations as location}
								<option value={location.id}>{location.name}</option>
							{/each}
						</select>
					</div>

					<div>
						<label for="status" class="block text-sm font-medium text-gray-700">Status</label>
						<select
							id="status"
							name="status"
							value={editingMachine?.status || 'available'}
							required
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
						>
							<option value="available">Available</option>
							<option value="deployed">Deployed</option>
							<option value="maintenance">Maintenance</option>
							<option value="sold">Sold</option>
						</select>
					</div>
				</div>

				<div>
					<label for="notes" class="block text-sm font-medium text-gray-700">Notes</label>
					<textarea
						id="notes"
						name="notes"
						rows="3"
						value={editingMachine?.notes || ''}
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
					></textarea>
				</div>

				<div class="flex justify-end space-x-3">
					<button
						type="button"
						on:click={cancelEdit}
						class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={loading}
						class="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md text-sm font-medium disabled:opacity-50"
					>
						{loading ? 'Saving...' : (editingMachine ? 'Update Machine' : 'Add Machine')}
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Machines Table -->
	<div class="bg-white shadow rounded-lg overflow-hidden">
		<div class="px-4 py-5 sm:p-6">
			<h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
				All Machines ({data.machines.length})
			</h3>
			
			{#if data.machines.length === 0}
				<div class="text-center py-8">
					<p class="text-gray-500">No machines found. Add your first machine to get started.</p>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-200">
						<thead class="bg-gray-50">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Machine
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Type
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Location
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Status
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Cost
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Acquired
								</th>
								<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody class="bg-white divide-y divide-gray-200">
							{#each data.machines as machine}
								<tr>
									<td class="px-6 py-4 whitespace-nowrap">
										<div class="text-sm font-medium text-gray-900">{machine.name}</div>
										<div class="text-sm text-gray-500">{machine.manufacturer || 'Unknown'} {machine.year_manufactured || ''}</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
											{machine.machine_type || 'Unknown'}
										</span>
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{machine.location_name || 'Warehouse'}
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full
											{machine.status === 'available' ? 'bg-green-100 text-green-800' :
											 machine.status === 'deployed' ? 'bg-blue-100 text-blue-800' :
											 machine.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
											 'bg-gray-100 text-gray-800'}">
											{machine.status}
										</span>
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{machine.initial_cost ? `$${parseFloat(machine.initial_cost).toLocaleString()}` : '-'}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{machine.purchase_date ? new Date(machine.purchase_date).toLocaleDateString() : '-'}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
										<button
											on:click={() => editMachine(machine)}
											class="text-indigo-600 hover:text-indigo-900 mr-3"
										>
											Edit
										</button>
										<form 
											method="POST" 
											action="?/delete" 
											class="inline"
											use:enhance={() => {
												return async ({ result, update }) => {
													if (result.type === 'success') {
														await invalidateAll();
													}
													await update();
												};
											}}
											on:submit={(e) => {
												if (!confirm('Are you sure you want to delete this machine?')) {
													e.preventDefault();
												}
											}}
										>
											<input type="hidden" name="id" value={machine.id} />
											<button
												type="submit"
												class="text-red-600 hover:text-red-900"
											>
												Delete
											</button>
										</form>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</div>
</div>
