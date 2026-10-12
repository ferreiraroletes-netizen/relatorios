// Leitura dos exports do Google Search Console (Desempenho > Exportar > CSV).
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
  const dados = { consultas: [], paginas: [], dispositivos: [], paises: [], grafico: [], aspectos: [] }
  Object.values(arquivos).forEach((txt) => {
    const r = parseCSV(txt)
    if (r) dados[r.tipo] = r.rows
  })
  return dados
}

export async function carregaArquivos(files, base) {
  const dados = { ...base }
  const lidos = []
  for (const f of files) {
    const r = parseCSV(await f.text())
    if (r) { dados[r.tipo] = r.rows; lidos.push(f.name) }
  }
  return { dados, lidos }
}

const MARCA = /(ferreira|roller ?port|rolle?port|roll ?port|rolport)/i
export const ehMarca = (consulta) => MARCA.test(consulta)
