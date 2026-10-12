// Perfil da Empresa no Google (Google Business Profile) — mai/2026 a out/2026.
// Atualize copiando os números do painel "Desempenho" do perfil.
// `null` = o Google mostra apenas "< 15".

export const periodoPerfil = 'mai/2026 a out/2026'
export const mesParcial = 'out/26' // mês ainda em andamento

export const visualizacoes = 1901

export const plataformas = [
  { nome: 'Pesquisa Google – celular', valor: 804 },
  { nome: 'Pesquisa Google – computador', valor: 706 },
  { nome: 'Google Maps – celular', valor: 230 },
  { nome: 'Google Maps – computador', valor: 161 },
]

export const pesquisasTotal = 536

export const termos = [
  'rolete:341', 'roletes:131', 'ferreira roletes:42', 'rollerport:22',
  'correias', 'empresa de roletes', 'empresas de roletes', 'esteira de roletes',
  'fabrica correias caieiras', 'fabrica de roletes', 'fabrica de roletes para esteira',
  'fabricante de rolete para esteira transportadora', 'fabricante de roletes',
  'fabricantes de roletes', 'fabricantes de roletes industriais',
  'fabricas no polo industrial franco da rocha', 'fabricasfranco da rocha',
  'ferreira roletes, industria comercio e servicos ltda',
  'metalurgica de roletes no rio grande so sul', 'rolete industrial',
  'rolete para esteira', 'rolete transporte', 'roletes para esteira',
  'roletes rollerport', 'roletes rollerport - r. joão marcos pimenta rocha - polo industrial, franco da rocha - sp',
  'roletes shop',
].map((t) => {
  const [nome, v] = t.split(':')
  return { nome, valor: v ? Number(v) : null }
})

const MESES = ['mai/26', 'jun/26', 'jul/26', 'ago/26', 'set/26', 'out/26']
const ROTAS = [71, 62, 49, 76, 73, 36]
const SITE = [25, 45, 27, 36, 16, 5]
const LIGACOES = [6, 1, 4, 9, 3, 0]

export const interacoesMensais = MESES.map((mes, i) => ({
  mes,
  rotas: ROTAS[i],
  site: SITE[i],
  ligacoes: LIGACOES[i],
  total: ROTAS[i] + SITE[i] + LIGACOES[i],
}))
