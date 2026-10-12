# Relatórios Rollerport

Dashboard de desempenho de busca orgânica de [rollerport.com.br](https://rollerport.com.br),
a partir dos exports do **Google Search Console**. React + Vite + Recharts.

## Relatórios
- **Visão geral** – cliques, impressões, CTR e posição média, com evolução diária/semanal e comparação de períodos; marca x busca genérica
- **Consultas** – todas as consultas, com busca, filtro marca/genérica e ordenação
- **Oportunidades SEO** – termos na 1ª página com CTR baixo e termos quase na 1ª página
- **Perfil no Google** – visualizações, rotas, ligações, cliques para o site e termos de pesquisa do Perfil da Empresa (dados em `src/data/perfilEmpresa.js`)
- **Instagram** – visualizações, alcance, interações, visitas, seguidores e cliques no link (importa os CSVs exportados do Meta Business Suite)
- **Páginas**, **Dispositivos**, **Países**

Exportação CSV em todas as tabelas, tema claro/escuro, layout responsivo.

## Atualizar os dados
1. No Search Console: *Desempenho > Resultados da pesquisa > Exportar > Fazer o download do CSV* e extraia o ZIP.
2. Opção A (temporária): clique em **Importar CSVs** no dashboard e selecione os arquivos.
3. Opção B (permanente): substitua os arquivos em `src/data/gsc/` e rode `npm run build`.

O tipo de cada arquivo é reconhecido pelo cabeçalho, então o nome do arquivo não importa.

## Uso
```bash
npm install
npm run dev      # desenvolvimento
npm run build    # gera dist/ para publicar
```
