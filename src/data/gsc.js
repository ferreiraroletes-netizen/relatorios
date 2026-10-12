// Leitura dos exports do Google Search Console (Desempenho > Exportar > CSV).
import { instagramPadrao } from './instagram'
import { facebookPadrao } from './facebook'
import { linkedinPadrao, parseLinkedin } from './linkedin'

const arquivos = import.meta.glob('./gsc/*.csv', { query: '?raw', import: 'default', eager: true })
const arquivosYoutube = import.meta.glob('./youtube/*.csv', { query: '?raw', import: 'default', eager: true })

const normaliza = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// Identifica o relatório pelo cabeçalho da primeira coluna (funciona com qualquer nome de arquivo)
const TIPOS = {
  'top consultas': 'consultas',
  'paginas principais': 'paginas',
  dispositivo: 'dispositivos',
  pais: 'paises',
  data: 'grafico',
  'aspecto da pesquisa': 'aspectos',
}

const numero = (v) => {
  const s = String(v).trim()
  if (s.endsWith('%')) return parseFloat(s) / 100
  const n = Number(s)
  return Number.isNaN(n) ? s : n
}

function parseLinha(linha) {
  const out = []
  let cur = ''
  let aspas = false
  for (const c of linha) {
    if (c === '"') aspas = !aspas
    else if (c === ',' && !aspas) { out.push(cur); cur = '' }
    else cur += c
  }
  out.push(cur)
  return out
}

export function parseCSV(texto) {
  const linhas = texto.replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim())
  if (!linhas.length) return null
  const cab = parseLinha(linhas[0])
  const tipo = TIPOS[normaliza(cab[0])]
  if (!tipo) return null
  const rows = linhas.slice(1).map((l) => {
    const v = parseLinha(l)
    return {
      nome: v[0],
      cliques: numero(v[1]),
      impressoes: numero(v[2]),
      ctr: numero(v[3]),
      posicao: numero(v[4]),
    }
  })
  return { tipo, rows }
}

// YouTube Studio > Análises > Modo avançado > Exportar (CSV)
// "Dados da tabela" = um vídeo por linha; "Dados do gráfico" = vídeo por dia; "Total" = canal por dia
const nOuZero = (v) => (v === undefined || String(v).trim() === '' ? 0 : Number(v) || 0)

function dataIso(texto) {
  const d = new Date(texto)
  if (Number.isNaN(d.getTime())) return texto
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function parseYoutube(texto) {
  const linhas = texto.replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim())
  if (!linhas.length) return null
  const cab = parseLinha(linhas[0]).map((c) => normaliza(c.trim()))
  const corpo = linhas.slice(1).map(parseLinha)
  if (cab[0] === 'conteudo' && cab[1] === 'titulo do video' && cab.includes('tempo de exibicao (horas)')) {
    const col = (nome) => cab.indexOf(nome)
    const linha = (v) => ({
      id: v[0],
      titulo: v[1],
      publicado: v[2] ? dataIso(v[2]) : '',
      duracao: nOuZero(v[col('duracao')]),
      visualizacoes: nOuZero(v[col('visualizacoes')]),
      horas: nOuZero(v[col('tempo de exibicao (horas)')]),
      inscritos: nOuZero(v[col('inscritos')]),
      impressoes: nOuZero(v[col('impressoes de miniaturas')]),
      ctr: nOuZero(v[col('taxa de cliques na miniatura (%)')]) / 100,
    })
    const total = corpo.find((v) => v[0] === 'Total')
    return { tipo: 'videos', rows: { total: total ? linha(total) : null, videos: corpo.filter((v) => v[0] !== 'Total').map(linha) } }
  }
  if (cab[0] === 'data' && cab[1] === 'conteudo') {
    return { tipo: 'porVideo', rows: corpo.map((v) => ({ data: v[0], id: v[1], titulo: v[2], valor: nOuZero(v[cab.indexOf('visualizacoes')]) })) }
  }
  if (cab.length === 2 && cab[0] === 'data' && cab[1] === 'visualizacoes') {
    return { tipo: 'diario', rows: corpo.map((v) => ({ data: v[0], valor: nOuZero(v[1]) })) }
  }
  return null
}

const youtubeVazio = () => ({ videos: [], total: null, porVideo: [], diario: [] })

function aplicaYoutube(yt, r) {
  if (r.tipo === 'videos') { yt.videos = r.rows.videos; yt.total = r.rows.total }
  else yt[r.tipo] = r.rows
}

