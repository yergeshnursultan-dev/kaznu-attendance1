import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import CameraPanel from './CameraPanel'
import AttendanceTable from './AttendanceTable'

const SESSION_ID = 'lesson-001'

export default function Dashboard({ session, onLogout }) {
  const [students, setStudents] = useState([])
  const [newIds, setNewIds] = useState(new Set())
  const [isActive, setIsActive] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const newIdTimers = useRef({})

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    fetch(`/api/students/${session.group}`)
      .then(r => r.json())
      .then(data => { setStudents(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [session.group])

  const handleDetection = useCallback((detections) => {
    if (!isActive) return
    const now = new Date().toLocaleTimeString('kk-KZ', { hour: '2-digit', minute: '2-digit' })
    setStudents(prev => {
      let changed = false
      const next = prev.map(s => {
        const match = detections.find(d => d.student_id === s.student_id)
        if (match && s.status === 'absent') { changed = true; return { ...s, status: 'present', time: now, confidence: match.confidence } }
        return s
      })
      if (!changed) return prev
      const updatedIds = new Set()
      next.forEach((s, i) => {
        if (prev[i].status === 'absent' && s.status === 'present') {
          updatedIds.add(s.id)
          fetch('/api/attendance/update', {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: s.id, status: 'present', confidence: s.confidence, method: 'auto' }),
          }).catch(() => {})
        }
      })
      if (updatedIds.size > 0) {
        setNewIds(prev => new Set([...prev, ...updatedIds]))
        updatedIds.forEach(id => {
          clearTimeout(newIdTimers.current[id])
          newIdTimers.current[id] = setTimeout(() => {
            setNewIds(prev => { const n = new Set(prev); n.delete(id); return n })
          }, 4000)
        })
      }
      return next
    })
  }, [isActive])

  const handleManualUpdate = useCallback((studentId, status) => {
    const now = new Date().toLocaleTimeString('kk-KZ', { hour: '2-digit', minute: '2-digit' })
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status, time: now, confidence: null } : s))
    fetch('/api/attendance/update', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: studentId, status, method: 'manual' }),
    }).catch(() => {})
  }, [])

  const startLesson = useCallback(async () => {
    // Бүгінгі attendance-ды тазалап, барлығын "absent"-ке қайтарамыз
    await fetch('/api/attendance/reset-today', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ group: session.group }),
    }).catch(() => {})
    setStudents(prev => prev.map(s => ({ ...s, status: 'absent', time: null, confidence: null })))
    setNewIds(new Set())
    setIsActive(true)
  }, [session.group])

  const stopLesson = useCallback(() => setIsActive(false), [])

  const present = students.filter(s => s.status === 'present').length
  const late    = students.filter(s => s.status === 'late').length
  const total   = students.length

  return (
    <div className="min-h-screen bg-main flex flex-col">
      <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="glass-header px-6 py-3">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-kaznu rounded-lg flex items-center justify-center text-white text-xs font-bold"
                style={{ background: 'linear-gradient(135deg,#003F87,#1a56db)' }}>K</div>
              <div>
                <p className="text-xs font-bold text-white leading-none">KazNU Smart Attendance</p>
                <p className="text-[10px] text-slate-500 mt-0.5">AI-негізді қатысу жүйесі</p>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="flex items-center gap-4 text-sm">
              <InfoChip icon="user"  label={session.name} />
              <InfoChip icon="book"  label={session.subject} />
              <InfoChip icon="users" label={session.group} />
              <InfoChip icon="map"   label={session.room} />
              <InfoChip icon="clock" label={session.schedule_time} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-semibold text-white">
                {present + late}<span className="text-slate-500 font-normal">/{total}</span>
              </span>
              <span className="text-xs text-slate-500">студент</span>
            </div>
            <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: total > 0 ? `${((present + late) / total) * 100}%` : '0%' }} />
            </div>
            <button onClick={() => isActive ? stopLesson() : startLesson()}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.97] text-white ${
                isActive ? 'btn-danger' : 'btn-primary'
              }`}>
              {isActive
                ? <><span className="w-2 h-2 rounded-sm bg-white" />Сабақты тоқтату</>
                : <><span className="w-2 h-2 rounded-full bg-white" />Сабақты бастау</>}
            </button>
            <div className="text-sm font-mono text-slate-500 min-w-[60px] text-right">
              {currentTime.toLocaleTimeString('kk-KZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <button onClick={onLogout} className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 transition" title="Шығу">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </motion.header>

      {!isActive && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="bg-amber-950/40 border-b border-amber-800/30 px-6 py-2">
          <p className="text-xs text-amber-400 text-center">
            Камера белсенді емес.{' '}
            <button onClick={startLesson} className="underline font-semibold hover:text-amber-200">«Сабақты бастау»</button>{' '}
            батырмасын басыңыз.
          </p>
        </motion.div>
      )}

      <div className="flex-1 flex gap-4 p-4 overflow-hidden max-w-[1600px] w-full mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex-[55] flex flex-col overflow-hidden">
          <CameraPanel sessionId={SESSION_ID} isActive={isActive} onDetection={handleDetection} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="flex-[45] flex flex-col overflow-hidden">
          <AttendanceTable students={students} newIds={newIds} onManualUpdate={handleManualUpdate} loading={loading} />
        </motion.div>
      </div>
    </div>
  )
}

function InfoChip({ icon, label }) {
  const icons = {
    user:  'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    book:  'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    map:   'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
    clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  }
  return (
    <div className="flex items-center gap-1.5 text-slate-400">
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icons[icon]} />
      </svg>
      <span className="text-xs font-medium truncate max-w-[140px]">{label}</span>
    </div>
  )
}
