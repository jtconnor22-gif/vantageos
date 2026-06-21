'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { STAGE_CONFIG, STAGE_ORDER } from '@/lib/stage-config'
import type { PipelineStage } from '@/lib/supabase/types'

interface Props {
  fileId: string
  currentStage: PipelineStage
}

export default function StageSelector({ fileId, currentStage }: Props) {
  const router = useRouter()
  const [stage, setStage] = useState(currentStage)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const cfg = STAGE_CONFIG[stage]

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  async function selectStage(newStage: PipelineStage) {
    if (newStage === stage) { setOpen(false); return }
    setOpen(false)
    setLoading(true)
    setStage(newStage) // optimistic

    try {
      await fetch(`/api/files/${fileId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      })
      router.refresh()
    } catch {
      setStage(stage) // revert
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
        style={{
          backgroundColor: `${cfg.color}14`,
          borderColor: `${cfg.color}30`,
          color: cfg.color,
          cursor: loading ? 'wait' : 'pointer',
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
        {loading ? 'Saving...' : cfg.label}
        <ChevronDown size={12} style={{ opacity: 0.7 }} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 z-50 bg-white rounded-xl py-1 overflow-y-auto"
          style={{
            width: '220px',
            maxHeight: '280px',
            boxShadow: '0 8px 28px rgba(16,24,40,0.14)',
            border: '1px solid var(--border)',
          }}
        >
          {STAGE_ORDER.map(s => {
            const c = STAGE_CONFIG[s]
            const active = s === stage
            return (
              <button
                key={s}
                onClick={() => selectStage(s)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-medium transition-colors"
                style={{
                  backgroundColor: active ? `${c.color}12` : 'transparent',
                  color: active ? c.color : 'var(--text-secondary)',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = '#F4F5F9' }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                {c.label}
                {active && <span className="ml-auto text-[10px] font-bold opacity-60">CURRENT</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
