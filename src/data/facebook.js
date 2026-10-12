// Página do Facebook (Meta Business Suite > Insights > Exportar), 14/09/2026 a 11/10/2026.
// Mesmo formato do Instagram; "Visualizadores" do Facebook equivale ao alcance.

const INICIO = '2026-09-14'

const serie = (valores) => valores.split(' ').map(Number)

const BRUTO = {
  visualizacoes: serie('0 2 2 0 0 0 0 1 0 0 0 0 0 0 0 0 0 3 0 2 0 1 0 1 0 0 0 0'),
  alcance: serie('0 1 1 0 0 0 0 1 0 0 0 0 0 0 0 0 0 2 0 1 0 1 0 1 0 0 0 0'),
  interacoes: serie('0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0'),
  visitas: serie('0 1 1 0 0 0 0 1 0 1 0 2 0 0 0 0 1 6 0 1 1 0 0 0 1 2 0 1'),
  seguidores: serie('0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0'),
  cliquesLink: serie('0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0'),
}

const datas = BRUTO.visualizacoes.map((_, i) => {
  const d = new Date(`${INICIO}T12:00:00`)
  d.setDate(d.getDate() + i)
  return d.toISOString().slice(0, 10)
})

export const facebookPadrao = Object.fromEntries(
  Object.entries(BRUTO).map(([k, vals]) => [k, datas.map((data, i) => ({ data, valor: vals[i] }))]),
)
