import { useMemo, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  LayoutDashboard, ShoppingCart, Package, Globe, MapPin, FileText, Percent,
  DollarSign, Users, MousePointerClick, Download, Moon, Sun, Search,
} from 'lucide-react'
import { pedidos, trafego, paginas, produtos, regioes } from './data/mockData'
import { brl, brlK, num, groupSum, exportCSV, CORES } from './utils'
import { Kpi, Card } from './components/ui'

const ABAS = [
  { id: 'geral', nome: 'Visão geral', icon: LayoutDashboard },
  { id: 'vendas', nome: 'Vendas', icon: ShoppingCart },
  { id: 'produtos', nome: 'Produtos', icon: Package },
  { id: 'regioes', nome: 'Regiões e segmentos', icon: MapPin },
  { id: 'site', nome: 'Site e marketing', icon: Globe },
  { id: 'pedidos', nome: 'Pedidos', icon: FileText },
]

const PERIODOS = [
  { id: 3, nome: 'Últimos 3 meses' },
  { id: 6, nome: 'Últimos 6 meses' },
  { id: 12, nome: 'Últimos 12 meses' },
  { id: 24, nome: 'Últimos 24 meses' },
]

const idx = (ano, mes) => (ano - 2025) * 12 + mes
const ULTIMO = trafego.length - 1

