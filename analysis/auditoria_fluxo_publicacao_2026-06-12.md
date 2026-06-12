## Auditoria do Problema de Publicacao

Data: 2026-06-12

### Sintoma observado

Alteracoes feitas no repositório nao se manifestam de forma direta e previsivel no site publicado.

### Causas encontradas

1. A branch de desenvolvimento e a branch publicada nao eram a mesma.
   - Desenvolvimento ativo em `codex/publish-turmas`
   - Publicacao historica em `master`

2. O repositório acumulou fluxos paralelos de promocao.
   - worktree local `PPGEF - DashBorad-master-publish`
   - worktrees temporarios em `%TEMP%`
   - clone auxiliar `publish_clone/`

3. Nao existia automacao de deploy.
   - o repositório nao tinha `.github/workflows/`
   - a publicacao dependia de promocao manual entre branches

4. Houve necessidade recorrente de cache busting manual.
   - versoes `?v=2026-06-12f` e `?v=2026-06-12g` no HTML
   - isso tratava o sintoma de cache, mas nao o problema estrutural de publicacao

5. O trabalho local ficou vulneravel a herancas e divergencias.
   - stashs antigos
   - worktrees desatualizados
   - arquivos gerados fora do fluxo principal

### Diagnostico objetivo

O problema principal nao era “o site demora a atualizar”.

O problema principal era:

- falta de fonte unica de verdade para publicacao
- deploy manual entre branches divergentes
- excesso de trilhas paralelas para chegar ao mesmo site

### Solucao aplicada no repositório

Foi adicionada a automacao:

- `.github/workflows/deploy-pages.yml`

Com esse modelo, a publicacao passa a ser disparada por push em:

- `codex/publish-turmas`

### Solucao operacional recomendada

1. Configurar no GitHub Pages a opcao `Source = GitHub Actions`
2. Tratar `codex/publish-turmas` como branch unica de publicacao
3. Parar de promover manualmente para `master`
4. Manter `master` apenas como legado, referencia historica ou abandonar seu uso no deploy

### Efeito esperado

Depois da mudanca:

- `git commit`
- `git push origin codex/publish-turmas`

passa a ser o caminho normal para alterar o site publicado.

### Risco residual

Se o GitHub continuar configurado em `Deploy from a branch`, o workflow novo nao resolvera sozinho.

A mudanca de `Settings > Pages > Source` para `GitHub Actions` ainda precisa ser feita uma vez no repositório remoto.
