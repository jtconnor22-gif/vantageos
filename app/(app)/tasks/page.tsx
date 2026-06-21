import { CheckSquare } from 'lucide-react'

const SAMPLE_TASKS = [
  { title: 'Follow up with Maria Gonzalez re: bank statements', priority: 'high', status: 'open', due: 'Jun 23', file: 'VF-1000' },
  { title: 'Submit SBA package for Carter Construction', priority: 'high', status: 'in_progress', due: 'Jun 25', file: 'VF-1001' },
  { title: 'Prepare RBF application for Williams Tech', priority: 'medium', status: 'open', due: 'Jun 22', file: 'VF-1002' },
  { title: 'Send success fee invoice to Nguyen Auto Group', priority: 'medium', status: 'done', due: 'Jun 10', file: 'VF-1003' },
  { title: 'Schedule consultation with Tanya Brooks', priority: 'low', status: 'open', due: 'Jun 24', file: 'VF-1004' },
]

const PRIORITY_STYLES: Record<string, { color: string; bg: string }> = {
  high: { color: '#EF4444', bg: '#FEF2F2' },
  medium: { color: '#F59E0B', bg: '#FFFBEB' },
  low: { color: '#10B981', bg: '#ECFDF5' },
}

const STATUS_STYLES: Record<string, { color: string; label: string }> = {
  open: { color: 'var(--text-secondary)', label: 'Open' },
  in_progress: { color: '#0EA5E9', label: 'In Progress' },
  done: { color: '#10B981', label: 'Done' },
}

export default function TasksPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2
            className="text-xl font-semibold"
            style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
          >
            Tasks
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Track follow-ups, deadlines, and team assignments
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ backgroundColor: 'rgba(79,70,229,0.08)', color: 'var(--accent)' }}
        >
          Coming in Phase 2
        </span>
      </div>

      <div
        className="rounded-[14px] bg-white overflow-hidden"
        style={{ boxShadow: '0 1px 2px rgba(16,24,40,0.04)', border: '1px solid var(--border)' }}
      >
        <div
          className="px-5 py-3 text-xs font-semibold uppercase tracking-wide grid grid-cols-5 gap-4"
          style={{ backgroundColor: 'var(--subtle)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}
        >
          <span className="col-span-2">Task</span>
          <span>File</span>
          <span>Priority</span>
          <span>Status / Due</span>
        </div>

        {SAMPLE_TASKS.map((task, idx) => {
          const p = PRIORITY_STYLES[task.priority]
          const s = STATUS_STYLES[task.status]
          return (
            <div
              key={task.title}
              className="grid grid-cols-5 gap-4 px-5 py-4 text-sm items-center"
              style={{ borderBottom: idx < SAMPLE_TASKS.length - 1 ? '1px solid var(--border)' : 'none' }}
            >
              <span className="col-span-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                {task.status === 'done' ? (
                  <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>{task.title}</span>
                ) : task.title}
              </span>
              <span
                className="font-mono text-xs font-semibold"
                style={{ color: 'var(--accent)' }}
              >
                {task.file}
              </span>
              <span>
                <span
                  className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
                  style={{ backgroundColor: p.bg, color: p.color }}
                >
                  {task.priority}
                </span>
              </span>
              <div>
                <div className="text-xs font-medium" style={{ color: s.color }}>{s.label}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Due {task.due}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
