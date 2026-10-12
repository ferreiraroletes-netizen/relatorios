// Explicações em linguagem simples. A chave é o título exibido no indicador.
export const AJUDA = {
  // Search Console (Google Pesquisa → site)
  Cliques: 'Quantas vezes alguém clicou no site da Rollerport nos resultados do Google.',
  'Impressões': 'Quantas vezes o site apareceu nos resultados do Google, mesmo que a pessoa não tenha clicado.',
  'CTR médio': 'De cada 100 vezes que o site apareceu no Google, quantas viraram clique. Quanto maior, melhor.',
  'Posição média': 'Em que lugar o site costuma aparecer no Google. 1 é o primeiro resultado; até 10 é a 1ª página. Quanto menor, melhor.',

  // Perfil da Empresa no Google (ficha no Google/Maps)
  'Visualizações do perfil': 'Quantas pessoas viram a ficha da Rollerport no Google ou no Google Maps.',
  'Pesquisas que exibiram o perfil': 'Quantas buscas no Google mostraram a ficha da empresa.',
  'Interações totais': 'Soma das ações feitas na ficha: pedir rota, clicar no site e ligar.',
  'Taxa de interação': 'De cada 100 pessoas que viram a ficha, quantas fizeram alguma ação.',
  'Solicitações de rota': 'Quantas pessoas pediram ao Google o caminho até a fábrica.',
  'Cliques para o site': 'Quantas pessoas saíram da ficha do Google e entraram no site.',
  'Ligações': 'Quantas pessoas ligaram para a empresa pelo botão da ficha do Google.',
  // Instagram
  'Visualizações (Instagram)': 'Quantas vezes as publicações e o perfil foram exibidos na tela. A mesma pessoa pode contar mais de uma vez.',
  'Visualizações (Facebook)': 'Quantas vezes as publicações e a página do Facebook foram exibidas na tela.',
  'Visualizações (YouTube)': 'Quantas vezes os vídeos do canal foram assistidos.',
  'Tempo assistido': 'Soma do tempo que as pessoas passaram assistindo aos vídeos.',
  'Novos inscritos': 'Quantas pessoas se inscreveram no canal para acompanhar os vídeos.',
  'Impressões da miniatura': 'Quantas vezes a capa (miniatura) de um vídeo apareceu para alguém no YouTube.',
  'CTR da miniatura': 'De cada 100 vezes que a capa apareceu, quantas pessoas clicaram para assistir.',
  'Contas alcançadas': 'Quantas contas diferentes viram algum conteúdo. Cada pessoa conta uma vez por dia.',
  'Interações com o conteúdo': 'Curtidas, comentários, compartilhamentos e salvamentos. Valores negativos significam curtidas desfeitas.',
  'Visitas ao perfil': 'Quantas vezes alguém abriu a página do perfil @ da empresa.',
  'Novos seguidores': 'Quantas pessoas começaram a seguir a empresa no período.',
  'Cliques no link': 'Quantas pessoas clicaram no link da bio (ex.: link para o site).',
  'Média mensal de interações': 'Média de ações por mês, sem contar o mês atual (ainda incompleto).',
}

