'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Place {
  fsq_id: string
  name: string
  location: {
    address: string
    locality: string
  }
}

export default function RatePage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Place[]>([])
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [stars, setStars] = useState<number>(0)
  const [drinkOrdered, setDrinkOrdered] = useState('')
  const [visitedAt, setVisitedAt] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  const searchCafes = async () => {
    if (!query) return
    let lat: number | null = null
    let lon: number | null = null
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
      )
      lat = position.coords.latitude
      lon = position.coords.longitude
    } catch {}

    const params = new URLSearchParams({ query })
    if (lat && lon) {
      params.append('lat', lat.toString())
      params.append('lon', lon.toString())
    }
    const res = await fetch(`/api/search?${params}`)
    const data = await res.json()
    setResults(data.results || [])
  }

  const handleSelectPlace = (place: Place) => {
    setSelectedPlace(place)
    setResults([])
    setQuery(place.name)
  }

  const handleRate = async () => {
    if (!selectedPlace || stars === 0) {
      setMessage('Please select a coffee shop and a star rating')
      return
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: shop, error: shopError } = await supabase
      .from('coffee_shops')
      .upsert({
        name: selectedPlace.name,
        address: selectedPlace.location?.address,
        city: selectedPlace.location?.locality,
        google_place_id: selectedPlace.fsq_id,
      }, { onConflict: 'google_place_id' })
      .select()
      .single()

    if (shopError) { setMessage(shopError.message); return }

    const { error: ratingError } = await supabase
      .from('ratings')
      .insert({
        user_id: user.id,
        shop_id: shop.id,
        stars,
        drink_ordered: drinkOrdered || null,
        visited_at: visitedAt || null,
      })

    if (ratingError) { setMessage(ratingError.message); return }
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-xl mx-auto px-6 py-10">
        <h1 className="text-xs uppercase tracking-widest text-zinc-600 mb-8">
          New rating
        </h1>

        {/* Search */}
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchCafes()}
            placeholder="Search for a coffee shop..."
            className="flex-1 bg-zinc-900 text-white border border-zinc-800 rounded-lg px-4 py-3 outline-none focus:border-zinc-600 transition-colors text-sm"
          />
          <button
            onClick={searchCafes}
            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white px-4 rounded-lg transition-colors text-sm"
          >
            Search
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg mb-8 overflow-hidden">
            {results.map((place) => (
              <button
                key={place.fsq_id}
                onClick={() => handleSelectPlace(place)}
                className="w-full text-left px-4 py-3 hover:bg-zinc-800 transition-colors border-b border-zinc-800 last:border-0"
              >
                <p className="text-white text-sm font-medium">{place.name}</p>
                <p className="text-zinc-600 text-xs mt-0.5">
                  {place.location?.address}{place.location?.address && place.location?.locality ? ', ' : ''}{place.location?.locality}
                </p>
              </button>
            ))}
          </div>
        )}

{/* Rating form */}
{selectedPlace && (
  <div className="space-y-6">
    <div>
      <p className="text-xs uppercase tracking-widest text-zinc-600 mb-3">Stars</p>
      <div className="flex flex-wrap gap-2">
        {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((value) => (
          <button
            key={value}
            onClick={() => setStars(value)}
            className={`px-3 h-10 rounded-lg text-sm transition-colors ${
              stars === value
                ? 'bg-amber-800 text-white border border-amber-700'
                : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-600 hover:text-white'
            }`}
          >
            {'★'.repeat(Math.floor(value))}{value % 1 !== 0 ? '½' : ''}
          </button>
        ))}
      </div>
    </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-600 mb-2">
                What did you order? <span className="text-zinc-700 normal-case tracking-normal">(optional)</span>
              </p>
              <input
                type="text"
                value={drinkOrdered}
                onChange={(e) => setDrinkOrdered(e.target.value)}
                placeholder="e.g. Oat latte"
                className="w-full bg-zinc-900 text-white border border-zinc-800 rounded-lg px-4 py-3 outline-none focus:border-zinc-600 transition-colors text-sm"
              />
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-600 mb-2">
                When did you visit? <span className="text-zinc-700 normal-case tracking-normal">(optional)</span>
              </p>
              <input
                type="date"
                value={visitedAt}
                onChange={(e) => setVisitedAt(e.target.value)}
                className="w-full bg-zinc-900 text-white border border-zinc-800 rounded-lg px-4 py-3 outline-none focus:border-zinc-600 transition-colors text-sm"
              />
            </div>

            <button
              onClick={handleRate}
              className="w-full bg-amber-800 hover:bg-amber-700 text-white text-sm font-medium py-3 rounded-lg transition-colors tracking-wide"
            >
              Save rating
            </button>

            {message && <p className="text-red-500 text-xs text-center">{message}</p>}
          </div>
        )}
      </div>
    </div>
  )
}