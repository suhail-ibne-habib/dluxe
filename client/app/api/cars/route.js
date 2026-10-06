import { NextResponse } from 'next/server';
import { getFromServer } from '@/lib/client';

export async function GET(request) {
  try {
    const available = new URL(request.url).searchParams.get('available');
    const path = available === '1' ? '/cars?available=1' : '/cars';
    const cars = await getFromServer(path);
    return NextResponse.json(Array.isArray(cars) ? cars : []);
  } catch (error) {
    console.error('Error fetching cars:', error);
    return NextResponse.json({ message: 'Could not load cars' }, { status: 500 });
  }
}
