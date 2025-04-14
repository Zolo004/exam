import prisma from '@/lib/prisma';

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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId'); // userId-г URL-аас авах

    if (!userId) {
      return new Response('User ID is required', { status: 400 });
    }

    const posts = await prisma.post.findMany({
      where: { authorId: userId }, // Хэрэглэгчийн ID-гаар фильтр хийх
      include: {
        author: { select: { name: true, email: true } },
        category: { select: { name: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: {
        createdAt: 'desc', // Үндсэн дээр шинэ нийтлэлүүдийг эхэнд нь харагдуулна
      },
    });

    return new Response(JSON.stringify({ posts }), { status: 200 });
  } catch (error) {
    console.error("Алдаа гарлаа:", error);
    return new Response('Алдаа гарлаа', { status: 500 });
  }
}
