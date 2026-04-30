import { useState, useEffect, useRef, useCallback } from 'react'


//  상수 
const MODES = {
  focus: { label: '집중', duration: 25 * 60, key: 'focus' },
  break: { label: '휴식', duration: 5 * 60, key: 'break' },
}
const COLOR = {
  bg: '#0e0e0e',
  surface: '#161616',
  surface2: '#1f1f1f',
  border: '#2a2a2a',
  text: '#ebe7e1',
  textMuted: '#6b6560',
  accentFocus: '#e4f0e5',
  accentBreak: '#e6ebf1',
  accentFocusDim: 'rgba(22, 82, 22, 0.1)',
  accentBreakDim: 'rgba(154, 184, 232, 0.12)',
}
//  유틸 
function pad(n) {
  return String(n).padStart(2, '0')
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${pad(m)}:${pad(s)}`
}

//  컴포넌트 
export default function App() {
  const [mode, setMode] = useState('focus')           
  const [timeLeft, setTimeLeft] = useState(MODES.focus.duration)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)         
  const [flash, setFlash] = useState(false)           

  const intervalRef = useRef(null)
  const currentMode = MODES[mode]
  const totalDuration = currentMode.duration
  const progress = 1 - timeLeft / totalDuration       // 0 → 1

  // 타이머 
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

  //  모드 전환 
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

  //  컨트롤 
  function handleStartStop() {
    setRunning(r => !r)
  }

  function handleReset() {
    setRunning(false)
    setTimeLeft(currentMode.duration)
  }

  /* 문서 타이틀 동기화 
  useEffect(() => {
    document.title = `${formatTime(timeLeft)} · ${currentMode.label}`
  }, [timeLeft, currentMode.label])
  */

  //  렌더 
  const isFocus = mode === 'focus'
  const accentVar = isFocus ? 'var(--accent-focus)' : 'var(--accent-break)'

  return (
    <div className={`shell ${flash ? 'flash' : ''}`} data-mode={mode}>

   

      {/* 헤더 */}
      <header className="header">
        <span className="session-count">
          {sessions > 0 && (
            <>
              {Array.from({ length: Math.min(sessions, 8) }).map((_, i) => (
                <span key={i} className="pip" />
              ))}
            </>
          )}
        </span>
      </header>

      
      {/* 타이머 디스플레이 */}
      <main className="timer-area">
        <div className="time-display" style={{ '--accent': accentVar }}>
          {formatTime(timeLeft)}
        </div>
        <div className="time-label">{currentMode.label} 시간</div>
      </main>

      {/* 프로그레스 바 */}
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{
            width: `${progress * 100}%`,
            background: accentVar,
          }}
        />
        {/* 구간 마커 */}
        {[0.25, 0.5, 0.75].map(p => (
          <div
            key={p}
            className="progress-marker"
            style={{ left: `${p * 100}%`, opacity: progress >= p ? 0 : 0.3 }}
          />
        ))}
      </div>

    

      {/* 컨트롤 버튼 */}
      <div className="controls">
        <button className="btn btn-reset" onClick={handleReset} title="리셋">
          <ResetIcon />
        </button>

        <button
          className={`btn btn-primary ${running ? 'running' : ''}`}
          onClick={handleStartStop}
          style={{ '--accent': accentVar }}
        >
          {running ? <PauseIcon /> : <PlayIcon />}
          <span>{running ? '정지' : '시작'}</span>
        </button>

        <button
          className="btn btn-skip"
          onClick={triggerModeSwitch}
          title="건너뛰기"
        >
          <SkipIcon />
        </button>
      </div>

    </div>
  )
}

//  아이콘 
function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  )
}

function ResetIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-4.5" />
    </svg>
  )
}

function SkipIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,4 15,12 5,20" />
      <rect x="16" y="4" width="3" height="16" />
    </svg>
  )
}