export default function App() {
  const [aba, setAba] = useState('geral')
  const [periodo, setPeriodo] = useState(12)
  const [regiao, setRegiao] = useState('Todas')
  const [produto, setProduto] = useState('Todos')
  const [escuro, setEscuro] = useState(false)

  const d = useMemo(() => {
    const filtra = (ini, fim) =>
      pedidos.filter((p) => {
        const i = idx(p.ano, p.mes)
        return i >= ini && i <= fim && p.status !== 'Cancelado' &&
          (regiao === 'Todas' || p.regiao === regiao) &&
          (produto === 'Todos' || p.produto === produto)
      })
    const ini = ULTIMO - periodo + 1
    const atual = filtra(ini, ULTIMO)
    const anterior = filtra(ini - periodo, ini - 1)
    const fat = atual.reduce((s, p) => s + p.valor, 0)
    const fatAnt = anterior.reduce((s, p) => s + p.valor, 0)
    const varia = (a, b) => (b ? ((a - b) / b) * 100 : undefined)

    const trafAtual = trafego.slice(ini, ULTIMO + 1)
    const trafAnt = ini - periodo >= 0 ? trafego.slice(ini - periodo, ini) : []
    const soma = (arr, k) => arr.reduce((s, t) => s + t[k], 0)
    const visitas = soma(trafAtual, 'visitas')
    const orc = soma(trafAtual, 'orcamentos')

    const mensal = trafAtual.map((t, j) => {
      const ps = atual.filter((p) => idx(p.ano, p.mes) === ini + j)
      return {
        label: t.label,
        faturamento: ps.reduce((s, p) => s + p.valor, 0),
        pedidos: ps.length,
        visitas: t.visitas,
        orcamentos: t.orcamentos,
        whatsapp: t.whatsapp,
      }
    })

    return {
      atual, fat, varFat: varia(fat, fatAnt),
      nPed: atual.length, varPed: varia(atual.length, anterior.length),
      ticket: atual.length ? fat / atual.length : 0,
      varTicket: varia(fat / (atual.length || 1), anterior.length ? fatAnt / anterior.length : 0),
      visitas, varVisitas: varia(visitas, soma(trafAnt, 'visitas')),
      orc, varOrc: varia(orc, soma(trafAnt, 'orcamentos')),
      mensal,
      porProduto: groupSum(atual, 'produto'),
      porProdutoQtd: groupSum(atual, 'produto', 'quantidade'),
      porRegiao: groupSum(atual, 'regiao'),
      porSegmento: groupSum(atual, 'segmento'),
      canais: groupSum(trafAtual.flatMap((t) => t.canais), 'canal', 'visitas'),
      paginas: paginas.map((p) => ({ ...p, visitas: Math.round(visitas * p.visitas) })),
      rejeicao: (soma(trafAtual, 'rejeicao') / trafAtual.length).toFixed(1),
    }
  }, [periodo, regiao, produto])

  return (
    <div className={`app ${escuro ? 'dark' : ''}`}>
      <aside className="sidebar">
        <div className="brand">
          <span className="logo">R</span>
          <div><b>Rollerport</b><small>Relatórios</small></div>
        </div>
        <nav>
          {ABAS.map(({ id, nome, icon: Icon }) => (
            <button key={id} className={aba === id ? 'ativo' : ''} onClick={() => setAba(id)}>
              <Icon size={18} /> <span>{nome}</span>
            </button>
          ))}
        </nav>
        <a className="site-link" href="https://rollerport.com.br" target="_blank" rel="noreferrer">rollerport.com.br ↗</a>
      </aside>

      <main>
        <header className="topbar">
          <h1>{ABAS.find((a) => a.id === aba).nome}</h1>
          <div className="filtros">
            <select value={periodo} onChange={(e) => setPeriodo(+e.target.value)}>
              {PERIODOS.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
            <select value={regiao} onChange={(e) => setRegiao(e.target.value)}>
              <option>Todas</option>
              {regioes.map((r) => <option key={r}>{r}</option>)}
            </select>
            <select value={produto} onChange={(e) => setProduto(e.target.value)}>
              <option>Todos</option>
              {produtos.map((p) => <option key={p.id}>{p.nome}</option>)}
            </select>
            <button className="icon-btn" onClick={() => setEscuro(!escuro)} title="Alternar tema">
              {escuro ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        {aba === 'geral' && <Geral d={d} />}
        {aba === 'vendas' && <Vendas d={d} />}
        {aba === 'produtos' && <Produtos d={d} />}
        {aba === 'regioes' && <Regioes d={d} />}
        {aba === 'site' && <Site d={d} />}
        {aba === 'pedidos' && <Pedidos d={d} />}
      </main>
    </div>
  )
}

const tip = { formatter: (v, n) => (n === 'faturamento' ? brl(v) : num(v)) }
const eixoMoeda = { tickFormatter: brlK, width: 80 }

function Geral({ d }) {
  return (
    <>
      <div className="kpis">
        <Kpi titulo="Faturamento" valor={brlK(d.fat)} variacao={d.varFat} icon={DollarSign} />
        <Kpi titulo="Pedidos" valor={num(d.nPed)} variacao={d.varPed} icon={ShoppingCart} />
        <Kpi titulo="Ticket médio" valor={brl(d.ticket)} variacao={d.varTicket} icon={FileText} />
        <Kpi titulo="Visitas no site" valor={num(d.visitas)} variacao={d.varVisitas} icon={Users} />
        <Kpi titulo="Orçamentos solicitados" valor={num(d.orc)} variacao={d.varOrc} icon={MousePointerClick} />
      </div>
      <div className="grid-2">
        <Card titulo="Faturamento mensal" className="span-2">
          <ResponsiveContainer height={300}>
            <AreaChart data={d.mensal}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#e4572e" stopOpacity={0.35} />
                  <stop offset="1" stopColor="#e4572e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" /><YAxis {...eixoMoeda} />
              <Tooltip {...tip} />
              <Area dataKey="faturamento" stroke="#e4572e" fill="url(#g)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card titulo="Faturamento por produto"><Pizza data={d.porProduto} /></Card>
        <Card titulo="Visitas x Orçamentos">
          <ResponsiveContainer height={280}>
            <LineChart data={d.mensal}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" /><YAxis yAxisId="a" /><YAxis yAxisId="b" orientation="right" />
              <Tooltip {...tip} /><Legend />
              <Line yAxisId="a" dataKey="visitas" stroke="#1f6f8b" strokeWidth={2} dot={false} />
              <Line yAxisId="b" dataKey="orcamentos" stroke="#f3a712" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </>
  )
}

function Pizza({ data }) {
  return (
    <ResponsiveContainer height={280}>
      <PieChart>
        <Pie data={data} dataKey="valor" nameKey="nome" innerRadius={60} outerRadius={100} paddingAngle={2}>
          {data.map((_, i) => <Cell key={i} fill={CORES[i % CORES.length]} />)}
        </Pie>
        <Tooltip formatter={(v) => brl(v)} />
        <Legend layout="vertical" align="right" verticalAlign="middle" />
      </PieChart>
    </ResponsiveContainer>
  )
}

function Barras({ data, moeda = true, cor = '#1f6f8b' }) {
  return (
    <ResponsiveContainer height={Math.max(220, data.length * 44)}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tickFormatter={moeda ? brlK : num} />
        <YAxis type="category" dataKey="nome" width={150} />
        <Tooltip formatter={(v) => (moeda ? brl(v) : num(v))} />
        <Bar dataKey="valor" fill={cor} radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function Vendas({ d }) {
  return (
    <>
      <div className="kpis">
        <Kpi titulo="Faturamento" valor={brl(d.fat)} variacao={d.varFat} icon={DollarSign} />
        <Kpi titulo="Pedidos" valor={num(d.nPed)} variacao={d.varPed} icon={ShoppingCart} />
        <Kpi titulo="Ticket médio" valor={brl(d.ticket)} variacao={d.varTicket} icon={FileText} />
      </div>
      <div className="grid-2">
        <Card titulo="Faturamento e pedidos por mês" className="span-2"
          acao={<button className="btn" onClick={() => exportCSV('vendas-mensais.csv', d.mensal)}><Download size={16} /> CSV</button>}>
          <ResponsiveContainer height={320}>
            <BarChart data={d.mensal}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" /><YAxis yAxisId="a" {...eixoMoeda} /><YAxis yAxisId="b" orientation="right" />
              <Tooltip {...tip} /><Legend />
              <Bar yAxisId="a" dataKey="faturamento" fill="#e4572e" radius={[6, 6, 0, 0]} />
              <Bar yAxisId="b" dataKey="pedidos" fill="#1f6f8b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Tabela titulo="Resumo mensal" linhas={d.mensal.slice().reverse()} className="span-2" colunas={[
          ['label', 'Mês'], ['pedidos', 'Pedidos', num], ['faturamento', 'Faturamento', brl],
          ['orcamentos', 'Orçamentos (site)', num],
        ]} />
      </div>
    </>
  )
}

function Produtos({ d }) {
  const linhas = d.porProduto.map((p) => ({
    nome: p.nome,
    quantidade: d.porProdutoQtd.find((x) => x.nome === p.nome)?.valor || 0,
    valor: p.valor,
    share: ((p.valor / d.fat) * 100).toFixed(1) + '%',
  }))
  return (
    <div className="grid-2">
      <Card titulo="Faturamento por produto"><Barras data={d.porProduto} cor="#e4572e" /></Card>
      <Card titulo="Unidades vendidas"><Barras data={d.porProdutoQtd} moeda={false} /></Card>
      <Tabela titulo="Ranking de produtos" linhas={linhas} className="span-2" csv="produtos.csv" colunas={[
        ['nome', 'Produto'], ['quantidade', 'Unidades', num], ['valor', 'Faturamento', brl], ['share', 'Participação'],
      ]} />
    </div>
  )
}

function Regioes({ d }) {
  return (
    <div className="grid-2">
      <Card titulo="Faturamento por região"><Barras data={d.porRegiao} cor="#4c956c" /></Card>
      <Card titulo="Faturamento por segmento"><Pizza data={d.porSegmento} /></Card>
      <Tabela titulo="Faturamento por região" linhas={d.porRegiao} csv="regioes.csv" colunas={[
        ['nome', 'Região'], ['valor', 'Faturamento', brl],
      ]} />
      <Tabela titulo="Segmentos de clientes" linhas={d.porSegmento} csv="segmentos.csv" colunas={[
        ['nome', 'Segmento'], ['valor', 'Faturamento', brl],
      ]} />
    </div>
  )
}

function Site({ d }) {
  const conv = d.visitas ? ((d.orc / d.visitas) * 100).toFixed(2) : '0'
  return (
    <>
      <div className="kpis">
        <Kpi titulo="Visitas" valor={num(d.visitas)} variacao={d.varVisitas} icon={Users} />
        <Kpi titulo="Orçamentos" valor={num(d.orc)} variacao={d.varOrc} icon={MousePointerClick} />
        <Kpi titulo="Taxa de conversão" valor={`${conv}%`} icon={Percent} />
        <Kpi titulo="Taxa de rejeição" valor={`${d.rejeicao}%`} icon={Globe} />
      </div>
      <div className="grid-2">
        <Card titulo="Leads por mês (formulário x WhatsApp)" className="span-2">
          <ResponsiveContainer height={300}>
            <BarChart data={d.mensal}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" /><YAxis />
              <Tooltip /><Legend />
              <Bar dataKey="orcamentos" name="Formulário" stackId="l" fill="#f3a712" />
              <Bar dataKey="whatsapp" name="WhatsApp" stackId="l" fill="#4c956c" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card titulo="Origem do tráfego"><Barras data={d.canais} moeda={false} cor="#7b5ea7" /></Card>
        <Tabela titulo="Páginas mais acessadas" linhas={d.paginas} csv="paginas.csv" colunas={[
          ['titulo', 'Página'], ['pagina', 'URL'], ['visitas', 'Visitas', num],
        ]} />
      </div>
    </>
  )
}

const POR_PAGINA = 15

function Pedidos({ d }) {
  const [busca, setBusca] = useState('')
  const [pag, setPag] = useState(0)
  const lista = d.atual
    .filter((p) => !busca || [p.id, p.produto, p.regiao, p.segmento, p.status].join(' ').toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => b.data - a.data)
  const total = Math.max(1, Math.ceil(lista.length / POR_PAGINA))
  const atual = Math.min(pag, total - 1)
  return (
    <Card titulo={`Pedidos (${num(lista.length)})`} acao={
      <div className="filtros">
        <label className="busca">
          <Search size={16} />
          <input placeholder="Buscar..." value={busca} onChange={(e) => { setBusca(e.target.value); setPag(0) }} />
        </label>
        <button className="btn" onClick={() => exportCSV('pedidos.csv', lista)}><Download size={16} /> CSV</button>
      </div>}>
      <div className="tabela-wrap">
        <table>
          <thead>
            <tr><th>Pedido</th><th>Data</th><th>Produto</th><th>Região</th><th>Segmento</th><th className="r">Qtd</th><th className="r">Valor</th><th>Status</th></tr>
          </thead>
          <tbody>
            {lista.slice(atual * POR_PAGINA, (atual + 1) * POR_PAGINA).map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td><td>{p.data.toLocaleDateString('pt-BR')}</td><td>{p.produto}</td><td>{p.regiao}</td>
                <td>{p.segmento}</td><td className="r">{num(p.quantidade)}</td><td className="r">{brl(p.valor)}</td>
                <td><span className={`tag ${p.status === 'Faturado' ? 'ok' : 'warn'}`}>{p.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="paginacao">
        <button className="btn" disabled={atual === 0} onClick={() => setPag(atual - 1)}>Anterior</button>
        <span>Página {atual + 1} de {total}</span>
        <button className="btn" disabled={atual >= total - 1} onClick={() => setPag(atual + 1)}>Próxima</button>
      </div>
    </Card>
  )
}

function Tabela({ titulo, linhas, colunas, className, csv }) {
  return (
    <Card titulo={titulo} className={className}
      acao={csv && <button className="btn" onClick={() => exportCSV(csv, linhas)}><Download size={16} /> CSV</button>}>
      <div className="tabela-wrap">
        <table>
          <thead><tr>{colunas.map(([k, n, f]) => <th key={k} className={f ? 'r' : ''}>{n}</th>)}</tr></thead>
          <tbody>
            {linhas.map((l, i) => (
              <tr key={i}>{colunas.map(([k, , f]) => <td key={k} className={f ? 'r' : ''}>{f ? f(l[k]) : l[k]}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
