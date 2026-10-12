// Leitura dos exports do Google Search Console (Desempenho > Exportar > CSV).
import { instagramPadrao } from './instagram'

const arquivos = import.meta.glob('./gsc/*.csv', { query: '?raw', import: 'default', eager: true })

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

export function carregaPadrao() {
  const dados = { consultas: [], paginas: [], dispositivos: [], paises: [], grafico: [], aspectos: [], instagram: instagramPadrao }
  Object.values(arquivos).forEach((txt) => {
    const r = parseCSV(txt)
    if (r) dados[r.tipo] = r.rows
  })
  return dados
}

// Exports do Instagram (Meta): UTF-16, linha "sep=,", título da métrica e linhas "data","valor"
const INSTAGRAM = {
  'visualizacoes': 'visualizacoes',
  'alcance': 'alcance',
  'interacoes com o conteudo': 'interacoes',
  'visitas ao perfil do instagram': 'visitas',
  'cliques no link do instagram': 'cliquesLink',
  'seguidores no instagram': 'seguidores',
}

function parseInstagram(texto, atual) {
  const linhas = texto.replace(/^﻿/, '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (!/^sep=/i.test(linhas[0] || '')) return null
  const metrica = INSTAGRAM[normaliza(linhas[1].replace(/"/g, '').trim())]
  if (!metrica) return null
  const valores = new Map(linhas.slice(3).map((l) => {
    const [d, v] = parseLinha(l)
    return [d.slice(0, 10), Number(v) || 0]
  }))
  // Seguidores vem só com os dias que tiveram ganho: completa com zero
  const rows = metrica === 'seguidores' && atual?.length
    ? atual.map((r) => ({ data: r.data, valor: valores.get(r.data) || 0 }))
    : [...valores].map(([data, valor]) => ({ data, valor }))
  return { metrica, rows }
}

async function lerTexto(f) {
  const buf = new Uint8Array(await f.arrayBuffer())
  if (buf[0] === 0xff && buf[1] === 0xfe) return new TextDecoder('utf-16le').decode(buf)
  if (buf[0] === 0xfe && buf[1] === 0xff) return new TextDecoder('utf-16be').decode(buf)
  return new TextDecoder('utf-8').decode(buf)
}

export async function carregaArquivos(files, base) {
  const dados = { ...base, instagram: { ...base.instagram } }
  const lidos = []
  for (const f of files) {
    const texto = await lerTexto(f)
    const ig = parseInstagram(texto, dados.instagram.visualizacoes)
    if (ig) { dados.instagram[ig.metrica] = ig.rows; lidos.push(f.name); continue }
    const r = parseCSV(texto)
    if (r) { dados[r.tipo] = r.rows; lidos.push(f.name) }
  }
  return { dados, lidos }
}

const MARCA = /(ferreira|roller ?port|rolle?port|roll ?port|rolport)/i
export const ehMarca = (consulta) => MARCA.test(consulta)
