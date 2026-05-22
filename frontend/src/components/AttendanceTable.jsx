import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STATUS_CFG = {
  present: {
    label: 'Келді',   cls: 'status-present',
    icon: <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>,
  },
  late: {
    label: 'Кешікті', cls: 'status-late',
    icon: <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  absent: {
    label: 'Келмеді', cls: 'status-absent',
    icon: <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>,
  },
}

function StatusBadge({ status }) {
  const c = STATUS_CFG[status] || STATUS_CFG.absent
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${c.cls}`}>
      {c.icon}{c.label}
    </span>
  )
}

function StudentAvatar({ photoIndex, name, status }) {
  const [imgOk, setImgOk] = useState(true)
  const colorStyle = status === 'present'
    ? { background: 'rgba(34,197,94,0.2)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }
    : status === 'late'
    ? { background: 'rgba(245,158,11,0.2)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }
    : { background: 'rgba(100,116,139,0.15)', color: '#64748b', border: '1px solid rgba(100,116,139,0.2)' }

  return (
    <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-bold" style={colorStyle}>
      {imgOk && photoIndex ? (
        <img src={`/students/student${photoIndex}.jpg`} alt={name}
          className="w-full h-full object-cover" onError={() => setImgOk(false)} />
      ) : (
        name?.charAt(0) ?? '?'
      )}
    </div>
  )
}

function EditDropdown({ studentId, currentStatus, onUpdate }) {
  const [open, setOpen] = useState(false)
  const options = [
    { value: 'present', label: 'Келді',   icon: '✓', color: 'text-green-400' },
    { value: 'late',    label: 'Кешікті', icon: '⏱', color: 'text-amber-400' },
    { value: 'absent',  label: 'Келмеді', icon: '✗', color: 'text-slate-400' },
  ]
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-300 hover:bg-blue-500/10 transition" title="Өзгерту">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -6 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -6 }} transition={{ duration: 0.12 }}
              className="dropdown-menu absolute right-0 top-8 rounded-xl overflow-hidden z-20 min-w-[130px]"
            >
              {options.map(opt => (
                <button key={opt.value}
                  onClick={() => { onUpdate(studentId, opt.value); setOpen(false) }}
                  className={`w-full text-left px-3.5 py-2.5 text-xs font-medium transition-all flex items-center gap-2.5 ${
                    opt.value === currentStatus ? 'bg-blue-500/10 ' + opt.color : 'text-slate-300 hover:bg-white/5'
                  }`}>
                  <span className={`w-4 ${opt.color}`}>{opt.icon}</span>
                  {opt.label}
                  {opt.value === currentStatus && (
                    <svg className="w-3 h-3 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function AttendanceTable({ students, newIds, onManualUpdate, loading }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = students.filter(s => {
    const matchFilter = filter === 'all' || s.status === filter
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                        s.student_id.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const counts = {
    present: students.filter(s => s.status === 'present').length,
    late:    students.filter(s => s.status === 'late').length,
    absent:  students.filter(s => s.status === 'absent').length,
  }
  const total = students.length
  const attendRate = total > 0 ? Math.round(((counts.present + counts.late) / total) * 100) : 0

  const filters = [
    { key: 'all',     label: 'Барлығы', count: total },
    { key: 'present', label: 'Келді',   count: counts.present },
    { key: 'late',    label: 'Кешікті', count: counts.late },
    { key: 'absent',  label: 'Келмеді', count: counts.absent },
  ]

  return (
    <div className="glass-card rounded-2xl flex flex-col overflow-hidden" style={{ height: '100%', minHeight: 0 }}>

      {/* Header */}
      <div className="px-4 pt-4 pb-3" style={{ background: 'rgba(4,13,31,0.8)', borderBottom: '1px solid rgba(99,179,237,0.08)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,rgba(0,63,135,0.8),rgba(26,86,219,0.8))', border: '1px solid rgba(99,179,237,0.2)' }}>
              <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Қатысу Тізімі</p>
              <p className="text-[10px] text-slate-500">Алфавит бойынша · Real-time</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-white">{attendRate}%</div>
            <div className="text-[10px] text-slate-500">{counts.present + counts.late}/{total} студент</div>
          </div>
        </div>

        <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg,#22c55e,#4ade80)' }}
            initial={{ width: 0 }} animate={{ width: `${attendRate}%` }} transition={{ duration: 0.6 }} />
        </div>

        <div className="flex gap-2 mb-3">
          {[
            { count: counts.present, label: 'Келді',   bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.15)',   text: '#4ade80' },
            { count: counts.late,    label: 'Кешікті', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.15)',  text: '#fbbf24' },
            { count: counts.absent,  label: 'Жоқ',     bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.15)', text: '#94a3b8' },
          ].map(c => (
            <div key={c.label} className="flex-1 text-center py-1.5 rounded-lg"
              style={{ background: c.bg, border: `1px solid ${c.border}` }}>
              <div className="text-sm font-bold" style={{ color: c.text }}>{c.count}</div>
              <div className="text-[9px] uppercase tracking-wide" style={{ color: c.text }}>{c.label}</div>
            </div>
          ))}
        </div>

        <div className="relative mb-2.5">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Студент іздеу..." value={search} onChange={e => setSearch(e.target.value)}
            className="input-dark w-full pl-9 pr-3 py-2 rounded-xl text-xs" />
        </div>

        <div className="flex gap-1">
          {filters.map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className="flex-1 py-1.5 text-[10px] rounded-lg font-semibold transition-all"
              style={filter === tab.key
                ? { background: 'linear-gradient(135deg,#003F87,#1a56db)', color: '#fff', boxShadow: '0 2px 8px rgba(0,63,135,0.4)' }
                : { background: 'rgba(255,255,255,0.03)', color: '#64748b' }}>
              {tab.label} <span className="opacity-60">({tab.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-y-auto" style={{ flex: '1 1 0', minHeight: 0 }}>
        {loading ? (
          <div className="flex flex-col gap-2 p-3">
            {[...Array(8)].map((_, i) => <div key={i} className="shimmer h-10 rounded-lg" />)}
          </div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 z-10" style={{ background: 'rgba(4,13,31,0.95)', borderBottom: '1px solid rgba(99,179,237,0.06)' }}>
              <tr>
                <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-slate-600 uppercase tracking-wider w-8">№</th>
                <th className="text-left px-2 py-2.5 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Аты-жөні</th>
                <th className="text-left px-2 py-2.5 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">ID</th>
                <th className="text-left px-2 py-2.5 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Статус</th>
                <th className="text-left px-2 py-2.5 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Уақыт</th>
                <th className="text-left px-2 py-2.5 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">%</th>
                <th className="px-2 py-2.5 w-8" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((s, idx) => {
                  const isNew = newIds.has(s.id)
                  return (
                    <motion.tr key={s.id} layout
                      initial={isNew ? { backgroundColor: 'rgba(59,130,246,0.2)' } : false}
                      animate={{ backgroundColor: 'transparent' }}
                      transition={isNew ? { duration: 2.5 } : {}}
                      className={`table-row-hover border-b cursor-default ${isNew ? 'row-new' : ''}`}
                      style={{ borderColor: 'rgba(99,179,237,0.05)' }}
                    >
                      <td className="px-3 py-2.5 text-[10px] text-slate-600 font-mono">{idx + 1}</td>
                      <td className="px-2 py-2.5">
                        <div className="flex items-center gap-2">
                          <StudentAvatar photoIndex={s.photo_index} name={s.name} status={s.status} />
                          <span className="text-xs font-medium text-slate-200 leading-tight line-clamp-1 max-w-[120px]">{s.name}</span>
                          {isNew && <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400 pulse-dot" />}
                        </div>
                      </td>
                      <td className="px-2 py-2.5">
                        <span className="text-[10px] font-mono text-slate-600 bg-slate-800/50 px-1.5 py-0.5 rounded">{s.student_id}</span>
                      </td>
                      <td className="px-2 py-2.5"><StatusBadge status={s.status} /></td>
                      <td className="px-2 py-2.5">
                        <span className="text-[10px] font-mono text-slate-500">{s.time || '—'}</span>
                      </td>
                      <td className="px-2 py-2.5">
                        {s.confidence != null ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-10 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                              <div className="h-full rounded-full"
                                style={{ width: `${s.confidence}%`, background: s.confidence >= 85 ? '#22c55e' : '#f59e0b' }} />
                            </div>
                            <span className={`text-[10px] font-mono font-semibold ${s.confidence >= 85 ? 'text-green-400' : 'text-amber-400'}`}>
                              {s.confidence.toFixed(0)}%
                            </span>
                          </div>
                        ) : <span className="text-slate-700 text-xs">—</span>}
                      </td>
                      <td className="px-2 py-2.5">
                        <EditDropdown studentId={s.id} currentStatus={s.status} onUpdate={onManualUpdate} />
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
              {filtered.length === 0 && !loading && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-600 text-xs">Студент табылмады</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: 'rgba(4,13,31,0.7)', borderTop: '1px solid rgba(99,179,237,0.06)' }}>
        <span className="text-[10px] text-slate-600">{filtered.length} / {total} студент</span>
        <span className="text-[10px] text-slate-600 font-mono">Анықталған: <span className="text-green-500">{counts.present + counts.late}</span></span>
      </div>
    </div>
  )
}
