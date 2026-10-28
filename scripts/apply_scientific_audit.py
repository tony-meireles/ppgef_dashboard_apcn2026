"""Reapply reviewed corrections after imports; refuse identity drift instead of losing history."""
import csv, json, pathlib
from collections import Counter, defaultdict
ROOT=pathlib.Path(__file__).resolve().parents[1]
def reconcile(rows):
    path=ROOT/'data/cienciometria_correcoes_2026.json'
    if not path.exists(): return rows
    corrections=json.loads(path.read_text(encoding='utf8'))
    by_id={str(r['id']):r for r in rows}
    for patch in corrections:
        row=by_id.get(patch['id'])
        if row is None: continue
        titles={patch['titulo_original'],patch['alteracoes'].get('titulo',{}).get('depois',patch['titulo_original'])}
        if row['docente']!=patch['docente'] or row['titulo'] not in titles:
            raise ValueError(f"Audit identity conflict in id {patch['id']}; reconcile the import before publication")
        for key,change in patch['alteracoes'].items():
            if key in {'titulo','ano','doi','autores','isbn_issn'} and row.get(key) not in (change['antes'],change['depois']):
                raise ValueError(f"New bibliographic value in id {patch['id']}, field {key}; review instead of overwriting it with the archived correction")
            row[key]=change['depois']
    return rows
def write(rows):
    payload=json.dumps(rows,ensure_ascii=False,indent=2)+'\n'
    (ROOT/'data/producao_cientifica.json').write_text(payload,encoding='utf8')
    (ROOT/'dashboard/producao-cientifica-data.js').write_text('window.PRODUCAO_CIENTIFICA = '+payload.strip()+';\n',encoding='utf8')
    fields=list(dict.fromkeys(k for r in rows for k in r))
    with (ROOT/'data/producao_cientifica.csv').open('w',encoding='utf8',newline='') as f:
        w=csv.DictWriter(f,fieldnames=fields);w.writeheader()
        w.writerows({k:json.dumps(v,ensure_ascii=False) if isinstance(v,(list,dict)) else v for k,v in r.items()} for r in rows)
    grouped=defaultdict(list)
    for r in rows:grouped[r['docente']].append(r)
    summary=[]
    for name,rr in sorted(grouped.items()):
        c=Counter(r['tipo_producao'] for r in rr)
        summary.append(dict(docente=name,total=len(rr),artigo=c['artigo'],capitulo=c['capitulo'],livro=c['livro'],pontuacao_total=sum(float(r.get('pontuacao') or 0) for r in rr)))
    with (ROOT/'data/producao_cientifica_resumo_docente.csv').open('w',encoding='utf8',newline='') as f:
        w=csv.DictWriter(f,fieldnames=list(summary[0]));w.writeheader();w.writerows(summary)
def main():
    rows=json.loads((ROOT/'data/producao_cientifica.json').read_text(encoding='utf8'))
    write(reconcile(rows))
if __name__=='__main__':main()
