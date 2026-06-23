'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Rating {
  id: string
  stars: number
  drink_ordered: string | null
  visited_at: string | null
  created_at: string
  coffee_shops: {
    name: string
    city: string
  }
  profiles: {
    username: string
    display_name: string | null
  }
}

export default function Home() {
  const [ratings, setRatings] = useState<Rating[]>([])
  const [username, setUsername] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', data.user.id)
        .single()

      if (profile?.username?.includes('@')) { router.push('/onboarding'); return }
      setUsername(profile?.username || null)

      const { data: ratingsData, error: ratingsError } = await supabase
  .from('ratings')
  .select(`*, coffee_shops(name, city)`)
  .order('created_at', { ascending: false })
  .limit(20)

console.log('ratings error:', ratingsError)
console.log('ratings data:', ratingsData)

if (ratingsData) {
  // Fetch profiles for each unique user_id
  const userIds = [...new Set(ratingsData.map((r: any) => r.user_id))]
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('id, username, display_name')
    .in('id', userIds)

  const profileMap = Object.fromEntries(
    (profilesData || []).map((p: any) => [p.id, p])
  )

  setRatings(ratingsData.map((r: any) => ({
    ...r,
    profiles: profileMap[r.user_id] || { username: 'unknown', display_name: null }
  })))
}
    })
  }, [])

  if (!username) return null

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xs uppercase tracking-widest text-zinc-600">
            Recent ratings
          </h1>
          <Link
            href="/rate"
            className="text-xs uppercase tracking-widest text-amber-900 hover:text-amber-700 transition-colors"
          >
            + Rate
          </Link>
        </div>

        {ratings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-700 text-sm mb-4">No ratings yet.</p>
            <Link
              href="/rate"
              className="text-xs uppercase tracking-widest text-amber-900 hover:text-amber-700 transition-colors"
            >
              Be the first →
            </Link>
          </div>
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
                  <Link
                    href={`/user/${rating.profiles.username}`}
                    className="text-zinc-700 hover:text-zinc-400 text-xs mt-2 block transition-colors"
                  >
                    @{rating.profiles.username}
                  </Link>
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
      </div>
    </div>
  )
}