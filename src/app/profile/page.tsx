'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
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

async function getPosts(userId: string): Promise<PostSummary[]> {
  try {
    const response = await fetch(`/api/my-posts?userId=${userId}`);
    const data = await response.json();
    return data.posts || [];
  } catch (error) {
    console.error("Алдаа гарлаа:", error);
    return [];
  }
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      getPosts(session.user.id) // Хэрэглэгчийн ID-гаар постуудыг ачаална
        .then((data) => {
          setPosts(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Алдаа:', error);
          setLoading(false);
        });
    }
  }, [session]);

  if (status === 'loading' || loading) {
    return <p className="text-center">Түр хүлээнэ үү...</p>;
  }

  if (!session || !session.user) {
    return <p className="text-center">Нэвтрээгүй байна.</p>;
  }

  const { user } = session;

  return (
    <div>
      <h1 className="text-4xl font-bold mb-12 text-center text-gray-800">Миний Нийтлэлүүд</h1>
      {posts.length === 0 ? (
        <p className="text-center text-gray-500">Одоогоор нийтлэл байхгүй.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
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
                <span className="inline-block bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full mb-3 self-start">
                  {post.category.name}
                </span>
                <Link href={`/posts/${post.id}`} className="block mb-2 group">
                  <h2 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2">
                    {post.title}
                  </h2>
                </Link>
                <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">
                  {truncateContent(post.content)}
                </p>
                <div className="text-xs text-gray-500 mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-700 hover:text-gray-900 transition-colors">
                      {post.author.name || post.author.email}
                    </span>
                    <span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <span className="flex items-center text-gray-500 hover:text-gray-700 transition-colors">
                      <FiThumbsUp className="w-4 h-4 mr-1" /> {post._count.likes}
                    </span>
                    <span className="flex items-center text-gray-500 hover:text-gray-700 transition-colors">
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
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