export const GLOSSARIO = [
  {
    grupo: 'De onde vêm os dados',
    itens: [
      ['Google Search Console', 'Ferramenta gratuita do Google que mostra como o site rollerport.com.br aparece nas pesquisas: quantas vezes foi exibido, quantos cliques recebeu e com quais palavras.'],
      ['Perfil da Empresa no Google', 'É a "ficha" da Rollerport que aparece no Google e no Google Maps, com endereço, telefone, fotos e botão de rota (antigo Google Meu Negócio).'],
    ],
  },
  {
    grupo: 'Indicadores do site (Search Console)',
    itens: [
      ['Impressões', 'Cada vez que o site aparece na tela de alguém nos resultados do Google. Ex.: 1.959 impressões = o site apareceu 1.959 vezes.'],
      ['Cliques', 'Cada vez que a pessoa clicou e entrou no site.'],
      ['CTR (taxa de cliques)', 'Cliques ÷ impressões. Ex.: CTR de 9% = de cada 100 pessoas que viram o site no Google, 9 clicaram. Um CTR baixo indica que o título/descrição do site no Google não está atraindo cliques.'],
      ['Posição média', 'O lugar médio em que o site aparece no Google. Posição 1 = primeiro resultado. Até 10 = primeira página. Acima de 10 = segunda página em diante, onde quase ninguém clica.'],
      ['Consulta', 'A palavra ou frase que a pessoa digitou no Google (ex.: "roletes para esteira").'],
      ['Busca de marca', 'Pesquisas com o nome da empresa (ex.: "rollerport", "ferreira roletes"). São pessoas que já conhecem a empresa.'],
      ['Busca genérica', 'Pesquisas pelo produto, sem citar a empresa (ex.: "rolete", "fábrica de roletes"). São clientes novos — é onde está o maior potencial de crescimento.'],
      ['Oportunidade SEO', 'Palavra em que o site já aparece bem no Google, mas recebe poucos cliques, ou que está quase chegando à 1ª página. SEO = melhorar o site para aparecer melhor no Google.'],
    ],
  },
  {
    grupo: 'Indicadores da ficha no Google (Perfil da Empresa)',
    itens: [
      ['Visualizações', 'Quantas pessoas viram a ficha da empresa no Google ou no Maps.'],
      ['Interações', 'Ações feitas na ficha: pedir rota, clicar para o site ou ligar.'],
      ['Solicitação de rota', 'A pessoa pediu o caminho até a fábrica no Google Maps — normalmente alguém indo buscar ou visitar.'],
      ['Taxa de interação', 'Interações ÷ visualizações. Mostra quantos, de cada 100 que viram a ficha, fizeram alguma ação.'],
    ],
  },
  {
    grupo: 'Indicadores do Instagram',
    itens: [
      ['Visualizações', 'Quantas vezes o conteúdo apareceu na tela. Se a mesma pessoa vê 3 vezes, conta 3.'],
      ['Alcance', 'Quantas pessoas diferentes viram o conteúdo. É sempre menor ou igual às visualizações.'],
      ['Interações', 'Curtidas, comentários, compartilhamentos e salvamentos. Mostra se o conteúdo despertou interesse.'],
      ['Taxa de engajamento', 'Interações ÷ alcance. De cada 100 pessoas que viram, quantas reagiram.'],
      ['Visitas ao perfil', 'Pessoas que abriram a página da empresa no Instagram, geralmente para conhecer mais.'],
      ['Cliques no link', 'Pessoas que clicaram no link da bio e foram para o site ou WhatsApp.'],
    ],
  },
  {
    grupo: 'Indicadores do YouTube',
    itens: [
      ['Visualizações', 'Quantas vezes os vídeos foram assistidos.'],
      ['Tempo de exibição', 'Soma do tempo assistido. O YouTube valoriza mais vídeos assistidos por mais tempo.'],
      ['Miniatura', 'A imagem de capa do vídeo, que aparece antes de a pessoa clicar.'],
      ['Impressões da miniatura', 'Quantas vezes a capa apareceu na tela de alguém (na busca, na página inicial ou em sugestões).'],
      ['CTR da miniatura', 'Cliques ÷ impressões da capa. Entre 4% e 10% é o normal.'],
      ['Inscritos', 'Pessoas que seguem o canal e são avisadas de vídeos novos.'],
    ],
  },
  {
    grupo: 'Como usar o painel',
    itens: [
      ['Setas verdes/vermelhas', 'Comparam com o período anterior. Verde = melhorou; vermelho = piorou. Na posição média, cair o número é bom (verde).'],
      ['Filtro de período', 'Na Visão geral, escolha ver os últimos 7 dias, 28 dias ou o período completo.'],
      ['Botão CSV', 'Baixa a tabela para abrir no Excel.'],
      ['Clique no título da coluna', 'Ordena a tabela por aquela coluna.'],
    ],
  },
]
