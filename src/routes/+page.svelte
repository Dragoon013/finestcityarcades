<script>
	  import Carousel from 'svelte-carousel'
	  import { browser } from '$app/environment';
	  import star_wars from '$lib/images/star_wars_flyer.png';


	let carousel; // for calling methods of the carousel instance

</script>

<svelte:head>
	<title>Home</title>
	<meta name="home" content="The Friendly Flipper site" />
</svelte:head>

<section>
	<h1>
		Welcome to the Friendly Flipper
	</h1>
	{#if browser}
	<Carousel
	  bind:this={carousel}
	>
	  <div>
		<picture>
		<source srcset={star_wars} type="png" />
		<img src={star_wars} alt="star_wars" />
	</picture>
</div>
	  <div>2</div>
	  <div>3</div>
	</Carousel>
  {/if}
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}
</style>
