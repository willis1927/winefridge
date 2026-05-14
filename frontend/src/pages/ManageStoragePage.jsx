import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import CreateStorageForm from '../components/CreateStorageForm'

// ─── Theme ───────────────────────────────────────────────────────────────────

const DARK = {
  page: 'bg-gradient-to-br from-slate-900 to-amber-950',
  card: 'bg-slate-800 border border-slate-700',
  title: 'text-amber-100',
  subtitle: 'text-slate-400',
  sectionHead: 'text-amber-500',
  accentBar: 'border-amber-700',
  toggleBtn: 'bg-slate-700 border border-slate-600 text-slate-300 hover:text-amber-400 hover:border-amber-600',
  row: 'border-slate-700',
  rowText: 'text-slate-100',
  rowSub: 'text-slate-400',
  thead: 'text-slate-400 border-slate-700',
  badge: 'bg-slate-700 text-slate-300',
  quantityBadge: 'bg-amber-900/70 text-amber-300 font-semibold',
  empty: 'text-slate-500',
  nav: 'text-amber-500 hover:text-amber-300',
  input: 'bg-slate-700 border border-slate-600 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition',
  inputSm: 'bg-slate-700 border border-slate-600 text-slate-100 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-amber-600',
  label: 'text-slate-400',
  select: 'bg-slate-700 border border-slate-600 text-slate-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition appearance-none',
  btnSave: 'bg-amber-700 hover:bg-amber-600 text-white text-xs px-3 py-1.5 rounded transition-colors',
  btnDanger: 'bg-red-800/80 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded transition-colors',
  btnCancel: 'bg-slate-600 hover:bg-slate-500 text-slate-300 text-xs px-3 py-1.5 rounded transition-colors',
  divider: 'border-slate-700',
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
  rowText: 'text-slate-700',
  rowSub: 'text-slate-500',
  thead: 'text-slate-400 border-slate-200',
  badge: 'bg-slate-200 text-slate-500',
  quantityBadge: 'bg-amber-100 text-amber-700 font-semibold',
  empty: 'text-slate-400',
  nav: 'text-amber-600 hover:text-amber-500',
  input: 'bg-slate-100 border border-slate-300 text-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition',
  inputSm: 'bg-slate-100 border border-slate-300 text-slate-700 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500',
  label: 'text-slate-500',
  select: 'bg-slate-100 border border-slate-300 text-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition appearance-none',
  btnSave: 'bg-amber-600 hover:bg-amber-500 text-white text-xs px-3 py-1.5 rounded transition-colors',
  btnDanger: 'bg-red-600 hover:bg-red-500 text-white text-xs px-3 py-1.5 rounded transition-colors',
  btnCancel: 'bg-slate-200 hover:bg-slate-300 text-slate-600 text-xs px-3 py-1.5 rounded transition-colors',
  divider: 'border-slate-200',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function formatSize(ml) {
  const s = SIZES.find(s => s.ml === ml)
  return s ? s.label : `${ml}ml`
}

function groupWines(wines) {
  const groups = new Map()
  for (const wine of wines) {
    const key = [wine.lwinCode, wine.vintage ?? '', wine.size ?? ''].join('|')
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

function groupConsumedWines(wines) {
  const groups = new Map()
  for (const wine of wines) {
    const dateKey = wine.dateConsumed ? wine.dateConsumed.split('T')[0] : ''
    const key = [wine.lwinCode, wine.vintage ?? '', wine.size ?? '', dateKey].join('|')
    if (groups.has(key)) {
      const g = groups.get(key)
      g.quantity += 1
      g.storedIds.push(wine.storedId)
    } else {
      groups.set(key, { ...wine, quantity: 1, storedIds: [wine.storedId] })
    }
  }
  return [...groups.values()].sort((a, b) => (b.dateConsumed ?? '').localeCompare(a.dateConsumed ?? ''))
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ManageStoragePage() {
  const { user } = useAuth()
  const [dark, setDark] = useState(true)
  const t = dark ? DARK : LIGHT

  const [storages, setStorages] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [allWines, setAllWines] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  // Edit details state
  const [editName, setEditName] = useState('')
  const [editCapacity, setEditCapacity] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState(null)

  // Delete storage state
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Consume state
  const [withdrawQtys, setWithdrawQtys] = useState({})
  const [withdrawNotes, setWithdrawNotes] = useState({})
  const [withdrawing, setWithdrawing] = useState(null)
  const [withdrawError, setWithdrawError] = useState(null)

  // Delete wine state
  const [confirmingDeleteWine, setConfirmingDeleteWine] = useState(null) // storedId
  const [deletingWine, setDeletingWine] = useState(null) // storedId
  const [deleteWineError, setDeleteWineError] = useState(null)

  useEffect(() => {
    if (!user) return
    Promise.all([
      apiFetch(`/storage/${user.id}`).then(r => r.json()),
      apiFetch('/stored-wines?consumed=true').then(r => r.json()),
    ])
      .then(([storageData, wineData]) => {
        const sl = Array.isArray(storageData) ? storageData : []
        setStorages(sl)
        setAllWines(Array.isArray(wineData) ? wineData : [])
        if (sl.length > 0) setSelectedId(String(sl[0].id))
        setLoading(false)
      })
      .catch(err => { setFetchError(err.message); setLoading(false) })
  }, [user])

  const selectedStorage = storages.find(s => String(s.id) === selectedId)

  const storageWines = selectedId
    ? groupWines(allWines.filter(w => String(w.storageId) === selectedId && w.ownerId === user?.id && !w.dateConsumed))
    : []

  const consumedStorageWines = selectedId
    ? groupConsumedWines(allWines.filter(w => String(w.storageId) === selectedId && w.ownerId === user?.id && w.dateConsumed))
    : []

  const bottleCount = storageWines.reduce((sum, g) => sum + g.quantity, 0)

  // Sync edit fields when storage selection changes
  useEffect(() => {
    if (selectedStorage) {
      setEditName(selectedStorage.name)
      setEditCapacity(selectedStorage.capacity ?? '')
      setSaveMsg(null)
      setConfirmDelete(false)
      setWithdrawError(null)
      setWithdrawNotes({})
    }
  }, [selectedId]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSelect(id) {
    setSelectedId(id)
    setConfirmDelete(false)
    setWithdrawError(null)
    setDeleteWineError(null)
    setConfirmingDeleteWine(null)
    setWithdrawQtys({})
    setWithdrawNotes({})
  }

  async function handleSave() {
    if (!editName.trim()) return
    setSaving(true)
    setSaveMsg(null)
    try {
      const res = await apiFetch(`/storage/${selectedId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editName.trim(),
          capacity: editCapacity ? parseInt(editCapacity, 10) : null,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to update')
      setStorages(prev => prev.map(s =>
        String(s.id) === selectedId
          ? { ...s, name: editName.trim(), capacity: editCapacity ? parseInt(editCapacity, 10) : null }
          : s
      ))
      setSaveMsg({ type: 'success', text: 'Saved' })
      setTimeout(() => setSaveMsg(null), 3000)
    } catch (err) {
      setSaveMsg({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteStorage() {
    setDeleting(true)
    try {
      const res = await apiFetch(`/storage/${selectedId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete')
      const remaining = storages.filter(s => String(s.id) !== selectedId)
      setStorages(remaining)
      setSelectedId(remaining.length > 0 ? String(remaining[0].id) : '')
      setConfirmDelete(false)
    } catch (err) {
      setSaveMsg({ type: 'error', text: err.message })
      setConfirmDelete(false)
    } finally {
      setDeleting(false)
    }
  }

  async function handleWithdraw(group) {
    const qty = Math.min(withdrawQtys[group.storedId] ?? 1, group.quantity)
    const ids = group.storedIds.slice(0, qty)
    const notes = withdrawNotes[group.storedId]?.trim() || undefined
    setWithdrawing(group.storedId)
    setWithdrawError(null)
    try {
      await Promise.all(
        ids.map(id =>
          apiFetch(`/stored-wines/${id}/consume`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notes }),
          }).then(r => { if (!r.ok) throw new Error('Failed to consume') })
        )
      )
      const consumedSet = new Set(ids)
      const consumedAt = new Date().toISOString()
      setAllWines(prev => prev.map(w =>
        consumedSet.has(w.storedId) ? { ...w, dateConsumed: consumedAt, notes: notes ?? w.notes } : w
      ))
      setWithdrawQtys(prev => { const next = { ...prev }; delete next[group.storedId]; return next })
      setWithdrawNotes(prev => { const next = { ...prev }; delete next[group.storedId]; return next })
    } catch (err) {
      setWithdrawError(err.message)
    } finally {
      setWithdrawing(null)
    }
  }

  async function handleDeleteWine(group) {
    const qty = Math.min(withdrawQtys[group.storedId] ?? 1, group.quantity)
    const ids = group.storedIds.slice(0, qty)
    setDeletingWine(group.storedId)
    setDeleteWineError(null)
    try {
      await Promise.all(
        ids.map(id =>
          apiFetch(`/stored-wines/${id}`, { method: 'DELETE' })
            .then(r => { if (!r.ok) throw new Error('Failed to delete') })
        )
      )
      const removedSet = new Set(ids)
      setAllWines(prev => prev.filter(w => !removedSet.has(w.storedId)))
      setConfirmingDeleteWine(null)
      setWithdrawQtys(prev => { const next = { ...prev }; delete next[group.storedId]; return next })
    } catch (err) {
      setDeleteWineError(err.message)
    } finally {
      setDeletingWine(null)
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

      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className={`text-4xl font-serif font-light tracking-widest ${t.title} uppercase transition-colors duration-300`}>
            <Link to="/cellar" className="hover:opacity-70 transition-opacity">Wine Fridge</Link>
          </h1>
          <p className={`mt-2 text-sm tracking-widest ${t.subtitle} uppercase transition-colors duration-300`}>
            Manage Storage
          </p>
          <div className={`mt-4 mx-auto w-16 border-t ${t.accentBar} transition-colors duration-300`} />
        </div>

        {/* Nav */}
        <div className="flex justify-between items-center mb-8">
          <Link to="/cellar" className={`text-sm tracking-widest uppercase transition-colors ${t.nav}`}>
            ← My Cellar
          </Link>
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className={`text-sm tracking-widest uppercase transition-colors ${t.empty} opacity-60 hover:opacity-100`}
          >
            Sign Out
          </button>
        </div>

        {loading && <p className={`text-center text-sm tracking-widest uppercase ${t.empty}`}>Loading…</p>}
        {fetchError && <p className="text-center text-sm text-red-400">{fetchError}</p>}

        {!loading && !fetchError && (
          <>
            {/* Storage selector */}
            {storages.length === 0 ? (
              <div className={`${t.card} rounded-2xl shadow-xl p-8 text-center space-y-4`}>
                <p className={`text-sm tracking-widest uppercase ${t.empty}`}>No storage locations yet</p>
                <CreateStorageForm
                  t={t}
                  ownerId={user?.id}
                  onCreated={(newLoc) => {
                    setStorages([newLoc])
                    setSelectedId(String(newLoc.id))
                  }}
                />
              </div>
            ) : (
              <>
                <div className="flex gap-3 items-start mb-6">
                  <select
                    value={selectedId}
                    onChange={e => handleSelect(e.target.value)}
                    className={`flex-1 ${t.select}`}
                  >
                    {storages.map(s => {
                      const count = allWines.filter(w => w.storageId === s.id && !w.dateConsumed).length
                      return (
                        <option key={s.id} value={s.id}>
                          {s.name}{s.capacity ? ` · ${count} / ${s.capacity}` : ` · ${count}`}
                        </option>
                      )
                    })}
                  </select>
                  <CreateStorageForm
                    t={t}
                    ownerId={user?.id}
                    onCreated={(newLoc) => {
                      setStorages(prev => [...prev, newLoc])
                      setSelectedId(String(newLoc.id))
                    }}
                  />
                </div>

                {selectedStorage && (
                  <div className="space-y-4">

                    {/* ── Edit details ── */}
                    <div className={`${t.card} rounded-2xl shadow-xl p-6 space-y-4`}>
                      <h2 className={`text-xs font-semibold tracking-widest ${t.sectionHead} uppercase`}>
                        Storage Details
                      </h2>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1">
                          <label className={`text-xs tracking-widest ${t.label} uppercase`}>Name</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            className={`w-full ${t.input}`}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className={`text-xs tracking-widest ${t.label} uppercase`}>Capacity (bottles)</label>
                          <input
                            type="number"
                            min="1"
                            value={editCapacity}
                            onChange={e => setEditCapacity(e.target.value)}
                            className={`w-full ${t.input}`}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={handleSave} disabled={saving} className={t.btnSave}>
                          {saving ? 'Saving…' : 'Save Changes'}
                        </button>
                        {saveMsg && (
                          <p className={`text-xs ${saveMsg.type === 'success' ? 'text-green-500' : 'text-red-400'}`}>
                            {saveMsg.text}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* ── Wines in storage ── */}
                    <div className={`${t.card} rounded-2xl shadow-xl overflow-hidden`}>
                      <div className={`px-6 py-4 border-b ${t.divider} flex items-center justify-between`}>
                        <h2 className={`text-xs font-semibold tracking-widest ${t.sectionHead} uppercase`}>
                          Wines in Storage
                        </h2>
                        <span className={`text-xs ${t.rowSub}`}>
                          {selectedStorage?.capacity
                            ? `${bottleCount} / ${selectedStorage.capacity} bottles`
                            : `${bottleCount} bottle${bottleCount !== 1 ? 's' : ''}`}
                        </span>
                      </div>

                      {withdrawError && (
                        <p className="px-6 py-2 text-xs text-red-400">{withdrawError}</p>
                      )}
                      {deleteWineError && (
                        <p className="px-6 py-2 text-xs text-red-400">{deleteWineError}</p>
                      )}

                      {storageWines.length === 0 ? (
                        <p className={`p-8 text-center text-sm tracking-widest uppercase ${t.empty}`}>
                          No wines stored here
                        </p>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className={`border-b ${t.thead} text-xs tracking-widest uppercase`}>
                              <th className="text-left px-6 py-3 font-medium">Wine</th>
                              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Vintage</th>
                              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Size</th>
                              <th className="text-right px-6 py-3 font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {storageWines.map(group => (
                              <tr key={group.storedId} className={`border-b last:border-0 ${t.row}`}>
                                <td className="px-6 py-4">
                                  <p className={`font-medium ${t.rowText}`}>
                                    {group.wineRef?.displayName ?? '—'}
                                    {group.quantity > 1 && (
                                      <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${t.quantityBadge}`}>
                                        ×{group.quantity}
                                      </span>
                                    )}
                                  </p>
                                  {group.wineRef?.colour && (
                                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${t.badge}`}>
                                      {group.wineRef.colour}
                                    </span>
                                  )}
                                </td>
                                <td className={`px-4 py-4 hidden sm:table-cell ${t.rowSub}`}>
                                  {group.vintage ?? '—'}
                                </td>
                                <td className={`px-4 py-4 hidden sm:table-cell ${t.rowSub}`}>
                                  {formatSize(group.size)}
                                </td>
                                <td className="px-6 py-4">
                                  {confirmingDeleteWine === group.storedId ? (
                                    <div className="flex flex-col items-end gap-2">
                                      <p className="text-xs text-red-400 text-right max-w-50">
                                        ⚠ Permanently removes {withdrawQtys[group.storedId] ?? 1} record{(withdrawQtys[group.storedId] ?? 1) !== 1 ? 's' : ''} from the database. This cannot be undone.
                                      </p>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => setConfirmingDeleteWine(null)}
                                          className={t.btnCancel}
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          onClick={() => handleDeleteWine(group)}
                                          disabled={deletingWine === group.storedId}
                                          className={t.btnDanger}
                                        >
                                          {deletingWine === group.storedId ? '…' : 'Confirm Delete'}
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-end gap-2">
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="number"
                                          min="1"
                                          max={group.quantity}
                                          value={withdrawQtys[group.storedId] ?? 1}
                                          onChange={e => setWithdrawQtys(prev => ({
                                            ...prev,
                                            [group.storedId]: Math.min(Math.max(1, Number(e.target.value)), group.quantity)
                                          }))}
                                          className={`w-14 text-center ${t.inputSm}`}
                                        />
                                        <button
                                          onClick={() => handleWithdraw(group)}
                                          disabled={withdrawing === group.storedId}
                                          className={t.btnDanger}
                                        >
                                          {withdrawing === group.storedId ? '…' : 'Withdraw'}
                                        </button>
                                        <button
                                          onClick={() => setConfirmingDeleteWine(group.storedId)}
                                          disabled={withdrawing === group.storedId}
                                          className={t.btnCancel}
                                          title="Permanently delete from database"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                      <textarea
                                        rows={2}
                                        placeholder="Withdrawal notes (optional)"
                                        value={withdrawNotes[group.storedId] ?? ''}
                                        onChange={e => setWithdrawNotes(prev => ({
                                          ...prev,
                                          [group.storedId]: e.target.value
                                        }))}
                                        className={`w-full text-xs resize-none ${t.inputSm}`}
                                      />
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>

                    {/* ── Withdrawn wines ── */}
                    <div className={`${t.card} rounded-2xl shadow-xl overflow-hidden`}>
                      <div className={`px-6 py-4 border-b ${t.divider} flex items-center justify-between`}>
                        <h2 className={`text-xs font-semibold tracking-widest ${t.sectionHead} uppercase`}>
                          Withdrawn
                        </h2>
                        <span className={`text-xs ${t.rowSub}`}>
                          {consumedStorageWines.reduce((s, g) => s + g.quantity, 0)} bottle{consumedStorageWines.reduce((s, g) => s + g.quantity, 0) !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {consumedStorageWines.length === 0 ? (
                        <p className={`p-8 text-center text-sm tracking-widest uppercase ${t.empty}`}>
                          No withdrawn wines recorded
                        </p>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className={`border-b ${t.thead} text-xs tracking-widest uppercase`}>
                              <th className="text-left px-6 py-3 font-medium">Wine</th>
                              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Vintage</th>
                              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Size</th>
                              <th className="text-right px-6 py-3 font-medium">Date Withdrawn</th>
                            </tr>
                          </thead>
                          <tbody>
                            {consumedStorageWines.map(group => (
                              <tr key={`${group.storedId}-consumed`} className={`border-b last:border-0 ${t.row}`}>
                                <td className="px-6 py-4">
                                  <p className={`font-medium ${t.rowText}`}>
                                    {group.wineRef?.displayName ?? '—'}
                                    {group.quantity > 1 && (
                                      <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${t.quantityBadge}`}>
                                        ×{group.quantity}
                                      </span>
                                    )}
                                  </p>
                                  {group.wineRef?.colour && (
                                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${t.badge}`}>
                                      {group.wineRef.colour}
                                    </span>
                                  )}
                                </td>
                                <td className={`px-4 py-4 hidden sm:table-cell ${t.rowSub}`}>
                                  {group.vintage ?? '—'}
                                </td>
                                <td className={`px-4 py-4 hidden sm:table-cell ${t.rowSub}`}>
                                  {formatSize(group.size)}
                                </td>
                                <td className={`px-6 py-4 text-right ${t.rowSub}`}>
                                  {formatDate(group.dateConsumed)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>

                    {/* ── Danger zone ── */}
                    <div className={`${t.card} rounded-2xl shadow-xl p-6`}>
                      <h2 className={`text-xs font-semibold tracking-widest text-red-500 uppercase mb-2`}>
                        Danger Zone
                      </h2>
                      <p className={`text-xs ${t.rowSub} mb-4`}>
                        Deleting this storage removes the location. Any wines stored here will remain in your cellar without a storage assignment.
                      </p>
                      {!confirmDelete ? (
                        <button onClick={() => setConfirmDelete(true)} className={t.btnDanger}>
                          Delete Storage Location
                        </button>
                      ) : (
                        <div className="flex items-center gap-3 flex-wrap">
                          <p className={`text-xs ${t.rowSub}`}>Are you sure?</p>
                          <button onClick={handleDeleteStorage} disabled={deleting} className={t.btnDanger}>
                            {deleting ? 'Deleting…' : 'Yes, Delete'}
                          </button>
                          <button onClick={() => setConfirmDelete(false)} className={t.btnCancel}>
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
