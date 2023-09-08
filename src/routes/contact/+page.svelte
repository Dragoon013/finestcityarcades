<svelte:head>
	<title>Contact Us</title>
	<meta name="description" content="Contact Us" />
</svelte:head>

<div class="text-column">
	<h1>Contact Us</h1>

	<p>
		We're based in Ramona, California and serve San Diego city and county. Please fill out the form below and we'll get back to ASAP.
	</p>

	<form method="POST">
		<label>
			Name
			<input
				name="name"
				autocomplete="off"
			/>
		</label>
		<br/>
		<label>
			Email
			<input
				name="email"
				autocomplete="off"
			/>
		</label>		
		<br/>
		<label>
			Venue
			<input
				name="venue"
				autocomplete="off"
			/>
		</label>
		<br/>
		<label>
			Description
			<textarea rows="5" cols="60" name="description" placeholder="Tell us about your desired pinball machines, etc">

			</textarea>
		</label>
		<br/>
		<button type="submit">Submit</button>
	</form>

	<p>
		Reach out to us directly at <a href="mailto:jacob.a.teal@gmail.com">jacob.a.teal@gmail.com</a>.
	</p>

</div>
