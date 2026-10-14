import { NextResponse } from 'next/server';
import { getFromServer } from '@/lib/client';

export async function GET(_request, { params }) {
  try {
    const { slug } = await params;
    const tour = await getFromServer(`/tours/slug/${encodeURIComponent(slug)}`);
    return NextResponse.json(tour);
  } catch (error) {
    console.error('Error fetching tour:', error);
    return NextResponse.json({ message: 'Tour not found' }, { status: 404 });
  }
}
