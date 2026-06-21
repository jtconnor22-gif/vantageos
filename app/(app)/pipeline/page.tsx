import { getFiles } from '@/lib/queries/files'
import KanbanBoard from '@/components/KanbanBoard'

export const dynamic = 'force-dynamic'

export default async function PipelinePage() {
  const files = await getFiles()

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold" style={{ fontFamily: 'Space Grotesk,sans-serif', color: 'var(--text-primary)' }}>
          Funding Pipeline
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {files.length} active file{files.length !== 1 ? 's' : ''} · drag cards to update stage
        </p>
      </div>
      <KanbanBoard initialFiles={files} />
    </div>
  )
}
