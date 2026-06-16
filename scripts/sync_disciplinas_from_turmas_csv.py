import csv
import json
import re
import sys
import unicodedata
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE_CSV = Path(
    r"G:\.shortcut-targets-by-id\18B_rphPE1Flt1tGbECpP70xTWYIcUsfW\AAA - PPGEF EFI\Sucupira\014 - Pj APCN 03 - 2026\BDs Estratégicos\CSVs\Turmas.csv"
)
OUTPUT_JSON = ROOT / "data" / "disciplinas_turmas_quadrenio.json"
OUTPUT_JS = ROOT / "dashboard" / "disciplinas-data.js"
PRODUCAO_CIENTIFICA_JS = ROOT / "dashboard" / "producao-cientifica-data.js"

HEADER_PREFIX = "Nome da Turma;"
FIELD_MAP = {
    "Nome da Turma": "nome_turma",
    "Ano.Período": "ano_periodo",
    "Ano": "ano",
    "Nome da Disciplina": "nome_disciplina",
    "Nome da Disciplina Completo": "nome_disciplina_completo",
    "Núcleo Didático": "nucleo_didatico",
    "Formação Docente": "formacao_docente",
    "Tipo": "tipo",
    "Quantidade de créditos": "quantidade_creditos",
    "Carga horária total": "carga_horaria_total",
    "Nome do responsável": "nome_responsavel",
    "Categoria do responsável": "categoria_responsavel",
    "Indicador de responsável principal": "indicador_responsavel_principal",
    "Carga horária do docente": "carga_horaria_docente",
}
LOWERCASE_PARTICLES = {
    "da",
    "das",
    "de",
    "di",
    "do",
    "dos",
    "du",
    "e",
}


def fold_text(value: str) -> str:
    normalized = unicodedata.normalize("NFD", value or "")
    without_marks = "".join(ch for ch in normalized if unicodedata.category(ch) != "Mn")
    return re.sub(r"\s+", " ", without_marks).strip().casefold()


def is_all_upper(value: str) -> bool:
    letters = [ch for ch in value if ch.isalpha()]
    return bool(letters) and all(ch.isupper() for ch in letters)


def smart_title_token(token: str, is_first: bool) -> str:
    lowered = token.lower()
    if not is_first and lowered in LOWERCASE_PARTICLES:
        return lowered
    return lowered[:1].upper() + lowered[1:]


def smart_title_name(value: str) -> str:
    parts = re.split(r"(\s+)", value.strip())
    titled = []
    word_index = 0
    for part in parts:
        if not part or part.isspace():
            titled.append(part)
            continue
        subparts = re.split(r"(-)", part)
        titled_subparts = []
        for subpart in subparts:
            if subpart == "-":
                titled_subparts.append(subpart)
                continue
            titled_subparts.append(smart_title_token(subpart, word_index == 0))
            word_index += 1
        titled.append("".join(titled_subparts))
    return "".join(titled)


def choose_canonical_name(variants: set[str]) -> str:
    cleaned = sorted({re.sub(r"\s+", " ", item.strip()) for item in variants if item and item.strip()})
    preferred = [item for item in cleaned if not is_all_upper(item)]
    if preferred:
        return preferred[0]
    return smart_title_name(cleaned[0])


def load_producao_cientifica_name_map() -> dict[str, str]:
    if not PRODUCAO_CIENTIFICA_JS.exists():
        return {}

    text = PRODUCAO_CIENTIFICA_JS.read_text(encoding="utf-8")
    match = re.search(r"=\s*(\[.*\])\s*;?\s*$", text, re.S)
    if not match:
        return {}

    items = json.loads(match.group(1))
    name_map: dict[str, str] = {}
    for item in items:
        docente = re.sub(r"\s+", " ", str(item.get("docente") or "").strip())
        if not docente:
            continue
        name_map[fold_text(docente)] = docente
    return name_map


