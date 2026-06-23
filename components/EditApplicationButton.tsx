'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import EditApplicationModal from './EditApplicationModal'

interface Lender { id: string; name: string }

interface Application {
  id: string
  product_name?: string | null
  lender_id?: string | null
  status: string
  approved_amount?: number | null
  funded_amount?: number | null
  submitted_date?: string | null
  decision_date?: string | null
  notes?: string | null
}

interface Props {
  application: Application
  lenders: Lender[]
}

export default function EditApplicationButton({ application, lenders }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={e => { e.preventDefault(); e.stopPropagation(); setOpen(true) }}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition-colors"
        style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--subtle)' }}
        title="Edit application"
      >
        <Pencil size={11} />
        Edit
      </button>
      {open && (
        <EditApplicationModal
          application={application}
          lenders={lenders}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
