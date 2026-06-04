import { useEffect, useState } from 'react'
import { Plus, Search, X } from 'lucide-react'
import api from '../services/api'

const POSICIONES = ['portero','defensa','mediocampista','delantero']
const ESTADOS    = ['activo','inactivo','lesionado']
const ESTADO_CLASS = { activo: 'badge-green', inactivo: 'badge-gray', lesionado: 'badge-yellow' }

const formVacio = {
  nombre: '', apellido: '', fecha_nacimiento: '',
  posicion: '', categoria_id: '', numero_camiseta: '', estado: 'activo',
}

export default function Jugadores() {
  const [jugadores,   setJugadores]   = useState([])
  const [categorias,  setCategorias]  = useState([])
  const [busqueda,    setBusqueda]    = useState('')
  const [filtroCat,   setFiltroCat]   = useState('')
  const [modal,       setModal]       = useState(false)
  const [form,        setForm]        = useState(formVacio)
  const [editando,    setEditando]    = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [guardando,   setGuardando]   = useState(false)
  const [error,       setError]       = useState('')

  const cargar = () =>
    api.get('/jugadores').then(r => setJugadores(r.data)).finally(() => setLoading(false))

  useEffect(() => {
    cargar()
    api.get('/jugadores').then(r => {
      // Extraer categorías únicas de los jugadores
      const cats = [...new Map(r.data.map(j => [j.categoria, j.categoria_id || j.categoria])).entries()]
      setCategorias(cats.map(([nombre]) => nombre))
      setJugadores(r.data)
      setLoading(false)
    })
  }, [])

  const filtrados = jugadores.filter(j => {
    const texto = `${j.nombre} ${j.apellido}`.toLowerCase()
    return (
      texto.includes(busqueda.toLowerCase()) &&
      (!filtroCat || j.categoria === filtroCat)
    )
  })

  const abrirCrear  = () => { setForm(formVacio); setEditando(null); setError(''); setModal(true) }
  const abrirEditar = j  => {
    setForm({
      nombre: j.nombre, apellido: j.apellido,
      fecha_nacimiento: j.fecha_nacimiento?.split('T')[0] || '',
      posicion: j.posicion || '', categoria_id: j.categoria_id || '',
      numero_camiseta: j.numero_camiseta || '', estado: j.estado,
    })
    setEditando(j.id); setError(''); setModal(true)
  }

  const guardar = async e => {
    e.preventDefault()
    setGuardando(true); setError('')
    try {
      if (editando) {
        await api.put(`/jugadores/${editando}`, form)
      } else {
        await api.post('/jugadores', form)
      }
      setModal(false); cargar()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async id => {
    if (!confirm('¿Eliminar este jugador?')) return
    await api.delete(`/jugadores/${id}`)
    cargar()
  }

  const catsUnicas = [...new Set(jugadores.map(j => j.categoria))]

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 32, fontWeight: 800 }}>JUGADORES</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{jugadores.length} jugadores registrados</p>
        </div>
        <button className="btn btn-accent" onClick={abrirCrear}>
          <Plus size={16} /> Nuevo jugador
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
        <select value={filtroCat} onChange={e => setFiltroCat(e.target.value)} style={{ width: 180 }}>
          <option value="">Todas las categorías</option>
          {catsUnicas.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <p style={{ padding: '2rem', color: 'var(--text-muted)' }}>Cargando...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Jugador</th>
                <th>Categoría</th>
                <th>Posición</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(j => (
                <tr key={j.id}>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 600, width: 40 }}>
                    {j.numero_camiseta || '—'}
                  </td>
                  <td style={{ fontWeight: 500 }}>
                    {j.nombre} {j.apellido}
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{j.categoria}</td>
                  <td style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {j.posicion || '—'}
                  </td>
                  <td>
                    <span className={`badge ${ESTADO_CLASS[j.estado]}`}>{j.estado}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-ghost" style={{ fontSize: 12, padding: '.35rem .8rem', marginRight: 6 }} onClick={() => abrirEditar(j)}>
                      Editar
                    </button>
                    <button className="btn btn-danger" style={{ fontSize: 12, padding: '.35rem .8rem' }} onClick={() => eliminar(j.id)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No se encontraron jugadores</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div className="card fade-up" style={{ width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 700 }}>
                {editando ? 'EDITAR JUGADOR' : 'NUEVO JUGADOR'}
              </h2>
              <button className="btn btn-ghost" style={{ padding: '.35rem' }} onClick={() => setModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: '.9rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.9rem' }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>NOMBRE</label>
                  <input value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))} required />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>APELLIDO</label>
                  <input value={form.apellido} onChange={e => setForm(f => ({...f, apellido: e.target.value}))} required />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>FECHA DE NACIMIENTO</label>
                <input type="date" value={form.fecha_nacimiento} onChange={e => setForm(f => ({...f, fecha_nacimiento: e.target.value}))} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.9rem' }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>POSICIÓN</label>
                  <select value={form.posicion} onChange={e => setForm(f => ({...f, posicion: e.target.value}))}>
                    <option value="">Seleccionar</option>
                    {POSICIONES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>N° CAMISETA</label>
                  <input type="number" value={form.numero_camiseta} onChange={e => setForm(f => ({...f, numero_camiseta: e.target.value}))} min={1} max={99} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.9rem' }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>CATEGORÍA ID</label>
                  <input type="number" value={form.categoria_id} onChange={e => setForm(f => ({...f, categoria_id: e.target.value}))} required placeholder="1-5" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>ESTADO</label>
                  <select value={form.estado} onChange={e => setForm(f => ({...f, estado: e.target.value}))}>
                    {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {error && (
                <div style={{ padding: '.7rem', borderRadius: 8, background: 'rgba(255,77,109,.1)', color: 'var(--danger)', fontSize: 14 }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end', marginTop: '.5rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-accent" disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}