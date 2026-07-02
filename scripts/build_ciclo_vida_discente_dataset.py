from __future__ import annotations

import argparse
import csv
import json
import re
from collections import Counter
from datetime import date, datetime
from pathlib import Path
from statistics import mean
from typing import Any


DEFAULT_SOURCE = Path("data/ciclo-vida-discente.csv")
DEFAULT_OUTPUT = Path("dashboard/ciclo-vida-discente-data.js")
REFERENCE_DATE = date(2026, 7, 2)

PLACEHOLDERS = {"", "---", "vazio", "VAZIO", "null", "None"}
STATUS_GROUP_MAP = {
    "ATIVO": "ativos",
    "TITULADO": "titulados",
    "ABANDONOU": "evasoes",
    "DESLIGADO": "evasoes",
    "REPROVADA": "evasoes",
    "NÃO MATRICULADO": "nao_matriculados",
    "NAO MATRICULADO": "nao_matriculados",
}
ADVISOR_ALIAS_MAP: dict[str, str] = {}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Gera dataset público do painel de ciclo de vida discente.")
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    return parser.parse_args()


def collapse_spaces(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def clean_text(value: str | None) -> str:
    if value is None:
        return ""
    normalized = collapse_spaces(str(value).replace("\ufeff", ""))
    return "" if normalized in PLACEHOLDERS else normalized


def clean_status(value: str | None) -> str:
    text = clean_text(value).upper()
    return "NÃO MATRICULADO" if text == "NAO MATRICULADO" else text


def normalize_advisor(value: str | None) -> str:
    text = clean_text(value)
    if not text or "AINDA NÃO POSSUI ORIENTADOR" in text.upper():
        return "Sem orientador definido"
    return ADVISOR_ALIAS_MAP.get(text, text)


def parse_date(value: str | None) -> date | None:
    text = clean_text(value)
    if not text:
        return None
    try:
        return datetime.strptime(text, "%d/%m/%Y").date()
    except ValueError:
        return None


def parse_int(value: str | None) -> int | None:
    text = clean_text(value)
    if not text:
        return None
    text = text.replace(".", "").replace(",", ".")
    try:
        return int(float(text))
    except ValueError:
        return None


def parse_percent(value: str | None) -> int | None:
    text = clean_text(value)
    if not text or not text.endswith("%"):
        return None
    try:
        return int(round(float(text[:-1].replace(",", "."))))
    except ValueError:
        return None


def format_percent(value: float | None) -> float | None:
    if value is None:
        return None
    return round(value, 1)


def average_percent(values: list[int | None]) -> float | None:
    valid = [value for value in values if value is not None]
    return format_percent(mean(valid)) if valid else None


def build_advisor_labels(advisors: list[str]) -> dict[str, str]:
    labels: dict[str, str] = {}
    sequence = 1
    for advisor in advisors:
        if advisor == "Sem orientador definido":
            labels[advisor] = "Sem carteira definida"
            continue
        labels[advisor] = f"Carteira {sequence:02d}"
        sequence += 1
    return labels


def read_rows(source: Path) -> list[dict[str, str]]:
    for encoding in ("utf-8-sig", "utf-8", "cp1252", "latin-1"):
        try:
            with source.open("r", encoding=encoding, newline="") as handle:
                return list(csv.DictReader(handle, delimiter=";"))
        except UnicodeDecodeError:
            continue
    raise RuntimeError(f"Não foi possível ler {source}")


def get_risk_flags(
    status: str,
    advisor: str,
    qual_due: date | None,
    qual_date: date | None,
    defense_due: date | None,
    defense_date: date | None,
    check_percent: int | None,
    completed_components: int,
) -> dict[str, Any]:
    active = status == "ATIVO"
    qual_overdue = bool(active and qual_due and qual_due < REFERENCE_DATE and not qual_date)
    defense_overdue = bool(active and defense_due and defense_due < REFERENCE_DATE and not defense_date)
    no_advisor = bool(active and advisor == "Sem orientador definido")
    high_check = check_percent is not None and check_percent >= 50
    medium_check = check_percent is not None and 30 <= check_percent < 50
    low_progress = bool(active and completed_components == 0)
    score = (
        (5 if no_advisor else 0)
        + (4 if defense_overdue else 0)
        + (3 if qual_overdue else 0)
        + (2 if high_check else 0)
        + (1 if medium_check else 0)
        + (1 if low_progress else 0)
    )
    if score >= 5:
        level = "vermelho"
    elif score >= 2:
        level = "amarelo"
    else:
        level = "verde"
    return {
        "qualification_overdue": qual_overdue,
        "defense_overdue": defense_overdue,
        "no_advisor": no_advisor,
        "score": score,
        "level": level,
    }


def build_public_dataset(rows: list[dict[str, str]]) -> dict[str, Any]:
    fieldnames = list(rows[0].keys())
    component_fields = [field for field in fieldnames if field.startswith("EDF")]
    public_rows: list[dict[str, Any]] = []
    quality_counts = Counter()

    for row in rows:
        status = clean_status(row.get("Status"))
        advisor = normalize_advisor(row.get("Orientador(a) "))
        ingress_date = parse_date(row.get("Ingresso"))
        start_year = parse_int(row.get("Ano Inicio"))
        qualification_due = parse_date(row.get("Qualificação\n(12 meses)"))
        qualification_date = parse_date(row.get("Data Qualificação"))
        defense_due = parse_date(row.get("Defesa\n(24 meses)"))
        defense_date = parse_date(row.get("Data de Defesa"))
        defense_year = parse_int(row.get("Ano da Defesa"))
        tmt_value = parse_int(row.get("TMT"))
        check_percent = parse_percent(row.get("Check Antecedentes Críticos"))
        completed_components = sum(
            1 for field in component_fields if clean_text(row.get(field)).upper() == "VERDADEIRO"
        )
        cohort_year = ingress_date.year if ingress_date else start_year
        risk = get_risk_flags(
            status=status,
            advisor=advisor,
            qual_due=qualification_due,
            qual_date=qualification_date,
            defense_due=defense_due,
            defense_date=defense_date,
            check_percent=check_percent,
            completed_components=completed_components,
        )
        public_rows.append(
            {
                "status": status,
                "status_group": STATUS_GROUP_MAP.get(status, "outros"),
                "advisor": advisor,
                "cohort_year": cohort_year,
                "qualification_done": bool(qualification_date),
                "defense_done": bool(defense_date or status == "TITULADO"),
                "check_percent": check_percent,
                "completed_components": completed_components,
                "total_components": len(component_fields),
                "risk_level": risk["level"],
                "risk_flags": {key: value for key, value in risk.items() if key not in {"score", "level"}},
            }
        )

        if advisor == "Sem orientador definido":
            quality_counts["sem_orientador"] += 1
        if start_year and ingress_date and start_year != ingress_date.year:
            quality_counts["ano_inicio_divergente"] += 1
        if defense_year == 1900:
            quality_counts["ano_defesa_sentinela"] += 1
        if tmt_value is not None and tmt_value < 0:
            quality_counts["tmt_negativo"] += 1
        if clean_text(row.get("Orientador(a) ")) != advisor and advisor != "Sem orientador definido":
            quality_counts["alias_orientador"] += 1

    advisors = sorted({row["advisor"] for row in public_rows}, key=lambda value: value.casefold())
    advisor_labels = build_advisor_labels(advisors)
    statuses = sorted({row["status"] for row in public_rows}, key=lambda value: value.casefold())
    cohort_years = sorted({row["cohort_year"] for row in public_rows if row["cohort_year"]})

    summary_counts = Counter(row["status_group"] for row in public_rows)
    active_rows = [row for row in public_rows if row["status"] == "ATIVO"]
    summary = {
        "total_students": len(public_rows),
        "active_students": len(active_rows),
        "titulados": summary_counts["titulados"],
        "evasoes": summary_counts["evasoes"],
        "nao_matriculados": summary_counts["nao_matriculados"],
        "without_advisor": sum(1 for row in active_rows if row["risk_flags"]["no_advisor"]),
        "qualification_overdue": sum(1 for row in active_rows if row["risk_flags"]["qualification_overdue"]),
        "defense_overdue": sum(1 for row in active_rows if row["risk_flags"]["defense_overdue"]),
        "average_check_percent": average_percent([row["check_percent"] for row in active_rows]),
        "risk_counts": dict(Counter(row["risk_level"] for row in active_rows)),
    }

    flow_by_cohort = []
    for year in cohort_years:
        group = [row for row in public_rows if row["cohort_year"] == year]
        flow_by_cohort.append(
            {
                "year": year,
                "ingressos": len(group),
                "ativos": sum(1 for row in group if row["status"] == "ATIVO"),
                "qualificacoes": sum(1 for row in group if row["qualification_done"]),
                "defesas": sum(1 for row in group if row["defense_done"]),
                "evasoes": sum(1 for row in group if row["status_group"] == "evasoes"),
            }
        )

    advisor_summary = []
    advisor_cohort_breakdown = []
    for advisor in advisors:
        group = [row for row in public_rows if row["advisor"] == advisor]
        active_group = [row for row in group if row["status"] == "ATIVO"]
        advisor_summary.append(
            {
                "advisor": advisor_labels[advisor],
                "total_students": len(group),
                "active_students": len(active_group),
                "titulados": sum(1 for row in group if row["status_group"] == "titulados"),
                "evasoes": sum(1 for row in group if row["status_group"] == "evasoes"),
                "qualification_overdue": sum(1 for row in active_group if row["risk_flags"]["qualification_overdue"]),
                "defense_overdue": sum(1 for row in active_group if row["risk_flags"]["defense_overdue"]),
                "without_advisor": sum(1 for row in active_group if row["risk_flags"]["no_advisor"]),
                "average_check_percent": average_percent([row["check_percent"] for row in active_group]),
                "risk_counts": dict(Counter(row["risk_level"] for row in active_group)),
            }
        )
        for year in cohort_years:
            bucket = [row for row in group if row["cohort_year"] == year]
            if not bucket:
                continue
            bucket_active = [row for row in bucket if row["status"] == "ATIVO"]
            advisor_cohort_breakdown.append(
                {
                    "advisor": advisor_labels[advisor],
                    "cohort_year": year,
                    "total_students": len(bucket),
                    "active_students": len(bucket_active),
                    "titulados": sum(1 for row in bucket if row["status_group"] == "titulados"),
                    "evasoes": sum(1 for row in bucket if row["status_group"] == "evasoes"),
                    "qualification_overdue": sum(1 for row in bucket_active if row["risk_flags"]["qualification_overdue"]),
                    "defense_overdue": sum(1 for row in bucket_active if row["risk_flags"]["defense_overdue"]),
                    "average_check_percent": average_percent([row["check_percent"] for row in bucket_active]),
                    "average_progress": format_percent(
                        mean((row["completed_components"] / row["total_components"]) * 100 for row in bucket_active)
                    ) if bucket_active else None,
                    "dominant_risk": (
                        "vermelho"
                        if any(row["risk_level"] == "vermelho" for row in bucket_active)
                        else "amarelo"
                        if any(row["risk_level"] == "amarelo" for row in bucket_active)
                        else "verde"
                        if bucket_active
                        else "gray"
                    ),
                }
            )

    advisor_summary.sort(key=lambda item: (-item["active_students"], -item["qualification_overdue"], item["advisor"].casefold()))
    advisor_cohort_breakdown.sort(key=lambda item: (item["advisor"].casefold(), item["cohort_year"]))

    component_summary = []
    for field in component_fields:
        completed = sum(1 for row in rows if clean_text(row.get(field)).upper() == "VERDADEIRO")
        component_summary.append({"key": field, "label": field, "completed": completed})
    component_summary.sort(key=lambda item: (-item["completed"], item["label"]))

    quality = {
        "counts": dict(quality_counts),
        "notes": [
            "Versão pública sem identificadores nominais de discente.",
            "Leituras individuais substituídas por agregados anonimizados por carteira e coorte.",
            "Alertas de qualidade mantidos apenas como contagem consolidada.",
        ],
    }

    return {
        "generated_at": REFERENCE_DATE.isoformat(),
        "reference_date": REFERENCE_DATE.isoformat(),
        "source_file": "sanitized-publication",
        "publication_mode": "public_aggregated",
        "filters": {
            "advisors": [advisor_labels[advisor] for advisor in advisors],
            "statuses": statuses,
            "cohort_years": cohort_years,
            "risk_levels": ["verde", "amarelo", "vermelho"],
        },
        "summary": summary,
        "advisor_summary": advisor_summary,
        "advisor_cohort_breakdown": advisor_cohort_breakdown,
        "flow_by_cohort": flow_by_cohort,
        "component_summary": component_summary,
        "data_quality": quality,
    }


def write_output(output: Path, dataset: dict[str, Any]) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    payload = "window.CICLO_VIDA_DISCENTE_PPGEF = " + json.dumps(dataset, ensure_ascii=False, indent=2) + ";\n"
    output.write_text(payload, encoding="utf-8")


def main() -> None:
    args = parse_args()
    rows = read_rows(args.source)
    dataset = build_public_dataset(rows)
    write_output(args.output, dataset)


if __name__ == "__main__":
    main()
