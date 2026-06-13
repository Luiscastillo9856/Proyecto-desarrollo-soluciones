import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import api from '../../services/api'

const ESTADOS     = ['pagado','pendiente','vencido','exonerado']
const ESTADO_CLASS = { pagado: 'badge-green', pendiente: 'badge-yellow', vencido: 'badge-red', exonerado: 'badge-gray' }
const METODOS     = ['efectivo','transferencia','otro']

const formVacio = {
  jugador_id: '', monto: '', mes_correspondiente: '',
  estado: 'pagado', metodo_pago: 'efectivo', notas: '',
}

export default function Pagos() {
  const [pagos,    setPagos]    = useState([])
  const [modal,    setModal]    = useState(false)
  const [form,     setForm]     = useState(formVacio)
  const [editando, setEditando] = useState(null)
  const [filtros,  setFiltros]  = useState({ estado: '', mes: '' })
  const [loading,  setLoading]  = useState(true)
  const [guardando,setGuardando]= useState(false)
  const [error,    setError]    = useState('')

  const cargar = () => {
    const params = new URLSearchParams()
    if (filtros.estado) params.set('estado', filtros.estado)
    if (filtros.mes)    params.set('mes', filtros.mes)
    api.get(`/pagos?${params}`).then(r => setPagos(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [filtros])

  const abrirCrear  = () => { setForm(formVacio); setEditando(null); setError(''); setModal(true) }
  const abrirEditar = p => {
    setForm({
      jugador_id: p.jugador_id || '',
      monto: p.monto,
      mes_correspondiente: p.mes_correspondiente,
      estado: p.estado,
      metodo_pago: p.metodo_pago || 'efectivo',
      notas: p.notas || '',
    })
    setEditando(p.id); setError(''); setModal(true)
  }

  const guardar = async e => {
    e.preventDefault()
    setGuardando(true); setError('')
    try {
      if (editando) {
        await api.put(`/pagos/${editando}`, form)
      } else {
        await api.post('/pagos', form)
      }
      setModal(false); cargar()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  const marcarPagado = async p => {
    await api.put(`/pagos/${p.id}`, { estado: 'pagado', metodo_pago: 'efectivo' })
    cargar()
  }

  const total = pagos.reduce((s, p) => s + Number(p.monto), 0)

  return (
    <>
      <div className="fade-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 32, fontWeight: 800 }}>PAGOS</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              {pagos.length} registros · Total: ${total.toLocaleString('es-CL')}
            </p>
          </div>
          <button className="btn btn-accent" onClick={abrirCrear}>
            <Plus size={16} /> Registrar pago
          </button>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <select value={filtros.estado} onChange={e => setFiltros(f => ({...f, estado: e.target.value}))} style={{ width: 180 }}>
            <option value="">Todos los estados</option>
            {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input
            type="month"
            value={filtros.mes}
            onChange={e => setFiltros(f => ({...f, mes: e.target.value}))}
            style={{ width: 180 }}
          />
          {(filtros.estado || filtros.mes) && (
            <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => setFiltros({ estado: '', mes: '' })}>
              <X size={14} /> Limpiar
            </button>
          )}
        </div>

        {/* Tabla */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <p style={{ padding: '2rem', color: 'var(--text-muted)' }}>Cargando...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Jugador</th>
                  <th>Categoría</th>
                  <th>Mes</th>
                  <th>Monto</th>
                  <th>Método</th>
                  <th>Estado</th>
                  <th>Fecha pago</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pagos.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 500 }}>{p.jugador}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{p.categoria}</td>
                    <td>{p.mes_correspondiente}</td>
                    <td>${Number(p.monto).toLocaleString('es-CL')}</td>
                    <td style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {p.metodo_pago || '—'}
                    </td>
                    <td>
                      <span className={`badge ${ESTADO_CLASS[p.estado]}`}>{p.estado}</span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {p.fecha_pago ? new Date(p.fecha_pago).toLocaleDateString('es-CL') : '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {(p.estado === 'pendiente' || p.estado === 'vencido') && (
                        <button
                          className="btn btn-accent"
                          style={{ fontSize: 12, padding: '.3rem .7rem', marginRight: 6 }}
                          onClick={() => marcarPagado(p)}
                        >
                          ✓ Marcar pagado
                        </button>
                      )}
                      <button
                        className="btn btn-ghost"
                        style={{ fontSize: 12, padding: '.3rem .7rem' }}
                        onClick={() => abrirEditar(p)}
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
                {pagos.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No hay pagos con esos filtros
                  </td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
        {/* Modal */}
        {modal && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
          }}>
            <div className="card fade-up" style={{ width: '100%', maxWidth: 460 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 700 }}>
                  {editando ? 'EDITAR PAGO' : 'REGISTRAR PAGO'}
                </h2>
                <button className="btn btn-ghost" style={{ padding: '.35rem' }} onClick={() => setModal(false)}>
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: '.9rem' }}>
                {!editando && (
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>ID JUGADOR</label>
                    <input
                      type="number" value={form.jugador_id}
                      onChange={e => setForm(f => ({...f, jugador_id: e.target.value}))}
                      placeholder="Ej: 1" required
                    />
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.9rem' }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>MONTO ($)</label>
                    <input type="number" value={form.monto} onChange={e => setForm(f => ({...f, monto: e.target.value}))} required />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>MES (YYYY-MM)</label>
                    <input type="month" value={form.mes_correspondiente} onChange={e => setForm(f => ({...f, mes_correspondiente: e.target.value}))} required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.9rem' }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>ESTADO</label>
                    <select value={form.estado} onChange={e => setForm(f => ({...f, estado: e.target.value}))}>
                      {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>MÉTODO DE PAGO</label>
                    <select value={form.metodo_pago} onChange={e => setForm(f => ({...f, metodo_pago: e.target.value}))}>
                      {METODOS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>NOTAS</label>
                  <textarea value={form.notas} onChange={e => setForm(f => ({...f, notas: e.target.value}))} rows={2} placeholder="Observaciones..." />
                </div>

                {error && (
                  <div style={{ padding: '.7rem', borderRadius: 8, background: 'rgba(255,77,109,.1)', color: 'var(--danger)', fontSize: 14 }}>
                    {error}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-accent" disabled={guardando}>
                    {guardando ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
      )}
    </>
  )
}