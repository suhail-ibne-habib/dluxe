import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const strapiBase = process.env.NEXT_PUBLIC_API_URL || 'https://dluxe.eracodex.io/api';
    const strapiUrl = `${strapiBase}/locations?populate[airports][fields][0]=airportName&populate[airports][fields][1]=airportNote&populate[airports][populate][Available_Packages][populate][package][fields][0]=id&populate[airports][populate][Available_Packages][populate][package][fields][1]=name`;

    const res = await fetch(strapiUrl, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch from Strapi' }, { status: res.status });
    }

    const strapiData = await res.json();

    const transformed = (strapiData.data || []).map(item => {
      // Map airports
      const airports = (item.airports || []).map(airport => {
        // Excluded packages: those that have isEnabled === false
        const excludedPackages = (item.Available_Packages || [])
          .filter(ap => ap.isEnabled === false && ap.package)
          .map(ap => ap.package.id.toString());

        // Custom pricing
        const customPricing = (item.Available_Packages || [])
          .filter(ap => ap.Updated_Price !== null && ap.package)
          .map(ap => ({
            package_id: ap.package.id.toString(),
            custom_price: ap.Updated_Price.toString()
          }));

        return {
          id: airport.id.toString(),
          _id: airport.id.toString(),
          name: airport.airportName,
          note: airport.airportNote || '',
          excludedPackages,
          customPricing
        };
      });

      return {
        id: item.id.toString(),
        _id: item.id.toString(),
        countryName: item.country_name,
        isAvailable: item.isAvailable ?? true,
        airports: airports
      };
    });

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error fetching locations from Strapi:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
