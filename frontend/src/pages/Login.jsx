import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Login() {
  const [form, setForm]     = useState({ email: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const { login }  = useAuth()
  const navigate   = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      login(data.token, data.usuario)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      {/* Fondo decorativo */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(232,255,71,.06) 0%, transparent 70%)',
      }} />

      <div className="card fade-up" style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, borderRadius: 14,
            background: 'var(--accent)', marginBottom: '1rem',
            fontSize: 28,
          }}>⚽</div>
          <h1 style={{
            fontFamily: 'var(--font-head)', fontSize: 28,
            fontWeight: 800, letterSpacing: 1,
          }}>
            ACADEMIA DE FÚTBOL
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
            Panel del Entrenador
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
              CORREO
            </label>
            <input
              type="email"
              placeholder="entrenador@academia.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
              CONTRASEÑA
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
          </div>

          {error && (
            <div style={{
              padding: '.7rem 1rem', borderRadius: 8,
              background: 'rgba(255,77,109,.1)', color: 'var(--danger)',
              fontSize: 14,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-accent"
            style={{ width: '100%', justifyContent: 'center', marginTop: '.5rem', padding: '.75rem' }}
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}