# Relatórios Rollerport

Dashboard de relatórios para [rollerport.com.br](https://rollerport.com.br) — React + Vite + Recharts.

## Relatórios
- **Visão geral** – KPIs (faturamento, pedidos, ticket médio, visitas, orçamentos) e tendências
- **Vendas** – faturamento e pedidos por mês, resumo mensal
- **Produtos** – faturamento, unidades e participação por linha (roletes, tambores, suportes)
- **Regiões e segmentos** – faturamento por região e segmento de cliente
- **Site e marketing** – visitas, leads (formulário/WhatsApp), conversão, origem do tráfego, páginas
- **Pedidos** – lista pesquisável e paginada

Filtros por período, região e produto; exportação CSV; tema claro/escuro; layout responsivo.

## Uso
```bash
npm install
npm run dev      # desenvolvimento
npm run build    # gera dist/ para publicar
```

## Dados
Os dados em `src/data/mockData.js` são **de exemplo**. Substitua pelas fontes reais
(ERP/planilha de pedidos, Google Analytics 4, CRM) mantendo o mesmo formato.
