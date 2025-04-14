'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function CreatePostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/create-post');
    }
    setCategories([
      'Technology', 'Science', 'Lifestyle', 'Health', 'Business'
    ]);
  }, [status, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !content || !categoryName.trim()) {
      setError('Title, Content, and Category Name are required.');
      return;
    }

    if (status !== 'authenticated') {
      setError('You must be logged in to create a post.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // If a file is selected, upload it to your server or a cloud storage service
      let uploadedImageUrl = imageUrl;
      if (imageFile) {
        // Here you should upload the file to your storage and get the URL (e.g., Firebase, AWS S3, etc.)
        const formData = new FormData();
        formData.append('file', imageFile);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('File upload failed');
        }

        const data = await response.json();
        uploadedImageUrl = data.url; // Assuming the server returns the uploaded image URL
      }

      const postData = { title, content, categoryName: categoryName.trim(), imageUrl: uploadedImageUrl };

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errorData = { message: `Request failed with status ${response.status}` };
        try {
            errorData = JSON.parse(responseText); 
        } catch (parseError) {
            errorData.message = responseText; 
        }
        throw new Error(errorData.message || 'Failed to create post');
      }

      router.push('/'); 
      router.refresh(); 

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="flex justify-center items-center h-64"><p>Loading session...</p></div>;
  }

  if (status === 'unauthenticated') {
    return <div className="flex justify-center items-center h-64"><p>Redirecting to login...</p></div>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-[#1e2939] p-8 rounded-lg shadow-md text-white mt-30">
      <h1 className="text-2xl font-bold mb-8 text-center">Create New Post</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-600 px-4 py-3 rounded text-sm" role="alert">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-white mb-1">
            Post Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Enter post title"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-white mb-1">
            Content
          </label>
          <textarea
            id="content"
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Write your post content here..."
            required
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="categoryName" className="block text-sm font-medium text-white mb-1">
            Category Name
          </label>
          <select
            id="categoryName"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 bg-[#1e2939] text-white focus:outline-none focus:ring-4 focus:ring-indigo-400 focus:ring-opacity-50 sm:text-sm"
            disabled={loading}
            required
          >
            <option value="">Select a category</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-white mb-1">
            Image URL (Optional)
          </label>
          <input
            type="url" 
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="https://example.com/image.jpg"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="imageFile" className="block text-sm font-medium text-white mb-1">
            Or Upload Image (Optional)
          </label>
          <input
            type="file"
            id="imageFile"
            onChange={handleFileChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            disabled={loading}
          />
        </div>
        <div>
          <button
            type="submit"
            className={`w-full flex justify-center py-3 px-6 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-600 hover:to-pink-600 focus:outline-none focus:ring-4 focus:ring-indigo-400 focus:ring-opacity-50 transition duration-300 ease-in-out transform ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
            disabled={loading || status !== 'authenticated'}
          >
            {loading ? (
              <span className="animate-pulse">Creating Post...</span>
            ) : (
              'Create Post'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
