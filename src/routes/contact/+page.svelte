<script>
  import { enhance } from '$app/forms';
/** @type {import('./$types').ActionData} */
	export let form;
</script>

<svelte:head>
    <title>Contact Us</title>
    <meta name="description" content="Contact Us" />
    </svelte:head>

    <div class="text-column">
        <h1>Contact Us</h1>

        <form class="my-4" method="POST" action="?/handleSubmit" use:enhance>
            <div>
                <label class="label text-slate-500 mr-4" for="name">Name </label>
                <input type="text" id="name" name="name" placeholder="Wade Wilson" class="ring-1 ring-slate-200 focus:outline-none rounded-sm input w-full" style="color:white" />
            </div>
            <div>
                <label class="label text-slate-500 mr-4" for="email">Email </label>
                <input type="email" id="email" name="email" placeholder="wade.wilson@hotmail.com" class="ring-1 ring-slate-200 focus:outline-none rounded-sm input w-full" style="color:white" />
            </div>
            <div>
                <label class="label text-slate-500 mr-4" for="message">Message </label>
                <textarea class="textarea ring-1 ring-slate-200 focus:outline-none rounded-sm w-full" id="message" style="color:white" placeholder="# of machines, special requests, date, etc"></textarea>
            </div>
            <div>
                <button type="submit" class="mt-2 w-1/4 btn px-8 rounded-sm btn-outline">Send</button>
            </div>
        </form>
        {#if form?.success}
        <p>Message sent successfully! We'll get back to you as soon as possible!</p>
        {/if}
        <br/><br/><br/>
        <p>
            Reach out to us directly at <a href="mailto:contact@finestcitypinball.com">contact@finestcitypinball.com</a>.
        </p>

    </div>