def load_csv_rows(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        raise FileNotFoundError(f"Arquivo de origem não encontrado: {path}")

    lines = path.read_text(encoding="utf-8-sig").splitlines()
    header_index = next((idx for idx, line in enumerate(lines) if line.startswith(HEADER_PREFIX)), None)
    if header_index is None:
        raise RuntimeError("Cabeçalho esperado não encontrado em Turmas.csv")

    reader = csv.DictReader(lines[header_index:], delimiter=";")
    rows = []
    for source_row in reader:
        if not any((value or "").strip() for value in source_row.values()):
            continue
        rows.append({FIELD_MAP[key]: (source_row.get(key) or "").strip() for key in FIELD_MAP})
    return rows


def build_canonical_name_map(rows: list[dict[str, str]]) -> dict[str, str]:
    producao_cientifica_name_map = load_producao_cientifica_name_map()
    variants_by_key: dict[str, set[str]] = {}
    for row in rows:
        nome = row["nome_responsavel"]
        folded = fold_text(nome)
        if not folded:
            continue
        variants_by_key.setdefault(folded, set()).add(nome)
    canonical_map = {}
    for folded, variants in variants_by_key.items():
        canonical_map[folded] = producao_cientifica_name_map.get(folded) or choose_canonical_name(variants)
    return canonical_map


def apply_manual_row_overrides(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    overrides = {
        (
            "1",
            "2024_2",
            "MÉTODOS ESTATÍSTICOS APLICADOS AO MOVIMENTO HUMANO (Turma: 1)",
            "leonardo gomes de oliveira luz",
        ): {
            "nome_responsavel": "Leonardo Gomes de Oliveira Luz",
            "categoria_responsavel": "Participante Externo",
            "indicador_responsavel_principal": "Não",
            "carga_horaria_docente": "20",
        },
        (
            "01",
            "2025.2",
            "Tópicos Especiais: Temas Emergentes em Atividades Motoras e Saúde: COMPORTAMENTO DE MOVIMENTO DA CRIANÇA E DO ADOLESCENTE (Turma: 01)",
            "leonardo luz",
        ): {
            "nome_responsavel": "Leonardo Gomes de Oliveira Luz",
            "categoria_responsavel": "Docente",
            "indicador_responsavel_principal": "Sim",
            "carga_horaria_docente": "45",
        },
        (
            "01",
            "2026.1",
            "Tópicos Especiais: Temas Emergentes em Atividades Motoras e Saúde: LETRAMENTO CORPORAL (Turma: 01)",
            "leonardo luz",
        ): {
            "nome_responsavel": "Leonardo Gomes de Oliveira Luz",
            "categoria_responsavel": "Docente",
            "indicador_responsavel_principal": "Não",
            "carga_horaria_docente": "15",
        },
    }

    updated = []
    for row in rows:
        override_key = (
            row["nome_turma"],
            row["ano_periodo"],
            row["nome_disciplina_completo"],
            fold_text(row["nome_responsavel"]),
        )
        normalized_row = dict(row)
        if override_key in overrides:
            normalized_row.update(overrides[override_key])
        updated.append(normalized_row)
    return updated


def normalize_rows(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    canonical_names = build_canonical_name_map(rows)
    normalized = []
    for row in rows:
        normalized_row = dict(row)
        folded = fold_text(normalized_row["nome_responsavel"])
        if folded:
            normalized_row["nome_responsavel"] = canonical_names[folded]
        normalized.append(normalized_row)
    return apply_manual_row_overrides(normalized)


def write_outputs(rows: list[dict[str, str]]) -> None:
    json_payload = json.dumps(rows, ensure_ascii=False, indent=2) + "\n"
    OUTPUT_JSON.write_text(json_payload, encoding="utf-8")
    OUTPUT_JS.write_text(f"window.DISCIPLINAS_PPGEF = {json_payload.rstrip()};\n", encoding="utf-8")


def main() -> int:
    rows = load_csv_rows(SOURCE_CSV)
    overridden_rows = apply_manual_row_overrides(rows)
    normalized_rows = normalize_rows(overridden_rows)
    write_outputs(normalized_rows)

    before_names = {row["nome_responsavel"] for row in rows if row["nome_responsavel"]}
    after_names = {row["nome_responsavel"] for row in normalized_rows if row["nome_responsavel"]}
    print(f"Fonte: {SOURCE_CSV}")
    print(f"Linhas exportadas: {len(normalized_rows)}")
    print(f"Docentes distintos antes da normalização: {len(before_names)}")
    print(f"Docentes distintos após a normalização: {len(after_names)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
