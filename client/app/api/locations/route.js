import { NextResponse } from 'next/server';
import { getFromServer } from '@/lib/client';

export async function GET() {
  try {
    const locations = await getFromServer('/locations');
    const transformed = (Array.isArray(locations) ? locations : []).map((item) => ({
      id: item.id,
      _id: String(item.id),
      countryName: item.countryName,
      isAvailable: item.isAvailable ?? true,
      airports: (item.airports || []).map((airport) => ({
        id: airport.id,
        _id: String(airport.id),
        name: airport.name,
        note: airport.note || '',
        excludedPackages: airport.excludedPackages || [],
        customPricing: airport.customPricing || [],
      })),
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
