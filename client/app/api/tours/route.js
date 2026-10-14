import { NextResponse } from 'next/server';
import { getFromServer } from '@/lib/client';

export async function GET() {
  try {
    const tours = await getFromServer('/tours');
    return NextResponse.json(Array.isArray(tours) ? tours : []);
  } catch (error) {
    console.error('Error fetching tours:', error);
    return NextResponse.json({ message: 'Could not load tours' }, { status: 500 });
  }
}
