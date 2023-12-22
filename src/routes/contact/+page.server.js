import Contact from '../../lib/Contact.svelte'
import sendgrid from '@sendgrid/mail';
import { SENDGRID_API_KEY } from '$env/static/private';
import { render } from 'svelte-email';

sendgrid.setApiKey(SENDGRID_API_KEY || "");

const emailHtml = render({
	template: Contact,
	props: {
		name: 'Svelte'
	}
});

const options = {
  from: 'contact@finestcitypinball.com',
  to: 'jacob.a.teal@gmail.com',
  subject: 'hello world',
  html: emailHtml,
};

sendgrid.send(options);