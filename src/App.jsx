import { useMemo, useRef, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  Search, Target, FileText, Smartphone, Globe,
  MousePointerClick, Eye, Percent, ArrowUpDown, Download, Moon, Sun, Upload,
  MapPinned, Phone, Navigation, BookOpen, Heart, UserPlus, Link, Users,
  ChevronDown, ChevronRight, TrendingUp as TrendingUpIcon, PlayCircle as PlayIcon,
} from 'lucide-react'
import {
  periodoPerfil, mesParcial, visualizacoes, plataformas, pesquisasTotal, termos, interacoesMensais,
} from './data/perfilEmpresa'
import { carregaPadrao, carregaArquivos, ehMarca } from './data/gsc'
import { num, exportCSV, CORES } from './utils'
import { Kpi, Card } from './components/ui'
import { IconInstagram, IconFacebook, IconLinkedin, IconTiktok, IconYoutube } from './components/icones'
import { GLOSSARIO } from './data/glossario'

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

// Cada rede/canal tem suas subabas de análise
const REDES = [
  {
    id: 'site', nome: 'Site', icon: Globe,
    subs: [
      { id: 'busca', nome: 'Busca no Google' },
      { id: 'consultas', nome: 'Consultas' },
      { id: 'oportunidades', nome: 'Oportunidades SEO' },
      { id: 'paginas', nome: 'Páginas' },
      { id: 'dispositivos', nome: 'Dispositivos' },
      { id: 'paises', nome: 'Países' },
      { id: 'perfil', nome: 'Perfil no Google' },
    ],
  },
  {
    id: 'instagram', nome: 'Instagram', icon: IconInstagram,
    subs: [
      { id: 'resumo', nome: 'Resumo' },
      { id: 'alcance', nome: 'Alcance' },
      { id: 'engajamento', nome: 'Engajamento' },
    ],
  },
  {
    id: 'facebook', nome: 'Facebook', icon: IconFacebook,
    subs: [{ id: 'resumo', nome: 'Resumo' }, { id: 'alcance', nome: 'Alcance' }, { id: 'engajamento', nome: 'Engajamento' }],
  },
  {
    id: 'linkedin', nome: 'LinkedIn', icon: IconLinkedin,
    subs: [{ id: 'resumo', nome: 'Resumo' }, { id: 'visitantes', nome: 'Visitantes' }, { id: 'seguidores', nome: 'Seguidores' }, { id: 'publicacoes', nome: 'Publicações' }],
  },
  {
    id: 'tiktok', nome: 'TikTok', icon: IconTiktok,
    subs: [{ id: 'resumo', nome: 'Resumo' }, { id: 'visualizacoes', nome: 'Visualizações' }, { id: 'seguidores', nome: 'Seguidores' }, { id: 'videos', nome: 'Vídeos' }],
  },
  {
    id: 'youtube', nome: 'YouTube', icon: IconYoutube,
    subs: [{ id: 'resumo', nome: 'Resumo' }, { id: 'visualizacoes', nome: 'Visualizações' }, { id: 'inscritos', nome: 'Inscritos' }, { id: 'videos', nome: 'Vídeos' }],
  },
  { id: 'ajuda', nome: 'Como ler este relatório', icon: BookOpen, subs: [] },
]

// Como exportar os dados de cada rede ainda sem informações
const COMO_EXPORTAR = {
  facebook: 'Meta Business Suite → Insights → Exportar dados (CSV), selecionando a Página do Facebook.',
  linkedin: 'Página da empresa no LinkedIn → Análises (Visitantes, Seguidores, Conteúdo) → Exportar (XLS).',
  tiktok: 'TikTok Studio (conta comercial) → Análises → Baixar dados.',
  youtube: 'YouTube Studio → Análises → Modo avançado → Exportar visualização atual (CSV).',
}

