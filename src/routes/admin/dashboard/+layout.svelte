<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	
	export let data;
	
	async function logout() {
		const response = await fetch('/admin/logout', { method: 'POST' });
		if (response.ok) {
			goto('/admin/login');
		}
	}
</script>

<svelte:head>
	<title>Admin Dashboard - Finest City Arcades</title>
</svelte:head>

<div class="min-h-screen bg-gray-100">
	<!-- Navigation -->
	<nav class="bg-white shadow-sm">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between h-16">
				<div class="flex">
					<div class="flex-shrink-0 flex items-center">
						<h1 class="text-xl font-bold text-gray-900">Finest City Arcades Admin</h1>
					</div>
					<div class="hidden sm:ml-6 sm:flex sm:space-x-8">
						<a
							href="/admin/dashboard"
							class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
							class:border-indigo-500={$page.url.pathname === '/admin/dashboard'}
							class:text-indigo-600={$page.url.pathname === '/admin/dashboard'}
						>
							Dashboard
						</a>
						<a
							href="/admin/dashboard/machines"
							class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
							class:border-indigo-500={$page.url.pathname.startsWith('/admin/dashboard/machines')}
							class:text-indigo-600={$page.url.pathname.startsWith('/admin/dashboard/machines')}
						>
							Machines
						</a>
						<a
							href="/admin/dashboard/locations"
							class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
							class:border-indigo-500={$page.url.pathname.startsWith('/admin/dashboard/locations')}
							class:text-indigo-600={$page.url.pathname.startsWith('/admin/dashboard/locations')}
						>
							Locations
						</a>
						<a
							href="/admin/dashboard/revenue"
							class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
							class:border-indigo-500={$page.url.pathname.startsWith('/admin/dashboard/revenue')}
							class:text-indigo-600={$page.url.pathname.startsWith('/admin/dashboard/revenue')}
						>
							Revenue
						</a>
					</div>
				</div>
				<div class="flex items-center">
					<span class="text-sm text-gray-700 mr-4">Welcome, {data.user.username}</span>
					<button
						on:click={logout}
						class="bg-gray-800 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
					>
						Logout
					</button>
				</div>
			</div>
		</div>
	</nav>

	<!-- Main content -->
	<main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
		<slot />
	</main>
</div>
