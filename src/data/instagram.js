// Instagram (Meta Business Suite > Insights > Exportar), 14/09/2026 a 11/10/2026.
// Pode ser atualizado pelo botão "Importar CSVs" com os arquivos exportados do Meta.

const INICIO = '2026-09-14'
const DIAS = 28

const serie = (valores) => valores.split(' ').map(Number)

// Valores diários a partir de INICIO
const BRUTO = {
  visualizacoes: serie('282 203 37 10 2 29 2 1 2 0 28 0 0 0 0 0 0 274 71 3 0 6 0 13 0 261 52 8'),
  alcance: serie('123 72 13 4 1 1 1 0 1 0 3 0 0 0 0 0 0 97 41 1 0 3 0 2 0 49 15 5'),
  interacoes: serie('15 9 0 0 1 -2 0 0 0 0 0 0 0 0 0 0 0 12 1 0 0 0 0 0 0 14 1 0'),
  visitas: serie('4 0 0 1 0 3 0 0 0 1 2 0 0 0 0 1 0 7 1 0 0 0 0 3 1 1 1 0'),
  cliquesLink: serie('0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0'),
}

// O export de seguidores traz só os dias em que houve novos seguidores
const SEGUIDORES = { '2026-09-16': 1, '2026-09-18': 1, '2026-09-21': 1, '2026-09-23': 2, '2026-09-24': 1, '2026-09-30': 1, '2026-10-07': 2, '2026-10-09': 1 }

const datas = Array.from({ length: DIAS }, (_, i) => {
  const d = new Date(`${INICIO}T12:00:00`)
  d.setDate(d.getDate() + i)
  return d.toISOString().slice(0, 10)
})

const paraLista = (vals) => datas.map((data, i) => ({ data, valor: vals[i] }))

export const instagramPadrao = {
  visualizacoes: paraLista(BRUTO.visualizacoes),
  alcance: paraLista(BRUTO.alcance),
  interacoes: paraLista(BRUTO.interacoes),
  visitas: paraLista(BRUTO.visitas),
  cliquesLink: paraLista(BRUTO.cliquesLink),
  seguidores: datas.map((data) => ({ data, valor: SEGUIDORES[data] || 0 })),
}