export function carregaPadrao() {
  const dados = { consultas: [], paginas: [], dispositivos: [], paises: [], grafico: [], aspectos: [], instagram: instagramPadrao, facebook: facebookPadrao, youtube: youtubeVazio(), linkedin: linkedinPadrao() }
  Object.values(arquivosYoutube).forEach((txt) => {
    const r = parseYoutube(txt)
    if (r) aplicaYoutube(dados.youtube, r)
  })
  Object.values(arquivos).forEach((txt) => {
    const r = parseCSV(txt)
    if (r) dados[r.tipo] = r.rows
  })
  return dados
}

// Exports do Meta Business Suite (Instagram e Facebook):
// UTF-16, linha "sep=,", título da métrica e linhas "data","valor".
// [rede, métrica]; rede null = título igual nas duas redes (decidido pelo lote)
const META = {
  'visualizacoes': [null, 'visualizacoes'],
  'interacoes com o conteudo': [null, 'interacoes'],
  'alcance': ['instagram', 'alcance'],
  'visitas ao perfil do instagram': ['instagram', 'visitas'],
  'cliques no link do instagram': ['instagram', 'cliquesLink'],
  'seguidores no instagram': ['instagram', 'seguidores'],
  'visualizadores': ['facebook', 'alcance'],
  'visitas ao facebook': ['facebook', 'visitas'],
  'cliques no link do facebook': ['facebook', 'cliquesLink'],
  'seguidores do facebook': ['facebook', 'seguidores'],
}

function parseMeta(texto) {
  const linhas = texto.replace(/^\ufeff/, '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (!/^sep=/i.test(linhas[0] || '')) return null
  const tipo = META[normaliza(linhas[1].replace(/"/g, '').trim())]
  if (!tipo) return null
  const valores = new Map(linhas.slice(3).map((l) => {
    const [d, v] = parseLinha(l)
    return [d.slice(0, 10), Number(v) || 0]
  }))
  return { rede: tipo[0], metrica: tipo[1], valores }
}

async function lerTexto(f) {
  const buf = new Uint8Array(await f.arrayBuffer())
  if (buf[0] === 0xff && buf[1] === 0xfe) return new TextDecoder('utf-16le').decode(buf)
  if (buf[0] === 0xfe && buf[1] === 0xff) return new TextDecoder('utf-16be').decode(buf)
  return new TextDecoder('utf-8').decode(buf)
}

export async function carregaArquivos(files, base) {
  const dados = { ...base, instagram: { ...base.instagram }, facebook: { ...base.facebook }, youtube: { ...base.youtube }, linkedin: { ...base.linkedin } }
  const lidos = []
  const meta = []
  for (const f of files) {
    const texto = await lerTexto(f)
    const m = parseMeta(texto)
    if (m) { meta.push({ ...m, nome: f.name }); continue }
    const li = parseLinkedin(texto, f.name)
    if (li) { Object.assign(dados.linkedin, li); lidos.push(`${f.name} (linkedin)`); continue }
    // YouTube antes do Search Console: "Total.csv" também começa com a coluna Data
    const yt = parseYoutube(texto)
    if (yt) { aplicaYoutube(dados.youtube, yt); lidos.push(`${f.name} (youtube)`); continue }
    const r = parseCSV(texto)
    if (r) { dados[r.tipo] = r.rows; lidos.push(f.name) }
  }
  // Arquivos com título ambíguo vão para a rede identificada pelos demais do lote
  const redes = new Set(meta.map((m) => m.rede).filter(Boolean))
  const padrao = redes.size === 1 ? [...redes][0] : 'instagram'
  // Primeiro as métricas com todos os dias, para completar as que vêm só com dias > 0
  meta.sort((a, b) => b.valores.size - a.valores.size)
  for (const m of meta) {
    const rede = m.rede || padrao
    const dias = dados[rede].visualizacoes
    const rows = m.valores.size < dias.length
      ? dias.map((r) => ({ data: r.data, valor: m.valores.get(r.data) || 0 }))
      : [...m.valores].map(([data, valor]) => ({ data, valor }))
    dados[rede][m.metrica] = rows
    lidos.push(`${m.nome} (${rede})`)
  }
  return { dados, lidos }
}

const MARCA = /(ferreira|roller ?port|rolle?port|roll ?port|rolport)/i
export const ehMarca = (consulta) => MARCA.test(consulta)
