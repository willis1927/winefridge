import { useState } from 'react'
import WineDetails from './components/WineDetails'
import './App.css'
import { supabase } from './lib/supabase'
import { useAuth } from './context/AuthContext'
import { apiFetch } from './utils/api'



function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [wines, setWines] = useState([])
  const {user, session } = useAuth()
  
  
  const signIn = () => supabase.auth.signInWithOAuth({ 
    provider: 'google',
    options: { redirectTo: window.location.origin }
  })

const signOut = () => supabase.auth.signOut()
  
async function search(e) {
    e.preventDefault()
    try {
      const res = await apiFetch(`/wines?search=${searchTerm}`)
      const data = await res.json()
      setWines(data)
      console.log('Found wines:', data)
      
    } catch (err) {
      console.error('Search error:', err)
    }
  }

  return (
      <>
        {user ? (
      <>
        <span>{user.email}</span>
        <button onClick={signOut}>Sign out</button>
      </>
      ) : (
      <button onClick={signIn}>Sign in with Google</button>
    )}
      <h1>Wine Fridge</h1>
      <form onSubmit={search}>
         <input type="text" placeholder="Search for a wine..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
         <button type="submit">Search</button>
      </form>
      

      <div className="wine-list">
        {wines.map((wine) => (
          <div key={wine.LWIN} className="wine-item">
            <WineDetails
              wineName={wine.DISPLAY_NAME}
              vintage={wine.VINTAGE}
              quantity={wine.QUANTITY}
              size={wine.SIZE}
              datePurchased={wine.DATE_PURCHASED}
              purchasedFrom={wine.PURCHASED_FROM}
              dateStored={wine.DATE_STORED}
              storage={wine.STORAGE}
              notes={wine.NOTES}
              drinkBy={wine.DRINK_BY}
              drinkStatus={wine.DRINK_STATUS}
            />
          </div>
        ))}
      </div>
    </>
  )
}

export default App
