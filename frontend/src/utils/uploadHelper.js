/**
 * Uploads a file to the backend api which stores it on Supabase Storage.
 * Gracefully falls back to a Base64 Data URL if the upload fails.
 * 
 * @param {File} file - The file to upload
 * @returns {Promise<string>} The public URL of the uploaded file or base64 fallback.
 */
export async function uploadImageFile(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch('/api/data/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!res.ok) {
      throw new Error(`Upload failed with status: ${res.status}`);
    }
    
    const data = await res.json();
    if (data && data.url) {
      return data.url;
    }
    throw new Error('Invalid response payload');
  } catch (err) {
    console.error('Image upload failed, falling back to local base64 preview:', err);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }
}
