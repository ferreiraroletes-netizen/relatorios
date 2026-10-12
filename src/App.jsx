import { useMemo, useRef, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  LayoutDashboard, Search, Target, FileText, Smartphone, Globe,
  MousePointerClick, Eye, Percent, ArrowUpDown, Download, Moon, Sun, Upload,
  MapPinned, Phone, Navigation, Store,
} from 'lucide-react'
import {
  periodoPerfil, mesParcial, visualizacoes, plataformas, pesquisasTotal, termos, interacoesMensais,
} from './data/perfilEmpresa'
import { carregaPadrao, carregaArquivos, ehMarca } from './data/gsc'
import { num, exportCSV, CORES } from './utils'
import { Kpi, Card } from './components/ui'

const ABAS = [
  { id: 'geral', nome: 'Visão geral', icon: LayoutDashboard },
  { id: 'perfil', nome: 'Perfil no Google', icon: Store },
  { id: 'consultas', nome: 'Consultas', icon: Search },
  { id: 'oportunidades', nome: 'Oportunidades SEO', icon: Target },
  { id: 'paginas', nome: 'Páginas', icon: FileText },
  { id: 'dispositivos', nome: 'Dispositivos', icon: Smartphone },
  { id: 'paises', nome: 'Países', icon: Globe },
]

const PERIODOS = [
  { id: 7, nome: 'Últimos 7 dias' },
  { id: 28, nome: 'Últimos 28 dias' },
  { id: 0, nome: 'Período completo' },
]

const ctrFmt = (v) => `${(v * 100).toFixed(2).replace('.', ',')}%`
const posFmt = (v) => v.toFixed(1).replace('.', ',')
const dataFmt = (s) => s.split('-').reverse().slice(0, 2).join('/')

function resume(rows) {
  const cliques = rows.reduce((s, r) => s + r.cliques, 0)
  const impressoes = rows.reduce((s, r) => s + r.impressoes, 0)
  const posPond = rows.reduce((s, r) => s + r.posicao * r.impressoes, 0)
  return {
    cliques, impressoes,
    ctr: impressoes ? cliques / impressoes : 0,
    posicao: impressoes ? posPond / impressoes : 0,
  }
}

const varia = (a, b) => (b ? ((a - b) / b) * 100 : undefined)

