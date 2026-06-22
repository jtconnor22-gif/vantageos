'use client'

import { useState } from 'react'

interface InternalNotesProps {
  fileId: string
  initialNotes: string | null | undefined
}

export default function InternalNotes({ fileId, initialNotes }: InternalNotesProps) {
  const [notes, setNotes] = useState(initialNotes ?? '')
  const [newNote, setNewNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    if (!newNote.trim()) return
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const res = await fetch(`/api/files/${fileId}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNote.trim() }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Failed to save note')
      }
      const { internal_notes } = await res.json()
      setNotes(internal_notes)
      setNewNote('')
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h3
        className="text-sm font-semibold mb-3"
        style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk,sans-serif' }}
      >
        Internal Notes
      </h3>

      {/* Existing notes */}
      {notes ? (
        <div
          className="text-sm mb-3 whitespace-pre-wrap rounded-lg p-3"
          style={{
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            backgroundColor: 'var(--subtle)',
            border: '1px solid var(--border)',
          }}
        >
          {notes}
        </div>
      ) : (
        <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
          No notes yet.
        </p>
      )}

      {/* Add new note */}
      <textarea
        rows={3}
        value={newNote}
        onChange={e => setNewNote(e.target.value)}
        placeholder="Add a note…"
        className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none resize-none transition-all"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--subtle)',
          color: 'var(--text-primary)',
        }}
        onFocus={e => {
          e.target.style.borderColor = 'var(--accent)'
          e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.08)'
        }}
        onBlur={e => {
          e.target.style.borderColor = 'var(--border)'
          e.target.style.boxShadow = 'none'
        }}
      />

      {error && (
        <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{error}</p>
      )}

      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={handleSave}
          disabled={saving || !newNote.trim()}
          className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-white transition-all"
          style={{
            backgroundColor: saving || !newNote.trim() ? '#A5B4FC' : 'var(--accent)',
            cursor: saving || !newNote.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving…' : 'Save Note'}
        </button>
        {saved && (
          <span className="text-xs" style={{ color: '#10B981' }}>Saved!</span>
        )}
      </div>
    </div>
  )
}
