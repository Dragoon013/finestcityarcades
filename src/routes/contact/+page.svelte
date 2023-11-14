<script>
 let name = "";
  let email = "";
  let message = "";

  async function handleSubmit() {
    // You can add validation here
    // If valid, send the data to the backend
    const response = await fetch(
      "https://srdx91a4we.execute-api.us-east-1.amazonaws.com/contact",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, message }),
      }
    );

    // Handle the response from the API Gateway (e.g., show a success message)
    const result = await response.json();
    console.log(result);
  }
  </script>

<svelte:head>
    <title>Contact Us</title>
    <meta name="description" content="Contact Us" />
    </svelte:head>

    <div class="text-column">
        <h1>Contact Us</h1>

        <form class="my-4 " on:submit|preventDefault={handleSubmit}>
            <div>
                <label class="label text-slate-500 mr-4" for="name">Name </label>
                <input type="text" name="name" placeholder="Wade Wilson" class="ring-1 ring-slate-200 focus:outline-none rounded-sm input w-full" style="color:white" />
            </div>
            <div>
                <label class="label text-slate-500 mr-4" for="name">Email </label>
                <input type="email" name="email" placeholder="wade.wilson@hotmail.com" class="ring-1 ring-slate-200 focus:outline-none rounded-sm input w-full" style="color:white" />
            </div>
            <div>
                <label class="label text-slate-500 mr-4" for="name">Message </label>
                <textarea class="textarea ring-1 ring-slate-200 focus:outline-none rounded-sm w-full" style="color:white" placeholder="# of machines, special requests, date, etc"></textarea>
            </div>
            <div>
                <button type="submit" class="mt-2 w-1/4 btn px-8 rounded-sm btn-outline">Send</button>
            </div>
        </form>

        <p>
            Reach out to us directly at <a href="mailto:jacob.a.teal@gmail.com">jacob.a.teal@gmail.com</a>.
        </p>

    </div>
