import { getTasks } from '@/lib/queries/tasks'
import TaskRow, { type Task as TaskRowTask } from '@/components/TaskRow'

export const dynamic = 'force-dynamic'

export default async function TasksPage() {
  const tasks = await getTasks()

  const open = tasks.filter(t => t.status !== 'done')
  const done = tasks.filter(t => t.status === 'done')
  const overdue = open.filter(t => t.due_date && new Date(t.due_date) < new Date())

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold" style={{ fontFamily: 'Space Grotesk,sans-serif', color: 'var(--text-primary)' }}>
            Tasks
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {open.length} open · {overdue.length} overdue
          </p>
        </div>
      </div>

      {/* Stat chips */}
      <div className="flex gap-3 mb-5">
        {[
          { label: 'Open', value: open.length, color: '#2563EB', bg: '#DBEAFE' },
          { label: 'Overdue', value: overdue.length, color: '#DC2626', bg: '#FEE2E2' },
          { label: 'Done', value: done.length, color: '#10B981', bg: '#DCFCE7' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: s.bg, color: s.color }}>
            {s.label} <span>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Active tasks */}
      <div
        className="bg-white rounded-2xl overflow-hidden mb-4"
        style={{ border: '1px solid var(--border)', boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}
      >
        <div
          className="px-5 py-3 text-xs font-semibold uppercase tracking-wide"
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr .8fr .8fr .7fr',
            gap: '12px',
            backgroundColor: '#FAFBFD',
            borderBottom: '1px solid var(--border)',
            color: 'var(--text-muted)',
          }}
        >
          <span>Task</span>
          <span>File</span>
          <span>Priority</span>
          <span>Status</span>
          <span>Due</span>
        </div>

        {open.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            No open tasks
          </div>
        ) : (
          open.map((task, idx) => {
            const isOverdue = !!(task.due_date && new Date(task.due_date) < new Date())
            return (
              <TaskRow
                key={task.id}
                task={task as unknown as TaskRowTask}
                isOverdue={isOverdue}
                last={idx === open.length - 1}
              />
            )
          })
        )}
      </div>

      {/* Completed */}
      {done.length > 0 && (
        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--border)', boxShadow: '0 1px 2px rgba(16,24,40,0.04)', opacity: 0.7 }}
        >
          <div className="px-5 py-3 text-xs font-semibold" style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            COMPLETED / CANCELLED ({done.length})
          </div>
          {done.map((task, idx) => (
            <TaskRow
              key={task.id}
              task={task as unknown as TaskRowTask}
              isOverdue={false}
              last={idx === done.length - 1}
              strikethrough
            />
          ))}
        </div>
      )}
    </div>
  )
}
