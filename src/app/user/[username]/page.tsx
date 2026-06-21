'use client'

import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'

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
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <p className="text-zinc-400">User not found</p>
    </div>
  )

  if (!profile) return null

  return (
    <div className="min-h-screen bg-black text-white p-8 max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          {profile.display_name || profile.username}
        </h1>
        <p className="text-zinc-400">@{profile.username}</p>
        <p className="text-zinc-500 text-sm mt-1">{ratings.length} ratings</p>
      </div>

      {ratings.length === 0 ? (
        <p className="text-zinc-500">No ratings yet.</p>
      ) : (
        <div className="space-y-4">
          {ratings.map((rating) => (
            <div key={rating.id} className="bg-zinc-900 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-white font-semibold">
                    {rating.coffee_shops.name}
                  </h2>
                  <p className="text-zinc-400 text-sm">
                    {rating.coffee_shops.city}
                  </p>
                  {rating.drink_ordered && (
                    <p className="text-zinc-400 text-sm mt-1">
                      ☕ {rating.drink_ordered}
                    </p>
                  )}
                  {rating.visited_at && (
                    <p className="text-zinc-500 text-xs mt-1">
                      {new Date(rating.visited_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span className="text-amber-900 font-bold text-xl">
                  {rating.stars}★
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}