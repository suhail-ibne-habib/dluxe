import { NextResponse } from 'next/server';
import { getFromServer } from '@/lib/client';

export async function GET() {
  try {
    const packages = await getFromServer('/packages');
    const transformed = (Array.isArray(packages) ? packages : []).map((item) => ({
      _id: String(item.id ?? item._id),
      id: item.id ?? item._id,
      name: item.name,
      isActive: item.isActive ?? true,
      basePrice: typeof item.basePrice === 'string' ? parseFloat(item.basePrice) : item.basePrice,
      description: item.description || '',
      isPopular: item.isPopular || false,
      features: Array.isArray(item.features) ? item.features : [],
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
