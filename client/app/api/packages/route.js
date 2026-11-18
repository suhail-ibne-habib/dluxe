import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const strapiBase = process.env.NEXT_PUBLIC_API_URL || 'https://dluxe.eracodex.io/api';
    const res = await fetch(`${strapiBase}/packages`, {
      cache: 'no-store'
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch from Strapi' }, { status: res.status });
    }
    const strapiData = await res.json();
    
    // Transform data to fit client requirements
    const transformed = (strapiData.data || []).map(item => {
      // Extract features from blocks
      let features = [];
      if (item.Features) {
        let blocks = item.Features;
        if (typeof blocks === 'string') {
          try { blocks = JSON.parse(blocks); } catch { blocks = []; }
        }
        if (Array.isArray(blocks)) {
          for (const block of blocks) {
            if (block.type === 'list' && Array.isArray(block.children)) {
              for (const child of block.children) {
                if (child.type === 'list-item' && Array.isArray(child.children)) {
                  const text = child.children.map(c => c.text || '').join('');
                  if (text) features.push(text);
                }
              }
            } else if (block.type === 'paragraph' && Array.isArray(block.children)) {
              const text = block.children.map(c => c.text || '').join('');
              if (text) features.push(text);
            }
          }
        }
      }

      // Extract image if available
      let imageUrl = item.image || item.image_url || null;
      if (!imageUrl && item.Image && item.Image.url) {
        const domainBase = strapiBase.replace(/\/api\/?$/, '');
        imageUrl = item.Image.url.startsWith('/') ? `${domainBase}${item.Image.url}` : item.Image.url;
      }

      return {
        _id: item.id.toString(),
        id: item.id,
        name: item.name,
        isActive: item.isAvailable ?? true,
        basePrice: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
        description: item.description || '',
        isPopular: item.isPopular || false,
        features: features,
        image: imageUrl
      };
    });

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error fetching packages from Strapi:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