export default function App() {
  const [dados, setDados] = useState(carregaPadrao)
  const [aba, setAba] = useState('geral')
  const [periodo, setPeriodo] = useState(0)
  const [escuro, setEscuro] = useState(false)
  const [aviso, setAviso] = useState('')
  const inputRef = useRef()

  const g = dados.grafico
  const inicio = g[0]?.nome
  const fim = g[g.length - 1]?.nome

  const geral = useMemo(() => {
    const n = periodo || g.length
    const atual = g.slice(-n)
    const anterior = periodo ? g.slice(-2 * n, -n) : g.slice(0, Math.floor(g.length / 2))
    const base = periodo ? atual : g.slice(Math.floor(g.length / 2))
    const ra = resume(atual)
    const rb = resume(base)
    const rp = resume(anterior)
    // semanal quando o período é longo
    const serie = []
    const passo = atual.length > 35 ? 7 : 1
    for (let i = 0; i < atual.length; i += passo) {
      const bloco = atual.slice(i, i + passo)
      const r = resume(bloco)
      serie.push({ label: dataFmt(bloco[0].nome), ...r, ctrPct: +(r.ctr * 100).toFixed(2) })
    }
    return {
      ...ra,
      var: {
        cliques: varia(rb.cliques, rp.cliques),
        impressoes: varia(rb.impressoes, rp.impressoes),
        ctr: varia(rb.ctr, rp.ctr),
        posicao: rp.posicao ? -varia(rb.posicao, rp.posicao) : undefined, // posição menor = melhor
      },
      comparacao: periodo ? `vs. ${periodo} dias anteriores` : '2ª metade vs. 1ª metade',
      serie, semanal: passo === 7,
    }
  }, [g, periodo])

  async function importar(e) {
    const files = [...e.target.files]
    const { dados: novos, lidos } = await carregaArquivos(files, dados)
    setDados(novos)
    setAviso(lidos.length ? `${lidos.length} arquivo(s) carregado(s): ${lidos.join(', ')}` : 'Nenhum CSV do Search Console reconhecido.')
    e.target.value = ''
  }

  return (
    <div className={`app ${escuro ? 'dark' : ''}`}>
      <aside className="sidebar">
        <div className="brand">
          <img className="logo" src="./logo.png" alt="Rollerport" />
          <div><b>Rollerport</b><small>Relatórios do site</small></div>
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
          <div>
            <h1>{ABAS.find((a) => a.id === aba).nome}</h1>
            <p className="sub">{aba === 'perfil' ? `Perfil da Empresa no Google · ${periodoPerfil}` : <>Google Search Console · pesquisa na Web · {inicio && `${dataFmt(inicio)}/${inicio.slice(0, 4)} a ${dataFmt(fim)}/${fim.slice(0, 4)}`}</>}</p>
          </div>
          <div className="filtros">
            {aba === 'geral' && (
              <select value={periodo} onChange={(e) => setPeriodo(+e.target.value)}>
                {PERIODOS.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            )}
            <input ref={inputRef} type="file" accept=".csv" multiple hidden onChange={importar} />
            <button className="btn" onClick={() => inputRef.current.click()} title="Selecione os CSVs exportados do Search Console">
              <Upload size={16} /> Importar CSVs
            </button>
            <button className="icon-btn" onClick={() => setEscuro(!escuro)} title="Alternar tema">
              {escuro ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>
        {aviso && <div className="aviso" onClick={() => setAviso('')}>{aviso}</div>}

        {aba === 'geral' && <Geral r={geral} dados={dados} />}
        {aba === 'perfil' && <PerfilGoogle />}
        {aba === 'consultas' && <Consultas rows={dados.consultas} />}
        {aba === 'oportunidades' && <Oportunidades rows={dados.consultas} />}
        {aba === 'paginas' && <Dimensao rows={dados.paginas} rotulo="Página" csv="paginas.csv" fmtNome={(u) => u.replace(/^https?:\/\/[^/]+/, '') || '/'} />}
        {aba === 'dispositivos' && <Dimensao rows={dados.dispositivos} rotulo="Dispositivo" csv="dispositivos.csv" pizza />}
        {aba === 'paises' && <Dimensao rows={dados.paises} rotulo="País" csv="paises.csv" />}
      </main>
    </div>
  )
}

function Kpis({ r, v = {}, comp }) {
  return (
    <div className="kpis">
      <Kpi titulo="Cliques" valor={num(r.cliques)} variacao={v.cliques} comp={comp} icon={MousePointerClick} />
      <Kpi titulo="Impressões" valor={num(r.impressoes)} variacao={v.impressoes} comp={comp} icon={Eye} />
      <Kpi titulo="CTR médio" valor={ctrFmt(r.ctr)} variacao={v.ctr} comp={comp} icon={Percent} />
      <Kpi titulo="Posição média" valor={posFmt(r.posicao)} variacao={v.posicao} comp={comp} icon={ArrowUpDown} />
    </div>
  )
}

function Geral({ r, dados }) {
  const marca = resume(dados.consultas.filter((c) => ehMarca(c.nome)))
  const generica = resume(dados.consultas.filter((c) => !ehMarca(c.nome)))
  const top = [...dados.consultas].sort((a, b) => b.cliques - a.cliques || b.impressoes - a.impressoes).slice(0, 8)
  return (
    <>
      <h2 className="secao">Busca orgânica no site (Search Console)</h2>
      <Kpis r={r} v={r.var} comp={r.comparacao} />
      <h2 className="secao">Perfil da Empresa no Google · {periodoPerfil}</h2>
      <ResumoPerfil />
      <div className="grid-2">
        <Card titulo={`Cliques e impressões ${r.semanal ? 'por semana' : 'por dia'}`} className="span-2">
          <ResponsiveContainer height={300}>
            <AreaChart data={r.serie}>
              <defs>
                <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#7b5ea7" stopOpacity={0.3} /><stop offset="1" stopColor="#7b5ea7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#1f6f8b" stopOpacity={0.4} /><stop offset="1" stopColor="#1f6f8b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" /><YAxis yAxisId="c" /><YAxis yAxisId="i" orientation="right" />
              <Tooltip /><Legend />
              <Area yAxisId="i" dataKey="impressoes" name="Impressões" stroke="#7b5ea7" fill="url(#gi)" strokeWidth={2} />
              <Area yAxisId="c" dataKey="cliques" name="Cliques" stroke="#1f6f8b" fill="url(#gc)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card titulo="CTR (%) e posição média">
          <ResponsiveContainer height={260}>
            <LineChart data={r.serie}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" /><YAxis yAxisId="c" /><YAxis yAxisId="p" orientation="right" reversed />
              <Tooltip formatter={(v, n) => (n === 'Posição' ? posFmt(v) : `${v}%`)} /><Legend />
              <Line yAxisId="c" dataKey="ctrPct" name="CTR" stroke="#4c956c" strokeWidth={2} dot={false} />
              <Line yAxisId="p" dataKey="posicao" name="Posição" stroke="#e4572e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card titulo="Marca x busca genérica (cliques)">
          <ResponsiveContainer height={200}>
            <BarChart data={[
              { nome: 'Marca', cliques: marca.cliques, impressoes: marca.impressoes },
              { nome: 'Genérica', cliques: generica.cliques, impressoes: generica.impressoes },
            ]} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" /><YAxis type="category" dataKey="nome" width={80} />
              <Tooltip /><Legend />
              <Bar dataKey="cliques" name="Cliques" fill="#1f6f8b" radius={[0, 6, 6, 0]} />
              <Bar dataKey="impressoes" name="Impressões" fill="#7b5ea7" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="nota">
            Buscas pela marca: CTR {ctrFmt(marca.ctr)}, posição {posFmt(marca.posicao)}. Buscas genéricas: CTR {ctrFmt(generica.ctr)}, posição {posFmt(generica.posicao)}.
          </p>
        </Card>
        <Tabela titulo="Principais consultas" linhas={top} className="span-2" colunas={COLS('Consulta')} />
      </div>
    </>
  )
}

const COLS = (rotulo, fmtNome) => [
  ['nome', rotulo, fmtNome],
  ['cliques', 'Cliques', num, true],
  ['impressoes', 'Impressões', num, true],
  ['ctr', 'CTR', ctrFmt, true],
  ['posicao', 'Posição', posFmt, true],
]

function Consultas({ rows }) {
  const [busca, setBusca] = useState('')
  const [tipo, setTipo] = useState('todas')
  const lista = rows.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) &&
    (tipo === 'todas' || (tipo === 'marca') === ehMarca(c.nome)))
  return (
    <>
      <Kpis r={resume(lista)} />
      <Tabela titulo={`Consultas (${lista.length})`} linhas={lista} csv="consultas.csv" ordenavel colunas={COLS('Consulta')}
        extra={<>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="todas">Todas</option><option value="marca">Marca</option><option value="generica">Genéricas</option>
          </select>
          <label className="busca"><Search size={16} /><input placeholder="Filtrar consulta..." value={busca} onChange={(e) => setBusca(e.target.value)} /></label>
        </>} />
    </>
  )
}

