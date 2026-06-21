'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import AddApplicationModal from './AddApplicationModal'
import AddDocumentModal from './AddDocumentModal'
import AddTaskModal from './AddTaskModal'

interface Lender { id: string; name: string }

interface Props {
  fileId: string
  lenders: Lender[]
}

export default function FileProfileActions({ fileId, lenders }: Props) {
  const [modal, setModal] = useState<'app' | 'doc' | 'task' | null>(null)

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        <ActionBtn label="+ Application" onClick={() => setModal('app')} />
        <ActionBtn label="+ Document" onClick={() => setModal('doc')} />
        <ActionBtn label="+ Task" onClick={() => setModal('task')} />
      </div>

      {modal === 'app' && (
        <AddApplicationModal fileId={fileId} lenders={lenders} onClose={() => setModal(null)} />
      )}
      {modal === 'doc' && (
        <AddDocumentModal fileId={fileId} onClose={() => setModal(null)} />
      )}
      {modal === 'task' && (
        <AddTaskModal fileId={fileId} onClose={() => setModal(null)} />
      )}
    </>
  )
}

function ActionBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
      style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', backgroundColor: 'white' }}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'
        ;(e.currentTarget as HTMLElement).style.color = 'var(--accent)'
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
        ;(e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'
      }}
    >
      {label}
    </button>
  )
}
