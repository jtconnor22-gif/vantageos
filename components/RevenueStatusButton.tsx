'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type FeeStatus = 'pending' | 'invoiced' | 'collected'

interface Props {
  revenueId: string
  invoiceSent: boolean
  collected: boolean
}

function deriveStatus(invoiceSent: boolean, collected: boolean): FeeStatus {
  if (collected) return 'collected'
  if (invoiceSent) return 'invoiced'
  return 'pending'
}

const STATUS_STYLES: Record<FeeStatus, { bg: string; color: string; label: string }> = {
  pending:   { bg: '#F0F1F6', color: '#64748B', label: 'Pending' },
  invoiced:  { bg: '#DBEAFE', color: '#2563EB', label: 'Invoiced' },
  collected: { bg: '#D1FAE5', color: '#059669', label: 'Collected' },
}

export default function RevenueStatusButton({ revenueId, invoiceSent, collected }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [current, setCurrent] = useState<FeeStatus>(deriveStatus(invoiceSent, collected))
  const ref = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  async function select(status: FeeStatus) {
    if (status === current || loading) return
    setLoading(true)
    setOpen(false)
    try {
      const res = await fetch(`/api/revenue/${revenueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fee_status: status }),
      })
      if (res.ok) {
        setCurrent(status)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  const style = STATUS_STYLES[current]

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        disabled={loading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 8px',
          borderRadius: '9999px',
          fontSize: '12px',
          fontWeight: 600,
          backgroundColor: style.bg,
          color: style.color,
          border: 'none',
          cursor: loading ? 'wait' : 'pointer',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {style.label}
        <span style={{ fontSize: '10px', lineHeight: 1 }}>▾</span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            right: 0,
            backgroundColor: 'white',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
            zIndex: 50,
            minWidth: '120px',
            overflow: 'hidden',
          }}
        >
          {(['pending', 'invoiced', 'collected'] as FeeStatus[]).map(status => {
            const s = STATUS_STYLES[status]
            return (
              <button
                key={status}
                onClick={() => select(status)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '7px 12px',
                  fontSize: '13px',
                  fontWeight: status === current ? 600 : 400,
                  color: status === current ? s.color : 'var(--text-primary)',
                  backgroundColor: status === current ? s.bg : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {s.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
