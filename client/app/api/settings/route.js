import { NextResponse } from 'next/server';
import { getFromServer } from '@/lib/client';

export async function GET() {
  try {
    const settings = await getFromServer('/settings');
    return NextResponse.json({
      whatsapp: settings?.whatsapp || null,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ whatsapp: null });
  }
}