function Oportunidades({ rows }) {
  const genericas = rows.filter((c) => !ehMarca(c.nome))
  // Já aparece na 1ª página, mas recebe poucos cliques
  const ctrBaixo = genericas.filter((c) => c.posicao <= 10 && c.impressoes >= 5 && c.ctr < 0.05)
    .sort((a, b) => b.impressoes - a.impressoes)
  // Quase na 1ª página
  const quase = genericas.filter((c) => c.posicao > 10 && c.posicao <= 20)
    .sort((a, b) => b.impressoes - a.impressoes)
  const impSemClique = ctrBaixo.reduce((s, c) => s + c.impressoes, 0)
  return (
    <div className="grid-2">
      <Card titulo="Como ler" className="span-2">
        <p className="nota">
          <b>Na 1ª página com CTR baixo</b>: o site aparece no Google (posição ≤ 10) mas quase ninguém clica — melhore o título e a descrição da página
          ou crie uma página específica para o termo. São <b>{num(impSemClique)}</b> impressões sem aproveitamento.
          <br /><b>Quase na 1ª página</b>: posição entre 11 e 20 — conteúdo e links internos podem levar à 1ª página.
          <br />Hoje apenas 2 páginas recebem impressões (home e /empresa): criar páginas para cada linha de produto (roletes de carga, retorno, impacto, nylon, aço) é a maior oportunidade.
        </p>
      </Card>
      <Card titulo="Termos genéricos com mais impressões" className="span-2">
        <ResponsiveContainer height={300}>
          <BarChart data={genericas.slice().sort((a, b) => b.impressoes - a.impressoes).slice(0, 12)}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="nome" interval={0} angle={-30} textAnchor="end" height={90} /><YAxis />
            <Tooltip /><Legend />
            <Bar dataKey="impressoes" name="Impressões" fill="#7b5ea7" radius={[6, 6, 0, 0]} />
            <Bar dataKey="cliques" name="Cliques" fill="#1f6f8b" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Tabela titulo={`Na 1ª página com CTR baixo (${ctrBaixo.length})`} linhas={ctrBaixo} csv="oportunidades-ctr.csv" colunas={COLS('Consulta')} />
      <Tabela titulo={`Quase na 1ª página (${quase.length})`} linhas={quase} csv="oportunidades-posicao.csv" colunas={COLS('Consulta')} />
    </div>
  )
}

