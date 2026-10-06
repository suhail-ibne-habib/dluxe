import { NextResponse } from 'next/server';
import { API_BASE_URL, fetchWithTimeout } from '@/lib/api';

export async function POST(request) {
  try {
    const body = await request.json();
    const response = await fetchWithTimeout(`${API_BASE_URL}/rental-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error creating rental request:', error);
    return NextResponse.json({ message: 'Could not send the request' }, { status: 500 });
  }
}
