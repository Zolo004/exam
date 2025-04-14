// app/api/posts/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/posts - Fetch all posts (add filtering/searching later)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const searchTerm = searchParams.get('search');
  
  try {
    const posts = await prisma.post.findMany({
      where: {
        AND: [
          category ? { category: { name: { contains: category, mode: 'insensitive' } } } : {},
          searchTerm ? { title: { contains: searchTerm, mode: 'insensitive' } } : {},
        ],
      },
      include: {
        author: { select: { name: true, email: true } },
        category: { select: { name: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    return new NextResponse('Post-уудыг авахад алдаа гарлаа', { status: 500 });
  }
}

// POST /api/posts - Create a new post (requires authentication)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, content, categoryName, imageUrl } = body; 

    if (!title || !content || !categoryName) {
      return new NextResponse('Missing required fields: title, content, categoryName', { status: 400 });
    }

    const category = await prisma.category.upsert({
      where: { name: categoryName.trim() },
      update: {},
      create: { name: categoryName.trim() },
    });

    const categoryId = category.id;

    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        imageUrl: imageUrl || null,
        categoryId,
        authorId: session.user.id, 
      },
      include: {
          category: true,
          author: { select: { name: true, email: true } }
      }
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    return new NextResponse('Failed to create post', { status: 500 });
  }
}
