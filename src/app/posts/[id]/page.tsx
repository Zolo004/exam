import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';
import LikeButton from '@/components/LikeButton';
import CommentSection from '@/components/CommentSection';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import DeletePostButton from '@/components/DeletePostButton';

export interface CommentWithUser {
  id: string;
  text: string;
  createdAt: Date;
  userId: string;
  postId: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

interface PostDetailPageProps {
  params: { id: string };
}

interface PostDetail {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string | null;
    email: string | null;
  };
  category: {
    id: string;
    name: string;
  };
  comments: CommentWithUser[];
  _count: {
    likes: number;
  };
  hasLiked: boolean;
}

type GetPostDataReturnType = Omit<PostDetail, 'hasLiked'> & { hasLiked: boolean } | null;

async function getPostData(id: string): Promise<GetPostDataReturnType> {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, email: true } },
      category: { select: { id: true, name: true } },
      _count: { select: { likes: true } },
      comments: {
        select: {
          id: true,
          text: true,
          createdAt: true,
          userId: true,
          postId: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!post) return null;

  const session = await getServerSession(authOptions);
  let hasLiked = false;

  if (session?.user?.id) {
    const like = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: id,
        },
      },
    });
    hasLiked = !!like;
  }

  return { ...post, hasLiked } as GetPostDataReturnType;
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = params;
  const postData = await getPostData(id);

  if (!postData) {
    notFound();
  }

  const post = postData as PostDetail;
  const session = await getServerSession(authOptions);
  const isAuthor = session?.user?.id === post.author.id;

  return (
    <article
      className="max-w-2xl mx-auto text-white p-6 sm:p-8 rounded-lg shadow-lg"
      style={{ backgroundColor: '#1e2939' }}
    >
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full mb-2">
            {post.category.name}
          </span>
          <div className="text-sm text-gray-300">
            <span>
              By{' '}
              <span className="font-medium text-white hover:text-indigo-300 transition-colors">
                {post.author.name || post.author.email}
              </span>
            </span>
            <span className="mx-2">·</span>
            <span>{format(new Date(post.createdAt), 'PPP')}</span>
            {post.createdAt.toISOString() !== post.updatedAt.toISOString() && (
              <span className="text-xs italic text-gray-400 ml-2">(edited)</span>
            )}
          </div>
        </div>

        {isAuthor && (
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Link
              href={`/posts/${id}/edit`}
              className="inline-flex items-center bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-1.5 px-3 rounded text-sm transition-all"
            >
              <FiEdit className="mr-1.5 h-4 w-4" /> Edit
            </Link>
            <DeletePostButton postId={id} isAuthor={isAuthor} />
          </div>
        )}
      </div>

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-white leading-tight">{post.title}</h1>

      {/* Image */}
      {post.imageUrl && (
        <div className="mb-6 rounded-lg overflow-hidden">
          <img src={post.imageUrl} alt={post.title} className="w-full h-auto object-cover rounded-md" />
        </div>
      )}

      {/* Content */}
      <div className="prose prose-invert prose-lg max-w-none text-gray-200 mb-8">
        <p className="whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Like Button */}
      <div className="mb-8">
        <LikeButton postId={id} initialLikes={post._count.likes} initialLiked={post.hasLiked} />
      </div>

      {/* Comments */}
      <CommentSection postId={id} initialComments={post.comments} />
    </article>
  );
}
