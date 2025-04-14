"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { FiThumbsUp, FiMessageSquare } from 'react-icons/fi';

interface PostSummary {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
  author: {
    name: string | null;
    email: string | null;
  };
  category: {
    name: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
}

async function getPosts(categoryFilter: string, searchQuery: string): Promise<PostSummary[]> {
  try {
    const posts = await fetch(`/api/posts?category=${categoryFilter}&search=${searchQuery}`);
    const data = await posts.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return [];
  }
}

export default function HomePage() {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [category, setCategory] = useState<string>(''); 
  const [searchQuery, setSearchQuery] = useState<string>(''); 
  const [categories, setCategories] = useState<string[]>([
    'Technology', 'Science', 'Lifestyle', 'Health', 'Business'
  ]);

  useEffect(() => {
    const fetchPostsData = async () => {
      const fetchedPosts = await getPosts(category, searchQuery);
      setPosts(fetchedPosts);
    };
    fetchPostsData();
  }, [category, searchQuery]);

  return (
    <div className='container ml-32'>
      <h1 className="text-4xl font-bold mb-12 text-center text-gray-100">All Posts</h1>

      {/* Category & Search */}
      <div className='flex justify-center mb-8 gap-5'>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border-0.5 p-2 rounded-md bg-[#1e2939] text-white"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search posts..."
          className="border-0.5 p-2 rounded-md"
        />
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <p className="text-center text-gray-400">No posts found yet. Create one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {posts.map((post) => (
            <div
              key={post.id}
              className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col"
              style={{ backgroundColor: '#1e2939' }}
            >
              {post.imageUrl && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              )}
              <div className="p-6 flex flex-col flex-grow">
                <span className="inline-block bg-indigo-200 text-indigo-900 text-sm font-medium px-3 py-1 rounded-full mb-3 self-start">
                  {post.category.name}
                </span>
                <Link href={`/posts/${post.id}`} className="block mb-2 group">
                  <h2 className="text-xl font-semibold text-white group-hover:text-indigo-400 transition-colors duration-200 line-clamp-2">
                    {post.title}
                  </h2>
                </Link>
                <p className="text-gray-300 text-sm mb-4 flex-grow line-clamp-3">
                  {truncateContent(post.content)}
                </p>
                <div className="text-xs text-gray-400 mt-auto pt-4 border-t border-gray-600 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-medium text-white hover:text-indigo-300 transition-colors">
                      {post.author.name || post.author.email}
                    </span>
                    <span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <span className="flex items-center hover:text-white transition-colors">
                      <FiThumbsUp className="w-4 h-4 mr-1" /> {post._count.likes}
                    </span>
                    <span className="flex items-center hover:text-white transition-colors">
                      <FiMessageSquare className="w-4 h-4 mr-1" /> {post._count.comments}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function truncateContent(text: string, maxLength: number = 100): string {
  return text.length <= maxLength ? text : text.substring(0, maxLength) + '...';
}
