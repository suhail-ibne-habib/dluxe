import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const strapiBase = process.env.NEXT_PUBLIC_API_URL || 'https://dluxe.eracodex.io/api';
    const strapiUrl = `${strapiBase}/setting`;

    const headers = {};
    if (process.env.STRAPI_SECRET_KEY) {
      headers['Authorization'] = `Bearer ${process.env.STRAPI_SECRET_KEY}`;
    }

    const res = await fetch(strapiUrl, { headers, cache: 'no-store' });
    if (!res.ok) {
      // Return defaults gracefully rather than propagating the error
      return NextResponse.json({ whatsapp: null });
    }

    const strapiData = await res.json();
    const attrs = strapiData?.data || {};

    return NextResponse.json({
      whatsapp: attrs.whatsapp || null,
    });
  } catch (error) {
    console.error('Error fetching settings from Strapi:', error);
    return NextResponse.json({ whatsapp: null });
  }
}
