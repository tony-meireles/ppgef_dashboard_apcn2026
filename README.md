# PPGEF Dashboard

Dashboard estatico para publicacao da producao cientifica, producao tecnica e orientacoes do PPGEF.

## Estrutura

- `dashboard/`: paginas HTML e datasets embarcados em JavaScript para o site.
- `data/`: bases exportadas em JSON/CSV usadas como referencia e download.
- `analysis/`: diagnosticos e comparacoes geradas durante a consolidacao dos dados.
- `scripts/`: rotinas de preparo e classificacao.

## Publicacao no GitHub Pages

### Fluxo recomendado

O fluxo antigo de publicar a branch `master` manualmente gerou divergencia entre:

- branch de desenvolvimento
- branch realmente publicada
- worktrees e clones auxiliares usados para promocao

Para eliminar esse problema, o repositório agora inclui o workflow:

- `.github/workflows/deploy-pages.yml`

Esse workflow publica o site automaticamente quando houver push na branch:

- `codex/publish-turmas`

### Migracao necessaria no GitHub

Uma unica vez, no repositório do GitHub:

1. Abrir `Settings > Pages`
2. Em `Build and deployment`, trocar `Source` para `GitHub Actions`
3. Manter `codex/publish-turmas` como a unica branch operacional de publicacao

### Resultado esperado

Depois dessa migracao:

- alteracao commitada e enviada para `codex/publish-turmas` vira deploy
- deixa de existir promocao manual obrigatoria para `master`
- o site publicado passa a refletir diretamente a branch de trabalho escolhida
- clones auxiliares e worktrees de publicacao devem permanecer fora do workspace operacional

### Fluxo que deve parar de ser usado

Evitar daqui em diante:

- publicar manualmente pela `master`
- usar clones ou worktrees paralelos para “fechar” publicacao
- tratar `master` como branch intermediaria de deploy
- recriar pastas locais como `publish_clone/` ou `tmp-publish-master/` para testar publicacao

Ao abrir a raiz do site, `index.html` redireciona para `dashboard/producao-cientifica.html`.

## Observacoes

- A producao tecnica continua vinculada ao fluxo original em SQLite; os artefatos publicados podem ser atualizados a partir da nova base sem trocar o tipo de banco.
- O dashboard publicado consome os dados embarcados em `dashboard/*.js` e mantem links para downloads em `data/`.

## Recorte atual do corpo docente

Antes de publicar nova importacao, execute `python scripts/apply_current_cohort.py`.
O script retira Clarice Maria de Lucena Martins, Paulo Felipe Ribeiro Bandeira,
Fabio Nakamura e Joao Carlos Bouzas Marins do corpo docente e da producao
exibida, e recalcula os agregados do corpo docente. Orientacoes, disciplinas,
captacao e outros registros historicos de atividades permanecem no painel.
Daniela Karina da Silva Ferreira e permanente a partir de 2026, inclusive na
projecao de 2027-2028, e atua como permanente apenas no PPGEF. O historico
de 2024-2025 continua como temporaria.
Na aba Orientacoes, os indicadores e as tabelas principais usam apenas o corpo
docente atual, com nomes em ordem alfabetica; orientacoes de ex-docentes ficam
visiveis em uma secao historica separada.
Na aba Captacao de Recursos, `data/captacao_recursos.csv` espelha a aba
`Respostas ao formulário 1` da planilha
`https://docs.google.com/spreadsheets/d/19PhpY6GXENm0QvbOBRSZ4FyJf7doslUHGq13d8teC-I`.
O script `python scripts/sync_captacao_recursos_from_csv.py` gera
`dashboard/captacao-recursos-data.js`. A carteira geral mostra os registros
informados no recorte 2022-2026; a secao de criterios criticos considera
somente os classificados como `Elegível pelo objeto` no item 4.2. A versao
sincronizada em 28/10/2026 tem 78 registros na planilha, dos quais 76 entram
no recorte temporal. A planilha atual nao contem os tres registros anteriores
de Paulo Felipe; o historico deles permanece no Git.
Os CSVs intermediarios `data/producao_cientifica_v2026-06-10-*.csv` sao
fontes de auditoria e nao alimentam diretamente as abas publicadas.

## Producao cientifica de Daniela (atualizacao de 28/10/2026)

`data/daniela_producao_2026.json` registra os 13 artigos informados pela docente,
com DOI e indexacao confirmados onde havia fonte primaria acessivel. Execute
`python scripts/reconcile_daniela_producao.py` depois de qualquer importacao
cientifica e antes de `python scripts/apply_current_cohort.py`; a reconciliacao
preserva o capitulo de livro de 2022 ja existente na base. O painel dos
criterios de produtividade usa uma simulacao interna: 15 permanentes de 2026,
ate cinco produtos de 2022-2026 por docente, selecionados pelos maiores pontos,
e dois artigos WoS/Scopus como aproximacao do segundo indicador. Esse segundo
indicador ainda exige conferencia da classificacao formal no Documento
Orientador de APCN da Area 21 publicado em junho de 2026 e da selecao efetiva
na Sucupira. Os artigos historicos de 2018-2021 permanecem consultaveis na
producao cientifica, mas nao entram nessa janela de simulacao.
