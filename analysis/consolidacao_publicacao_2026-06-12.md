## Consolidacao de Publicacao - 2026-06-12

Objetivo executado:
- congelar o `publish_clone` como referencia operacional temporaria
- tratar o repositorio principal como unica trilha de consolidacao daqui em diante

Estado confirmado:
- o fluxo documentado de publicacao continua sendo `master` via GitHub Pages
- o site publicado mais recente esta em `origin/master` com o commit `d399c04`
- a branch ativa de desenvolvimento continua sendo `codex/publish-turmas`
- o commit local `41eb7c6` ainda nao foi enviado para `origin/codex/publish-turmas`

Convergencia validada:
- os arquivos abaixo estao identicos entre o repositorio principal e o `publish_clone` no estado local atual:
  - `dashboard/producao-cientifica-data.js`
  - `data/producao_cientifica.csv`
  - `data/producao_cientifica.json`
  - `scripts/sync_indexacao_periodicos_csv.py`
- conclusao: a rodada atual de sincronizacao da producao cientifica ja esta consolidada no repositorio principal; o `publish_clone` nao adiciona conteudo exclusivo nesses arquivos

Divergencias que permanecem apenas no repositorio principal:
- `dashboard/producao-cientifica.html`
- `dashboard/corpo-docente-data.js`
- `analysis/sincronizacao_indexacao_periodicos_report.json`

Leitura tecnica das divergencias remanescentes:
- `dashboard/producao-cientifica.html`
  - houve reestruturacao forte da aba de docentes, com nova UI, novos filtros e nova amarracao de renderizacao
- `dashboard/corpo-docente-data.js`
  - houve mudanca do dataset embarcado do corpo docente, com serie historica maior e novo conjunto de issues
- `analysis/sincronizacao_indexacao_periodicos_report.json`
  - o relatorio indica rodada incremental recente: `472` artigos casados, `4` atualizacoes aplicadas e `12` nao casados

Riscos ainda abertos antes da promocao para `master`:
- risco de publicar HTML de docentes sem validar compatibilidade final com o dataset embarcado
- risco de manter dois fluxos ativos por habito operacional, mesmo com os arquivos principais ja convergidos
- risco de perder rastreabilidade se novas edicoes continuarem no `publish_clone`

Medidas praticas aplicadas nesta consolidacao:
- `publish_clone/` foi marcado no `.gitignore` do repositorio principal para sair do fluxo normal de status
- `tmp_corpo_docente.xlsx` foi marcado no `.gitignore` do repositorio principal para sair do fluxo normal de status

Proximo passo recomendado:
- concluir a validacao do pacote `docentes` no repositorio principal
- depois promover uma unica trilha consolidada para `master`
