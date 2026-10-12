// Dados de exemplo. Substitua por integração real (ERP, Google Analytics, CRM).
const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function rng(seed) {
  let s = seed
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280)
}
const r = rng(42)

export const produtos = [
  { id: 'RC', nome: 'Roletes de Carga' },
  { id: 'RR', nome: 'Roletes de Retorno' },
  { id: 'RI', nome: 'Roletes de Impacto' },
  { id: 'RA', nome: 'Roletes Autoalinhantes' },
  { id: 'TB', nome: 'Tambores' },
  { id: 'SP', nome: 'Suportes e Cavaletes' },
]

export const regioes = ['Sudeste', 'Sul', 'Centro-Oeste', 'Nordeste', 'Norte']
export const segmentos = ['Mineração', 'Agronegócio', 'Siderurgia', 'Portos', 'Cimento', 'Papel e Celulose']
export const canais = ['Busca orgânica', 'Google Ads', 'Direto', 'Redes sociais', 'Indicação', 'E-mail']

// Pedidos individuais (24 meses) — base para todos os relatórios
export const pedidos = []
for (let m = 0; m < 24; m++) {
  const ano = 2025 + Math.floor(m / 12)
  const mes = m % 12
  const n = 35 + Math.floor(r() * 30) + m
  for (let i = 0; i < n; i++) {
    const p = produtos[Math.floor(r() * produtos.length)]
    const qtd = 10 + Math.floor(r() * 400)
    const unit = { RC: 180, RR: 150, RI: 260, RA: 420, TB: 3800, SP: 520 }[p.id] * (0.85 + r() * 0.3)
    pedidos.push({
      id: `PED-${ano}${String(mes + 1).padStart(2, '0')}-${i + 1}`,
      data: new Date(ano, mes, 1 + Math.floor(r() * 28)),
      ano, mes,
      produto: p.nome,
      regiao: regioes[Math.floor(Math.pow(r(), 1.6) * regioes.length)],
      segmento: segmentos[Math.floor(r() * segmentos.length)],
      quantidade: p.id === 'TB' ? Math.ceil(qtd / 40) : qtd,
      valor: 0,
      status: r() < 0.82 ? 'Faturado' : r() < 0.6 ? 'Em produção' : 'Cancelado',
    })
    const ped = pedidos[pedidos.length - 1]
    ped.valor = Math.round(ped.quantidade * unit)
  }
}

// Tráfego do site rollerport.com.br por mês
export const trafego = Array.from({ length: 24 }, (_, m) => {
  const visitas = Math.round(5200 + m * 180 + r() * 1500)
  const orcamentos = Math.round(visitas * (0.018 + r() * 0.012))
  return {
    ano: 2025 + Math.floor(m / 12),
    mes: m % 12,
    label: `${MESES[m % 12]}/${String(25 + Math.floor(m / 12))}`,
    visitas,
    usuarios: Math.round(visitas * 0.72),
    orcamentos,
    whatsapp: Math.round(orcamentos * (0.8 + r() * 0.6)),
    rejeicao: +(38 + r() * 14).toFixed(1),
    canais: canais.map((c, i) => ({ canal: c, visitas: Math.round(visitas * [0.42, 0.22, 0.16, 0.09, 0.07, 0.04][i] * (0.85 + r() * 0.3)) })),
  }
})

export const paginas = [
  { pagina: '/', titulo: 'Home', visitas: 0.28 },
  { pagina: '/produtos/roletes', titulo: 'Roletes', visitas: 0.19 },
  { pagina: '/produtos/tambores', titulo: 'Tambores', visitas: 0.11 },
  { pagina: '/orcamento', titulo: 'Solicitar orçamento', visitas: 0.09 },
  { pagina: '/produtos/roletes-impacto', titulo: 'Roletes de Impacto', visitas: 0.08 },
  { pagina: '/empresa', titulo: 'A empresa', visitas: 0.06 },
  { pagina: '/contato', titulo: 'Contato', visitas: 0.05 },
  { pagina: '/blog', titulo: 'Blog', visitas: 0.04 },
]

export { MESES }
