'use client'

import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Rating {
  id: string
  stars: number
  drink_ordered: string | null
  visited_at: string | null
  coffee_shops: {
    name: string
    city: string
  }
}

interface Profile {
  username: string
  display_name: string | null
}

export default function UserProfile({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [ratings, setRatings] = useState<Rating[]>([])
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (!profileData) { setNotFound(true); return }
      setProfile(profileData)

      const { data: ratingsData } = await supabase
        .from('ratings')
        .select(`*, coffee_shops(name, city)`)
        .eq('user_id', profileData.id)
        .order('created_at', { ascending: false })

      setRatings(ratingsData || [])
    }
    load()
  }, [username])

  if (notFound) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <p className="text-zinc-600 text-sm">User not found</p>
    </div>
  )

  if (!profile) return null

  const avgStars = ratings.length
    ? (ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length).toFixed(1)
    : null

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-xl mx-auto px-6 py-10">

        {/* Profile header */}
        <div className="mb-10">
          <h1 className="text-2xl font-semibold text-white">
            {profile.display_name || profile.username}
          </h1>
          <p className="text-zinc-600 text-sm mt-1">@{profile.username}</p>

          <div className="flex gap-6 mt-5">
            <div>
              <p className="text-white font-semibold">{ratings.length}</p>
              <p className="text-zinc-600 text-xs uppercase tracking-wider mt-0.5">Ratings</p>
            </div>
            {avgStars && (
              <div>
                <p className="text-white font-semibold">{avgStars}</p>
                <p className="text-zinc-600 text-xs uppercase tracking-wider mt-0.5">Avg stars</p>
              </div>
            )}
          </div>
        </div>

        {/* Ratings list */}
        {ratings.length === 0 ? (
          <p className="text-zinc-700 text-sm">No ratings yet.</p>
        ) : (
          <div className="space-y-3">
            {ratings.map((rating) => (
              <div
                key={rating.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 flex justify-between items-start gap-4"
              >
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {rating.coffee_shops.name}
                  </p>
                  <p className="text-zinc-600 text-xs mt-0.5">
                    {rating.coffee_shops.city}
                  </p>
                  {rating.drink_ordered && (
                    <p className="text-zinc-500 text-xs mt-2">
                      {rating.drink_ordered}
                    </p>
                  )}
                  {rating.visited_at && (
                    <p className="text-zinc-700 text-xs mt-1">
                      {new Date(rating.visited_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-amber-900 font-semibold text-lg leading-none">
                    {rating.stars}
                  </p>
                  <p className="text-amber-900 text-xs opacity-60 mt-1">★</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link
            href="/rate"
            className="text-xs uppercase tracking-widest text-zinc-700 hover:text-zinc-400 transition-colors"
          >
            + New rating
          </Link>
        </div>
      </div>
    </div>
  )
}