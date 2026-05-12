import { useState, useRef, useCallback, useEffect, createContext, useContext } from 'react'
import { apiFetch } from './utils/api'

const COLOURS = ['Red', 'White', 'Rosé', 'Sparkling', 'Dessert', 'Fortified']
const SIZES = ['187.5ml', '375ml', '500ml', '750ml', '1L', '1.5L (Magnum)', '3L (Double Magnum)', '6L (Imperial)']
const VINTAGES = ['NV', ...Array.from({ length: new Date().getFullYear() - 1979 }, (_, i) => String(new Date().getFullYear() - i))]

// ─── Theme ───────────────────────────────────────────────────────────────────

const ThemeCtx = createContext(null)
const useTheme = () => useContext(ThemeCtx)

const DARK = {
  page: 'bg-stone-950',
  card: 'bg-stone-900 border border-stone-700',
  input: 'bg-stone-800 border border-stone-600 text-stone-100 placeholder-stone-500 focus:ring-amber-600',
  label: 'text-stone-400',
  title: 'text-amber-100',
  subtitle: 'text-stone-400',
  sectionHead: 'text-amber-600',
  divider: 'border-stone-700',
  listBg: 'bg-stone-800 border border-stone-600',
  listItem: 'text-stone-100',
  listSub: 'text-stone-400',
  listActive: 'bg-stone-600',
  listHover: 'hover:bg-stone-700',
  clearBtn: 'text-stone-400 hover:text-stone-100',
  accentBar: 'border-amber-700',
  toggleBtn: 'bg-stone-800 border border-stone-600 text-stone-300 hover:text-amber-400 hover:border-amber-600',
  submitShadow: 'shadow-amber-900/40',
}

const LIGHT = {
  page: 'bg-amber-50',
  card: 'bg-white border border-stone-200',
  input: 'bg-white border border-stone-300 text-stone-800 placeholder-stone-400 focus:ring-amber-500',
  label: 'text-stone-500',
  title: 'text-stone-800',
  subtitle: 'text-stone-500',
  sectionHead: 'text-amber-700',
  divider: 'border-stone-200',
  listBg: 'bg-white border border-stone-200',
  listItem: 'text-stone-800',
  listSub: 'text-stone-500',
  listActive: 'bg-amber-100',
  listHover: 'hover:bg-stone-100',
  clearBtn: 'text-stone-400 hover:text-stone-700',
  accentBar: 'border-amber-600',
  toggleBtn: 'bg-white border border-stone-300 text-stone-500 hover:text-amber-700 hover:border-amber-500',
  submitShadow: 'shadow-amber-700/30',
}

// ─── App ─────────────────────────────────────────────────────────────────────

