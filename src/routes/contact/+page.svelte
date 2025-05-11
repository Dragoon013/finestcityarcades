<script>
	/** @type {import('./$types').ActionData} */
	
	let status = "";
	const handleSubmit = async data => {
	  status = 'Submitting...'
	  const formData = new FormData(data.currentTarget)
	  const object = Object.fromEntries(formData);
	  const json = JSON.stringify(object);
	
	  const response = await fetch("https://api.web3forms.com/submit", {
		  method: "POST",
		  headers: {
			  "Content-Type": "application/json",
			  Accept: "application/json",
		  },
		  body: json
	  });
	  const result = await response.json();
	  if (result.success) {
		  console.log(result);
		  status = result.message || "Success"
		  data.currentTarget.reset();
	  }
	}
</script>

<svelte:head>
	<title>Contact Us</title>
	<meta name="description" content="Contact Us" />
</svelte:head>

<div class="text-column">
	<h1>Contact Us</h1>

	<form on:submit|preventDefault={handleSubmit} class="my-4">
		<input type="hidden" name="access_key" value="0fde4008-440c-4627-b92a-0ccda34d5737">
		<div>
			<label class="label text-slate-500 mr-4" for="name">Name </label>
			<input
				type="text"
				id="name"
				name="name"
				placeholder="Wade Wilson"
				class="ring-1 ring-slate-200 focus:outline-none rounded-sm input w-full"
				style="color:white"
			/>
		</div>
		<div>
			<label class="label text-slate-500 mr-4" for="email">Email </label>
			<input
				type="email"
				id="email"
				name="email"
				placeholder="wade.wilson@hotmail.com"
				class="ring-1 ring-slate-200 focus:outline-none rounded-sm input w-full"
				style="color:white"
			/>
		</div>
		<div>
			<label class="label text-slate-500 mr-4" for="message">Message </label>
			<textarea
				class="textarea ring-1 ring-slate-200 focus:outline-none rounded-sm w-full"
				id="message"
				name="message"
				style="color:white"
				placeholder="# of machines, special requests, date, etc"
			/>
		</div>
		<div>
			<button type="submit" class="mt-2 w-1/4 btn px-8 rounded-sm btn-outline">Send</button>
		</div>
	</form>
	<div>{status}</div>
	<br /><br /><br />
</div>
	
