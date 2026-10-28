"""Reconcile Daniela's article list with the scientific data used by the dashboard.

The source list is data/daniela_producao_2026.json. Running this script twice is
idempotent: it updates the four existing article records and adds nine missing
articles, while preserving the separately recorded 2022 book chapter.
"""

import csv
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
DASHBOARD = ROOT / "dashboard"
DOCENTE = "Daniela Karina da Silva Ferreira"
FIELDS = [
    "id", "docente", "autores", "autor_principal", "ano", "titulo",
    "tipo_producao", "revista_ou_veiculo", "editora", "cidade", "isbn_issn",
    "doi", "url", "indexacao", "jif_jcr_2025", "quartil_jcr_2025",
    "pontuacao", "observacoes", "produto_referencia", "source_row",
]
EXISTING_IDS = {1: "119", 3: "117", 4: "115", 5: "114"}  # zero-based source positions


def fold(value):
    text = unicodedata.normalize("NFKD", str(value or "").lower())
    return re.sub(r"[^a-z0-9]+", " ", "".join(
        char for char in text if not unicodedata.combining(char)
    )).strip()


def main():
    source = json.loads((DATA / "daniela_producao_2026.json").read_text(encoding="utf-8"))
    rows = json.loads((DATA / "producao_cientifica.json").read_text(encoding="utf-8"))
    by_id = {row["id"]: row for row in rows}
    next_id = max(int(row["id"]) for row in rows) + 1

    for source_index, item in enumerate(source):
        match_id = EXISTING_IDS.get(source_index)
        existing = by_id.get(match_id) if match_id else None
        if existing and existing["docente"] != DOCENTE:
            raise ValueError(f"Existing id {match_id} belongs to another docente")
        if not existing:
            matches = [row for row in rows if row["docente"] == DOCENTE
                       and fold(row["titulo"]) == fold(item["titulo"])]
            if len(matches) > 1:
                raise ValueError(f"Duplicate Daniela record: {item['titulo']}")
            existing = matches[0] if matches else None
        if not existing:
            existing = {field: "" for field in FIELDS}
            existing["id"] = str(next_id)
            next_id += 1
            rows.append(existing)
            by_id[existing["id"]] = existing

        authors = item["autores"]
        notes = ["origem=lista_docente_2026", f"qualis_informado={item['qualis_informado'] or 'não informado'}"]
        if item["indexacao"] == "Não verificada":
            notes.append("indexacao_pendente=sim")
        elif item["ano"] < 2022:
            notes.append("indexacao_historica=herdada_da_base_local_ou_fonte_primaria")
        if source_index == 2:
            notes.append("secao_editora=Short Communication; enquadramento_formal_pendente=sim")
        existing.update({
            "docente": DOCENTE,
            "autores": authors,
            "autor_principal": authors.split(";")[0].strip(),
            "ano": str(item["ano"]),
            "titulo": item["titulo"],
            "tipo_producao": "artigo",
            "revista_ou_veiculo": item["revista"],
            "editora": "",
            "cidade": "",
            "isbn_issn": item["issn"],
            "doi": item["doi"],
            "url": item["url"],
            "indexacao": "" if item["indexacao"] == "Não verificada" else item["indexacao"],
            "jif_jcr_2025": "2.4" if source_index == 2 else (existing.get("jif_jcr_2025", "") if source_index == 4 else ""),
            "quartil_jcr_2025": existing.get("quartil_jcr_2025", "") if source_index == 4 else "",
            "pontuacao": "" if item["indexacao"] == "Não verificada" else str(item["pontuacao_painel"]),
            "observacoes": " | ".join(notes),
            "produto_referencia": f"{authors}. {item['titulo']}. {item['revista']}, {item['ano']}.",
            "source_row": "lista_docente_2026",
        })

    daniela_articles = [row for row in rows if row["docente"] == DOCENTE and row["tipo_producao"] == "artigo"]
    if len(daniela_articles) != 13:
        raise ValueError(f"Expected 13 Daniela articles, found {len(daniela_articles)}")
    if len({fold(row["titulo"]) for row in daniela_articles}) != 13:
        raise ValueError("Duplicate Daniela article title")

    rows.sort(key=lambda row: int(row["id"]))
    (DATA / "producao_cientifica.json").write_text(
        json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    (DASHBOARD / "producao-cientifica-data.js").write_text(
        "window.PRODUCAO_CIENTIFICA = " + json.dumps(rows, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )
    with (DATA / "producao_cientifica.csv").open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(rows)

    summary = []
    by_teacher = {}
    for row in rows:
        by_teacher.setdefault(row["docente"], []).append(row)
    for docente, teacher_rows in sorted(by_teacher.items()):
        types = Counter(row["tipo_producao"] for row in teacher_rows)
        summary.append({
            "docente": docente,
            "total": len(teacher_rows),
            "artigo": types["artigo"],
            "capitulo": types["capitulo"],
            "livro": types["livro"],
            "pontuacao_total": sum(float(row.get("pontuacao") or 0) for row in teacher_rows),
        })
    with (DATA / "producao_cientifica_resumo_docente.csv").open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(summary[0]))
        writer.writeheader()
        writer.writerows(summary)


if __name__ == "__main__":
    main()
