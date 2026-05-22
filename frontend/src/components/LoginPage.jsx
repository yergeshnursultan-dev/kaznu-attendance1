import { useState } from 'react'
import { motion } from 'framer-motion'

const STATS = [
  { label: 'Дәлдік', value: '98.7%', icon: '🎯' },
  { label: 'Жылдамдық', value: '<0.3с', icon: '⚡' },
  { label: 'Студент', value: '20,000+', icon: '👥' },
]

export default function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Кіру мүмкін болмады')
      }
      onLogin(await res.json())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex login-bg overflow-hidden relative">

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="particle-1 absolute w-64 h-64 rounded-full top-20 left-10 opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.8) 0%, transparent 70%)' }} />
        <div className="particle-2 absolute w-48 h-48 rounded-full bottom-40 right-20 opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(0,63,135,0.9) 0%, transparent 70%)' }} />
        <div className="particle-3 absolute w-32 h-32 rounded-full top-1/2 left-1/3 opacity-8"
          style={{ background: 'radial-gradient(circle, rgba(99,179,237,0.6) 0%, transparent 70%)' }} />

        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#63b3ed" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* ── Left Branding Panel ─────────────────── */}
      <div className="hidden lg:flex lg:w-[48%] flex-col items-center justify-center p-14 relative">

        {/* Decorative rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[500, 650, 800, 950].map((s, i) => (
            <div key={s} className="absolute rounded-full"
              style={{
                width: s, height: s,
                border: `1px solid rgba(99,179,237,${0.06 - i * 0.01})`,
              }} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="relative z-10 text-center max-w-md"
        >
          {/* University Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative w-28 h-28 mx-auto mb-8"
          >
            <div className="absolute inset-0 rounded-3xl"
              style={{ background: 'linear-gradient(135deg, rgba(0,63,135,0.8) 0%, rgba(26,86,219,0.8) 100%)', border: '1px solid rgba(99,179,237,0.3)', backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,63,135,0.5), inset 0 1px 0 rgba(255,255,255,0.1)' }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <span className="text-3xl font-bold tracking-tight leading-none">KazNU</span>
              <span className="text-[9px] text-blue-200 mt-1.5 tracking-[0.3em] uppercase">Al-Farabi</span>
            </div>
            {/* Glow ring */}
            <div className="absolute -inset-2 rounded-[28px] opacity-30"
              style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.4) 0%, rgba(0,63,135,0.4) 100%)', filter: 'blur(12px)' }} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">
              Қазақ Ұлттық Университеті
            </h1>
            <p className="text-sm text-blue-300 mb-2 tracking-wide">әл-Фараби атындағы</p>

            <div className="flex items-center justify-center gap-2 my-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
              <span className="text-xs text-blue-400 tracking-widest uppercase px-3">AI System</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-blue-500/40 to-transparent" />
            </div>

            <p className="text-xl font-semibold text-white mb-2">Smart Attendance AI</p>
            <p className="text-sm text-blue-300 leading-relaxed max-w-xs mx-auto">
              Беттану технологиясы негізіндегі автоматты қатысуды тіркеу жүйесі
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-10 grid grid-cols-3 gap-3"
          >
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="glass rounded-2xl p-4 text-center"
              >
                <div className="text-lg mb-1">{s.icon}</div>
                <div className="text-xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-blue-300 mt-0.5">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Security badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 flex items-center justify-center gap-6 text-xs text-blue-400"
          >
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 live-dot" />
              AES-256 шифрлама
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              ISO 27001
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              GDPR
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Right Login Form ────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 relative">

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="w-full max-w-[400px]"
        >
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #003F87 0%, #1a56db 100%)', boxShadow: '0 8px 24px rgba(0,63,135,0.5)' }}>
              <span className="text-white font-bold text-xl">K</span>
            </div>
            <p className="text-white font-semibold text-lg">KazNU Smart Attendance</p>
          </div>

          {/* Card */}
          <div className="glass-card rounded-3xl p-8" style={{ boxShadow: '0 8px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)' }}>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-1.5">Жүйеге кіру</h2>
              <p className="text-sm text-slate-400">Мұғалім тіркелгіңізбен кіріңіз</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 tracking-wide uppercase">
                  Логин
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="login-username"
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="bekova"
                    autoComplete="username"
                    className="input-dark w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 tracking-wide uppercase">
                  Құпиясөз
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="input-dark w-full pl-10 pr-10 py-3 rounded-xl text-sm text-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPass ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm"
                  style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)', color: '#fca5a5' }}
                >
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </motion.div>
              )}

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-white py-3.5 rounded-xl font-semibold text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Кіру...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Жүйеге кіру
                  </span>
                )}
              </button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 p-3.5 rounded-xl text-center"
              style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
              <p className="text-xs text-slate-400 mb-1">Demo тіркелгі:</p>
              <p className="text-xs">
                <span className="font-mono text-blue-300 font-semibold">bekova</span>
                <span className="text-slate-500 mx-2">/</span>
                <span className="font-mono text-blue-300 font-semibold">12345</span>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-slate-600 mt-5">
            © 2025 Al-Farabi KazNU · Smart Attendance AI v2.0
          </p>
        </motion.div>
      </div>
    </div>
  )
}
