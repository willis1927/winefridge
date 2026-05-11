import { useState, useEffect } from 'react'
import WineDetails from './components/WineDetails'
import WineSelect from './components/WineSelect.jsx'
import './App.css'
import { supabase } from './lib/supabase'
import { useAuth } from './context/AuthContext'
import { apiFetch } from './utils/api'



function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [wines, setWines] = useState([])
  const {user, session } = useAuth()
  
//   const signIn = () => supabase.auth.signInWithOAuth({ 
//   provider: 'google',
//   options: {
//     redirectTo: window.location.origin,
//     queryParams: { prompt: 'select_account' }
//   }
// })

// const signOut = () => supabase.auth.signOut()
  
async function search(e) {
    e.preventDefault()
    try {
      const res = await apiFetch(`/wines/search?name=${searchTerm}`)
      const data = await res.json()
      setWines(data)
      console.log(wines)
      console.log('Found wines:', data)
      
    } catch (err) {
      console.error('Search error:', err)
    }
  }

const [storageLocations, setStorageLocations] = useState([])

  useEffect(() => {
    async function fetchStorage() {
      const res = await apiFetch('/storage')
      const data = await res.json()
      setStorageLocations(data)
    }
    fetchStorage()
  }, [])
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-800 text-white py-4 shadow-md">
        <div className="max-w-2xl mx-auto px-4 flex items-center gap-3">
          <span className="text-2xl">🍷</span>
          <h1 className="text-2xl font-bold tracking-wide">Wine Fridge</h1>
          {/* {user ? (
            <>
              <span className="ml-auto text-sm">{user.email}</span>
              <button onClick={signOut} className="ml-2 text-sm underline">Sign out</button>
            </>
          ) : (
            <button onClick={signIn} className="ml-auto text-sm underline">Sign in with Google</button>
          )} */}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* Search card */}
        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Find a Wine</h2>
          <form onSubmit={search} className="flex gap-2">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            <button
              type="submit"
              className="bg-green-800 hover:bg-green-900 text-white px-5 py-2 rounded-lg font-medium transition-colors"
            >
              Search
            </button>
          </form>
        </section>

        {/* Wine + storage selection card */}
        {wines.length > 0 && (
          <section className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-gray-700">Store Wine</h2>

            <WineSelect wines={wines} />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">Storage Location</label>
              <select className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white">
                {storageLocations.map(location => (
                  <option key={location.id} value={location.id}>{location.name}</option>
                ))}
              </select>
            </div>

            <button className="self-end bg-green-800 hover:bg-green-900 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Add Wine
            </button>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
