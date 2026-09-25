import { NextResponse } from 'next/server';
import { getFromServer } from '@/lib/client';

export async function GET() {
  try {
    const testimonials = await getFromServer('/testimonials');
    const transformed = (Array.isArray(testimonials) ? testimonials : []).map((item, index) => ({
      id: item.id,
      _id: String(item.id),
      content: item.content || '',
      rating: item.rating || 5,
      author_name: item.author_name || 'Anonymous',
      author_title: item.author_title || '',
      author_image_url: item.author_image_url || null,
      is_published: Boolean(item.is_published),
      is_featured: Boolean(item.is_featured) || index === 0,
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
