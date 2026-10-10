import { NextResponse } from 'next/server';
import { getFromServer } from '@/lib/client';

export async function GET() {
  try {
    const locations = await getFromServer('/rental-locations');
    return NextResponse.json(Array.isArray(locations) ? locations : []);
  } catch (error) {
    console.error('Error fetching rental locations:', error);
    return NextResponse.json({ message: 'Could not load locations' }, { status: 500 });
  }
}
