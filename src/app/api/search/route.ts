import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query')
  const lat = request.nextUrl.searchParams.get('lat')
  const lon = request.nextUrl.searchParams.get('lon')

  if (!query) {
    return NextResponse.json({ error: 'Query required' }, { status: 400 })
  }

  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '8',
    addressdetails: '1',
    countrycodes: 'us',
    ...(lat && lon ? {
      viewbox: `${Number(lon) - 0.1},${Number(lat) + 0.1},${Number(lon) + 0.1},${Number(lat) - 0.1}`,
    } : {}),
  })

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    { headers: { 'User-Agent': 'Kona Coffee App (dev)' } }
  )

  const data = await response.json()
  return NextResponse.json({
    results: data.map((place: any) => ({
      fsq_id: place.place_id.toString(),
      name: place.display_name.split(',')[0],
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon),
      location: {
        address: place.address?.road || place.address?.pedestrian || '',
        locality: place.address?.city || place.address?.town || place.address?.village || '',
      }
    }))
  })
}