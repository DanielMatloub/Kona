'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push('/auth')
        return
      }
      setUser(data.user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      setProfile(profileData)

      // If username looks like an email, they haven't set one yet
      if (profileData?.username?.includes('@')) {
        router.push('/onboarding')
      }
    })
  }, [])

  if (!user || !profile) return null

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold text-amber-900">Kona ☕</h1>
      <p className="text-zinc-400 mt-2">Welcome, @{profile.username}</p>
    </div>
  )
}