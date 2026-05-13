import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../utils/api'

const DARK = {
  page: 'bg-gradient-to-br from-slate-900 to-amber-950',
  card: 'bg-slate-800 border border-slate-700',
  title: 'text-amber-100',
  subtitle: 'text-slate-400',
  sectionHead: 'text-amber-500',
  accentBar: 'border-amber-700',
  toggleBtn: 'bg-slate-700 border border-slate-600 text-slate-300 hover:text-amber-400 hover:border-amber-600',
  row: 'border-slate-700',
  rowEdit: 'border-slate-700 bg-slate-700',
  rowText: 'text-slate-100',
  rowSub: 'text-slate-400',
  thead: 'text-slate-400 border-slate-700',
  badge: 'bg-slate-700 text-slate-300',
  empty: 'text-slate-500',
  nav: 'text-amber-500 hover:text-amber-300',
  input: 'bg-slate-700 border border-slate-600 text-slate-100 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-amber-600',
  btnSave: 'bg-amber-700 hover:bg-amber-600 text-white text-xs px-3 py-1.5 rounded transition-colors',
  btnCancel: 'bg-slate-600 hover:bg-slate-500 text-slate-300 text-xs px-3 py-1.5 rounded transition-colors',
  rowClickable: 'hover:bg-white/5 cursor-pointer',
}

const LIGHT = {
  page: 'bg-gradient-to-br from-slate-200 to-amber-100',
  card: 'bg-slate-50 border border-slate-200',
  title: 'text-slate-700',
  subtitle: 'text-slate-500',
  sectionHead: 'text-amber-600',
  accentBar: 'border-amber-500',
  toggleBtn: 'bg-slate-50 border border-slate-300 text-slate-500 hover:text-amber-600 hover:border-amber-400',
  row: 'border-slate-200',
  rowEdit: 'border-slate-200 bg-slate-100',
  rowText: 'text-slate-700',
  rowSub: 'text-slate-500',
  thead: 'text-slate-400 border-slate-200',
  badge: 'bg-slate-200 text-slate-500',
  empty: 'text-slate-400',
  nav: 'text-amber-600 hover:text-amber-500',
  input: 'bg-slate-100 border border-slate-300 text-slate-700 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500',
  btnSave: 'bg-amber-600 hover:bg-amber-500 text-white text-xs px-3 py-1.5 rounded transition-colors',
  btnCancel: 'bg-slate-200 hover:bg-slate-300 text-slate-600 text-xs px-3 py-1.5 rounded transition-colors',
  rowClickable: 'hover:bg-black/5 cursor-pointer',
}

const SIZES = [
  { label: '187.5ml (Split)',        ml: 187.5 },
  { label: '375ml (Half)',           ml: 375   },
  { label: '500ml',                  ml: 500   },
  { label: '750ml (Standard)',       ml: 750   },
  { label: '1000ml (1L)',            ml: 1000  },
  { label: '1500ml (Magnum)',        ml: 1500  },
  { label: '3000ml (Double Magnum)', ml: 3000  },
  { label: '6000ml (Imperial)',      ml: 6000  },
]

const VINTAGES = ['', 'NV', ...Array.from({ length: new Date().getFullYear() - 1979 }, (_, i) =>
  String(new Date().getFullYear() - i)
)]

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}
function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

