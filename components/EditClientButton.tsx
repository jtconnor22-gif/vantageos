'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import EditClientModal from './EditClientModal'

interface FileData {
  client_name?: string | null
  business_name?: string | null
  email?: string | null
  phone?: string | null
  state?: string | null
  industry?: string | null
  time_in_business?: string | null
  monthly_revenue?: number | null
  funding_goal?: number | null
  funding_type?: string | null
  est_fico?: number | null
  current_status?: string | null
  next_followup_date?: string | null
  last_contact_date?: string | null
}

interface Props {
  fileId: string
  fileData: FileData
}

export default function EditClientButton({ fileId, fileData }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
        style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--subtle)' }}
      >
        <Pencil size={12} />
        Edit
      </button>
      {open && (
        <EditClientModal
          fileId={fileId}
          defaultValues={fileData}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
