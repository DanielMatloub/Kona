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
    } catch {
      // Location denied or unavailable, search globally
    }

    const params = new URLSearchParams({ query })
    if (lat && lon) {
      params.append('lat', lat.toString())
      params.append('lon', lon.toString())
    }

    const res = await fetch(`/api/search?${params}`)
    const data = await res.json()
    console.log('results:', data)
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
    <div className="min-h-screen bg-black text-white p-8 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-amber-900 mb-8">Rate a café ☕</h1>

      <label className="text-zinc-400 text-sm">Search for a coffee shop</label>
      <div className="flex gap-2 mt-1 mb-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchCafes()}
          placeholder="e.g. Blue Bottle Coffee"
          className="flex-1 bg-zinc-800 text-white rounded-lg px-4 py-3 outline-none"
        />
        <button
          onClick={searchCafes}
          className="bg-amber-900 hover:bg-amber-950 text-white px-4 rounded-lg transition-colors"
        >
          Search
        </button>
      </div>

      {results.length > 0 && (
        <div className="bg-zinc-900 rounded-lg mb-6 overflow-hidden">
          {results.map((place) => (
            <button
              key={place.fsq_id}
              onClick={() => handleSelectPlace(place)}
              className="w-full text-left px-4 py-3 hover:bg-zinc-800 transition-colors border-b border-zinc-800 last:border-0"
            >
              <p className="text-white font-medium">{place.name}</p>
              <p className="text-zinc-400 text-sm">{place.location?.address}, {place.location?.locality}</p>
            </button>
          ))}
        </div>
      )}

      {selectedPlace && (
        <>
          <div className="mb-6">
            <label className="text-zinc-400 text-sm">Stars</label>
            <div className="flex gap-1 mt-2">
              {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => setStars(value)}
                  className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                    stars === value
                      ? 'bg-amber-900 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <label className="text-zinc-400 text-sm">What did you order? (optional)</label>
          <input
            type="text"
            value={drinkOrdered}
            onChange={(e) => setDrinkOrdered(e.target.value)}
            placeholder="e.g. Oat latte"
            className="w-full bg-zinc-800 text-white rounded-lg px-4 py-3 mt-1 mb-4 outline-none"
          />

          <label className="text-zinc-400 text-sm">When did you visit? (optional)</label>
          <input
            type="date"
            value={visitedAt}
            onChange={(e) => setVisitedAt(e.target.value)}
            className="w-full bg-zinc-800 text-white rounded-lg px-4 py-3 mt-1 mb-6 outline-none"
          />

          <button
            onClick={handleRate}
            className="w-full bg-amber-900 hover:bg-amber-950 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Save rating
          </button>

          {message && <p className="text-red-400 text-sm mt-4">{message}</p>}
        </>
      )}
    </div>
  )
}