import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const WS_BASE = 'ws://localhost:8000/ws/camera'

export default function CameraPanel({ sessionId, isActive, onDetection }) {
  const canvasRef = useRef(null)
  const wsRef = useRef(null)
  const retryRef = useRef(null)

  const [status, setStatus] = useState('offline')
  const [dets, setDets] = useState([])
  const [timeStr, setTimeStr] = useState('')
  const [fps, setFps] = useState(0)
  const fpsRef = useRef({ count: 0, last: Date.now() })

  // ── Canvas painter with premium face boxes ──
  const paint = useCallback((b64, detections) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)

      detections.forEach(d => {
        if (!d.box || d.box.length < 4) return
        const [x1, y1, x2, y2] = d.box
        const bw = x2 - x1
        const bh = y2 - y1

        const known = d.status === 'known'
        const color = known ? '#22c55e' : '#ef4444'
        const colorRgb = known ? '34,197,94' : '239,68,68'
        const conf = d.confidence > 0 ? d.confidence.toFixed(0) : null

        // ── Outer glow ──
        ctx.save()
        ctx.shadowColor = color
        ctx.shadowBlur = 20

        // ── Main box ──
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.globalAlpha = 0.9
        ctx.strokeRect(x1, y1, bw, bh)
        ctx.restore()

        // ── Filled corners (bracket style) ──
        const tk = Math.max(10, Math.min(20, bw * 0.18))
        const tlw = 3
        ctx.strokeStyle = color
        ctx.lineWidth = tlw

        const corners = [
          [x1, y1,  1,  1],
          [x2, y1, -1,  1],
          [x1, y2,  1, -1],
          [x2, y2, -1, -1],
        ]
        corners.forEach(([cx, cy, sx, sy]) => {
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + sx * tk, cy); ctx.stroke()
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + sy * tk); ctx.stroke()
        })

        // ── Label background ──
        const name = d.name
        const confLabel = conf ? ` ${conf}%` : ''
        const fullLabel = `${name}${confLabel}`

        ctx.font = `bold 13px "Segoe UI", "Arial Unicode MS", Arial, sans-serif`
        const tw = ctx.measureText(fullLabel).width
        const lh = 26
        const lx = x1
        const ly = y1 - lh - 4

        // Shadow bg
        ctx.save()
        ctx.fillStyle = `rgba(${colorRgb}, 0.85)`
        ctx.shadowColor = `rgba(${colorRgb}, 0.5)`
        ctx.shadowBlur = 12
        const rr = 5
        if (ctx.roundRect) {
          ctx.beginPath()
          ctx.roundRect(lx, ly, tw + 14, lh, rr)
          ctx.fill()
        } else {
          ctx.fillRect(lx, ly, tw + 14, lh)
        }
        ctx.restore()

        // Text
        ctx.fillStyle = '#ffffff'
        ctx.font = `bold 13px "Segoe UI", "Arial Unicode MS", Arial, sans-serif`
        ctx.fillText(fullLabel, lx + 7, ly + 17)

        // ── Confidence bar (bottom of box) ──
        if (known && conf) {
          const barH = 3
          const barY = y2 + 3
          const barW = (parseFloat(conf) / 100) * bw
          ctx.fillStyle = `rgba(${colorRgb}, 0.25)`
          ctx.fillRect(x1, barY, bw, barH)
          ctx.fillStyle = color
          ctx.fillRect(x1, barY, barW, barH)
        }

        // ── Center dot ──
        const cx = x1 + bw / 2
        const cy = y1 + bh / 2
        ctx.beginPath()
        ctx.arc(cx, cy, 3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${colorRgb}, 0.3)`
        ctx.fill()
      })

      // ── FPS Counter ──
      const now = Date.now()
      fpsRef.current.count++
      if (now - fpsRef.current.last >= 1000) {
        setFps(fpsRef.current.count)
        fpsRef.current = { count: 0, last: now }
      }
    }
    img.src = `data:image/jpeg;base64,${b64}`
  }, [])

  const connect = useCallback(() => {
    if (!isActive) return
    try {
      const ws = new WebSocket(`${WS_BASE}/${sessionId}`)
      wsRef.current = ws
      setStatus('connecting')

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data)
          if (msg.type !== 'frame') return
          paint(msg.frame, msg.detections || [])
          setDets(msg.detections || [])
          setStatus(msg.is_demo ? 'demo' : 'live')
          setTimeStr(msg.ts || '')
          const known = (msg.detections || []).filter(d => d.status === 'known')
          if (known.length > 0) onDetection?.(known)
        } catch {}
      }

      ws.onerror = () => setStatus('error')
      ws.onclose = () => {
        setStatus('offline')
        if (isActive) retryRef.current = setTimeout(connect, 3000)
      }
    } catch {
      setStatus('offline')
    }
  }, [sessionId, isActive, onDetection, paint])

  useEffect(() => {
    if (isActive) {
      connect()
    } else {
      wsRef.current?.close()
      setStatus('offline')
      setDets([])
      setFps(0)
    }
    return () => {
      wsRef.current?.close()
      clearTimeout(retryRef.current)
    }
  }, [isActive, connect])

  const known = dets.filter(d => d.status === 'known')
  const unknown = dets.filter(d => d.status === 'unknown')

  const statusConfig = {
    connecting: { color: 'text-amber-400', dot: 'bg-amber-400', label: 'Қосылуда...', pulse: true },
    live:       { color: 'text-green-400',  dot: 'bg-green-400',  label: 'LIVE',        pulse: true },
    demo:       { color: 'text-green-400',  dot: 'bg-green-400',  label: 'LIVE',        pulse: true },
    offline:    { color: 'text-slate-500',  dot: 'bg-slate-500',  label: 'OFFLINE',     pulse: false },
    error:      { color: 'text-red-400',    dot: 'bg-red-400',    label: 'ҚАТЕ',        pulse: false },
  }
  const sc = statusConfig[status] || statusConfig.offline

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col" style={{ height: '100%', minHeight: 0 }}>

      {/* ── Camera Header ── */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{ background: 'rgba(4,13,31,0.8)', borderBottom: '1px solid rgba(99,179,237,0.1)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,rgba(0,63,135,0.8),rgba(26,86,219,0.8))', border: '1px solid rgba(99,179,237,0.2)' }}>
            <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 10l4.553-2.069A1 1 0 0121 8.854v6.292a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Тікелей Камера</p>
            <p className="text-[10px] text-slate-500">AI Face Recognition · YuNet + SFace</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {(status === 'live' || status === 'demo') && (
            <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{fps} FPS</span>
          )}
          {timeStr && <span className="text-xs font-mono text-slate-500">{timeStr}</span>}
          {dets.length > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)', color: '#93c5fd' }}>
              {dets.length} адам
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${sc.dot} ${sc.pulse ? 'live-dot' : ''}`} />
            <span className={`text-xs font-semibold ${sc.color}`}>{sc.label}</span>
          </div>
        </div>
      </div>

      {/* ── Canvas Area ── */}
      <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden min-h-0">
        {/* Scan line effect when active */}
        {(status === 'live' || status === 'demo') && (
          <div className="scan-line" />
        )}

        <canvas
          ref={canvasRef}
          className="camera-frame max-w-full max-h-full"
          style={{ display: status === 'offline' || status === 'error' ? 'none' : 'block' }}
        />

        {/* Connecting */}
        {status === 'connecting' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4"
            style={{ background: 'rgba(4,13,31,0.85)' }}>
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(0,63,135,0.3)', border: '1px solid rgba(99,179,237,0.2)' }}>
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M15 10l4.553-2.069A1 1 0 0121 8.854v6.292a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
              </div>
              <div className="absolute -inset-2 rounded-3xl border-2 border-blue-500/30 animate-ping" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-blue-300">Камераға қосылуда...</p>
              <p className="text-xs text-slate-600 mt-1">Жүйені іске қосу</p>
            </div>
          </div>
        )}

        {/* Offline */}
        {(status === 'offline' || status === 'error') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 p-8"
          >
            {/* Grid overlay */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="cam-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#63b3ed" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#cam-grid)" />
            </svg>

            <div className="relative z-10">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(99,179,237,0.1)' }}>
                <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M15 10l4.553-2.069A1 1 0 0121 8.854v6.292a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
              </div>
            </div>

            <div className="text-center relative z-10">
              <p className="text-sm font-medium text-slate-400">Камера қолжетімді емес</p>
              <p className="text-xs text-slate-600 mt-1">
                {isActive ? 'Камераға қосылу мүмкін болмады' : 'Сабақты бастау батырмасын басыңыз'}
              </p>
            </div>

            {isActive && (
              <button
                onClick={connect}
                className="btn-primary relative z-10 px-5 py-2 rounded-xl text-white text-xs font-semibold"
              >
                Қайта қосылу
              </button>
            )}
          </motion.div>
        )}

        {/* Live indicator */}
        {(status === 'live' || status === 'demo') && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
            style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(34,197,94,0.4)' }}>
            <span className="w-2 h-2 rounded-full bg-green-500 live-dot" />
            <span className="text-[10px] font-bold text-green-400 tracking-wider">LIVE</span>
          </div>
        )}
      </div>

      {/* ── Detection Chips ── */}
      <div className="px-4 py-3" style={{ background: 'rgba(4,13,31,0.7)', borderTop: '1px solid rgba(99,179,237,0.08)' }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Соңғы анықталған</span>
          {known.length > 0 && <span className="text-[10px] font-mono text-green-500">{known.length} танылды</span>}
          {unknown.length > 0 && <span className="text-[10px] font-mono text-red-500 ml-1">{unknown.length} белгісіз</span>}
        </div>

        <div className="flex gap-2 flex-wrap min-h-[28px]">
          <AnimatePresence>
            {dets.length === 0 ? (
              <span className="text-xs text-slate-400 italic">Камерада ешкім жоқ</span>
            ) : (
              dets.map((d, i) => (
                <motion.div
                  key={`${d.student_id ?? 'unk'}-${i}`}
                  initial={{ opacity: 0, scale: 0.8, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={d.status === 'known'
                    ? { background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }
                    : { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }
                  }
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${d.status === 'known' ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span>{d.name}</span>
                  {d.confidence > 0 && (
                    <span className="opacity-60">{d.confidence.toFixed(0)}%</span>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
