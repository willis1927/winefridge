import { useEffect, useState } from 'react'
import WineDetails from './components/WineDetails'
import './App.css'

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [wines, setWines] = useState([])
  const [filteredSuggestions, setFilteredSuggestions] = useState([])

  useEffect(async () => {
    if (searchTerm) {
      const suggestions = await search(searchTerm)
      setFilteredSuggestions(suggestions.map(wine => wine.display_name))
      
    }
  },[searchTerm])

  async function search(e) {
    e.preventDefault()
    try {
      const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')
      const res = await fetch(`${baseUrl}/wines?search=${searchTerm}`)
      const data = await res.json()
      setWines(data)
      console.log('Found wines:', data)
      
    } catch (err) {
      console.error('Search error:', err)
    }
  }

  return (
    <div className="mx-auto w-3/4 p-4 border-solid border-2 border-gray-300 rounded-lg mt-10">
      
      <div className='mx-autoflex flex flex-col align-middle mb-6'>
        <h1 className=" mx-auto font-bold text-2xl mb-4">Wine Fridge</h1>
        <form className="flex flex-col" onSubmit={search}>
          <input className="text-center border p-2 rounded mr-2 mb-3  " type="text" placeholder="Search for a wine..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          {/* <ul className="autocomplete-suggestions" hidden={filteredSuggestions.length === 0}>
          {filteredSuggestions.map((suggestion, index) => (
            <a href="#selectContainer" ><li
              className='autocomplete-suggestion' 
              key={index} 
              //onClick={() => setSearchTerm(suggestion)}
              >
              {suggestion}
              </li></a>
          ))}
          </ul> */}
          <button className="bg-red-950 text-white p-2 rounded" type="submit">Search</button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-4">
        {wines.map((wine) => (
          <div key={wine.lwin}>
            <WineDetails
              wineName={wine.display_name}
              producer={wine.producer_name}
              wine={wine.wine}
              colour={wine.colour}
              type={wine.type}
              subType={wine.sub_type}
              country={wine.country}
              region={wine.region}
              subRegion={wine.sub_region}
              firstVintage={wine.first_vintage}
              finalVintage={wine.final_vintage}
              status={wine.status}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
