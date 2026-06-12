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


MANUAL_CLASSIFICACAO_OVERRIDES = {
    fold_text("Applied Neuropsychology: Adult"): {
        "revista_ou_veiculo": "Applied Neuropsychology: Adult",
        "indexacao": "Scopus (SJR)",
        "jif_jcr_2025": "2.317",
        "quartil_jcr_2025": "Q3",
    },
    fold_text("SLEEP SCIENCE (IMPRESSO)"): {
        "revista_ou_veiculo": "SLEEP SCIENCE (IMPRESSO)",
        "indexacao": "Scopus (SJR)",
        "jif_jcr_2025": "2.43",
        "quartil_jcr_2025": "Q2",
    },
    fold_text("SPORT SCIENCES FOR HEALTH (TESTO STAMPATO)"): {
        "revista_ou_veiculo": "SPORT SCIENCES FOR HEALTH (TESTO STAMPATO)",
        "indexacao": "Scopus (SJR)",
        "jif_jcr_2025": "1.57",
        "quartil_jcr_2025": "Q3",
    },
    fold_text("German Journal Of Exercise And Sport Research"): {
        "revista_ou_veiculo": "German Journal Of Exercise And Sport Research",
        "indexacao": "Scopus (SJR)",
        "jif_jcr_2025": "2.32",
        "quartil_jcr_2025": "Q2",
    },
    fold_text("INTERNATIONAL JOURNAL OF SPORTS MEDICINE"): {
        "revista_ou_veiculo": "INTERNATIONAL JOURNAL OF SPORTS MEDICINE",
        "indexacao": "Scopus (SJR)",
        "jif_jcr_2025": "2.59",
        "quartil_jcr_2025": "Q1",
    },
    fold_text("Applied Physiology Nutrition and Metabolism"): {
        "revista_ou_veiculo": "Applied Physiology Nutrition and Metabolism",
        "indexacao": "Scopus (SJR)",
        "jif_jcr_2025": "2.731",
        "quartil_jcr_2025": "Q2",
    },
    fold_text("JOURNAL OF SPINAL CORD MEDICINE"): {
        "revista_ou_veiculo": "JOURNAL OF SPINAL CORD MEDICINE",
        "indexacao": "Scopus (SJR)",
        "jif_jcr_2025": "1.995",
        "quartil_jcr_2025": "Q3",
    },
    fold_text("JOURNAL OF SPINAL CORD MEDICINE, p"): {
        "revista_ou_veiculo": "JOURNAL OF SPINAL CORD MEDICINE",
        "indexacao": "Scopus (SJR)",
        "jif_jcr_2025": "1.995",
        "quartil_jcr_2025": "Q3",
    },
    fold_text("EUROPEAN JOURNAL OF APPLIED PHYSIOLOGY"): {
        "revista_ou_veiculo": "EUROPEAN JOURNAL OF APPLIED PHYSIOLOGY",
        "indexacao": "Scopus (SJR)",
        "jif_jcr_2025": "3.25",
        "quartil_jcr_2025": "Q1",
    },
    fold_text("Eur J Appl Physiol"): {
        "revista_ou_veiculo": "EUROPEAN JOURNAL OF APPLIED PHYSIOLOGY",
        "indexacao": "Scopus (SJR)",
        "jif_jcr_2025": "3.25",
        "quartil_jcr_2025": "Q1",
    },
    fold_text("RETOS"): {
        "revista_ou_veiculo": "RETOS",
        "indexacao": "Scopus (SJR)",
        "jif_jcr_2025": "1.42",
        "quartil_jcr_2025": "Q1",
    },
    fold_text("Retos: Nuevas Tendencias En Educacion Fisica Deporte Y Recreacion"): {
        "revista_ou_veiculo": "RETOS",
        "indexacao": "Scopus (SJR)",
        "jif_jcr_2025": "1.42",
        "quartil_jcr_2025": "Q1",
    },
    fold_text("Retos-Nuevas Tendencias En Educacion Fisica Deporte Y Recreacion"): {
        "revista_ou_veiculo": "RETOS",
        "indexacao": "Scopus (SJR)",
        "jif_jcr_2025": "1.42",
        "quartil_jcr_2025": "Q1",
    },
}


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
    text = re.sub(r",?\s*p\.?$", "", text, flags=re.I)
    text = re.sub(r",?\s*p\s*$", "", text, flags=re.I)
    text = text.replace("-", ": ")
    text = re.sub(r"\s+", " ", text).strip(" ,;:.")
    return text


def normalize_produto_referencia_journal(produto_referencia: Any, canonical_journal: str) -> str:
    text = norm_text(produto_referencia)
    if not text or not canonical_journal:
        return text
    pattern = re.compile(
        rf"{re.escape(canonical_journal)}\s*,\s*(?:v|p)\.?",
        flags=re.I,
    )
    return pattern.sub(canonical_journal, text)


def canonical_indexacao(value: str, existing: str) -> str:
    normalized = fold_text(value)
    has_wos = "web of science" in normalized or "jcr" in normalized
    has_scopus = "scimago" in normalized or "scopus" in normalized or "sjr" in normalized

    if has_wos and has_scopus:
        return "Web of Science (JCR); Scopus (SJR)"
    if has_wos:
        return "Web of Science (JCR)"
    if has_scopus:
        return "Scopus (SJR)"
    if "pubmed" in normalized:
        return "PubMed"
    if "scielo" in normalized:
        return "SciELO"
    if "google scholar" in normalized or "google academico" in normalized:
        return "Apenas Google Scholar"
    if normalized:
        return norm_text(value)
    return norm_text(existing)


def score_artigo(indexacao: str) -> str:
    normalized = fold_text(indexacao)
    if "web of science jcr" in normalized or "scopus sjr" in normalized:
        return "90"
    if "pubmed" in normalized or "scielo" in normalized:
        return "60"
    if "google scholar" in normalized or "google academico" in normalized:
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
        result.update(MANUAL_CLASSIFICACAO_OVERRIDES)
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
            norm_text(row.get("revista_ou_veiculo")),
            norm_text(row.get("produto_referencia")),
            norm_text(row.get("indexacao")),
            norm_text(row.get("jif_jcr_2025")),
            norm_text(row.get("quartil_jcr_2025")),
            norm_text(row.get("pontuacao")),
        )

        normalized_vehicle = normalize_journal_name(row.get("revista_ou_veiculo"))
        if fold_text(normalized_vehicle) == fold_text(classif["revista_ou_veiculo"]):
            row["revista_ou_veiculo"] = classif["revista_ou_veiculo"]
            row["produto_referencia"] = normalize_produto_referencia_journal(
                row.get("produto_referencia"),
                classif["revista_ou_veiculo"],
            )
        row["indexacao"] = canonical_indexacao(classif["indexacao"], row.get("indexacao", ""))
        row["jif_jcr_2025"] = classif["jif_jcr_2025"] or norm_text(row.get("jif_jcr_2025"))
        row["quartil_jcr_2025"] = classif["quartil_jcr_2025"] or norm_text(row.get("quartil_jcr_2025"))
        row["pontuacao"] = score_artigo(row["indexacao"])

        new_tuple = (
            norm_text(row.get("revista_ou_veiculo")),
            norm_text(row.get("produto_referencia")),
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
