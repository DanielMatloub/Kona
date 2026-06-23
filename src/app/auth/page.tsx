'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async () => {
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else router.push('/')
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage('Check your email to confirm your account!')
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6">
      <h1 className="text-amber-800 font-semibold tracking-widest text-lg uppercase mb-2">
        Kona
      </h1>
      <p className="text-zinc-600 text-sm mb-10">
        {isLogin ? 'Welcome back' : 'Start rating coffee'}
      </p>

      <div className="w-full max-w-sm">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-zinc-900 text-white border border-zinc-800 rounded-lg px-4 py-3 mb-3 outline-none focus:border-zinc-600 transition-colors text-sm"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className="w-full bg-zinc-900 text-white border border-zinc-800 rounded-lg px-4 py-3 mb-4 outline-none focus:border-zinc-600 transition-colors text-sm"
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-amber-800 hover:bg-amber-700 text-white text-sm font-medium py-3 rounded-lg transition-colors tracking-wide"
        >
          {isLogin ? 'Log in' : 'Sign up'}
        </button>

        {message && (
          <p className="text-zinc-500 text-xs mt-4 text-center">{message}</p>
        )}

        <p className="text-zinc-600 text-xs mt-6 text-center">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  )
}