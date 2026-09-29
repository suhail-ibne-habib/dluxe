import { NextResponse } from 'next/server';
import { getFromServer } from '@/lib/client';

export async function GET() {
  try {
    const settings = await getFromServer('/settings');
    return NextResponse.json({
      whatsapp: settings?.whatsapp || settings?.whatsapp_number || null,
      contact_phone: settings?.contact_phone || null,
      contact_email: settings?.contact_email || null,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ whatsapp: null, contact_phone: null, contact_email: null });
  }
}
