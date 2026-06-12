from __future__ import annotations

import csv
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path
from typing import Any


WORKSPACE = Path(r"C:\Users\tonym\OneDrive\Documentos\PPGEF - DashBorad")
SOURCE_CLASSIFICACAO = Path(
    r"G:\.shortcut-targets-by-id\18B_rphPE1Flt1tGbECpP70xTWYIcUsfW\AAA - PPGEF EFI\Sucupira\014 - Pj APCN 03 - 2026\BDs Estratégicos\CSVs\Indexação Periódicos.csv"
)
CSV_PATH = WORKSPACE / "data" / "producao_cientifica.csv"
JSON_PATH = WORKSPACE / "data" / "producao_cientifica.json"
JS_PATH = WORKSPACE / "dashboard" / "producao-cientifica-data.js"
REPORT_PATH = WORKSPACE / "analysis" / "sincronizacao_indexacao_periodicos_report.json"


def norm_text(value: Any) -> str:
    text = str(value or "").replace("\xa0", " ").replace("\u2009", " ").strip()
    return re.sub(r"\s+", " ", text)


def fold_text(value: Any) -> str:
    text = norm_text(value).lower()
    text = "".join(
        ch for ch in unicodedata.normalize("NFKD", text) if not unicodedata.combining(ch)
    )
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def clean_metric(value: Any) -> str:
    text = norm_text(value)
    if text in {"---", "-", "0,00", "0.00"}:
      return ""
    return text


def normalize_journal_name(value: Any) -> str:
    text = norm_text(value)
    text = re.sub(r"\s*\(on ?line\)\s*", " ", text, flags=re.I)
    text = re.sub(r",?\s*v\.?$", "", text, flags=re.I)
    text = re.sub(r",?\s*v\s*$", "", text, flags=re.I)
    text = re.sub(r"\s+", " ", text).strip(" ,;:.")
    return text


def canonical_indexacao(value: str, existing: str) -> str:
    normalized = fold_text(value)
    existing_parts = [part.strip() for part in norm_text(existing).split(";") if part.strip()]

    def add_unique(label: str) -> None:
        if label not in existing_parts:
            existing_parts.append(label)

    if "web of science" in normalized or "jcr" in normalized:
        add_unique("Web of Science (JCR)")
    elif "scimago" in normalized or "scopus" in normalized or "sjr" in normalized:
        add_unique("Scopus (SJR)")
    elif "pubmed" in normalized:
        add_unique("PubMed")
    elif "scielo" in normalized:
        add_unique("SciELO")
    elif "google scholar" in normalized:
        return "Apenas Google Scholar"
    elif normalized:
        return norm_text(value)

    return "; ".join(existing_parts)


def score_artigo(indexacao: str) -> str:
    normalized = fold_text(indexacao)
    if "web of science jcr" in normalized or "scopus sjr" in normalized:
        return "90"
    if "pubmed" in normalized or "scielo" in normalized:
        return "60"
    if "google scholar" in normalized:
        return "30"
    return "0"


def load_classificacao() -> dict[str, dict[str, str]]:
    with SOURCE_CLASSIFICACAO.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle, delimiter=";")
        result: dict[str, dict[str, str]] = {}
        for row in reader:
            journal = normalize_journal_name(row.get("revista_ou_veiculo"))
            if not journal:
                continue
            result[fold_text(journal)] = {
                "revista_ou_veiculo": journal,
                "indexacao": norm_text(row.get("indexacao")),
                "jif_jcr_2025": clean_metric(row.get("jif_jcr_2025")),
                "quartil_jcr_2025": clean_metric(row.get("quartil_jcr_2025")),
            }
        return result


def load_rows() -> list[dict[str, str]]:
    with CSV_PATH.open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def write_csv(rows: list[dict[str, str]], fieldnames: list[str]) -> None:
    with CSV_PATH.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def write_json(rows: list[dict[str, str]]) -> None:
    JSON_PATH.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")


def write_js(rows: list[dict[str, str]]) -> None:
    JS_PATH.write_text(
        "window.PRODUCAO_CIENTIFICA = " + json.dumps(rows, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )


def main() -> None:
    classificacao = load_classificacao()
    rows = load_rows()
    if not rows:
        raise RuntimeError("Base de produção científica vazia.")

    updated = 0
    matched = 0
    unmatched_artigos = 0
    docentes_atualizados: Counter[str] = Counter()

    for row in rows:
        tipo = fold_text(row.get("tipo_producao"))
        if tipo != "artigo":
            continue

        journal_key = fold_text(normalize_journal_name(row.get("revista_ou_veiculo")))
        classif = classificacao.get(journal_key)
        if not classif:
            unmatched_artigos += 1
            continue

        matched += 1
        old_tuple = (
            norm_text(row.get("indexacao")),
            norm_text(row.get("jif_jcr_2025")),
            norm_text(row.get("quartil_jcr_2025")),
            norm_text(row.get("pontuacao")),
        )

        row["indexacao"] = canonical_indexacao(classif["indexacao"], row.get("indexacao", ""))
        row["jif_jcr_2025"] = classif["jif_jcr_2025"] or norm_text(row.get("jif_jcr_2025"))
        row["quartil_jcr_2025"] = classif["quartil_jcr_2025"] or norm_text(row.get("quartil_jcr_2025"))
        row["pontuacao"] = score_artigo(row["indexacao"])

        new_tuple = (
            norm_text(row.get("indexacao")),
            norm_text(row.get("jif_jcr_2025")),
            norm_text(row.get("quartil_jcr_2025")),
            norm_text(row.get("pontuacao")),
        )
        if new_tuple != old_tuple:
            updated += 1
            docentes_atualizados[norm_text(row.get("docente"))] += 1
            observacoes = norm_text(row.get("observacoes"))
            note = "indexacao_periodicos_csv=sincronizado"
            if note not in observacoes:
                row["observacoes"] = f"{observacoes} | {note}".strip(" |")

    fieldnames = list(rows[0].keys())
    write_csv(rows, fieldnames)
    write_json(rows)
    write_js(rows)

    report = {
        "source_classificacao": str(SOURCE_CLASSIFICACAO),
        "matched_artigos": matched,
        "updated_rows": updated,
        "unmatched_artigos": unmatched_artigos,
        "docentes_atualizados": dict(docentes_atualizados),
    }
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
