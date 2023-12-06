<script>
	import Machines from '../../lib/Machines.svelte'
	export let data
  </script>

<svelte:head>
	<title>Machines</title>
	<meta name="description" content="machines on hand" />
</svelte:head>

<div class="text-column">
	<h1>Machines</h1>

</div>
<Machines machines={data?.machines} duration={data?.duration} />