function Dimensao({ rows, rotulo, csv, pizza, fmtNome }) {
  const dados = rows.map((r) => ({ ...r, rot: fmtNome ? fmtNome(r.nome) : r.nome }))
  const top = dados.slice().sort((a, b) => b.impressoes - a.impressoes).slice(0, 10)
  return (
    <>
      <Kpis r={resume(rows)} />
      <div className="grid-2">
        <Card titulo={`Impressões por ${rotulo.toLowerCase()}`}>
          {pizza ? (
            <ResponsiveContainer height={280}>
              <PieChart>
                <Pie data={top} dataKey="impressoes" nameKey="rot" innerRadius={60} outerRadius={100} paddingAngle={2}>
                  {top.map((_, i) => <Cell key={i} fill={CORES[i % CORES.length]} />)}
                </Pie>
                <Tooltip formatter={num} /><Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <Barras data={top} campo="impressoes" cor="#7b5ea7" />}
        </Card>
        <Card titulo={`Cliques e CTR por ${rotulo.toLowerCase()}`}>
          <ResponsiveContainer height={280}>
            <BarChart data={top.filter((t) => t.impressoes > 0).map((t) => ({ ...t, ctrPct: +(t.ctr * 100).toFixed(2) }))}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="rot" interval={0} angle={top.length > 4 ? -30 : 0} textAnchor={top.length > 4 ? 'end' : 'middle'} height={top.length > 4 ? 80 : 30} />
              <YAxis yAxisId="c" /><YAxis yAxisId="t" orientation="right" unit="%" />
              <Tooltip /><Legend />
              <Bar yAxisId="c" dataKey="cliques" name="Cliques" fill="#1f6f8b" radius={[6, 6, 0, 0]} />
              <Bar yAxisId="t" dataKey="ctrPct" name="CTR %" fill="#4c956c" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Tabela titulo={`${rotulo}s`} linhas={rows} csv={csv} className="span-2" ordenavel colunas={COLS(rotulo, fmtNome)} />
      </div>
    </>
  )
}

function Barras({ data, campo, cor }) {
  return (
    <ResponsiveContainer height={Math.max(220, data.length * 34)}>
      <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" /><YAxis type="category" dataKey="rot" width={140} />
        <Tooltip formatter={num} />
        <Bar dataKey={campo} name="Impressões" fill={cor} radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function Tabela({ titulo, linhas, colunas, className, csv, ordenavel, extra }) {
  const [ord, setOrd] = useState({ k: 'cliques', desc: true })
  const lista = ordenavel
    ? linhas.slice().sort((a, b) => {
        const x = a[ord.k], y = b[ord.k]
        const c = typeof x === 'string' ? x.localeCompare(y) : x - y
        return ord.desc ? -c : c
      })
    : linhas
  const clica = (k) => ordenavel && setOrd({ k, desc: ord.k === k ? !ord.desc : k !== 'posicao' && k !== 'nome' })
  return (
    <Card titulo={titulo} className={className}
      acao={<div className="filtros">{extra}{csv && <button className="btn" onClick={() => exportCSV(csv, lista)}><Download size={16} /> CSV</button>}</div>}>
      <div className="tabela-wrap">
        <table>
          <thead>
            <tr>{colunas.map(([k, n, , dir]) => (
              <th key={k} className={`${dir ? 'r' : ''} ${ordenavel ? 'clicavel' : ''}`} onClick={() => clica(k)}>
                {n}{ordenavel && ord.k === k ? (ord.desc ? ' ↓' : ' ↑') : ''}
              </th>
            ))}</tr>
          </thead>
          <tbody>
            {lista.map((l, i) => (
              <tr key={i}>{colunas.map(([k, , f, dir]) => <td key={k} className={dir ? 'r' : 'quebra'}>{f ? f(l[k]) : l[k]}</td>)}</tr>
            ))}
            {!lista.length && <tr><td colSpan={colunas.length} className="vazio">Nenhum resultado.</td></tr>}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

const totalPerfil = (k) => interacoesMensais.reduce((s, m) => s + m[k], 0)
const pctDe = (a, b) => `${((a / b) * 100).toFixed(0)}%`

function ResumoPerfil() {
  return (
    <div className="kpis">
      <Kpi titulo="Visualizações do perfil" valor={num(visualizacoes)} icon={Eye} />
      <Kpi titulo="Solicitações de rota" valor={num(totalPerfil('rotas'))} icon={Navigation} />
      <Kpi titulo="Cliques para o site" valor={num(totalPerfil('site'))} icon={MousePointerClick} />
      <Kpi titulo="Ligações" valor={num(totalPerfil('ligacoes'))} icon={Phone} />
    </div>
  )
}

function PerfilGoogle() {
  const total = totalPerfil('total')
  const rotas = totalPerfil('rotas')
  const fechados = interacoesMensais.filter((m) => m.mes !== mesParcial)
  const media = fechados.reduce((s, m) => s + m.total, 0) / fechados.length
  const soma = (f) => plataformas.filter((p) => p.nome.includes(f)).reduce((s, p) => s + p.valor, 0)
  const conhecidos = termos.filter((t) => t.valor !== null)
  const genericos = conhecidos.filter((t) => !ehMarca(t.nome)).reduce((s, t) => s + t.valor, 0)
  const marca = conhecidos.filter((t) => ehMarca(t.nome)).reduce((s, t) => s + t.valor, 0)
  const picoSite = interacoesMensais.reduce((a, m) => (m.site > a.site ? m : a))
  const ultimoFechado = fechados[fechados.length - 1]
  const listaTermos = termos.map((t) => ({
    nome: t.nome, tipo: ehMarca(t.nome) ? 'Marca' : 'Genérica', pesquisas: t.valor ?? '< 15',
  }))

  return (
    <>
      <div className="kpis">
        <Kpi titulo="Visualizações do perfil" valor={num(visualizacoes)} icon={Eye} />
        <Kpi titulo="Pesquisas que exibiram o perfil" valor={num(pesquisasTotal)} icon={Search} />
        <Kpi titulo="Interações totais" valor={num(total)} icon={MousePointerClick} />
        <Kpi titulo="Taxa de interação" valor={ctrFmt(total / visualizacoes)} icon={Percent} />
      </div>
      <div className="kpis">
        <Kpi titulo="Solicitações de rota" valor={num(rotas)} icon={Navigation} />
        <Kpi titulo="Cliques para o site" valor={num(totalPerfil('site'))} icon={MousePointerClick} />
        <Kpi titulo="Ligações" valor={num(totalPerfil('ligacoes'))} icon={Phone} />
        <Kpi titulo="Média mensal de interações" valor={num(Math.round(media))} icon={MapPinned} />
      </div>
      <div className="grid-2">
        <Card titulo="Interações por mês" className="span-2"
          acao={<button className="btn" onClick={() => exportCSV('perfil-interacoes.csv', interacoesMensais)}><Download size={16} /> CSV</button>}>
          <ResponsiveContainer height={300}>
            <BarChart data={interacoesMensais}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="mes" /><YAxis />
              <Tooltip /><Legend />
              <Bar dataKey="rotas" name="Rotas" stackId="i" fill="#4c956c" />
              <Bar dataKey="site" name="Cliques no site" stackId="i" fill="#1f6f8b" />
              <Bar dataKey="ligacoes" name="Ligações" stackId="i" fill="#e4572e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="nota">{mesParcial} é parcial (mês em andamento) e não entra na média mensal.</p>
        </Card>
        <Card titulo="Onde as pessoas viram o perfil">
          <ResponsiveContainer height={280}>
            <PieChart>
              <Pie data={plataformas} dataKey="valor" nameKey="nome" innerRadius={60} outerRadius={100} paddingAngle={2}>
                {plataformas.map((_, i) => <Cell key={i} fill={CORES[i % CORES.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => `${num(v)} (${pctDe(v, visualizacoes)})`} /><Legend />
            </PieChart>
          </ResponsiveContainer>
          <p className="nota">
            {pctDe(soma('celular'), visualizacoes)} das visualizações vieram do celular e {pctDe(soma('Maps'), visualizacoes)} do Google Maps.
          </p>
        </Card>
        <Card titulo="Termos que mais exibiram o perfil">
          <ResponsiveContainer height={280}>
            <BarChart data={conhecidos} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" /><YAxis type="category" dataKey="nome" width={130} />
              <Tooltip formatter={num} />
              <Bar dataKey="valor" name="Pesquisas" fill="#7b5ea7" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="nota">
            Entre os termos com número informado, <b>{num(genericos)}</b> pesquisas foram genéricas ("rolete", "roletes") e <b>{num(marca)}</b> pela marca.
          </p>
        </Card>
        <Card titulo="Leitura dos dados" className="span-2">
          <ul className="nota lista">
            <li><b>Rotas são a principal ação</b>: {num(rotas)} de {num(total)} interações ({pctDe(rotas, total)}). Clientes buscam a fábrica para ir até ela: mantenha endereço, horário e fotos atualizados.</li>
            <li><b>O perfil aparece em buscas genéricas</b>, ao contrário do site: "rolete" e "roletes" somam {num(genericos)} exibições no perfil, enquanto o site quase não recebe cliques nesses termos (veja Oportunidades SEO).</li>
            <li><b>Os cliques para o site caíram</b> de {picoSite.site} em {picoSite.mes} para {ultimoFechado.site} em {ultimoFechado.mes}. Publique posts e fotos de produtos no perfil com link para o site.</li>
            <li><b>Poucas ligações</b> ({num(totalPerfil('ligacoes'))} em 6 meses). Confira se o telefone do perfil está correto e se há WhatsApp.</li>
            <li>Há buscas regionais ("fábricas no polo industrial Franco da Rocha", "fábrica correias Caieiras"): cite a região nas descrições do perfil e do site.</li>
          </ul>
        </Card>
        <Tabela titulo={`Termos de pesquisa (${termos.length})`} linhas={listaTermos} className="span-2" csv="perfil-termos.csv" colunas={[
          ['nome', 'Termo'], ['tipo', 'Tipo'], ['pesquisas', 'Pesquisas', null, true],
        ]} />
      </div>
    </>
  )
}
