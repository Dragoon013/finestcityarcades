<script>
	import { Html, Text } from 'svelte-email';

	export let name = 'Contact';
    export let email = 'Email';
    export let message = 'Message';

</script>

<Html lang="en">
	<Text>
		{name} has reached out to you from finestcitypinball.com. They can be reached at {email}.
	</Text>
    <br/>
    <Text> Find their message below:</Text>
    <br/>
    <Text>{message}</Text>
</Html>