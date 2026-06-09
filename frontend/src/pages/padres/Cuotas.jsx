import { useEffect, useState } from 'react'
import api from '../../services/api'

const ESTADO_CLASS = {
  pagado: 'badge-green', pendiente: 'badge-yellow',
  vencido: 'badge-red',  exonerado: 'badge-gray',
}
const ESTADO_LABEL = {
  pagado: 'Pagado', pendiente: 'Pendiente',
  vencido: 'Vencido', exonerado: 'Exonerado',
}
const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]

function mesLabel(str) {
  const [y, m] = str.split('-')
  return `${MESES[parseInt(m) - 1]} ${y}`
}

export default function Cuotas() {
  const [pagos,   setPagos]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro,  setFiltro]  = useState('todos')

  useEffect(() => {
    api.get('/pagos').then(r => setPagos(r.data)).finally(() => setLoading(false))
  }, [])

  const filtrados = filtro === 'todos'
    ? pagos
    : pagos.filter(p => p.estado === filtro)

  const total     = pagos.reduce((s, p) => s + Number(p.monto), 0)
  const pendTotal = pagos.filter(p => p.estado === 'pendiente' || p.estado === 'vencido')
                        .reduce((s, p) => s + Number(p.monto), 0)

  return (
    <div style={{ padding: '1.5rem 1rem' }} className="fade-up">
      {/* Header */}
      <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 800, marginBottom: '.25rem' }}>
        MIS CUOTAS
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: '1.5rem' }}>
        Historial de pagos y estado de deuda
      </p>

      {/* Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ borderLeft: '3px solid var(--accent2)' }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: .5, marginBottom: 4 }}>TOTAL PAGADO</p>
          <p style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 800, color: 'var(--accent2)' }}>
            ${total.toLocaleString('es-CL')}
          </p>
        </div>
        <div className="card" style={{ borderLeft: `3px solid ${pendTotal > 0 ? 'var(--danger)' : 'var(--border)'}` }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: .5, marginBottom: 4 }}>POR PAGAR</p>
          <p style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 800, color: pendTotal > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
            ${pendTotal.toLocaleString('es-CL')}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '.5rem', overflowX: 'auto', paddingBottom: '.25rem', marginBottom: '1.25rem' }}>
        {['todos','pagado','pendiente','vencido'].map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{
              flexShrink: 0, padding: '.4rem .9rem',
              borderRadius: 20, fontSize: 13, fontWeight: 500,
              border: `1px solid ${filtro === f ? 'var(--accent)' : 'var(--border)'}`,
              background: filtro === f ? 'rgba(232,255,71,.1)' : 'var(--surface2)',
              color: filtro === f ? 'var(--accent)' : 'var(--text-muted)',
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Lista de pagos */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '3rem' }}>Cargando...</p>
      ) : filtrados.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '3rem', fontSize: 14 }}>
          No hay cuotas en esta categoría
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
          {filtrados.map(p => (
            <div key={p.id} className="card" style={{ padding: '1rem 1.1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 15 }}>{mesLabel(p.mes_correspondiente)}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                    {p.jugador} · {p.categoria}
                  </p>
                  {p.fecha_pago && (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      Pagado el {new Date(p.fecha_pago).toLocaleDateString('es-CL')}
                      {p.metodo_pago && ` · ${p.metodo_pago}`}
                    </p>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 700 }}>
                    ${Number(p.monto).toLocaleString('es-CL')}
                  </p>
                  <span className={`badge ${ESTADO_CLASS[p.estado]}`} style={{ marginTop: 4 }}>
                    {ESTADO_LABEL[p.estado]}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}