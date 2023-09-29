<script>
export let form;
</script>

<svelte:head>
    <title>Contact Us</title>
    <meta name="description" content="Contact Us" />
    </svelte:head>

    <div class="text-column">
        <h1>Contact Us</h1>

        <p>
            Please fill out the form below and we'll get back to you as soon as possible.
        </p>

        <section class="container mx-auto px-4 py-4">
            <div class="flex flex-col justify-center items-center min-h-[40rem]">                ​
                <div class="w-3/6 mt-4 rounded-sm p-8 bg-slate-100 ">
                    <form class="my-4 " action="?/contactus" method= "POST">
                        <div>
                            <label class="label text-slate-500 mr-4" for="name">Name </label>
                            <input type="text" name="name" placeholder="Wade Wilson" class="ring-1 ring-slate-200 focus:outline-none rounded-sm input w-full" />
                        </div>
                        <div>
                            <label class="label text-slate-500 mr-4" for="name">Email </label>
                            <input type="email" name="email" placeholder="wade.wilson@hotmail.com" class="ring-1 ring-slate-200 focus:outline-none rounded-sm input w-full" />
                        </div>
                        <div>
                            <label class="label text-slate-500 mr-4" for="name">Venue </label>
                            <input type="text" name="venue" placeholder="Where is the event taking place?" class="ring-1 ring-slate-200 focus:outline-none rounded-sm input w-full" />
                        </div>
                        <div>
                            <label class="label text-slate-500 mr-4" for="name">Message </label>
                            <textarea class="textarea ring-1 ring-slate-200 focus:outline-none rounded-sm w-full" placeholder="# of machines, special requests, date, etc"></textarea>
                        </div>
                        <div>
                            <button type="submit" class="mt-2 w-1/4 btn px-8 rounded-sm btn-outline">Send</button>
                          </div>
                    </form>
                </div>
            </div>
        </section>

        {#if form?.success }
        <div class="p-4 bg-slate-100 w-3/6 mt-4">
            <p>Name: {form?.formData.name}</p>
            <p>Message: {form?.formData.message}</p>
        </div>
        {/if}

        <p>
            Reach out to us directly at <a href="mailto:jacob.a.teal@gmail.com">jacob.a.teal@gmail.com</a>.
        </p>

    </div>
