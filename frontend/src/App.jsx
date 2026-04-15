import { useState } from 'react'
import WineDetails from './components/WineDetails'
import './App.css'

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [wines, setWines] = useState([])

  async function search(e) {
    e.preventDefault()
    try {
      const res = await fetch(`http://localhost:3000/wines?search=${searchTerm}`)
      const data = await res.json()
      setWines(data)
      console.log('Found wines:', data)
      
    } catch (err) {
      console.error('Search error:', err)
    }
  }

  return (
    <>
      <h1>Wine Fridge</h1>
      <form onSubmit={search}>
         <input type="text" placeholder="Search for a wine..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
         <button type="submit">Search</button>
      </form>
      

      <div className="wine-list">
        {wines.map((wine) => (
          <div key={wine.LWIN} className="wine-item border p-4 mb-4 rounded w-2/3 mx-auto bg-zinc-500">
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
