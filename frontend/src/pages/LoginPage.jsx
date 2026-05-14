import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (session) navigate('/cellar', { replace: true })
  }, [session, navigate])

  async function handleGoogleSignIn() {
    setGoogleLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/cellar` },
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('Check your email for a confirmation link.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function switchMode() {
    setMode(m => m === 'login' ? 'signup' : 'login')
    setError(null)
    setMessage(null)
  }

  const inputClass = 'bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition'

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 to-amber-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="mb-10 text-center">
          <h1 className="text-4xl font-serif font-light tracking-widest text-amber-100 uppercase">
            Wine Fridge
          </h1>
          <p className="mt-2 text-sm tracking-widest text-slate-400 uppercase">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </p>
          <div className="mt-4 mx-auto w-16 border-t border-amber-700" />
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 space-y-6">
          <h2 className="text-xs font-semibold tracking-widest text-amber-500 uppercase">
            {mode === 'login' ? 'Sign In' : 'Sign Up'}
          </h2>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 active:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed border border-slate-600 text-slate-100 text-sm font-medium tracking-wide transition-colors duration-200"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            {googleLoading ? 'Redirecting…' : 'Continue with Google'}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-slate-700" />
            <span className="text-xs text-slate-500 uppercase tracking-widest">or</span>
            <div className="flex-1 border-t border-slate-700" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div className="flex flex-col gap-1">
              <label className="text-xs tracking-widest text-slate-400 uppercase">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs tracking-widest text-slate-400 uppercase">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className={inputClass}
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
            {message && <p className="text-sm text-green-500">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-amber-700 hover:bg-amber-600 active:bg-amber-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold tracking-widest uppercase text-sm transition-colors duration-200 shadow-lg shadow-amber-900/40"
            >
              {loading
                ? (mode === 'login' ? 'Signing in…' : 'Creating account…')
                : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={switchMode}
              className="text-amber-500 hover:text-amber-400 transition-colors"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

      </div>
    </div>
  )
}
