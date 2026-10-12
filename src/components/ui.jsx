import { TrendingUp, TrendingDown } from 'lucide-react'
import { pct } from '../utils'

export function Kpi({ titulo, valor, variacao, comp = "vs. período anterior", icon: Icon }) {
  const up = variacao >= 0
  return (
    <div className="card kpi">
      <div className="kpi-top">
        <span>{titulo}</span>
        {Icon && <Icon size={18} />}
      </div>
      <strong>{valor}</strong>
      {variacao !== undefined && (
        <small className={up ? 'up' : 'down'}>
          {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {pct(variacao)} {comp}
        </small>
      )}
    </div>
  )
}

export function Card({ titulo, acao, children, className = '' }) {
  return (
    <section className={`card ${className}`}>
      <header className="card-head">
        <h3>{titulo}</h3>
        {acao}
      </header>
      {children}
    </section>
  )
}
