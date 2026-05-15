import { useState, useEffect, useRef, useCallback } from 'react'

const MODES = {
  focus: { label: '집중', duration: 25 * 60, key: 'focus' },
  break: { label: '휴식', duration: 5 * 60, key: 'break' },
}

const THEME = {
  dark: {
    bg: '#0e0e0e',
    surface: '#161616',
    surface2: '#1f1f1f',
    border: '#2a2a2a',
    text: '#ebe7e1',
    textMuted: '#6b6560',
    accentFocus: '#e4f0e5',
    accentBreak: '#e6ebf1',
    accentFocusDim: 'rgba(22, 82, 22, 0.15)',
    accentBreakDim: 'rgba(154, 184, 232, 0.12)',
    btnBg: '#1f1f1f',
    btnBorder: '#2a2a2a',
  },
  light: {
    bg: '#f0ede8',
    surface: '#faf9f7',
    surface2: '#eeebe6',
    border: '#ddd9d2',
    text: '#1a1a1a',
    textMuted: '#9a9590',
    accentFocus: '#2d6e2f',
    accentBreak: '#2a4e7a',
    accentFocusDim: 'rgba(22, 82, 22, 0.1)',
    accentBreakDim: 'rgba(42, 78, 122, 0.1)',
    btnBg: '#eeebe6',
    btnBorder: '#ddd9d2',
  },
}

function pad(n) {
  return String(n).padStart(2, '0')
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${pad(m)}:${pad(s)}`
}

export default function App() {
  const [mode, setMode] = useState('focus')
  const [timeLeft, setTimeLeft] = useState(MODES.focus.duration)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [flash, setFlash] = useState(false)
  const [isDark, setIsDark] = useState(true)

  const intervalRef = useRef(null)
  const currentMode = MODES[mode]
  const totalDuration = currentMode.duration
  const progress = 1 - timeLeft / totalDuration

  const C = isDark ? THEME.dark : THEME.light
  const isFocus = mode === 'focus'
  const accent = isFocus ? C.accentFocus : C.accentBreak
  const accentDim = isFocus ? C.accentFocusDim : C.accentBreakDim

  const tick = useCallback(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        setRunning(false)
        triggerModeSwitch()
        return 0
      }
      return prev - 1
    })
  }, [])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, tick])

  function triggerModeSwitch() {
    setFlash(true)
    setTimeout(() => {
      setMode(prev => {
        const next = prev === 'focus' ? 'break' : 'focus'
        setTimeLeft(MODES[next].duration)
        if (prev === 'focus') setSessions(s => s + 1)
        return next
      })
      setFlash(false)
    }, 600)
  }

  function switchMode(next) {
    if (next === mode) return
    setRunning(false)
    setFlash(true)
    setTimeout(() => {
      setMode(next)
      setTimeLeft(MODES[next].duration)
      setFlash(false)
    }, 300)
  }

  function handleStartStop() {
    setRunning(r => !r)
  }

  function handleReset() {
    setRunning(false)
    setTimeLeft(currentMode.duration)
  }

  useEffect(() => {
    document.title = `${formatTime(timeLeft)} · ${currentMode.label}`
  }, [timeLeft, currentMode.label])

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background 0.4s ease',
    }}>
      <div style={{
        position: 'relative',
        width: '420px',
        padding: '36px 44px 44px',
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: '20px',
        opacity: flash ? 0.15 : 1,
        transition: 'opacity 0.3s ease, background 0.4s ease, border-color 0.4s ease',
        fontFamily: "'Nunito', sans-serif",
      }}>

        {/* 헤더 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
        }}>
          {/* 세션 pip */}
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center', minHeight: '10px' }}>
            {Array.from({ length: Math.min(sessions, 8) }).map((_, i) => (
              <span key={i} style={{
                display: 'inline-block',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: accent,
                opacity: 0.7,
              }} />
            ))}
          </div>

          {/* 다크모드 토글 */}
          <button
            onClick={() => setIsDark(d => !d)}
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: C.surface2,
              border: `1px solid ${C.border}`,
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'background 0.3s',
            }}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>

        {/* 모드 탭 */}
        <div style={{
          display: 'flex',
          gap: '2px',
          background: C.surface2,
          borderRadius: '12px',
          padding: '3px',
          marginBottom: '36px',
        }}>
          {Object.values(MODES).map(m => (
            <button
              key={m.key}
              onClick={() => switchMode(m.key)}
              style={{
                flex: 1,
                padding: '9px 0',
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 700,
                fontSize: '13px',
                color: mode === m.key ? accent : C.textMuted,
                background: mode === m.key ? C.surface : 'transparent',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: mode === m.key ? `0 1px 4px rgba(0,0,0,0.15)` : 'none',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* 타이머 */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 600,
            fontSize: '88px',
            lineHeight: 1,
            color: accent,
            transition: 'color 0.5s ease',
            letterSpacing: '-2px',
          }}>
            {formatTime(timeLeft)}
          </div>
          <div style={{
            marginTop: '10px',
            fontSize: '12px',
            letterSpacing: '0.12em',
            color: C.textMuted,
            fontWeight: 600,
            textTransform: 'uppercase',
          }}>
            {currentMode.label} 시간
          </div>
        </div>

        {/* 프로그레스 바 */}
        <div style={{
          position: 'relative',
          height: '4px',
          background: C.surface2,
          borderRadius: '4px',
          marginBottom: '8px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progress * 100}%`,
            background: accent,
            borderRadius: '4px',
            transition: 'width 0.95s linear, background 0.5s ease',
          }} />
        </div>

        {/* 진행률 텍스트 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: C.textMuted,
          fontWeight: 600,
          marginBottom: '32px',
        }}>
          <span>{formatTime(timeLeft)} 남음</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>

        {/* 컨트롤 버튼 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
        }}>
          {/* 리셋 */}
          <button
            onClick={handleReset}
            style={{
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: C.btnBg,
              color: C.textMuted,
              border: `1px solid ${C.btnBorder}`,
              borderRadius: '14px',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-4.5" />
            </svg>
          </button>

          {/* 시작/정지 */}
          <button
            onClick={handleStartStop}
            style={{
              height: '52px',
              padding: '0 36px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800,
              fontSize: '14px',
              color: accent,
              background: accentDim,
              border: `1px solid ${accent}55`,
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {running ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            )}
            <span>{running ? '정지' : '시작'}</span>
          </button>

          {/* 스킵 */}
          <button
            onClick={triggerModeSwitch}
            style={{
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: C.btnBg,
              color: C.textMuted,
              border: `1px solid ${C.btnBorder}`,
              borderRadius: '14px',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,4 15,12 5,20" />
              <rect x="16" y="4" width="3" height="16" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  )
}