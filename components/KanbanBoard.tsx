'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { STAGE_CONFIG, STAGE_ORDER, avatarColor, getInitials, formatMoney } from '@/lib/stage-config'
import type { FileWithRelations } from '@/lib/queries/files'
import type { PipelineStage } from '@/lib/supabase/types'

interface Props {
  initialFiles: FileWithRelations[]
}

export default function KanbanBoard({ initialFiles }: Props) {
  const [files, setFiles] = useState(initialFiles)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null)

  // Group by stage
  const byStage: Record<PipelineStage, FileWithRelations[]> = {} as Record<PipelineStage, FileWithRelations[]>
  for (const stage of STAGE_ORDER) byStage[stage] = []
  for (const f of files) byStage[f.stage]?.push(f)

  function onDragStart(e: React.DragEvent, id: string) {
    setDraggingId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('fileId', id)
  }

  function onDragOver(e: React.DragEvent, stage: PipelineStage) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverStage(stage)
  }

  function onDragLeave() {
    setDragOverStage(null)
  }

  async function onDrop(e: React.DragEvent, newStage: PipelineStage) {
    e.preventDefault()
    const fileId = e.dataTransfer.getData('fileId') || draggingId
    setDragOverStage(null)
    setDraggingId(null)
    if (!fileId) return

    const file = files.find(f => f.id === fileId)
    if (!file || file.stage === newStage) return

    // Optimistic update
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, stage: newStage } : f))

    // Persist
    try {
      await fetch(`/api/files/${fileId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      })
    } catch {
      // Revert on failure
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, stage: file.stage } : f))
    }
  }

  const stageTotal = useCallback((stage: PipelineStage) => {
    return byStage[stage].reduce((sum, f) => sum + (f.funding_goal ?? 0), 0)
  }, [byStage])

  return (
    <div
      className="flex gap-4 overflow-x-auto pb-6"
      style={{ minHeight: 'calc(100vh - 130px)' }}
    >
      {STAGE_ORDER.map(stage => {
        const cfg = STAGE_CONFIG[stage]
        const stageFiles = byStage[stage]
        const isOver = dragOverStage === stage
        const total = stageTotal(stage)

        return (
          <div
            key={stage}
            className="flex-shrink-0 flex flex-col rounded-2xl transition-all"
            style={{
              width: '264px',
              backgroundColor: isOver ? `${cfg.color}10` : '#F4F5F9',
              border: `1.5px solid ${isOver ? cfg.color : 'transparent'}`,
            }}
            onDragOver={e => onDragOver(e, stage)}
            onDragLeave={onDragLeave}
            onDrop={e => onDrop(e, stage)}
          >
            {/* Column header */}
            <div className="px-3 pt-3 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.color }} />
                <span className="text-xs font-semibold uppercase tracking-wide flex-1 truncate" style={{ color: '#4B5563', letterSpacing: '0.04em' }}>
                  {cfg.label}
                </span>
                <span
                  className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: `${cfg.color}18`, color: cfg.color }}
                >
                  {stageFiles.length}
                </span>
              </div>
              {total > 0 && (
                <div className="mt-1 text-xs" style={{ color: '#9AA1B4', paddingLeft: '18px' }}>
                  {formatMoney(total)}
                </div>
              )}
            </div>

            {/* Cards */}
            <div className="flex-1 px-2 pb-2 space-y-2 min-h-[60px]">
              {stageFiles.map(file => (
                <FileCard
                  key={file.id}
                  file={file}
                  stageColor={cfg.color}
                  onDragStart={onDragStart}
                  dragging={draggingId === file.id}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function FileCard({
  file,
  stageColor,
  onDragStart,
  dragging,
}: {
  file: FileWithRelations
  stageColor: string
  onDragStart: (e: React.DragEvent, id: string) => void
  dragging: boolean
}) {
  const initials = getInitials(file.client_name)
  const color = avatarColor(file.id)
  const isOverdue = file.next_followup_date && new Date(file.next_followup_date) < new Date()

  return (
    <Link href={`/files/${file.id}`}>
      <div
        draggable
        onDragStart={e => onDragStart(e, file.id)}
        className="group bg-white rounded-xl p-3 transition-all select-none"
        style={{
          borderRadius: '11px',
          cursor: dragging ? 'grabbing' : 'grab',
          boxShadow: dragging
            ? '0 8px 24px rgba(16,24,40,0.14)'
            : '0 1px 3px rgba(16,24,40,0.06)',
          opacity: dragging ? 0.6 : 1,
          border: '1px solid var(--border)',
        }}
        onMouseEnter={e => {
          if (!dragging) {
            (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(16,24,40,0.10)'
            ;(e.currentTarget as HTMLElement).style.borderColor = '#D0D5E8'
          }
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(16,24,40,0.06)'
          ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
        }}
      >
        {/* Top row: avatar + name */}
        <div className="flex items-center gap-2.5 mb-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
            style={{ backgroundColor: color }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {file.client_name}
            </div>
            {file.business_name && (
              <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                {file.business_name}
              </div>
            )}
          </div>
        </div>

        {/* Funding goal + FICO */}
        <div className="flex items-center justify-between mb-2.5">
          {file.funding_goal ? (
            <span className="text-sm font-semibold" style={{ fontFamily: 'Space Grotesk,sans-serif', color: '#0EA968' }}>
              {formatMoney(file.funding_goal)}
            </span>
          ) : <span />}
          {file.est_fico ? (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#F0F1F6', color: '#5A6172' }}
            >
              {file.est_fico}
            </span>
          ) : null}
        </div>

        {/* Footer: file code + next followup */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono" style={{ color: '#9AA1B4' }}>
            {file.file_code}
          </span>
          {file.next_followup_date && (
            <span
              className="text-xs font-medium"
              style={{ color: isOverdue ? '#E5484D' : '#9AA1B4' }}
            >
              {isOverdue ? '⚑ ' : ''}
              {new Date(file.next_followup_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
