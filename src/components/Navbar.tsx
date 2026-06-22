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
    <nav className="border-b border-zinc-800 px-6 py-4 bg-zinc-950">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-amber-900 font-semibold tracking-widest text-sm uppercase">
          Kona
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/rate" className="text-zinc-500 hover:text-white transition-colors text-xs uppercase tracking-wider">
            Rate
          </Link>
          {username && (
            <Link
              href={`/user/${username}`}
              className="text-zinc-500 hover:text-white transition-colors text-xs uppercase tracking-wider"
            >
              Profile
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}