function App() {
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const t = dark ? DARK : LIGHT

  const [storageLocations, setStorageLocations] = useState([])
  const [users, setUsers] = useState([])

  useEffect(() => {
    apiFetch('/storage')
      .then((res) => res.json())
      .then((data) => setStorageLocations(data))
      .catch((err) => console.error('Storage fetch error:', err))
    apiFetch('/users')
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error('Users fetch error:', err))
  }, [])

  const [form, setForm] = useState({
    lwin: '',
    wineName: '',
    owner: '',
    region: '',
    subRegion: '',
    country: '',
    vintage: '',
    producer: '',
    classification: '',
    colour: '',
    size: '750ml',
    quantity: '1',
    storageLocation: '',
    purchasedFrom: '',
    purchasedDate: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleWineSelect = (wine) => {
    setForm((prev) => ({
      ...prev,
      wineName: wine.display_name ?? prev.wineName,
      lwin: wine.lwin ?? prev.lwin,
      producer: wine.producer_name ?? prev.producer,
      country: wine.country ?? prev.country,
      region: wine.region ?? prev.region,
      subRegion: wine.sub_region ?? prev.subRegion,
      colour: wine.colour ?? prev.colour,
      classification: wine.classification ?? prev.classification,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Adding to storage:', form)
    // TODO: wire up to API
  }

  const selectClass = `${t.input} rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition appearance-none`

  return (
   <ThemeCtx.Provider value={{ t }}>
  <div className={`min-h-screen ${t.page} flex items-start justify-center py-14 px-4 transition-colors duration-300`}>
    {/* Theme toggle — fixed top-right, clear of all content */}
    <button
      type="button"
      onClick={() => setDark((d) => !d)}
      className={`fixed top-4 right-4 z-50 rounded-lg p-2 transition-colors duration-200 ${t.toggleBtn}`}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>

    <div className="w-full max-w-2xl">

      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className={`text-4xl font-serif font-light tracking-widest ${t.title} uppercase transition-colors duration-300`}>
          Wine Fridge
        </h1>
        <p className={`mt-2 text-sm tracking-widest ${t.subtitle} uppercase transition-colors duration-300`}>
          Add a bottle to your cellar
        </p>
        <div className={`mt-4 mx-auto w-16 border-t ${t.accentBar} transition-colors duration-300`} />
      </div>

          {/* Card */}
          <form
            onSubmit={handleSubmit}
            className={`${t.card} rounded-2xl shadow-2xl p-8 space-y-8 transition-colors duration-300`}
          >
            {/* Section: Wine Identity */}
            <section>
              <h2 className={`text-xs font-semibold tracking-widest ${t.sectionHead} uppercase mb-4 transition-colors duration-300`}>
                Wine Identity
              </h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <WineAutocomplete
                  value={form.wineName}
                  onChange={(val) => setForm((prev) => ({ ...prev, wineName: val }))}
                  onSelect={handleWineSelect}
                />
                <Field label="Producer" name="producer" value={form.producer} onChange={handleChange} placeholder="e.g. Château Margaux" />
                <Field label="Classification" name="classification" value={form.classification} onChange={handleChange} placeholder="e.g. Premier Cru" />
              </div>
            </section>

            <Divider />

            {/* Section: Origin */}
            <section>
              <h2 className={`text-xs font-semibold tracking-widest ${t.sectionHead} uppercase mb-4 transition-colors duration-300`}>
                Origin
              </h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Country" name="country" value={form.country} onChange={handleChange} placeholder="e.g. France" />
                <Field label="Region" name="region" value={form.region} onChange={handleChange} placeholder="e.g. Bordeaux" />
                <Field label="Sub-Region" name="subRegion" value={form.subRegion} onChange={handleChange} placeholder="e.g. Margaux" />
              </div>
            </section>

            <Divider />

            {/* Section: Bottle Details */}
            <section>
              <h2 className={`text-xs font-semibold tracking-widest ${t.sectionHead} uppercase mb-4 transition-colors duration-300`}>
                Bottle Details
              </h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className={`text-xs tracking-widest ${t.label} uppercase transition-colors duration-300`}>Vintage</label>
                  <select name="vintage" value={form.vintage} onChange={handleChange} className={selectClass}>
                    <option value="">Select vintage…</option>
                    {VINTAGES.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className={`text-xs tracking-widest ${t.label} uppercase transition-colors duration-300`}>Colour</label>
                  <select name="colour" value={form.colour} onChange={handleChange} className={selectClass}>
                    <option value="">Select colour…</option>
                    {COLOURS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className={`text-xs tracking-widest ${t.label} uppercase transition-colors duration-300`}>Size</label>
                  <select name="size" value={form.size} onChange={handleChange} className={selectClass}>
                    <option value="">Select size…</option>
                    {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <Field label="Quantity" name="quantity" value={form.quantity} onChange={handleChange} placeholder="e.g. 6" type="number" />
              </div>
            </section>

            <Divider />

            {/* Section: Storage & Purchase */}
            <section>
              <h2 className={`text-xs font-semibold tracking-widest ${t.sectionHead} uppercase mb-4 transition-colors duration-300`}>
                Storage & Purchase
              </h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className={`text-xs tracking-widest ${t.label} uppercase transition-colors duration-300`}>Storage Location</label>
                  <select name="storageLocation" value={form.storageLocation} onChange={handleChange} className={selectClass}>
                    <option value="">Select location…</option>
                    {storageLocations.map((loc) => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                  </select>
                </div>

                <Field label="Purchased From" name="purchasedFrom" value={form.purchasedFrom} onChange={handleChange} placeholder="e.g. Berry Bros. & Rudd" />
                <Field label="Purchase Date" name="purchasedDate" value={form.purchasedDate} onChange={handleChange} type="date" />

                {/* TODO: remove when auth is implemented */}
                <div className="flex flex-col gap-1">
                  <label className={`text-xs tracking-widest ${t.label} uppercase transition-colors duration-300`}>
                    Owner <span className="text-amber-700">(temp)</span>
                  </label>
                  <select name="owner" value={form.owner} onChange={handleChange} className={selectClass}>
                    <option value="">Select owner…</option>
                    {users.map((u) => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}
                  </select>
                </div>
              </div>
            </section>

            {/* Submit */}
            <button
              type="submit"
              className={`w-full mt-2 py-3 rounded-xl bg-amber-700 hover:bg-amber-600 active:bg-amber-800 text-white font-semibold tracking-widest uppercase text-sm transition-colors duration-200 shadow-lg ${t.submitShadow}`}
            >
              Add to Storage
            </button>
          </form>

        </div>
      </div>
    </ThemeCtx.Provider>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function WineAutocomplete({ value, onChange, onSelect }) {
  const { t } = useTheme()
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const debounceRef = useRef(null)
  const listRef = useRef(null)

  const fetchSuggestions = useCallback(async (query) => {
    if (!query.trim()) { setSuggestions([]); setOpen(false); return }
    try {
      const res = await apiFetch(`/wines/search?name=${encodeURIComponent(query)}`)
      const data = await res.json()
      setSuggestions(data)
      setActiveIndex(-1)
      setOpen(data.length > 0)
    } catch {
      setSuggestions([])
    }
  }, [])

  const handleInput = (e) => {
    const val = e.target.value
    onChange(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300)
  }

  const handlePick = (wine) => {
    onSelect(wine)
    setSuggestions([])
    setOpen(false)
    setActiveIndex(-1)
  }

  const handleKeyDown = (e) => {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => {
        const next = Math.min(i + 1, suggestions.length - 1)
        scrollIntoView(next)
        return next
      })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => {
        const next = Math.max(i - 1, 0)
        scrollIntoView(next)
        return next
      })
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handlePick(suggestions[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  const scrollIntoView = (index) => {
    const list = listRef.current
    if (!list) return
    const item = list.children[index]
    if (item) item.scrollIntoView({ block: 'nearest' })
  }

  return (
    <div className="relative sm:col-span-2">
      <div className="flex flex-col gap-1">
        <label className={`text-xs tracking-widest ${t.label} uppercase transition-colors duration-300`}>Wine Name</label>
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={handleInput}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Château Margaux"
            autoComplete="off"
            className={`w-full ${t.input} rounded-lg px-4 py-2.5 pr-9 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition`}
          />
          {value && (
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); onChange(''); setSuggestions([]); setOpen(false); setActiveIndex(-1) }}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors ${t.clearBtn}`}
              aria-label="Clear"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      {open && (
        <ul ref={listRef} className={`absolute z-50 mt-1 w-full ${t.listBg} rounded-lg shadow-xl overflow-y-auto max-h-60 transition-colors duration-300`}>
          {suggestions.map((wine, i) => (
            <li
              key={wine.lwin}
              onMouseDown={() => handlePick(wine)}
              className={`flex flex-col px-4 py-2.5 cursor-pointer transition-colors ${i === activeIndex ? t.listActive : t.listHover}`}
            >
              <span className={`text-sm ${t.listItem}`}>{wine.display_name}</span>
              {(wine.producer_name || wine.region) && (
                <span className={`text-xs ${t.listSub}`}>
                  {[wine.producer_name, wine.region].filter(Boolean).join(' · ')}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Field({ label, name, value, onChange, placeholder = '', type = 'text', span2 = false }) {
  const { t } = useTheme()
  return (
    <div className={`flex flex-col gap-1 ${span2 ? 'sm:col-span-2' : ''}`}>
      <label className={`text-xs tracking-widest ${t.label} uppercase transition-colors duration-300`}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${t.input} rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition`}
      />
    </div>
  )
}

function Divider() {
  const { t } = useTheme()
  return <hr className={`border-0 border-t ${t.divider} transition-colors duration-300`} />
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

export default App
