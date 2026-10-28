/* Shared, deterministic bibliographic identity and authorship rules. */
(function(root) {
  'use strict';
  const stop = new Set(['DA','DE','DO','DOS','DAS','DEL','DI']);
  const norm = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,' ').trim().toUpperCase();
  const tokens = value => norm(value).split(/\s+/).filter(v=>v && !stop.has(v));
  const aliases = {
    'PEDRO PINHEIRO PAES NETO': [['PINHEIRO PAES','PEDRO'],['PAES','PEDRO PINHEIRO'],['PAES NETO','PEDRO PINHEIRO'],['PAES','PEDRO']],
    'OZEAS LIMA LINS FILHO': [['LINS FILHO','OZEAS LIMA'],['LINS FILHO','OZEAS'],['LINS FILHO','ODL']],
    'DANIELA KARINA SILVA FERREIRA': [['FERREIRA','DANIELA KARINA SILVA'],['SILVA FERREIRA','DANIELA KARINA'],['FERREIRA','DANIELA']],
    'ANDRE SANTOS COSTA': [['COSTA','ANDRE SANTOS'],['SANTOS COSTA','ANDRE']],
    'TONY MEIRELES SANTOS': [['SANTOS','TONY MEIRELES'],['SANTOS','TONY']],
    // Crossref ORCID 0000-0002-4402-1984, corroborated by UFSC's journal author record.
    'SAULO FERNANDES MELO OLIVEIRA': [['MELO','SAULO']],
    'LEONARDO GOMES OLIVEIRA LUZ': [['LUZ','LEONARDO GOMES OLIVEIRA'],['OLIVEIRA LUZ','LEONARDO GOMES']],
  };
  function authorMatches(author, docente) {
    author=String(author || '').replace(/\((?:org|ed)s?\.?\)/gi,'').trim();
    const expected=tokens(docente), a=tokens(author), full=expected.join(' ');
    if (!a.length || !expected.length || /\bET\s*AL\b/.test(norm(author))) return false;
    if (a.join(' ')===full) return true;
    let family,given;
    if (String(author).includes(',')) {
      const [f,...g]=String(author).split(','); family=tokens(f);given=tokens(g.join(' '));
    } else {
      // Family + initials, e.g. "Santos TM". Never accept family alone.
      const m=String(author).trim().match(/^(.*?)\s+([A-Z](?:[.\s]*[A-Z]){0,6})\.?$/);
      if (!m) return false;
      family=tokens(m[1]);given=tokens(m[2]);
    }
    if (!given.length) return false;
    const suffix=['FILHO','JUNIOR','NETO'].includes(expected.at(-1))?2:1;
    const profiles=[...(aliases[full] || []), ...expected.slice(1).map((_,i)=>[expected.slice(i+1).join(' '),expected.slice(0,i+1).join(' ')])];
    return profiles.some(([f,g])=> {
      if (family.join(' ')!==f) return false;
      const target=tokens(g), initials=target.map(t=>t[0]).join('');
      // Initial strings are exact; a shared surname/first character is insufficient.
      const rawGiven=given.join('');
      if (rawGiven===g && g==='ODL') return true;
      if (given.every(t=>t.length===1) || (given.length===1 && rawGiven.length<=4 && rawGiven===initials)) return rawGiven===initials;
      if (given[0]!==target[0]) return false;
      return given.every((t,i)=>target[i] && (t===target[i] || (t.length===1 && target[i][0]===t)));
    });
  }
  function authors(item) {
    const explicit=String(item.autores || '').trim();
    return explicit ? explicit.split(';').map(s=>s.trim()).filter(s=>s && !/^et\W*al\W*$/i.test(s)) : [];
  }
  function position(item) {
    const names=authors(item), matches=names.map((a,i)=>authorMatches(a,item.docente)?i:-1).filter(i=>i>=0);
    const truncated=/\bet\W*al\b/i.test(String(item.autores || ''));
    if (matches.length!==1) return {count:truncated?null:(names.length || null), position:null, score:null, status:matches.length?'ambigua':'nao_identificada'};
    const i=matches[0], n=names.length;
    if (truncated && i>1) return {count:null, position:i+1, score:null, status:'lista_truncada'};
    const score=i===0 || (!truncated && i===n-1)?1:i===1 || (!truncated && i===n-2)?.5:.1;
    return {count:truncated?null:n, position:i+1, score, status:truncated?'posicao_inicial_em_lista_parcial':'identificada'};
  }
  function productKey(item) {
    if (item.produto_id) return item.produto_id;
    if (item.doi_status==='conferido_crossref' && item.doi) return 'doi:'+item.doi.toLowerCase().trim();
    return ['titulo',norm(item.titulo),item.ano,item.tipo_producao].join('|');
  }
  function facultyInProduct(item, faculty) {
    const found=new Set([item.docente]);
    for (const docente of faculty) if (authors(item).some(a=>authorMatches(a,docente))) found.add(docente);
    return [...found].sort();
  }
  function indexing(rows) {
    const articles=rows.filter(r=>r.tipo_producao==='artigo');
    const unique=[...new Map(articles.map(r=>[productKey(r),r])).values()];
    return {articles:unique.length, wos:unique.filter(r=>r.wos_periodico_status==='corroborado_fonte_editorial').length,
      scopus:unique.filter(r=>r.scopus_periodico_status==='corroborado_fonte_editorial').length,
      scopusDeclared:unique.filter(r=>r.scopus_periodico_status==='informado_base_local').length,
      wosPending:unique.filter(r=>r.wos_periodico_status!=='corroborado_fonte_editorial').length,
      doi:unique.filter(r=>r.doi_status==='conferido_crossref').length};
  }
  const api={norm,authorMatches,authors,position,productKey,facultyInProduct,indexing};
  if (typeof module==='object' && module.exports) module.exports=api;
  else root.Cienciometria=api;
})(typeof window==='object'?window:globalThis);
