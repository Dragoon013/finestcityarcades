import { handleUpload } from '@vercel/blob/client';
import { BLOB_READ_WRITE_TOKEN } from '$env/static/private';

export async function POST({ request }) {
	try {
		const body = await request.json();
		
		const jsonResponse = await handleUpload({
			body,
			request,
			onBeforeGenerateToken: async (pathname, clientPayload) => {
				// Add any validation logic here
				// For example, check file size, type, user permissions, etc.
				
				// Validate file extension
				const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
				const extension = pathname.toLowerCase().substring(pathname.lastIndexOf('.'));
				
				if (!allowedExtensions.includes(extension)) {
					throw new Error('Invalid file type. Only JPEG, PNG, and WebP files are allowed.');
				}
				
				return {
					allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
					tokenPayload: JSON.stringify({
						// Optional: add metadata that will be stored with the blob
						uploadedAt: new Date().toISOString(),
					}),
				};
			},
			onUploadCompleted: async ({ blob, tokenPayload }) => {
				// Optional: Handle post-upload logic
				console.log('Upload completed:', blob.url);
				// You could save blob info to database here if needed
			},
			token: BLOB_READ_WRITE_TOKEN,
		});

		return new Response(JSON.stringify(jsonResponse), {
			status: 200,
			headers: { 'content-type': 'application/json' },
		});
	} catch (error) {
		console.error('Upload handler error:', error);
		const errorMessage = error instanceof Error ? error.message : 'Upload failed';
		return new Response(
			JSON.stringify({ error: errorMessage }),
			{
				status: 400,
				headers: { 'content-type': 'application/json' },
			}
		);
	}
}
