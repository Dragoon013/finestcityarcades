<script>
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	/** @type {import('./$types').ActionData} */
	export let form;

	let loading = false;
</script>

<svelte:head>
	<title>Admin Login - Finest City Arcades</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
				Admin Login
			</h2>
			<p class="mt-2 text-center text-sm text-gray-600">
				Access the arcade management dashboard
			</p>
		</div>
		
		<form 
			method="POST" 
			class="mt-8 space-y-6"
			use:enhance={() => {
				loading = true;
				return async ({ result, update }) => {
					loading = false;
					console.log('Form submission result:', result);
					await update();
				};
			}}
		>
			<div class="rounded-md shadow-sm -space-y-px">
				<div>
					<label for="username" class="sr-only">Username or Email</label>
					<input
						id="username"
						name="username"
						type="text"
						required
						class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
						placeholder="Username or Email"
						value={form?.username ?? ''}
					/>
				</div>
				<div>
					<label for="password" class="sr-only">Password</label>
					<input
						id="password"
						name="password"
						type="password"
						required
						class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
						placeholder="Password"
					/>
				</div>
			</div>

			{#if form?.error}
				<div class="rounded-md bg-red-50 p-4">
					<div class="text-sm text-red-700">
						{form.error}
					</div>
				</div>
			{/if}

			<div>
				<button
					type="submit"
					disabled={loading}
					class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if loading}
						<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Signing in...
					{:else}
						Sign in
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>
