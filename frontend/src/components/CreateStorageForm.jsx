import { useState } from 'react'
import { apiFetch } from '../utils/api'

/**
 * Inline expandable form for creating a new storage location.
 *
 * Props:
 *   t         – theme token object (needs: input, sectionHead, card, btnSave, btnCancel)
 *   ownerId   – id of the owner for the new location
 *   onCreated – called with the newly created location { id, name, capacity, owner_id }
 */
export default function CreateStorageForm({ t, ownerId, onCreated }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [capacity, setCapacity] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function reset() {
    setName('')
    setCapacity('')
    setError(null)
    setOpen(false)
  }

  async function handleCreate() {
    if (!name.trim()) { setError('Name is required'); return }
    if (!ownerId) { setError('Select an owner first'); return }
    setSaving(true)
    setError(null)
    try {
      const res = await apiFetch('/storage', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          capacity: capacity ? parseInt(capacity, 10) : null,
          owner_id: ownerId,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create storage location')
      }
      const newLoc = await res.json()
      onCreated(newLoc)
      reset()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`text-xs tracking-widest uppercase transition-colors ${t.sectionHead} opacity-70 hover:opacity-100`}
      >
        + New Storage
      </button>
    )
  }

  return (
    <div className={`mt-1 p-3 rounded-lg ${t.card} space-y-2`}>
      <p className={`text-xs font-semibold tracking-widest uppercase ${t.sectionHead}`}>
        New Storage Location
      </p>
      <div className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="Name (e.g. Wine Fridge)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full ${t.input} rounded px-2 py-1 text-sm focus:outline-none`}
        />
        <input
          type="number"
          placeholder="Capacity (bottles)"
          min="1"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          className={`w-full ${t.input} rounded px-2 py-1 text-sm focus:outline-none`}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={reset} className={t.btnCancel}>
          Cancel
        </button>
        <button type="button" onClick={handleCreate} disabled={saving} className={t.btnSave}>
          {saving ? 'Creating…' : 'Create'}
        </button>
      </div>
    </div>
  )
}
