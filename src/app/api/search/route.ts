import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query')

  if (!query) {
    return NextResponse.json({ error: 'Query required' }, { status: 400 })
  }

  const params = new URLSearchParams({
    q: query + ' coffee shop',
    format: 'json',
    limit: '8',
    addressdetails: '1',
  })

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    {
      headers: {
        'User-Agent': 'Kona Coffee App (dev)',
      },
    }
  )

  const data = await response.json()

  const results = data.map((place: any) => ({
    fsq_id: place.place_id.toString(),
    name: place.display_name.split(',')[0],
    location: {
      address: place.address?.road || place.address?.pedestrian || '',
      locality: place.address?.city || place.address?.town || place.address?.village || '',
    }
  }))

  return NextResponse.json({ results })
}