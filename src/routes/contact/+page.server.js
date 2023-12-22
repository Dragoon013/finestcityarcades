import Contact from '../../lib/Contact.svelte'
import sendgrid from '@sendgrid/mail';
import { SENDGRID_API_KEY } from '$env/static/private';
import { render } from 'svelte-email';

sendgrid.setApiKey(SENDGRID_API_KEY || "");

/** @type {import('./$types').Actions} */
export const actions = {
	handleSubmit: async ({request}) => {
		const data = await request.formData();
		const email = data.get('email');
        const name = data.get('name');
		const message = data.get('message');


        const emailHtml = render({
            template: Contact,
            props: {
                name: name?.toString(),
                email: email?.toString(),
                message: message?.toString()
            }
        });
        
        const options = {
          from: 'contact@finestcitypinball.com',
          to: 'jacob.a.teal@gmail.com',
          subject: 'FCP contact from '+name,
          html: emailHtml,
        };
        
        sendgrid.send(options);
        
        return { success: true };
	}
};
