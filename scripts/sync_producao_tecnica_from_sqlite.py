from __future__ import annotations

import csv
import json
import sqlite3
from collections import defaultdict
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
DASHBOARD_DIR = ROOT / "dashboard"
DB_PATH_FILE = DATA_DIR / "producao_tecnica_db_path.txt"


def read_external_db_path() -> Path:
    first_line = DB_PATH_FILE.read_text(encoding="utf-8").splitlines()[0].strip()
    if not first_line:
        raise ValueError("Arquivo de caminho do banco técnico está vazio.")
    return Path(first_line)


def fetch_records(db_path: Path) -> list[dict]:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    try:
        rows = conn.execute(
            """
            SELECT
                id,
                docente,
                autores,
                ano,
                titulo,
                categoria,
                tipo_produto,
                subtipo,
                formato,
                finalidade,
                local,
                cidade,
                total_produtos,
                pagina_pdf,
                fonte_pdf,
                observacoes
            FROM producao_tecnica
            ORDER BY id
            """
        ).fetchall()
    finally:
        conn.close()
    return [dict(row) for row in rows]


def write_csv(path: Path, rows: list[dict], fieldnames: list[str]) -> None:
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def build_summary(rows: list[dict]) -> list[dict]:
    grouped: dict[tuple[str, str], dict] = {}
    for row in rows:
        key = (row["docente"], row["tipo_produto"])
        bucket = grouped.setdefault(
            key,
            {
                "docente": row["docente"],
                "tipo_produto": row["tipo_produto"],
                "total_produtos": 0,
                "observacoes": [],
            },
        )
        bucket["total_produtos"] += int(row.get("total_produtos") or 1)
        if row.get("titulo"):
            bucket["observacoes"].append(row["titulo"])
    result = []
    for bucket in grouped.values():
        result.append(
            {
                "docente": bucket["docente"],
                "tipo_produto": bucket["tipo_produto"],
                "total_produtos": bucket["total_produtos"],
                "observacoes": "; ".join(bucket["observacoes"][:3]),
            }
        )
    result.sort(key=lambda item: (item["docente"], item["tipo_produto"]))
    return result


def write_dashboard_js(path: Path, rows: list[dict]) -> None:
    path.write_text(
        "window.PRODUCAO_TECNICA = " + json.dumps(rows, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )


def write_status(path: Path, db_path: Path, rows: list[dict]) -> None:
    grouped_docentes = defaultdict(int)
    for row in rows:
        grouped_docentes[row["docente"]] += int(row.get("total_produtos") or 1)
    payload = {
        "source_sqlite": str(db_path),
        "synced_at": datetime.now().isoformat(timespec="seconds"),
        "records": len(rows),
        "docentes": len(grouped_docentes),
        "totals_by_docente": grouped_docentes,
    }
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    db_path = read_external_db_path()
    if not db_path.exists():
        raise FileNotFoundError(f"Banco externo não encontrado: {db_path}")

    rows = fetch_records(db_path)
    fieldnames = [
        "id",
        "docente",
        "autores",
        "ano",
        "titulo",
        "categoria",
        "tipo_produto",
        "subtipo",
        "formato",
        "finalidade",
        "local",
        "cidade",
        "total_produtos",
        "pagina_pdf",
        "fonte_pdf",
        "observacoes",
    ]

    write_csv(DATA_DIR / "producao_tecnica.csv", rows, fieldnames)
    (DATA_DIR / "producao_tecnica.json").write_text(
        json.dumps(rows, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    write_dashboard_js(DASHBOARD_DIR / "producao-tecnica-data.js", rows)
    write_csv(
        DATA_DIR / "producao_tecnica_resumo_docente.csv",
        build_summary(rows),
        ["docente", "tipo_produto", "total_produtos", "observacoes"],
    )
    write_status(DATA_DIR / "producao_tecnica_sync_status.json", db_path, rows)
    print(f"Sincronizados {len(rows)} registros a partir de {db_path}")


if __name__ == "__main__":
    main()
