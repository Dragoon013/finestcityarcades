import { put, del } from '@vercel/blob';

/**
 * Upload a single image to Vercel Blob storage
 * @param {File} file - The image file to upload
 * @param {string} folder - The folder to store the image in (e.g., 'machines', 'locations')
 * @param {string} id - The ID of the machine or location
 * @returns {Promise<string>} - The URL of the uploaded image
 */
export async function uploadImage(file, folder, id) {
	try {
		// Generate a unique filename
		const timestamp = Date.now();
		const extension = file.name.split('.').pop();
		const filename = `${folder}/${id}/${timestamp}.${extension}`;
		
		// Upload to Vercel Blob
		const blob = await put(filename, file, {
			access: 'public',
		});
		
		return blob.url;
	} catch (error) {
		console.error('Error uploading image:', error);
		throw new Error('Failed to upload image');
	}
}

/**
 * Upload multiple images to Vercel Blob storage
 * @param {FileList} files - The image files to upload
 * @param {string} folder - The folder to store the images in
 * @param {string} id - The ID of the location
 * @returns {Promise<Array<{url: string, name: string}>>} - Array of uploaded image data
 */
export async function uploadMultipleImages(files, folder, id) {
	try {
		const uploadPromises = Array.from(files).map(async (file, index) => {
			const timestamp = Date.now();
			const extension = file.name.split('.').pop();
			const filename = `${folder}/${id}/${timestamp}_${index}.${extension}`;
			
			const blob = await put(filename, file, {
				access: 'public',
			});
			
			return {
				url: blob.url,
				name: file.name
			};
		});
		
		return await Promise.all(uploadPromises);
	} catch (error) {
		console.error('Error uploading multiple images:', error);
		throw new Error('Failed to upload images');
	}
}

/**
 * Delete an image from Vercel Blob storage
 * @param {string} url - The URL of the image to delete
 * @returns {Promise<void>}
 */
export async function deleteImage(url) {
	try {
		await del(url);
	} catch (error) {
		console.error('Error deleting image:', error);
		// Don't throw error for deletion failures as it's not critical
	}
}

/**
 * Validate image file
 * @param {File} file - The file to validate
 * @returns {boolean} - Whether the file is valid
 */
export function validateImageFile(file) {
	const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
	const maxSize = 5 * 1024 * 1024; // 5MB
	
	if (!allowedTypes.includes(file.type)) {
		throw new Error('Invalid file type. Please upload JPEG, PNG, or WebP images.');
	}
	
	if (file.size > maxSize) {
		throw new Error('File too large. Please upload images smaller than 5MB.');
	}
	
	return true;
}

/**
 * Validate multiple image files
 * @param {FileList} files - The files to validate
 * @returns {boolean} - Whether all files are valid
 */
export function validateImageFiles(files) {
	const maxFiles = 10;
	
	if (files.length > maxFiles) {
		throw new Error(`Too many files. Please upload no more than ${maxFiles} images.`);
	}
	
	Array.from(files).forEach(file => validateImageFile(file));
	
	return true;
}
