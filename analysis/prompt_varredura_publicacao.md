Use este prompt sempre que quiser uma auditoria critica de publicacao do site:

```text
Faça uma varredura critica e autonoma deste repositório para identificar tudo que foi produzido, alterado ou preparado para o site, mas ainda nao foi efetivamente publicado.

Objetivo:
- detectar pendencias reais de publicacao
- encontrar herancas perdidas de tentativas anteriores
- separar o que esta apenas local, o que esta commitado mas nao enviado, o que esta em branch errada e o que provavelmente nunca chegou ao GitHub Pages

Execute sem me perguntar coisas obvias. Tome a iniciativa de inspecionar o repositório inteiro e me devolva um diagnostico objetivo.

Checklist obrigatorio:
1. Verificar `git status --short --branch` no repositório principal.
2. Verificar `git branch -vv` e apontar:
   - branch atual
   - se ha commits `ahead`
   - se o trabalho esta em branch diferente da branch real de publicacao
3. Verificar `git remote -v`.
4. Verificar os ultimos commits com `git log --oneline --decorate -n 15`.
5. Comparar a branch atual com a branch de publicacao efetiva do site e dizer se o conteudo do site publicado pode estar defasado.
6. Procurar clones paralelos, pastas de publicacao auxiliares ou residuos de tentativas anteriores, como `publish_clone/`, e inspecionar o `git status` delas.
7. Listar arquivos modificados, nao rastreados e scripts novos que impactam publicacao, principalmente em:
   - `dashboard/`
   - `data/`
   - `scripts/`
   - `analysis/`
8. Identificar artefatos gerados que podem ter sido esquecidos fora do fluxo de publicacao.
9. Apontar inconsistencias entre:
   - HTML publicado
   - datasets embarcados em `dashboard/*.js`
   - bases em `data/`
   - scripts criados para sincronizacao
10. Dizer explicitamente se ha risco de:
   - mudanca pronta mas nao commitada
   - commit feito mas nao enviado
   - commit enviado em branch que nao publica o site
   - clone paralelo contendo a versao mais atual
   - reversao acidental de tela ou aba do dashboard

Quero a resposta neste formato:

1. Estado atual
- resumo em 3 a 6 linhas

2. Pendencias criticas
- liste apenas problemas reais, em ordem de severidade
- para cada item, informe:
  - evidencia objetiva
  - impacto na publicacao
  - acao recomendada
  - confianca da analise em percentual

3. Coisas produzidas e nao publicadas
- liste arquivos, commits, branches ou clones que indicam trabalho pronto ou semi-pronto fora da publicacao

4. Herancas perdidas ou tentativas anteriores
- aponte residuos, duplicacoes, clones, scripts soltos, arquivos orfaos ou mudancas contraditorias

5. Decisao recomendada
- me entregue no final apenas opcoes numeradas, se houver decisao necessaria
- use este formato:
  1. opcao mais recomendada - XX%
  2. segunda opcao - YY%
- recomende qual executar

6. Se nao houver decisao minha necessaria
- finalize com uma lista curta de proximos passos executaveis imediatamente

Importante:
- nao invente fluxo de deploy; confirme com base no repositorio
- se o README disser uma branch de publicacao e o trabalho estiver em outra, trate isso como alerta critico
- se houver pasta clone local com mudancas diferentes do repositório principal, trate isso como risco de perda de trabalho
- seja rigoroso com sinais de regressao visual, abas esvaziadas, datasets divergentes e scripts criados mas nao incorporados ao fluxo
```
