const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),C=require('../dashboard/cienciometria-core.js');
const rows=JSON.parse(fs.readFileSync('data/producao_cientifica.json','utf8'));
const html=fs.readFileSync('dashboard/producao-cientifica.html','utf8');
for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) if(m[1].trim())new vm.Script(m[1]);
const ctx={window:{},Cienciometria:C};vm.createContext(ctx);
for(const f of ['producao-cientifica-data.js','orientacoes-data.js','corpo-docente-data.js'])vm.runInContext(fs.readFileSync('dashboard/'+f,'utf8'),ctx);
assert.equal(JSON.stringify(rows),JSON.stringify(ctx.window.PRODUCAO_CIENTIFICA));
assert.equal(rows.length,428);assert.equal(new Set(rows.map(r=>r.docente)).size,16);
assert.equal(new Set(rows.map(r=>r.docente+'|'+C.productKey(r))).size,rows.length);
const doiTitles=new Map();for(const r of rows.filter(r=>r.doi_status==='conferido_crossref')){const key=r.doi;const value=C.norm(r.titulo);if(doiTitles.has(key))assert.equal(value,doiTitles.get(key));doiTitles.set(key,value);}
assert.equal(C.authorMatches('Santos, L. E. R.','Tony Meireles dos Santos'),false);
assert.equal(C.authorMatches('Santos, E. L.','Tony Meireles dos Santos'),false);
assert.equal(C.authorMatches('Santos, T. M.','Tony Meireles dos Santos'),true);
assert.equal(C.authorMatches('Pinheiro Paes, Pedro','Pedro Pinheiro Paes Neto'),true);
assert.equal(C.authorMatches('Melo, Saulo','Saulo Fernandes Melo de Oliveira'),true);
assert.equal(C.position({docente:'Tony Meireles dos Santos',autores:'Pessoa, A.; Pessoa, B.; Santos, T. M.; et al.'}).score,null);
assert.equal(C.position({docente:'Tony Meireles dos Santos',autores:'Pessoa, A.; Santos, T. M.; et al.'}).score,.5);
assert.equal(C.position({docente:'Tony Meireles dos Santos',autores:'Pessoa, A.; Santos, E. L.'}).score,null);
const q=rows.filter(r=>+r.ano>=2021&&+r.ano<=2025);assert.equal(q.length,373);assert.equal(new Set(q.map(C.productKey)).size,318);
assert.equal(C.indexing(q).wos,47);assert.equal(C.indexing(rows).wos,53);
function extract(name){const start=html.indexOf('    function '+name+'(');assert(start>=0,name);return html.slice(start,html.indexOf('\n    function ',start+10));}
for(const n of ['normalizeText','normalizePersonText','authorMatchesDocente','getLeadershipProductKey','inferScientificAuthors','getCoauthorNames','buildLeadershipProductGroups','aggregateLeadershipPartnershipByDocente','buildLeadershipPartnershipNetwork','getMostardScore','aggregateMostardByYear','getPermanentOrientationData','aggregateOrientationCriticalCriteria','renderOrientationCriticalCriteriaPanel'])vm.runInContext(extract(n),ctx);
ctx.rows=rows;ctx.q=q;
vm.runInContext(`const g=buildLeadershipProductGroups(q);const n=buildLeadershipPartnershipNetwork(aggregateLeadershipPartnershipByDocente(q,g),g);result={edges:n.edges.length,groups:g.size,years:aggregateMostardByYear(q)};`,ctx);
assert.equal(ctx.result.edges,27);assert.equal(ctx.result.groups,318);assert.equal(ctx.result.years.reduce((s,r)=>s+r.pendentes,0),10);
function hasPair(a,b,start,end){return rows.filter(r=>+r.ano>=start&&+r.ano<=end&&r.docentes_internos.includes(a)&&r.docentes_internos.includes(b)).map(C.productKey);}
const dan='Daniela Karina da Silva Ferreira',oz='Ozeas de Lima Lins Filho',tony='Tony Meireles dos Santos';
assert.equal(new Set(hasPair(dan,oz,2026,2026)).size,2);
assert.equal(new Set(hasPair(oz,tony,2018,2020)).size,2);
assert.equal(hasPair(oz,tony,2021,2026).length,0);
// Run the actual panel entrypoint with the same source normalization as the page.
vm.runInContext(html.slice(html.indexOf('    const dataSource ='),html.indexOf('    const orientacoesHistoricas =')),ctx);
const elements=new Map();ctx.document={getElementById(id){if(!elements.has(id))elements.set(id,{});return elements.get(id);}};
ctx.renderOrientationCriteriaChart=()=>{};
vm.runInContext('orient=getPermanentOrientationData(); orientation=aggregateOrientationCriticalCriteria(orient); renderOrientationCriticalCriteriaPanel();',ctx);
assert.equal(ctx.orientation.totalDocentes,15);
assert.equal(ctx.orientation.doutoradoAtendidos,4);assert.equal(ctx.orientation.mestradoAtendidos,13);assert.equal(ctx.orientation.graduacaoAtendidos,15);
assert.equal(elements.get('orient-crit-docentes-total').textContent,'15');
assert.equal(elements.get('orient-crit-mestrado-total').textContent,'13');
assert.equal(elements.get('orient-crit-doutorado-total').textContent,'4');
const rafael=ctx.orient.find(r=>r.docente.startsWith('Rafael'));assert.equal(rafael.doutorado_concluidas_principal,1);assert.equal(rafael.doutorado_andamento_principal,4);
console.log('PASS: export parity, identity, DOI consistency, author ambiguity, missing-data semantics, temporal networks and four doctoral supervisors.');
