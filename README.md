# PPGEF Dashboard

Dashboard estatico para publicacao da producao cientifica, producao tecnica e orientacoes do PPGEF.

## Estrutura

- `dashboard/`: paginas HTML e datasets embarcados em JavaScript para o site.
- `data/`: bases exportadas em JSON/CSV usadas como referencia e download.
- `analysis/`: diagnosticos e comparacoes geradas durante a consolidacao dos dados.
- `scripts/`: rotinas de preparo e classificacao.

## Publicacao no GitHub Pages

1. Criar um repositorio no GitHub.
2. Adicionar o remoto `origin`.
3. Fazer `push` da branch principal.
4. No GitHub, habilitar Pages a partir de `Deploy from a branch`, usando a branch `master` e a pasta `/ (root)`.

Ao abrir a raiz do site, `index.html` redireciona para `dashboard/producao-cientifica.html`.

## Observacoes

- A producao tecnica continua vinculada ao fluxo original em SQLite; os artefatos publicados podem ser atualizados a partir da nova base sem trocar o tipo de banco.
- O dashboard publicado consome os dados embarcados em `dashboard/*.js` e mantem links para downloads em `data/`.

## Recorte atual do corpo docente

Antes de publicar uma nova importacao, execute `python scripts/apply_current_cohort.py`.
O script retira Clarice Maria de Lucena Martins, Paulo Felipe Ribeiro Bandeira,
Fabio Nakamura e Joao Carlos Bouzas Marins do corpo docente e das bases de
producao exibidas, e recalcula todos os agregados do corpo docente. Registros
historicos de atividades (orientacoes e disciplinas) permanecem no painel.
Os arquivos intermediarios `data/producao_cientifica_v2026-06-10-*.csv` sao
fontes de auditoria; nao alimentam diretamente as abas publicadas.
