import { useState } from 'react'

export default function Login({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = () => {
    if (password === '12345') {
      onLogin('tracker_user')
    } else {
      setError('Invalid password')
      setPassword('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#0E0E0B',
      color: '#D4C9A8',
      fontFamily: "'JetBrains Mono', monospace"
    }}>
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        border: '.5px solid rgba(212,201,168,.2)',
        borderRadius: '3px',
        background: 'rgba(18,18,13,.85)',
        maxWidth: '300px'
      }}>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '28px',
          fontWeight: 300,
          color: '#E8DFC0',
          marginBottom: '1.5rem'
        }}>CA Tracker</h1>
        
        <label style={{
          fontSize: '10px',
          letterSpacing: '.14em',
          textTransform: 'uppercase',
          color: '#5A5A4E',
          display: 'block',
          marginBottom: '8px'
        }}>Password</label>
        
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter password"
          style={{
            background: 'rgba(212,201,168,.06)',
            border: '.5px solid rgba(212,201,168,.14)',
            borderRadius: '2px',
            color: '#C4B990',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
            padding: '10px',
            width: '100%',
            marginBottom: '1rem',
            boxSizing: 'border-box',
            outline: 'none'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'rgba(201,168,76,.38)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(212,201,168,.14)'
          }}
        />
        
        {error && <p style={{ color: '#C27A7A', fontSize: '10px', marginBottom: '1rem' }}>{error}</p>}
        
        <button
          onClick={handleLogin}
          style={{
            background: 'rgba(201,168,76,.11)',
            border: '.5px solid rgba(201,168,76,.28)',
            color: '#C9A84C',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
            letterSpacing: '.08em',
            padding: '10px 20px',
            borderRadius: '2px',
            cursor: 'pointer',
            width: '100%',
            textTransform: 'uppercase',
            transition: 'background .2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(201,168,76,.2)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(201,168,76,.11)'
          }}
        >
          Login
        </button>
      </div>
    </div>
  )
}