const METRICAS_REDE = {
  facebook: { resumo: 'seguidores, alcance, visualizações e interações', alcance: 'alcance e visualizações por dia', engajamento: 'reações, comentários, compartilhamentos e cliques' },
  linkedin: { resumo: 'seguidores, impressões e engajamento', visitantes: 'visitas à página por dia, cargo e setor dos visitantes', seguidores: 'novos seguidores por dia e perfil dos seguidores', publicacoes: 'impressões, cliques e reações de cada publicação' },
  tiktok: { resumo: 'visualizações, seguidores, curtidas e compartilhamentos', visualizacoes: 'visualizações de vídeo e do perfil por dia', seguidores: 'novos seguidores por dia', videos: 'desempenho de cada vídeo' },
  youtube: { resumo: 'visualizações, horas assistidas e inscritos', visualizacoes: 'visualizações e tempo de exibição por dia', inscritos: 'inscritos ganhos e perdidos', videos: 'desempenho de cada vídeo' },
}

function RedeSemDados({ rede, sub }) {
  const r = REDES.find((x) => x.id === rede)
  const Icon = r.icon
  return (
    <div className="grid-2">
      <Card titulo={`${r.nome} · ${r.subs.find((s) => s.id === sub)?.nome}`} className="span-2">
        <div className="vazio-rede">
          <Icon size={40} />
          <h3>Ainda não há dados do {r.nome}</h3>
          <p className="nota">Esta seção vai mostrar: <b>{METRICAS_REDE[rede]?.[sub]}</b>.</p>
          <p className="nota"><b>Como exportar:</b> {COMO_EXPORTAR[rede]}</p>
          <p className="nota">Envie os arquivos exportados para incluir no relatório.</p>
        </div>
      </Card>
    </div>
  )
}

