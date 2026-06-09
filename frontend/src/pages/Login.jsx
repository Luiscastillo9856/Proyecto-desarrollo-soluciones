import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Login() {
  const [form,    setForm]    = useState({ email: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      login(data.token, data.usuario)
      // Redirigir según rol
      navigate(data.usuario.rol === 'admin' ? '/admin' : '/padres', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Correo o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem', background: 'var(--bg)',
    }}>
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(232,255,71,.07) 0%, transparent 70%)',
      }} />

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 72, height: 72, borderRadius: 20,
          background: 'var(--accent)', fontSize: 36, marginBottom: '1rem',
        }}>⚽</div>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 30, fontWeight: 800, letterSpacing: 1 }}>
          ACADEMIA DE FÚTBOL
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
          Ingresa con tu cuenta
        </p>
      </div>

      {/* Formulario */}
      <div className="card fade-up" style={{ width: '100%', maxWidth: 400 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6, letterSpacing: .5 }}>
              CORREO ELECTRÓNICO
            </label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required autoComplete="email"
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6, letterSpacing: .5 }}>
              CONTRASEÑA
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required autoComplete="current-password"
            />
          </div>

          {error && (
            <div style={{
              padding: '.75rem 1rem', borderRadius: 10,
              background: 'rgba(255,77,109,.1)', color: 'var(--danger)', fontSize: 14,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-accent"
            style={{ width: '100%', justifyContent: 'center', padding: '.85rem', marginTop: '.25rem' }}
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: 13, color: 'var(--text-muted)' }}>
          ¿No tienes cuenta? Contacta al entrenador.
        </p>
      </div>
    </div>
  )
}