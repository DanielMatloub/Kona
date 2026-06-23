'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Onboarding() {
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSave = async () => {
    if (username.length < 3) {
      setMessage('Username must be at least 3 characters')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({ username, display_name: displayName })
      .eq('id', user.id)

    if (error) setMessage(error.message)
    else router.push('/')
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6">
      <h1 className="text-amber-800 font-semibold tracking-widest text-lg uppercase mb-2">
        Kona
      </h1>
      <p className="text-zinc-600 text-sm mb-10">Set up your profile</p>

      <div className="w-full max-w-sm">
        <label className="text-zinc-600 text-xs uppercase tracking-wider mb-2 block">
          Username
        </label>
        <input
          type="text"
          placeholder="e.g. daniel_matl"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
          className="w-full bg-zinc-900 text-white border border-zinc-800 rounded-lg px-4 py-3 mb-5 outline-none focus:border-zinc-600 transition-colors text-sm"
        />

        <label className="text-zinc-600 text-xs uppercase tracking-wider mb-2 block">
          Display name
        </label>
        <input
          type="text"
          placeholder="e.g. Daniel"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full bg-zinc-900 text-white border border-zinc-800 rounded-lg px-4 py-3 mb-6 outline-none focus:border-zinc-600 transition-colors text-sm"
        />

        <button
          onClick={handleSave}
          className="w-full bg-amber-800 hover:bg-amber-700 text-white text-sm font-medium py-3 rounded-lg transition-colors tracking-wide"
        >
          Let's go
        </button>

        {message && (
          <p className="text-red-500 text-xs mt-4 text-center">{message}</p>
        )}
      </div>
    </div>
  )
}