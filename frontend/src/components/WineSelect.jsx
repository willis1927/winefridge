import { useEffect, useState } from 'react'

const WineSelect = ({ wines }) => {
  const calculateVintages = (wine) => {
    if (wine.firstVintage === 'NA') {
      return Array.from({ length: 20 }, (_, i) => `${new Date().getFullYear() - i}`)
    }
    const first = parseInt(wine.firstVintage)
    const final = wine.finalVintage === 'NA' ? new Date().getFullYear() : parseInt(wine.finalVintage)
    return Array.from({ length: final - first + 1 }, (_, i) => `${final - i}`)
  }

  const wineNames = wines.map(wine => wine.display_name)
  const [selectedWine, setSelectedWine] = useState(wineNames[0] || '')
  const [vintages, setVintages] = useState(() => calculateVintages(wines[0]))
  const [selectedVintage, setSelectedVintage] = useState(vintages[0] || '')

  useEffect(() => {
    const wine = wines.find(w => w.display_name === selectedWine)
    if (wine) {
      const newVintages = calculateVintages(wine)
      setVintages(newVintages)
      setSelectedVintage(newVintages[0] || '')
    }
  }, [selectedWine, wines])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-600">Wine</label>
        <select
          value={selectedWine}
          onChange={(e) => setSelectedWine(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          {wineNames.map((name, index) => (
            <option key={index} value={name}>{name}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm font-medium text-gray-600">Vintage</label>
          <select
            value={selectedVintage}
            onChange={(e) => setSelectedVintage(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            {vintages.map((vintage, index) => (
              <option key={index} value={vintage}>{vintage}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-600">Qty</label>
          <input
            type="number"
            min="1"
            defaultValue="1"
            className="w-20 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>
      </div>
    </div>
  )
}

export default WineSelect
