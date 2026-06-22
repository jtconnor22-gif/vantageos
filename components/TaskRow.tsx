'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export const PRIORITY_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  high:   { label: 'High',   bg: '#FEE2E2', color: '#DC2626' },
  medium: { label: 'Medium', bg: '#FEF3C7', color: '#D97706' },
  low:    { label: 'Low',    bg: '#DCFCE7', color: '#16A34A' },
}

export const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  open:        { label: 'Open',        color: '#64748B' },
  in_progress: { label: 'In Progress', color: '#2563EB' },
  done:        { label: 'Done',        color: '#10B981' },
  cancelled:   { label: 'Cancelled',   color: '#94A3B8' },
}

export type Task = {
  id: string
  title: string
  status: 'open' | 'in_progress' | 'done'
  priority: 'high' | 'medium' | 'low' | null
  due_date: string | null
  notes: string | null
  funding_file_id: string
  funding_files?: { id: string; file_code: string } | null
  assigned_profile?: { full_name: string } | null
}

async function patchTask(id: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Failed to update task')
}

function EditModal({
  task,
  onClose,
  onSaved,
}: {
  task: Task
  onClose: () => void
  onSaved: () => void
}) {
  const [title, setTitle] = useState(task.title)
  const [dueDate, setDueDate] = useState(task.due_date ?? '')
  const [priority, setPriority] = useState(task.priority ?? '')
  const [notes, setNotes] = useState(task.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      await patchTask(task.id, {
        title: title.trim(),
        due_date: dueDate || null,
        priority: priority || null,
        notes: notes || null,
      })
      onSaved()
    } catch {
      setError('Failed to save. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose() }}
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
      }}
    >
      <div
        style={{
          backgroundColor: '#fff', borderRadius: '12px', padding: '24px',
          width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
      >
        <h2 style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
          Edit Task
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '4px' }}>Title</label>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{
                width: '100%', padding: '8px 10px', borderRadius: '8px',
                border: '1px solid var(--border)', fontSize: '14px', color: 'var(--text-primary)',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '4px' }}>Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: '8px',
                  border: '1px solid var(--border)', fontSize: '14px', color: 'var(--text-primary)',
                  outline: 'none', backgroundColor: '#fff',
                }}
              >
                <option value="">None</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '4px' }}>Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: '8px',
                  border: '1px solid var(--border)', fontSize: '14px', color: 'var(--text-primary)',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '4px' }}>Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              style={{
                width: '100%', padding: '8px 10px', borderRadius: '8px',
                border: '1px solid var(--border)', fontSize: '14px', color: 'var(--text-primary)',
                outline: 'none', resize: 'vertical', boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {error && <p style={{ color: '#DC2626', fontSize: '13px', marginTop: '8px' }}>{error}</p>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)',
              fontSize: '14px', cursor: 'pointer', backgroundColor: '#fff', color: 'var(--text-primary)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none',
              fontSize: '14px', cursor: saving ? 'wait' : 'pointer',
              backgroundColor: '#2563EB', color: '#fff', fontWeight: 500,
              opacity: saving || !title.trim() ? 0.6 : 1,
            }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TaskRow({
  task,
  isOverdue,
  last,
  strikethrough,
}: {
  task: Task
  isOverdue: boolean
  last: boolean
  strikethrough?: boolean
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [statusBusy, setStatusBusy] = useState(false)
  const currentStatus = task.status
  const pc = PRIORITY_CONFIG[task.priority ?? ''] ?? PRIORITY_CONFIG.medium

  async function handleStatusChange(newStatus: string) {
    setStatusBusy(true)
    try {
      await patchTask(task.id, { status: newStatus })
      router.refresh()
    } catch {
      // silently revert - router.refresh will restore original
    } finally {
      setStatusBusy(false)
    }
  }

  function handleSaved() {
    setEditing(false)
    router.refresh()
  }

  return (
    <>
      {editing && (
        <EditModal task={task} onClose={() => setEditing(false)} onSaved={handleSaved} />
      )}
      <div
        className="px-5 py-3.5 items-center"
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr .8fr .8fr .7fr',
          gap: '12px',
          borderBottom: last ? 'none' : '1px solid var(--border)',
        }}
      >
        {/* Title */}
        <div className="min-w-0">
          <span
            onClick={() => setEditing(true)}
            className="text-sm font-medium"
            style={{
              color: strikethrough ? 'var(--text-muted)' : 'var(--text-primary)',
              textDecoration: strikethrough ? 'line-through' : 'none',
              cursor: 'pointer',
            }}
            title="Click to edit"
          >
            {task.title}
          </span>
          {task.assigned_profile && (
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              → {task.assigned_profile.full_name}
            </div>
          )}
        </div>

        {/* File */}
        <div>
          {task.funding_files ? (
            <Link href={`/files/${task.funding_files.id}`}>
              <span className="text-xs font-mono font-semibold" style={{ color: 'var(--accent)' }}>
                {task.funding_files.file_code}
              </span>
            </Link>
          ) : (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
          )}
        </div>

        {/* Priority badge */}
        <div>
          <span
            className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: pc.bg, color: pc.color }}
          >
            {pc.label}
          </span>
        </div>

        {/* Status dropdown */}
        <div>
          <select
            value={currentStatus}
            disabled={statusBusy}
            onChange={e => handleStatusChange(e.target.value)}
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: STATUS_CONFIG[currentStatus]?.color ?? '#64748B',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '2px 6px',
              backgroundColor: '#fff',
              cursor: statusBusy ? 'wait' : 'pointer',
              outline: 'none',
              opacity: statusBusy ? 0.6 : 1,
            }}
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Due date */}
        <div className="text-xs font-medium" style={{ color: isOverdue ? '#DC2626' : 'var(--text-secondary)' }}>
          {task.due_date
            ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : '—'}
        </div>
      </div>
    </>
  )
}
