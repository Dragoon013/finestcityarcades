<script>
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { uploadImage, validateImageFile } from '$lib/imageUpload.js';

	/** @type {import('./$types').PageData} */
	export let data;

	/** @type {import('./$types').ActionData} */
	export let form;

	let showAddForm = false;
	let editingMachine = null;
	let loading = false;
	let imageFile = null;
	let imagePreview = null;
	let imageError = null;

	// Filter and sort variables
	let filterType = '';
	let filterLocation = '';
	let filterStatus = '';
	let filterVisibility = '';
	let sortAlphabetically = false;

	// Filtered and sorted machines
	$: filteredMachines = data.machines
		.filter(machine => {
			if (filterType && machine.machine_type !== filterType) return false;
			if (filterLocation && machine.current_location_id?.toString() !== filterLocation) return false;
			if (filterStatus && machine.status !== filterStatus) return false;
			if (filterVisibility !== '' && machine.visible_on_site?.toString() !== filterVisibility) return false;
			return true;
		})
		.sort((a, b) => {
			if (sortAlphabetically) {
				return a.name.localeCompare(b.name);
			}
			// Default sort by created_at DESC (newest first)
			return new Date(b.created_at) - new Date(a.created_at);
		});

	// Get unique values for filter options
	$: uniqueTypes = [...new Set(data.machines.map(m => m.machine_type).filter(Boolean))];
	$: uniqueStatuses = [...new Set(data.machines.map(m => m.status).filter(Boolean))];

	function clearFilters() {
		filterType = '';
		filterLocation = '';
		filterStatus = '';
		filterVisibility = '';
		sortAlphabetically = false;
	}

	function toggleAddForm() {
		showAddForm = !showAddForm;
		editingMachine = null;
		resetImageUpload();
	}

	function editMachine(machine) {
		editingMachine = machine;
		showAddForm = true;
		resetImageUpload();
		// Set current image as preview if exists
		if (machine.image_url) {
			imagePreview = machine.image_url;
		}
	}

	function cancelEdit() {
		showAddForm = false;
		editingMachine = null;
		resetImageUpload();
	}

	function resetImageUpload() {
		imageFile = null;
		imagePreview = null;
		imageError = null;
	}

	function handleImageSelect(event) {
		const file = event.target.files[0];
		imageError = null;
		
		if (!file) {
			resetImageUpload();
			return;
		}

		try {
			validateImageFile(file);
			imageFile = file;
			
			// Create preview
			const reader = new FileReader();
			reader.onload = (e) => {
				imagePreview = e.target.result;
			};
			reader.readAsDataURL(file);
		} catch (error) {
			imageError = error.message;
			resetImageUpload();
		}
	}

	function removeImage() {
		resetImageUpload();
		// Clear the file input
		const fileInput = document.getElementById('image');
		if (fileInput) fileInput.value = '';
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
				enctype="multipart/form-data"
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

					<div>
						<label for="display_order" class="block text-sm font-medium text-gray-700">Display Order</label>
						<input
							type="number"
							id="display_order"
							name="display_order"
							value={editingMachine?.display_order || 0}
							min="0"
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
						/>
						<p class="mt-1 text-xs text-gray-500">Lower numbers appear first on the public site</p>
					</div>
				</div>

				<!-- Visibility Toggle -->
				<div class="flex items-center">
					<input
						type="checkbox"
						id="visible_on_site"
						name="visible_on_site"
						checked={editingMachine?.visible_on_site ?? true}
						class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
					/>
					<label for="visible_on_site" class="ml-2 block text-sm text-gray-900">
						Show this machine on the public website
					</label>
				</div>

				<!-- Image Upload Section -->
				<div>
					<label for="image" class="block text-sm font-medium text-gray-700">Machine Image</label>
					<div class="mt-1 space-y-3">
						{#if imagePreview}
							<div class="relative inline-block">
								<img 
									src={imagePreview} 
									alt="Machine preview" 
									class="h-32 w-32 object-cover rounded-lg border border-gray-300"
								/>
								<button
									type="button"
									on:click={removeImage}
									class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
								>
									×
								</button>
							</div>
						{/if}
						
						<input
							type="file"
							id="image"
							name="image"
							accept="image/*"
							on:change={handleImageSelect}
							class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
						/>
						
						{#if imageError}
							<p class="text-sm text-red-600">{imageError}</p>
						{/if}
						
						<p class="text-xs text-gray-500">
							Upload a JPEG, PNG, or WebP image (max 15MB)
						</p>
					</div>
				</div>

				<div>
					<label for="description" class="block text-sm font-medium text-gray-700">Public Description</label>
					<textarea
						id="description"
						name="description"
						rows="3"
						value={editingMachine?.description || ''}
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
						placeholder="Enter a description that will be shown on the public website..."
					></textarea>
					<p class="mt-1 text-xs text-gray-500">This description will be displayed on the public machines page</p>
				</div>

				<div>
					<label for="notes" class="block text-sm font-medium text-gray-700">Internal Notes</label>
					<textarea
						id="notes"
						name="notes"
						rows="3"
						value={editingMachine?.notes || ''}
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
						placeholder="Internal notes for admin use only..."
					></textarea>
					<p class="mt-1 text-xs text-gray-500">These notes are for internal use and won't be shown publicly</p>
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

	<!-- Filter Controls -->
	<div class="bg-white shadow rounded-lg p-4 mb-6">
		<div class="flex flex-wrap items-center gap-4">
			<div class="flex items-center space-x-2">
				<label for="filterType" class="text-sm font-medium text-gray-700">Type:</label>
				<select
					id="filterType"
					bind:value={filterType}
					class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
				>
					<option value="">All Types</option>
					{#each uniqueTypes as type}
						<option value={type}>{type}</option>
					{/each}
				</select>
			</div>

			<div class="flex items-center space-x-2">
				<label for="filterLocation" class="text-sm font-medium text-gray-700">Location:</label>
				<select
					id="filterLocation"
					bind:value={filterLocation}
					class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
				>
					<option value="">All Locations</option>
					<option value="">Warehouse</option>
					{#each data.locations as location}
						<option value={location.id.toString()}>{location.name}</option>
					{/each}
				</select>
			</div>

			<div class="flex items-center space-x-2">
				<label for="filterStatus" class="text-sm font-medium text-gray-700">Status:</label>
				<select
					id="filterStatus"
					bind:value={filterStatus}
					class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
				>
					<option value="">All Statuses</option>
					{#each uniqueStatuses as status}
						<option value={status}>{status}</option>
					{/each}
				</select>
			</div>

			<div class="flex items-center space-x-2">
				<label for="filterVisibility" class="text-sm font-medium text-gray-700">Visibility:</label>
				<select
					id="filterVisibility"
					bind:value={filterVisibility}
					class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
				>
					<option value="">All</option>
					<option value="true">Visible</option>
					<option value="false">Hidden</option>
				</select>
			</div>

			<div class="flex items-center space-x-2">
				<label for="sortAlphabetically" class="text-sm font-medium text-gray-700">
					<input
						type="checkbox"
						id="sortAlphabetically"
						bind:checked={sortAlphabetically}
						class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
					/>
					Sort A-Z
				</label>
			</div>

			<button
				on:click={clearFilters}
				class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
			>
				Clear Filters
			</button>
		</div>
	</div>

	<!-- Machines Table -->
	<div class="bg-white shadow rounded-lg overflow-hidden">
		<div class="px-4 py-5 sm:p-6">
			<h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
				Machines ({filteredMachines.length} of {data.machines.length})
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
									Image
								</th>
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
									Visibility
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
							{#each filteredMachines as machine}
								<tr>
									<td class="px-6 py-4 whitespace-nowrap">
										{#if machine.image_url}
											<img 
												src={machine.image_url} 
												alt={machine.name} 
												class="h-16 w-16 object-cover rounded-lg border border-gray-300"
											/>
										{:else}
											<div class="h-16 w-16 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
												<svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
												</svg>
											</div>
										{/if}
									</td>
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
									<td class="px-6 py-4 whitespace-nowrap">
										<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full
											{machine.visible_on_site ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
											{machine.visible_on_site ? 'Visible' : 'Hidden'}
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
