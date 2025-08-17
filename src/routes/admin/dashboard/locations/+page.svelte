<script>
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	/** @type {import('./$types').PageData} */
	export let data;

	/** @type {import('./$types').ActionData} */
	export let form;

	let showAddForm = false;
	let editingLocation = null;
	let loading = false;

	function toggleAddForm() {
		showAddForm = !showAddForm;
		editingLocation = null;
	}

	function editLocation(location) {
		editingLocation = location;
		showAddForm = true;
	}

	function cancelEdit() {
		showAddForm = false;
		editingLocation = null;
	}
</script>

<svelte:head>
	<title>Locations - Finest City Arcades Admin</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<h1 class="text-2xl font-bold text-gray-900">Location Management</h1>
		<button
			on:click={toggleAddForm}
			class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
		>
			{showAddForm ? 'Cancel' : 'Add New Location'}
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
				{editingLocation ? 'Edit Location' : 'Add New Location'}
			</h2>
			
			<form 
				method="POST" 
				action={editingLocation ? '?/update' : '?/create'}
				use:enhance={() => {
					loading = true;
					return async ({ result, update }) => {
						loading = false;
						if (result.type === 'success') {
							showAddForm = false;
							editingLocation = null;
							await invalidateAll();
						}
						await update();
					};
				}}
				class="space-y-4"
			>
				{#if editingLocation}
					<input type="hidden" name="id" value={editingLocation.id} />
				{/if}

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="name" class="block text-sm font-medium text-gray-700">Location Name</label>
						<input
							type="text"
							id="name"
							name="name"
							value={editingLocation?.name || ''}
							required
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
						/>
					</div>

					<div>
						<label for="type" class="block text-sm font-medium text-gray-700">Type</label>
						<select
							id="type"
							name="type"
							value={editingLocation?.type || ''}
							required
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
						>
							<option value="">Select Type</option>
							<option value="restaurant">Restaurant</option>
							<option value="bar">Bar</option>
							<option value="arcade">Arcade</option>
							<option value="event_venue">Event Venue</option>
							<option value="warehouse">Warehouse</option>
							<option value="other">Other</option>
						</select>
					</div>

					<div class="md:col-span-2">
						<label for="address" class="block text-sm font-medium text-gray-700">Address</label>
						<input
							type="text"
							id="address"
							name="address"
							value={editingLocation?.address || ''}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
						/>
					</div>

					<div>
						<label for="city" class="block text-sm font-medium text-gray-700">City</label>
						<input
							type="text"
							id="city"
							name="city"
							value={editingLocation?.city || ''}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
						/>
					</div>

					<div>
						<label for="state" class="block text-sm font-medium text-gray-700">State</label>
						<input
							type="text"
							id="state"
							name="state"
							value={editingLocation?.state || ''}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
						/>
					</div>

					<div>
						<label for="zip_code" class="block text-sm font-medium text-gray-700">ZIP Code</label>
						<input
							type="text"
							id="zip_code"
							name="zip_code"
							value={editingLocation?.zip_code || ''}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
						/>
					</div>

					<div>
						<label for="contact_name" class="block text-sm font-medium text-gray-700">Contact Name</label>
						<input
							type="text"
							id="contact_name"
							name="contact_name"
							value={editingLocation?.contact_name || ''}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
						/>
					</div>

					<div>
						<label for="contact_phone" class="block text-sm font-medium text-gray-700">Contact Phone</label>
						<input
							type="tel"
							id="contact_phone"
							name="contact_phone"
							value={editingLocation?.contact_phone || ''}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
						/>
					</div>

					<div>
						<label for="contact_email" class="block text-sm font-medium text-gray-700">Contact Email</label>
						<input
							type="email"
							id="contact_email"
							name="contact_email"
							value={editingLocation?.contact_email || ''}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
						/>
					</div>

					<div>
						<label for="revenue_split" class="block text-sm font-medium text-gray-700">Revenue Split (%)</label>
						<input
							type="number"
							id="revenue_split"
							name="revenue_split"
							value={editingLocation?.revenue_split || ''}
							step="0.01"
							min="0"
							max="100"
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
						/>
					</div>
				</div>

				<div>
					<label for="notes" class="block text-sm font-medium text-gray-700">Notes</label>
					<textarea
						id="notes"
						name="notes"
						rows="3"
						value={editingLocation?.notes || ''}
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
					></textarea>
				</div>

				<div class="flex items-center">
					<input
						type="checkbox"
						id="active"
						name="active"
						checked={editingLocation?.active !== false}
						class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
					/>
					<label for="active" class="ml-2 block text-sm text-gray-900">
						Active Location
					</label>
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
						{loading ? 'Saving...' : (editingLocation ? 'Update Location' : 'Add Location')}
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Locations Table -->
	<div class="bg-white shadow rounded-lg overflow-hidden">
		<div class="px-4 py-5 sm:p-6">
			<h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
				All Locations ({data.locations.length})
			</h3>
			
			{#if data.locations.length === 0}
				<div class="text-center py-8">
					<p class="text-gray-500">No locations found. Add your first location to get started.</p>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-200">
						<thead class="bg-gray-50">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Location
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Type
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Address
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Contact
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Revenue Split
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Machines
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Status
								</th>
								<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody class="bg-white divide-y divide-gray-200">
							{#each data.locations as location}
								<tr>
									<td class="px-6 py-4 whitespace-nowrap">
										<div class="text-sm font-medium text-gray-900">{location.name}</div>
										<div class="text-sm text-gray-500">{location.city || ''} {location.state || ''}</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
											{location.type || 'Unknown'}
										</span>
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										<div>{location.address || '-'}</div>
										<div class="text-gray-500">{location.city || ''} {location.state || ''} {location.zip_code || ''}</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										<div>{location.contact_name || '-'}</div>
										<div class="text-gray-500">{location.contact_phone || ''}</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{location.revenue_split ? `${location.revenue_split}%` : '-'}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{location.machine_count || 0}
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full
											{location.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
											{location.active ? 'Active' : 'Inactive'}
										</span>
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
										<button
											on:click={() => editLocation(location)}
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
												if (!confirm('Are you sure you want to delete this location? This will also remove it from any machines assigned to it.')) {
													e.preventDefault();
												}
											}}
										>
											<input type="hidden" name="id" value={location.id} />
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
