// Página da empresa no LinkedIn > Análises > Exportar.
// Arquivos separados por ";" com datas dd/mm/aaaa. O tipo é reconhecido pela 1ª linha;
// os dois arquivos de dados demográficos só se distinguem pelo nome.
const arquivos = import.meta.glob('./linkedin/*.csv', { query: '?raw', import: 'default', eager: true })

const normaliza = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const isoDeBR = (s) => {
  const [d, m, a] = s.trim().split('/')
  return `${a}-${m}-${d}`
}
const inteiro = (v) => Number(String(v ?? '').trim()) || 0

export const linkedinVazio = () => ({
  impressoes: 0, alcancados: 0, periodo: '',
  diario: [], totalSeguidores: 0, seguidores: [],
  publicacoes: [], demoPublico: [], demoConteudo: [],
})

export function parseLinkedin(texto, nomeArquivo = '') {
  const linhas = texto.replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim())
  if (!linhas.length || !linhas[0].includes(';')) return null
  const col = linhas.map((l) => l.split(';'))
  const cab = normaliza(col[0][0])

  if (cab === 'principais dados demograficos') {
    const rows = col.slice(1).map(([grupo, valor, pct]) => ({ grupo, valor, pct: parseFloat(pct) / 100 || 0 }))
    const tipo = normaliza(nomeArquivo).includes('conteudo') ? 'demoConteudo' : 'demoPublico'
    return { [tipo]: rows }
  }
  if (cab === 'desempenho geral') {
    const v = Object.fromEntries(col.slice(1).map(([k, n]) => [normaliza(k), inteiro(n)]))
    return { impressoes: v.impressoes || 0, alcancados: v['usuarios alcancados'] || 0, periodo: (col[0][1] || '').trim() }
  }
  if (cab === 'data' && normaliza(col[0][1] || '') === 'impressoes') {
    return { diario: col.slice(1).map(([d, imp, eng]) => ({ data: isoDeBR(d), impressoes: inteiro(imp), engajamentos: inteiro(eng) })) }
  }
  if (cab.startsWith('total de seguidores')) {
    const inicio = col.findIndex((c) => normaliza(c[0]) === 'data')
    return {
      totalSeguidores: inteiro(col[0][1]),
      seguidores: col.slice(inicio + 1).map(([d, n]) => ({ data: isoDeBR(d), valor: inteiro(n) })),
    }
  }
  if (cab.startsWith('maximo de') && cab.includes('publicacoes')) {
    // Duas listas lado a lado: (url, data, engajamentos) e (url, data, impressões)
    const posts = new Map()
    const pega = (url, data) => {
      if (!posts.has(url)) posts.set(url, { url, data: isoDeBR(data), engajamentos: 0, impressoes: 0 })
      return posts.get(url)
    }
    col.slice(3).forEach((c) => {
      if (c[0]?.startsWith('http')) pega(c[0], c[1]).engajamentos = inteiro(c[2])
      if (c[4]?.startsWith('http')) pega(c[4], c[5]).impressoes = inteiro(c[6])
    })
    return { publicacoes: [...posts.values()] }
  }
  return null
}

export function linkedinPadrao() {
  const li = linkedinVazio()
  Object.entries(arquivos).forEach(([nome, txt]) => Object.assign(li, parseLinkedin(txt, nome)))
  return li
}

// Título legível a partir do link da publicação
export function tituloPost(url) {
  const slug = decodeURIComponent(url.split('/posts/')[1] || url).replace(/^roletesrollerport_/, '')
  const partes = slug.replace(/(^|-)(share|ugcPost|activity)-\d+.*$/, '').split('-').filter(Boolean)
  return partes.length ? partes.join(' ').replace(/^./, (c) => c.toUpperCase()) : 'Publicação sem texto no link'
}