export default function App() {
  const [dados, setDados] = useState(carregaPadrao)
  const [rede, setRede] = useState('site')
  const [sub, setSub] = useState('busca')
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
    setAviso(lidos.length ? `${lidos.length} arquivo(s) carregado(s): ${lidos.join(', ')}` : 'Nenhum CSV reconhecido (Search Console, Instagram, Facebook ou YouTube).')
    e.target.value = ''
  }

  function abreRede(id) {
    setRede(id)
    setSub(REDES.find((r) => r.id === id).subs[0]?.id || '')
  }

  const redeAtual = REDES.find((r) => r.id === rede)
  const subAtual = redeAtual.subs.find((s) => s.id === sub)

  const subtitulo =
    rede === 'ajuda' ? 'Glossário em linguagem simples'
      : rede === 'instagram' ? `Instagram · ${periodoIg(dados.instagram)}`
      : rede === 'facebook' ? `Página do Facebook · ${periodoIg(dados.facebook)}`
      : rede === 'youtube' ? `Canal do YouTube · ${periodoYt(dados.youtube)}`
        : rede === 'site' && sub === 'perfil' ? `Perfil da Empresa no Google · ${periodoPerfil}`
          : rede === 'site' ? `Google Search Console · pesquisa na Web · ${inicio ? `${dataFmt(inicio)}/${inicio.slice(0, 4)} a ${dataFmt(fim)}/${fim.slice(0, 4)}` : ''}`
            : 'Sem dados importados'

  return (
    <div className={`app ${escuro ? 'dark' : ''}`}>
      <aside className="sidebar">
        <div className="brand">
          <img className="logo" src="./logo.png" alt="Rollerport" />
          <div><b>Rollerport</b><small>Relatórios digitais</small></div>
        </div>
        <nav>
          {REDES.map(({ id, nome, icon: Icon, subs }) => (
            <div key={id} className={`grupo ${rede === id ? 'aberto' : ''}`}>
              <button className={rede === id ? 'ativo' : ''} onClick={() => abreRede(id)}>
                <Icon size={18} /> <span>{nome}</span>
                {subs.length > 0 && (rede === id ? <ChevronDown size={16} className="seta" /> : <ChevronRight size={16} className="seta" />)}
              </button>
              {rede === id && subs.length > 0 && (
                <div className="subs">
                  {subs.map((s) => (
                    <button key={s.id} className={sub === s.id ? 'sub-ativo' : ''} onClick={() => setSub(s.id)}>{s.nome}</button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <a className="site-link" href="https://rollerport.com.br" target="_blank" rel="noreferrer">rollerport.com.br ↗</a>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <h1>{redeAtual.nome}{subAtual ? ` · ${subAtual.nome}` : ''}</h1>
            <p className="sub">{subtitulo}</p>
          </div>
          <div className="filtros">
            {rede === 'site' && sub === 'busca' && (
              <select value={periodo} onChange={(e) => setPeriodo(+e.target.value)}>
                {PERIODOS.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            )}
            <input ref={inputRef} type="file" accept=".csv" multiple hidden onChange={importar} />
            <button className="btn" onClick={() => inputRef.current.click()} title="CSVs exportados do Search Console, Meta Business Suite (Instagram/Facebook) ou YouTube Studio">
              <Upload size={16} /> Importar CSVs
            </button>
            <button className="icon-btn" onClick={() => setEscuro(!escuro)} title="Alternar tema">
              {escuro ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>
        {aviso && <div className="aviso" onClick={() => setAviso('')}>{aviso}</div>}

        {rede === 'site' && sub === 'busca' && <Geral r={geral} dados={dados} />}
        {rede === 'site' && sub === 'consultas' && <Consultas rows={dados.consultas} />}
        {rede === 'site' && sub === 'oportunidades' && <Oportunidades rows={dados.consultas} />}
        {rede === 'site' && sub === 'paginas' && <Dimensao rows={dados.paginas} rotulo="Página" csv="paginas.csv" fmtNome={(u) => u.replace(/^https?:\/\/[^/]+/, '') || '/'} />}
        {rede === 'site' && sub === 'dispositivos' && <Dimensao rows={dados.dispositivos} rotulo="Dispositivo" csv="dispositivos.csv" pizza />}
        {rede === 'site' && sub === 'paises' && <Dimensao rows={dados.paises} rotulo="País" csv="paises.csv" />}
        {rede === 'site' && sub === 'perfil' && <PerfilGoogle />}
        {rede === 'instagram' && <MetaRel ig={dados.instagram} sub={sub} nome="Instagram" />}
        {rede === 'facebook' && <MetaRel ig={dados.facebook} sub={sub} nome="Facebook" />}
        {rede === 'youtube' && <YoutubeRel yt={dados.youtube} sub={sub} />}
        {['linkedin', 'tiktok'].includes(rede) && <RedeSemDados rede={rede} sub={sub} />}
        {rede === 'ajuda' && <Glossario />}
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
      <Kpis r={r} v={r.var} comp={r.comparacao} />
      <div className="grid-2">
        <Card titulo={`Cliques e impressões ${r.semanal ? 'por semana' : 'por dia'}`} className="span-2"
          ajuda="Roxo: quantas vezes o site apareceu no Google. Azul: quantas vezes alguém clicou e entrou no site.">
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
        <Card titulo="CTR (%) e posição média"
          ajuda="Verde: % de quem viu e clicou (maior é melhor). Vermelho: posição no Google (o eixo está invertido, então subir no gráfico é bom).">
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
        <Card titulo="Marca x busca genérica (cliques)"
          ajuda="Marca: quem já procurou pelo nome da empresa. Genérica: quem procurou pelo produto (clientes novos).">
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
      <Card titulo="Termos genéricos com mais impressões" className="span-2"
        ajuda="Palavras de produto em que o site aparece no Google. Barra roxa alta e azul baixa = muita gente viu, pouca clicou.">
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

function Barras({ data, campo, cor, nome = "Impressões" }) {
  return (
    <ResponsiveContainer height={Math.max(220, data.length * 34)}>
      <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" /><YAxis type="category" dataKey="rot" width={140} />
        <Tooltip formatter={num} />
        <Bar dataKey={campo} name={nome} fill={cor} radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function Tabela({ titulo, linhas, colunas, className, csv, ordenavel, extra, ordemInicial = 'cliques' }) {
  const [ord, setOrd] = useState({ k: ordemInicial, desc: true })
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
              <th key={k} className={`${dir ? 'r' : ''} ${ordenavel ? 'clicavel' : ''}`} onClick={() => clica(k)} title={DICA_COLUNA[k]}>
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
          ajuda="Ações feitas na ficha da empresa no Google a cada mês: pedir rota até a fábrica, clicar para o site ou ligar."
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
        <Card titulo="Onde as pessoas viram o perfil"
          ajuda="Em qual lugar e aparelho as pessoas encontraram a ficha da empresa.">
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
        <Card titulo="Termos que mais exibiram o perfil"
          ajuda="O que as pessoas digitaram no Google quando a ficha da empresa apareceu.">
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

const DICA_COLUNA = {
  cliques: 'Quantas vezes clicaram no site',
  impressoes: 'Quantas vezes o site apareceu no Google',
  ctr: 'De cada 100 que viram, quantos clicaram',
  posicao: 'Lugar médio no Google (1 = primeiro)',
}

function Glossario() {
  return (
    <div className="grid-2">
      <Card titulo="Resumo em 30 segundos" className="span-2">
        <ul className="nota lista">
          <li><b>Site no Google:</b> o site aparece bem quando procuram pelo nome da empresa, mas quase não recebe cliques de quem procura apenas pelo produto ("rolete", "roletes"). Esse é o público que ainda não conhece a Rollerport.</li>
          <li><b>Ficha no Google/Maps:</b> funciona bem. Muita gente vê e pede rota até a fábrica. As ligações e os cliques para o site estão baixos.</li>
          <li><b>Próximo passo:</b> criar páginas no site para cada tipo de rolete e manter a ficha do Google atualizada, com fotos, telefone, WhatsApp e publicações.</li>
        </ul>
      </Card>
      {GLOSSARIO.map((g) => (
        <Card key={g.grupo} titulo={g.grupo}>
          <dl className="glossario">
            {g.itens.map(([termo, def]) => (
              <div key={termo}><dt>{termo}</dt><dd>{def}</dd></div>
            ))}
          </dl>
        </Card>
      ))}
    </div>
  )
}

const somaIg = (lista) => lista.reduce((s, r) => s + r.valor, 0)
const dataBR = (s) => s.split('-').reverse().join('/')
const periodoIg = (ig) => {
  const v = ig.visualizacoes
  return v.length ? `${dataBR(v[0].data)} a ${dataBR(v[v.length - 1].data)}` : ''
}

function totaisIg(ig) {
  return {
    visualizacoes: somaIg(ig.visualizacoes),
    alcance: somaIg(ig.alcance),
    interacoes: somaIg(ig.interacoes),
    visitas: somaIg(ig.visitas),
    seguidores: somaIg(ig.seguidores),
    cliquesLink: somaIg(ig.cliquesLink),
  }
}

function MetaRel({ ig, sub, nome }) {
  const t = totaisIg(ig)
  const valorEm = (lista, data) => lista.find((r) => r.data === data)?.valor ?? 0
  const diario = ig.visualizacoes.map((r) => ({
    label: dataFmt(r.data),
    data: r.data,
    visualizacoes: r.valor,
    alcance: valorEm(ig.alcance, r.data),
    interacoes: valorEm(ig.interacoes, r.data),
    visitas: valorEm(ig.visitas, r.data),
    seguidores: valorEm(ig.seguidores, r.data),
    cliquesLink: valorEm(ig.cliquesLink, r.data),
  }))
  // Dias de pico: provavelmente dias com publicação nova
  const picos = diario.filter((d) => d.visualizacoes >= Math.max(50, t.visualizacoes * 0.1))
  const vizPicos = picos.reduce((s, d) => s + d.visualizacoes, 0)
  const diasZerados = diario.filter((d) => d.visualizacoes === 0).length
  const engaj = t.alcance ? t.interacoes / t.alcance : 0
  const funil = [
    { nome: 'Visualizações', valor: t.visualizacoes },
    { nome: 'Contas alcançadas', valor: t.alcance },
    { nome: 'Interações', valor: Math.max(t.interacoes, 0) },
    { nome: 'Visitas ao perfil', valor: t.visitas },
    { nome: 'Novos seguidores', valor: t.seguidores },
    { nome: 'Cliques no link', valor: t.cliquesLink },
  ]
  const csv = <button className="btn" onClick={() => exportCSV(`${nome.toLowerCase()}-diario.csv`, diario)}><Download size={16} /> CSV</button>

  if (sub === 'alcance') {
    return (
      <>
        <div className="kpis">
          <Kpi titulo={`Visualizações (${nome})`} valor={num(t.visualizacoes)} icon={Eye} />
          <Kpi titulo="Contas alcançadas" valor={num(t.alcance)} icon={Users} />
          <Kpi titulo="Dias com publicação forte" valor={num(picos.length)} icon={TrendingUpIcon}
            ajuda="Dias com muitas visualizações, normalmente quando houve publicação nova." />
          <Kpi titulo="Dias sem visualização" valor={`${diasZerados} de ${diario.length}`} icon={Eye}
            ajuda="Dias em que ninguém viu nenhum conteúdo do perfil." />
        </div>
        <div className="grid-2">
          <Card titulo="Visualizações e alcance por dia" className="span-2" acao={csv}
            ajuda="Roxo: quantas vezes o conteúdo foi visto. Azul: quantas pessoas diferentes viram. Os picos coincidem com os dias de publicação.">
            <ResponsiveContainer height={320}>
              <AreaChart data={diario}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" /><YAxis />
                <Tooltip /><Legend />
                <Area dataKey="visualizacoes" name="Visualizações" stroke="#7b5ea7" fill="#7b5ea733" strokeWidth={2} />
                <Area dataKey="alcance" name="Alcance" stroke="#1f6f8b" fill="#1f6f8b33" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
          <Tabela titulo="Dias de maior alcance" className="span-2"
            linhas={diario.slice().sort((a, b) => b.visualizacoes - a.visualizacoes).slice(0, 7)}
            colunas={[['label', 'Dia'], ['visualizacoes', 'Visualizações', num, true], ['alcance', 'Contas alcançadas', num, true], ['interacoes', 'Interações', num, true]]} />
        </div>
      </>
    )
  }

  if (sub === 'engajamento') {
    return (
      <>
        <div className="kpis">
          <Kpi titulo="Interações com o conteúdo" valor={num(t.interacoes)} icon={Heart} />
          <Kpi titulo="Taxa de engajamento" valor={ctrFmt(engaj)} icon={Percent}
            ajuda="De cada 100 contas que viram o conteúdo, quantas curtiram, comentaram, compartilharam ou salvaram." />
          <Kpi titulo="Visitas ao perfil" valor={num(t.visitas)} icon={MousePointerClick} />
          <Kpi titulo="Novos seguidores" valor={num(t.seguidores)} icon={UserPlus} />
          <Kpi titulo="Cliques no link" valor={num(t.cliquesLink)} icon={Link} />
        </div>
        <div className="grid-2">
          <Card titulo="Interações, visitas e seguidores por dia" className="span-2" acao={csv}
            ajuda="Curtidas/comentários (laranja), visitas ao perfil (verde) e novos seguidores (azul) a cada dia.">
            <ResponsiveContainer height={300}>
              <BarChart data={diario}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" /><YAxis allowDecimals={false} />
                <Tooltip /><Legend />
                <Bar dataKey="interacoes" name="Interações" fill="#f3a712" />
                <Bar dataKey="visitas" name="Visitas ao perfil" fill="#4c956c" />
                <Bar dataKey="seguidores" name="Novos seguidores" fill="#1f6f8b" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card titulo="Do conteúdo ao cliente (funil)" className="span-2"
            ajuda="Quantas pessoas passam de cada etapa para a próxima: ver → reagir → visitar o perfil → seguir → clicar no link.">
            <Barras data={funil.map((f) => ({ ...f, rot: f.nome }))} campo="valor" cor="#e4572e" nome="Quantidade" />
          </Card>
        </div>
      </>
    )
  }

  // Resumo
  return (
    <>
      <div className="kpis">
        <Kpi titulo={`Visualizações (${nome})`} valor={num(t.visualizacoes)} icon={Eye} />
        <Kpi titulo="Contas alcançadas" valor={num(t.alcance)} icon={Users} />
        <Kpi titulo="Interações com o conteúdo" valor={num(t.interacoes)} icon={Heart} />
        <Kpi titulo="Taxa de engajamento" valor={ctrFmt(engaj)} icon={Percent}
          ajuda="De cada 100 contas que viram o conteúdo, quantas curtiram, comentaram, compartilharam ou salvaram." />
      </div>
      <div className="kpis">
        <Kpi titulo="Visitas ao perfil" valor={num(t.visitas)} icon={MousePointerClick} />
        <Kpi titulo="Novos seguidores" valor={num(t.seguidores)} icon={UserPlus} />
        <Kpi titulo="Cliques no link" valor={num(t.cliquesLink)} icon={Link} />
      </div>
      <div className="grid-2">
        <Card titulo="Leitura dos dados" className="span-2">
          {nome === 'Facebook' ? <LeituraFacebook t={t} engaj={engaj} /> : <ul className="nota lista">
            <li><b>O Instagram depende de publicações</b>: {picos.length} dias ({picos.map((d) => d.label).join(', ')}) concentram {pctDe(vizPicos, t.visualizacoes)} das visualizações. Em {diasZerados} dos {diario.length} dias não houve nenhuma visualização. Publicar com frequência (2 a 3 vezes por semana) evita esses "vazios".</li>
            <li><b>Engajamento de {ctrFmt(engaj)}</b>: de cada 100 pessoas alcançadas, cerca de {Math.round(engaj * 100)} interagiram. Para perfis de empresa industrial, acima de 3% é considerado bom.</li>
            <li><b>{num(t.seguidores)} novos seguidores</b> e <b>{num(t.visitas)} visitas ao perfil</b> no período: o perfil ainda é pequeno e está começando.</li>
            <li><b>{t.cliquesLink ? `${t.cliquesLink} cliques no link` : 'Nenhum clique no link'}</b>: o Instagram {t.cliquesLink ? 'leva poucas pessoas' : 'não está levando ninguém'} para o site. Coloque na bio o link do site ou do WhatsApp com uma chamada clara ("Peça seu orçamento") e cite o link nas publicações.</li>
            <li>Ideias de conteúdo: fotos da fábrica e da produção, roletes instalados em clientes, vídeos curtos de testes e entregas, e dúvidas comuns ("qual rolete usar para mineração?").</li>
          </ul>}
        </Card>
      </div>
    </>
  )
}

function LeituraFacebook({ t, engaj }) {
  return (
    <ul className="nota lista">
      <li><b>A página do Facebook está praticamente parada</b>: {num(t.visualizacoes)} visualizações, {num(t.alcance)} pessoas alcançadas e {num(t.interacoes)} interações em todo o período. Para comparação, o Instagram teve mais de 1.000 visualizações no mesmo período.</li>
      <li><b>{num(t.visitas)} visitas à página</b> e <b>{num(t.seguidores)} novos seguidores</b>: algumas pessoas procuram a empresa no Facebook, mas não encontram conteúdo novo.</li>
      <li><b>{t.cliquesLink ? `${t.cliquesLink} cliques no link` : 'Nenhum clique no link'}</b>{engaj ? ` e engajamento de ${ctrFmt(engaj)}` : ''}.</li>
      <li><b>Solução simples</b>: no Meta Business Suite, ao publicar no Instagram, marque também a Página do Facebook. O mesmo conteúdo passa a sair nas duas redes sem trabalho extra.</li>
      <li>Confira se a página tem o botão "Enviar mensagem" ou "WhatsApp", telefone, endereço e link do site preenchidos. Mesmo sem muitas publicações, quem visita precisa achar o contato.</li>
    </ul>
  )
}

const minutosFmt = (horas) => {
  const min = Math.round(horas * 60)
  return min >= 60 ? `${Math.floor(min / 60)} h ${min % 60} min` : `${min} min`
}
const duracaoFmt = (seg) => `${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, '0')}`
const periodoYt = (yt) => {
  const d = yt.diario
  return d.length ? `${dataBR(d[0].data)} a ${dataBR(d[d.length - 1].data)}` : ''
}

function YoutubeRel({ yt, sub }) {
  if (!yt.videos.length && !yt.diario.length) return <RedeSemDados rede="youtube" sub={sub} />

  const somaV = (k) => yt.videos.reduce((s, v) => s + v[k], 0)
  const t = yt.total || {
    visualizacoes: somaV('visualizacoes'), horas: somaV('horas'), inscritos: somaV('inscritos'), impressoes: somaV('impressoes'),
  }
  const ctrMini = t.impressoes ? (yt.total?.ctr ?? 0) : 0
  const videos = yt.videos.map((v) => ({
    ...v,
    link: `https://www.youtube.com/watch?v=${v.id}`,
    mediaSeg: v.visualizacoes ? Math.round((v.horas * 3600) / v.visualizacoes) : 0,
  })).sort((a, b) => b.visualizacoes - a.visualizacoes)
  const semView = videos.filter((v) => !v.visualizacoes)
  const melhor = videos[0]
  const ultimoPub = videos.map((v) => v.publicado).filter(Boolean).sort().pop()

  // Visualizações por dia, uma coluna por vídeo
  const titulos = [...new Set(yt.porVideo.map((r) => r.titulo))]
  const diario = yt.diario.map((d) => {
    const linha = { label: dataFmt(d.data), data: d.data, total: d.valor }
    yt.porVideo.filter((r) => r.data === d.data).forEach((r) => { linha[r.titulo] = r.valor })
    return linha
  })
  const diasComView = diario.filter((d) => d.total > 0).length

  if (sub === 'visualizacoes') {
    return (
      <>
        <div className="kpis">
          <Kpi titulo="Visualizações (YouTube)" valor={num(t.visualizacoes)} icon={Eye} />
          <Kpi titulo="Tempo assistido" valor={minutosFmt(t.horas)} icon={PlayIcon} />
          <Kpi titulo="Dias com visualização" valor={`${diasComView} de ${diario.length}`} icon={Eye}
            ajuda="Em quantos dias do período pelo menos uma pessoa assistiu a algum vídeo." />
        </div>
        <div className="grid-2">
          <Card titulo="Visualizações por dia e por vídeo" className="span-2"
            ajuda="Cada cor é um vídeo. A altura da barra é o total de visualizações do canal no dia."
            acao={<button className="btn" onClick={() => exportCSV('youtube-diario.csv', diario)}><Download size={16} /> CSV</button>}>
            <ResponsiveContainer height={320}>
              <BarChart data={diario}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" /><YAxis allowDecimals={false} />
                <Tooltip /><Legend />
                {titulos.map((tt, i) => (
                  <Bar key={tt} dataKey={tt} stackId="v" fill={CORES[i % CORES.length]} />
                ))}
                {!titulos.length && <Bar dataKey="total" name="Visualizações" fill="#e4572e" />}
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </>
    )
  }

  if (sub === 'inscritos') {
    return (
      <>
        <div className="kpis">
          <Kpi titulo="Novos inscritos" valor={num(t.inscritos)} icon={UserPlus} />
          <Kpi titulo="Visualizações (YouTube)" valor={num(t.visualizacoes)} icon={Eye} />
        </div>
        <div className="grid-2">
          <Card titulo="Inscritos no período" className="span-2"
            ajuda="Inscrito é quem clica em &quot;Inscrever-se&quot; para acompanhar o canal e ser avisado de vídeos novos.">
            <ul className="nota lista">
              <li><b>{t.inscritos ? `${num(t.inscritos)} novos inscritos` : 'Nenhum novo inscrito'}</b> no período, com {num(t.visualizacoes)} visualizações.</li>
              <li>Peça a inscrição no final de cada vídeo ("inscreva-se para ver mais da nossa fábrica") e coloque o link do canal no site, no Instagram e na assinatura de e-mail.</li>
              <li>Para ver o número de inscritos dia a dia, exporte no YouTube Studio o relatório com a métrica "Inscritos" e envie o arquivo.</li>
            </ul>
          </Card>
        </div>
      </>
    )
  }

  if (sub === 'videos') {
    return (
      <div className="grid-2">
        <Card titulo="Visualizações por vídeo" className="span-2"
          ajuda="Quantas vezes cada vídeo foi assistido no período.">
          <Barras data={videos.map((v) => ({ ...v, rot: v.titulo }))} campo="visualizacoes" cor="#e4572e" nome="Visualizações" />
        </Card>
        <Tabela titulo={`Vídeos do canal (${videos.length})`} linhas={videos} className="span-2" csv="youtube-videos.csv" ordenavel ordemInicial="visualizacoes" colunas={[
          ['titulo', 'Vídeo'],
          ['publicado', 'Publicado em', (d) => (d ? dataBR(d) : '')],
          ['duracao', 'Duração', duracaoFmt, true],
          ['visualizacoes', 'Visualizações', num, true],
          ['mediaSeg', 'Tempo médio assistido', (s) => (s ? duracaoFmt(s) : '–'), true],
          ['impressoes', 'Impressões da miniatura', num, true],
          ['ctr', 'CTR da miniatura', ctrFmt, true],
        ]} />
        <Card titulo="Assistir aos vídeos" className="span-2">
          <ul className="nota lista">
            {videos.map((v) => (
              <li key={v.id}><a href={v.link} target="_blank" rel="noreferrer">{v.titulo}</a> · {num(v.visualizacoes)} visualizações</li>
            ))}
          </ul>
        </Card>
      </div>
    )
  }

  // Resumo
  return (
    <>
      <div className="kpis">
        <Kpi titulo="Visualizações (YouTube)" valor={num(t.visualizacoes)} icon={Eye} />
        <Kpi titulo="Tempo assistido" valor={minutosFmt(t.horas)} icon={PlayIcon} />
        <Kpi titulo="Novos inscritos" valor={num(t.inscritos)} icon={UserPlus} />
      </div>
      <div className="kpis">
        <Kpi titulo="Impressões da miniatura" valor={num(t.impressoes)} icon={Eye} />
        <Kpi titulo="CTR da miniatura" valor={ctrFmt(ctrMini)} icon={Percent} />
        <Kpi titulo="Vídeos no canal" valor={num(videos.length)} icon={PlayIcon}
          ajuda="Quantidade de vídeos que aparecem no relatório do YouTube." />
      </div>
      <div className="grid-2">
        <Card titulo="Leitura dos dados" className="span-2">
          <ul className="nota lista">
            <li><b>O canal ainda é muito pequeno</b>: {num(t.visualizacoes)} visualizações e {minutosFmt(t.horas)} assistidos em {diario.length} dias, menos de 1 visualização por dia.</li>
            {melhor && <li><b>Vídeo que mais funciona</b>: "{melhor.titulo}", com {num(melhor.visualizacoes)} visualizações{melhor.ctr ? ` e ${ctrFmt(melhor.ctr)} de cliques na miniatura` : ''}.</li>}
            <li><b>CTR da miniatura de {ctrFmt(ctrMini)}</b>: de cada 100 vezes que a capa de um vídeo apareceu, cerca de {Math.round(ctrMini * 100)} viraram clique. Entre 4% e 10% é o normal no YouTube, então as capas estão funcionando. O problema é que aparecem pouco ({num(t.impressoes)} vezes).</li>
            {semView.length > 0 && <li><b>{semView.length} vídeo(s) sem nenhuma visualização</b> no período: {semView.map((v) => `"${v.titulo}"`).join(', ')}.</li>}
            <li><b>Último vídeo publicado em {ultimoPub ? dataBR(ultimoPub) : '–'}</b>. Publicar com regularidade (1 a 2 vídeos por mês) ajuda o YouTube a mostrar o canal. Bons temas: processo de fabricação, recuperação de roletes, instalação em cliente e "qual rolete escolher".</li>
            <li>Os vídeos curtos (cerca de 1 minuto) podem ser publicados também como Reels no Instagram e no Facebook, aproveitando o mesmo material.</li>
          </ul>
        </Card>
      </div>
    </>
  )
}
