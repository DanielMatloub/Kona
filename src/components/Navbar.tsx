'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', data.user.id)
        .single()
      setUsername(profile?.username || null)
    })
  }, [])

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <Link href="/" className="text-amber-900 font-bold text-xl">
          Kona ☕
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/rate" className="text-zinc-400 hover:text-white transition-colors text-sm">
            Rate
          </Link>
          {username && (
            <Link
              href={`/user/${username}`}
              className="text-zinc-400 hover:text-white transition-colors text-sm"
            >
              Profile
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}