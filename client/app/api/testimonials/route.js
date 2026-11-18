import { NextResponse } from 'next/server';

const defaultTestimonials = [
  {
    id: 1,
    _id: "test-1",
    content: "The seamless transition from the aircraft to my private chauffeur was remarkable. D'LUXE Concierge sets the gold standard for luxury travel.",
    rating: 5,
    author_name: "James Worthington",
    author_title: "CEO, Global Ventures",
    author_image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    is_published: true,
    is_featured: true,
    created_at: "2026-03-15T10:00:00.000Z"
  },
  {
    id: 2,
    _id: "test-2",
    content: "The private terminal in Sint Maarten was an absolute oasis of calm. Worth every penny for the peace of mind and speed.",
    rating: 5,
    author_name: "Sarah Jenkins",
    author_title: "Managing Director, Apex Luxury",
    author_image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
    is_published: true,
    is_featured: false,
    created_at: "2026-04-02T14:30:00.000Z"
  },
  {
    id: 3,
    _id: "test-3",
    content: "Exceeded all expectations. The level of detail and care is unmatched in the industry. Baggage and customs were effortless.",
    rating: 5,
    author_name: "Elena Rodriguez",
    author_title: "Frequent Business Traveler",
    author_image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
    is_published: true,
    is_featured: false,
    created_at: "2026-04-18T09:15:00.000Z"
  },
  {
    id: 4,
    _id: "test-4",
    content: "Absolutely stress-free. My concierge took care of everything from luggage handling to fast-track security. Outstanding service.",
    rating: 5,
    author_name: "Marcus Aurelius",
    author_title: "Private Aviation Client",
    author_image_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    is_published: true,
    is_featured: false,
    created_at: "2026-05-01T11:45:00.000Z"
  },
  {
    id: 5,
    _id: "test-5",
    content: "A must-have for frequent business travelers. Efficiency at its finest, especially when making tight connections at major international hubs.",
    rating: 5,
    author_name: "Thomas Muller",
    author_title: "International Investor",
    author_image_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
    is_published: true,
    is_featured: false,
    created_at: "2026-05-10T16:20:00.000Z"
  }
];

export async function GET() {
  try {
    const strapiBase = process.env.NEXT_PUBLIC_API_URL || 'https://dluxe.eracodex.io/api';
    const strapiUrl = `${strapiBase}/testimonials?populate=*`;
    const headers = {};
    
    if (process.env.STRAPI_SECRET_KEY) {
      headers['Authorization'] = `Bearer ${process.env.STRAPI_SECRET_KEY}`;
    }

    const res = await fetch(strapiUrl, {
      headers,
      cache: 'no-store'
    });

    if (!res.ok) {
      // Fallback to test testimonials if Strapi fails
      return NextResponse.json(defaultTestimonials);
    }

    const strapiData = await res.json();
    const dataItems = strapiData.data || [];

    if (dataItems.length === 0) {
      // Return test testimonials so the client can review the section
      return NextResponse.json(defaultTestimonials);
    }

    const transformed = dataItems.map((item, index) => {
      // Extract content from Review blocks
      let content = '';
      if (Array.isArray(item.Review)) {
        content = item.Review
          .map(block => {
            if (block.children && Array.isArray(block.children)) {
              return block.children.map(child => child.text || '').join('');
            }
            return '';
          })
          .join('\n');
      } else if (typeof item.Review === 'string') {
        content = item.Review;
      } else if (item.content) {
        content = item.content;
      }

      // Extract author image URL
      let author_image_url = null;
      if (item.Profile && item.Profile.length > 0 && item.Profile[0].url) {
        const url = item.Profile[0].url;
        const domainBase = strapiBase.replace(/\/api\/?$/, '');
        author_image_url = url.startsWith('/') ? `${domainBase}${url}` : url;
      } else if (item.author_image_url) {
        author_image_url = item.author_image_url;
      }

      return {
        id: item.id,
        _id: item.id.toString(),
        content: content || '',
        rating: item.Rating || item.rating || 5,
        author_name: item.Name || item.author_name || 'Anonymous',
        author_title: item.Title || item.author_title || '',
        author_image_url: author_image_url || `https://i.pravatar.cc/150?u=${item.id}`,
        is_published: item.publishedAt ? !!item.publishedAt : true,
        is_featured: item.is_featured !== undefined ? item.is_featured : index === 0,
        created_at: item.createdAt || new Date().toISOString()
      };
    });

    return NextResponse.json(transformed.length > 0 ? transformed : defaultTestimonials);
  } catch (error) {
    console.error('Error fetching testimonials from Strapi, using default test testimonials:', error);
    return NextResponse.json(defaultTestimonials);
  }
}
