"""Apply the approved current-cohort scope to published production and faculty data.

Historical activity records and the June 2026 staging files remain intact.
Run after any production import before publishing the dashboard.
"""

import csv
import json
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
DASHBOARD = ROOT / "dashboard"
EXCLUDED = {
    "Clarice Maria de Lucena Martins",
    "Paulo Felipe Ribeiro Bandeira",
    "Fábio Nakamura",
    "João Carlos Bouzas Marins",
}


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def read_csv(path):
    with path.open(encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        return reader.fieldnames, list(reader)


def write_csv(path, fields, rows):
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def write_js(path, variable, rows, compact=False):
    payload = json.dumps(rows, ensure_ascii=False, separators=(",", ":") if compact else None,
                         indent=None if compact else 2)
    path.write_text(f"window.{variable} = {payload};\n", encoding="utf-8")


def apply_production():
    scientific = [r for r in read_json(DATA / "producao_cientifica.json") if r["docente"] not in EXCLUDED]
    technical = [r for r in read_json(DATA / "producao_tecnica.json") if r["docente"] not in EXCLUDED]
    write_json(DATA / "producao_cientifica.json", scientific)
    write_json(DATA / "producao_tecnica.json", technical)
    write_js(DASHBOARD / "producao-cientifica-data.js", "PRODUCAO_CIENTIFICA", scientific)
    write_js(DASHBOARD / "producao-tecnica-data.js", "PRODUCAO_TECNICA", technical, compact=True)

    for filename in ("producao_cientifica.csv", "producao_tecnica.csv", "producao_tecnica_resumo_docente.csv"):
        path = DATA / filename
        fields, rows = read_csv(path)
        write_csv(path, fields, [r for r in rows if r["docente"] not in EXCLUDED])

    # The previous scientific summary was older than the published JSON. Rebuild it.
    by_teacher = defaultdict(list)
    for row in scientific:
        by_teacher[row["docente"]].append(row)
    summary = []
    for teacher, rows in sorted(by_teacher.items()):
        types = Counter(r["tipo_producao"] for r in rows)
        summary.append({
            "docente": teacher,
            "total": len(rows),
            "artigo": types["artigo"],
            "capitulo": types["capitulo"],
            "livro": types["livro"],
            "pontuacao_total": sum(float(r.get("pontuacao") or 0) for r in rows),
        })
    write_csv(DATA / "producao_cientifica_resumo_docente.csv",
              ["docente", "total", "artigo", "capitulo", "livro", "pontuacao_total"], summary)

    status_path = DATA / "producao_tecnica_sync_status.json"
    status = read_json(status_path)
    totals = Counter()
    for row in technical:
        totals[row["docente"]] += int(row.get("total_produtos") or 0)
    status["records"] = len(technical)
    status["docentes"] = len({r["docente"] for r in technical})
    status["totals_by_docente"] = dict(totals)
    status["cohort_scope_applied"] = "2026-10-28"
    write_json(status_path, status)
    return len(scientific), len(technical)


def metric(value, threshold, previous):
    target = threshold["target"]
    direction = threshold["direction"]
    passed = value >= target if direction == "min" else value <= target
    result = dict(previous)
    result.update(value=value, passed=passed,
                  gap=value - target if direction == "min" else target - value)
    if "condition" in result:
        result["condition"] = "ok" if passed else "critical"
    return result


def apply_faculty():
    path = DASHBOARD / "corpo-docente-data.js"
    content = path.read_text(encoding="utf-8")
    faculty = json.loads(content.split("=", 1)[1].strip().rstrip(";"))
    faculty["docentes"] = [d for d in faculty["docentes"] if d["docente"] not in EXCLUDED]
    members = faculty["docentes"]
    thresholds = faculty["thresholds"]
    for year in faculty["history_years"]:
        active = [d for d in members if d["anos"].get(year) not in (None, "---")]
        permanent = [d for d in active if d["anos"][year] == "Per"]
        counts = Counter(d["anos"][year] for d in active)
        old = faculty["by_year"][year]
        old["classified_count"] = len(active)
        old["permanent_count"] = len(permanent)
        old["status_counts"] = {k: counts[k] for k in ("Per", "Col", "Temp", "Vis")}
        old["docentes"] = [d["docente"] for d in active]
        denominators = {
            "permanentes_no_corpo": (len(permanent), len(active)),
            "permanentes_internos": (sum(d["origem_matriz"] == "Interno" for d in permanent), len(permanent)),
            "permanentes_exclusivos": (sum((d["ppgs_como_permanente_2026"] or 1) == 1 for d in permanent), len(permanent)),
            "permanentes_externos": (sum(d["origem_matriz"] == "Externo" for d in permanent), len(permanent)),
            "permanentes_colaboradores_outros_ppgs": (sum(d["colabora_outros_ppgs"] for d in permanent), len(permanent)),
            "total_permanentes": (len(permanent), 1),
        }
        for key, (numerator, denominator) in denominators.items():
            old["metrics"][key] = metric(numerator / denominator if denominator else 0,
                                          thresholds[key], old["metrics"][key])

    current = [d for d in members if d["anos"].get(faculty["default_year"]) not in (None, "---")]
    ams = sum(d["ams"] for d in current)
    dfe = sum(d["dfe"] for d in current)
    faculty["lp_summary"] = dict(ams_share=ams / len(current), dfe_share=dfe / len(current),
                                 balance_ratio=round(ams / dfe, 2) if dfe else 0,
                                 ams_count=ams, dfe_count=dfe, active_docentes=len(current))

    years = faculty["quad_years"]
    rows = faculty["quad_summary"]["rows"]
    previous_counts = {y: faculty["by_year"][y]["classified_count"] for y in faculty["history_years"]}
    values = defaultdict(dict)
    for year in years:
        summary = faculty["by_year"][year]
        counts = summary["status_counts"]
        total = summary["classified_count"]
        permanent = summary["permanent_count"]
        prior = str(int(year) - 1)
        values["colaboradores"][year] = counts["Col"]
        values["permanentes"][year] = permanent
        values["temporarios"][year] = counts["Temp"]
        values["visitantes"][year] = counts["Vis"]
        values["docentes_classificados"][year] = total
        values["docentes_base_producao"][year] = sum(d["na_base_producao"] and d["anos"].get(year) not in (None, "---") for d in members)
        values["estabilidade_anual"][year] = total / previous_counts[prior] if previous_counts[prior] else 0
        values["dependencia_colaboradores"][year] = f"{permanent / counts['Col']:g}:1" if counts["Col"] else "—"
        values["percent_permanentes"][year] = permanent / total if total else 0
        values["percent_colaboradores"][year] = counts["Col"] / total if total else 0
        values["percent_permanente_interno"][year] = summary["metrics"]["permanentes_internos"]["value"]
        values["percent_permanente_externo"][year] = summary["metrics"]["permanentes_externos"]["value"]
    for row in rows:
        key = row["key"]
        row["values"] = values[key]
        if key == "dependencia_colaboradores":
            permanent_sum = sum(values["permanentes"].values())
            collaborator_sum = sum(values["colaboradores"].values())
            row["average"] = f"{permanent_sum / collaborator_sum:.1f}:1".replace(".", ",") if collaborator_sum else "—"
        else:
            row["average"] = sum(values[key].values()) / len(years)
    faculty["quad_summary"]["estabilidade_quadri"] = values["estabilidade_anual"][years[-1]] if len(years) == 1 else sum(values["estabilidade_anual"].values()) / len(years)

    permanent_2026 = [d for d in members if d["anos"].get("2026") == "Per"]
    distribution = Counter(d["ppgs_como_permanente_2026"] or 1 for d in permanent_2026)
    faculty["ppg_distribution_2026"] = [dict(ppgs=n, docentes=count, share=count / len(permanent_2026)) for n, count in sorted(distribution.items())]
    faculty["issues"] = [issue for issue in faculty["issues"] if issue["docente"] not in EXCLUDED]
    faculty["issue_counts"] = dict(Counter(issue["issue"] for issue in faculty["issues"]))
    faculty["scope_applied"] = "2026-10-28: current faculty only; activity history retained"
    write_js(path, "CORPO_DOCENTE_PPGEF", faculty, compact=True)
    return len(members)


if __name__ == "__main__":
    scientific_count, technical_count = apply_production()
    faculty_count = apply_faculty()
    print(f"Published scope: {faculty_count} faculty, {scientific_count} scientific records, {technical_count} technical records")
