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

    if (error) {
      setMessage(error.message)
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-zinc-900 p-8 rounded-xl w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white mb-2">Set up your profile</h1>
        <p className="text-zinc-400 text-sm mb-6">This is how you'll appear on Kona</p>

        <label className="text-zinc-400 text-sm">Username</label>
        <input
          type="text"
          placeholder="e.g. daniel"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
          className="w-full bg-zinc-800 text-white rounded-lg px-4 py-3 mb-4 mt-1 outline-none"
        />

        <label className="text-zinc-400 text-sm">Display name</label>
        <input
          type="text"
          placeholder="e.g. Daniel"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full bg-zinc-800 text-white rounded-lg px-4 py-3 mb-4 mt-1 outline-none"
        />

        <button
          onClick={handleSave}
          className="w-full bg-amber-900 hover:bg-amber-950 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          Let's go
        </button>

        {message && <p className="text-red-400 text-sm mt-4">{message}</p>}
      </div>
    </div>
  )
}