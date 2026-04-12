import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
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
          <div key={wine.LWIN} className="wine-item">
            <p>{wine.DISPLAY_NAME}</p>
          </div>
        ))}
      </div>
    </>
  )
}

export default App