function formatSize(ml) {
  const found = SIZES.find(s => s.ml === ml)
  return found ? found.label : `${ml}ml`
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function toDateInput(iso) {
  return iso.split('T')[0]
}

function groupWines(wines) {
  const groups = new Map()
  for (const wine of wines) {
    const dateKey = wine.dateStored ? wine.dateStored.split('T')[0] : ''
    const key = [
      wine.wineRef?.lwin ?? wine.wineRef?.id ?? '',
      wine.storageId ?? '',
      dateKey,
      wine.vintage ?? '',
      wine.size ?? '',
    ].join('|')
    if (groups.has(key)) {
      const g = groups.get(key)
      g.quantity += 1
      g.storedIds.push(wine.storedId)
    } else {
      groups.set(key, { ...wine, quantity: 1, storedIds: [wine.storedId] })
    }
  }
  return [...groups.values()]
}

function WineRow({ wine, isEditing, draft, storages, t, onStartEdit, onDraftChange, canEdit }) {
  if (isEditing) {
    return (
      <tr className={`border-b last:border-0 ${t.rowEdit} transition-colors`}>
        <td className="px-6 py-3 min-w-[180px]">
          <p className={`font-medium ${t.rowText}`}>
            {wine.wineRef?.displayName ?? '—'}
            {wine.quantity > 1 && (
              <span className={`ml-2 text-xs font-normal px-1.5 py-0.5 rounded ${t.badge}`}>×{wine.quantity}</span>
            )}
          </p>
          {wine.wineRef?.colour && (
            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${t.badge}`}>{wine.wineRef.colour}</span>
          )}
        </td>
        <td className="px-4 py-3">
          <select name="vintage" value={draft.vintage} onChange={onDraftChange} className={t.input}>
            {VINTAGES.map(v => <option key={v} value={v}>{v || '—'}</option>)}
          </select>
        </td>
        <td className="px-4 py-3">
          <select name="size" value={draft.size} onChange={onDraftChange} className={t.input}>
            {SIZES.map(s => <option key={s.ml} value={s.ml}>{s.label}</option>)}
          </select>
        </td>
        <td className={`px-4 py-3 hidden sm:table-cell ${t.rowSub}`}>
          {[wine.wineRef?.country, wine.wineRef?.region].filter(Boolean).join(', ') || '—'}
        </td>
        <td className="px-4 py-3 hidden md:table-cell">
          <select name="storage_id" value={draft.storage_id} onChange={onDraftChange} className={t.input}>
            <option value="">— None —</option>
            {storages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </td>
        <td className="px-4 py-3 hidden lg:table-cell">
          <input type="date" name="date_stored" value={draft.date_stored} onChange={onDraftChange} className={t.input} />
        </td>
      </tr>
    )
  }

  return (
    <tr
      onClick={canEdit ? () => onStartEdit(wine) : undefined}
      className={`border-b last:border-0 ${t.row} transition-colors ${canEdit ? t.rowClickable : ''}`}
    >
      <td className="px-6 py-4">
        <p className={`font-medium ${t.rowText}`}>
          {wine.wineRef?.displayName ?? '—'}
          {wine.quantity > 1 && (
            <span className={`ml-2 text-xs font-normal px-1.5 py-0.5 rounded ${t.badge}`}>×{wine.quantity}</span>
          )}
        </p>
        {wine.wineRef?.producerName && (
          <p className={`text-xs mt-0.5 ${t.rowSub}`}>{wine.wineRef.producerName}</p>
        )}
        {wine.wineRef?.colour && (
          <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${t.badge}`}>{wine.wineRef.colour}</span>
        )}
      </td>
      <td className={`px-4 py-4 ${t.rowText}`}>{wine.vintage ?? '—'}</td>
      <td className={`px-4 py-4 ${t.rowSub} whitespace-nowrap`}>{formatSize(wine.size)}</td>
      <td className={`px-4 py-4 hidden sm:table-cell ${t.rowSub}`}>
        {[wine.wineRef?.country, wine.wineRef?.region].filter(Boolean).join(', ') || '—'}
      </td>
      <td className={`px-4 py-4 hidden md:table-cell ${t.rowSub}`}>{wine.storage?.name ?? '—'}</td>
      <td className={`px-4 py-4 hidden lg:table-cell ${t.rowSub}`}>{formatDate(wine.dateStored)}</td>
    </tr>
  )
}

export default function CellarPage() {
  const [dark, setDark] = useState(true)
  const t = dark ? DARK : LIGHT
  const [wines, setWines] = useState([])
  const [storages, setStorages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingGroup, setEditingGroup] = useState(null)
  const [draft, setDraft] = useState({})
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState(null)

  useEffect(() => {
    Promise.all([
      apiFetch('/stored-wines').then(r => r.json()),
      apiFetch('/storage').then(r => r.json()),
    ])
      .then(([wineData, storageData]) => {
        setWines(Array.isArray(wineData) ? wineData : [])
        setStorages(Array.isArray(storageData) ? storageData : [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  function handleSaved(updatedList) {
    const updatedMap = new Map(updatedList.map(w => [w.storedId, w]))
    setWines(prev => prev.map(w => updatedMap.has(w.storedId) ? updatedMap.get(w.storedId) : w))
  }

  function startEdit(group) {
    setDraft({
      vintage:     group.vintage ?? '',
      size:        group.size ?? 750,
      storage_id:  group.storageId ?? '',
      date_stored: group.dateStored ? toDateInput(group.dateStored) : '',
    })
    setEditError(null)
    setEditingGroup(group)
  }

  function cancelEdit() {
    setEditingGroup(null)
    setEditError(null)
  }

  function handleDraftChange(e) {
    const { name, value } = e.target
    setDraft(prev => ({ ...prev, [name]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setEditError(null)
    try {
      const body = {
        vintage:     draft.vintage || undefined,
        size:        draft.size ? Number(draft.size) : undefined,
        storage_id:  draft.storage_id || undefined,
        date_stored: draft.date_stored || undefined,
      }
      const updatedList = await Promise.all(
        editingGroup.storedIds.map(id =>
          apiFetch(`/stored-wines/${id}`, { method: 'PUT', body: JSON.stringify(body) })
            .then(r => r.ok ? r.json() : r.json().then(e => { throw new Error(e.error || 'Failed to save') }))
        )
      )
      handleSaved(updatedList)
      setEditingGroup(null)
    } catch (err) {
      setEditError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`min-h-screen ${t.page} py-14 px-4 transition-colors duration-300`}>
      <button
        type="button"
        onClick={() => setDark(d => !d)}
        className={`fixed top-4 right-4 z-50 rounded-lg p-2 transition-colors duration-200 ${t.toggleBtn}`}
        aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {dark ? <SunIcon /> : <MoonIcon />}
      </button>
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className={`text-4xl font-serif font-light tracking-widest ${t.title} uppercase transition-colors duration-300`}>
            Wine Fridge
          </h1>
          <p className={`mt-2 text-sm tracking-widest ${t.subtitle} uppercase transition-colors duration-300`}>
            Your Cellar
          </p>
          <div className={`mt-4 mx-auto w-16 border-t ${t.accentBar} transition-colors duration-300`} />
        </div>
        <div className="flex justify-end mb-6">
          <Link to="/add" className={`text-sm tracking-widest uppercase transition-colors ${t.nav}`}>
            + Add Wine
          </Link>
        </div>
        <div className={`${t.card} rounded-2xl shadow-2xl overflow-hidden transition-colors duration-300`}>
          {loading && <p className={`p-10 text-center text-sm tracking-widest uppercase ${t.empty}`}>Loading…</p>}
          {error && <p className="p-10 text-center text-sm text-red-400">{error}</p>}
          {!loading && !error && wines.length === 0 && (
            <p className={`p-10 text-center text-sm tracking-widest uppercase ${t.empty}`}>
              No wines in your cellar yet. <Link to="/add" className={t.nav}>Add one →</Link>
            </p>
          )}
          {!loading && !error && wines.length > 0 && (
            <>
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${t.thead} text-xs tracking-widest uppercase`}>
                  <th className="text-left px-6 py-4 font-medium">Wine</th>
                  <th className="text-left px-4 py-4 font-medium">Vintage</th>
                  <th className="text-left px-4 py-4 font-medium">Size</th>
                  <th className="text-left px-4 py-4 font-medium hidden sm:table-cell">Origin</th>
                  <th className="text-left px-4 py-4 font-medium hidden md:table-cell">Storage</th>
                  <th className="text-left px-4 py-4 font-medium hidden lg:table-cell">Stored</th>
                </tr>
              </thead>
              <tbody>
                {groupWines(wines).map(group => (
                  <WineRow
                    key={group.storedId}
                    wine={group}
                    isEditing={editingGroup?.storedId === group.storedId}
                    draft={draft}
                    storages={storages}
                    t={t}
                    onStartEdit={startEdit}
                    onDraftChange={handleDraftChange}
                    canEdit={editingGroup === null}
                  />
                ))}
              </tbody>
            </table>
            </div>
            {editingGroup && (
              <div className={`px-6 py-4 border-t ${t.row} flex items-center gap-4 flex-wrap`}>
                <span className={`text-sm font-medium ${t.rowText} flex-1 min-w-0 truncate`}>
                  Editing: {editingGroup.wineRef?.displayName}
                  {editingGroup.quantity > 1 && ` ×${editingGroup.quantity}`}
                </span>
                <div className="flex items-center gap-3">
                  {editError && <p className="text-red-400 text-xs">{editError}</p>}
                  <button onClick={cancelEdit} disabled={saving} className={t.btnCancel}>Cancel</button>
                  <button onClick={handleSave} disabled={saving} className={t.btnSave}>
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            )}
            </>
          )}
        </div>
        {!loading && !error && (
          <p className={`mt-4 text-center text-xs tracking-widest uppercase ${t.empty}`}>
            {wines.length} bottle{wines.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  )
}
