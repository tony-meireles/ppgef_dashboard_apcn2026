import csv
import json
import re
import sys
import unicodedata
from collections import Counter
from datetime import date
from pathlib import Path


REFERENCE_YEAR = 2026
RECENT_WINDOW_START = 2022
CORPO_DOCENTE_PATH = Path("dashboard/corpo-docente-data.js")
INTERNATIONAL_KEYWORDS = (
    "INTERNACIONAL",
    "INTERNATIONAL",
    "FULBRIGHT",
    "ERASMUS",
    "HORIZON",
    "EUROPEAN",
    "NSF",
    "NIH",
    "WELCOME TRUST",
    "BRITISH COUNCIL",
)


def clean_text(value):
    return re.sub(r"\s+", " ", str(value or "").strip())


def strip_accents(value):
    return "".join(
        char
        for char in unicodedata.normalize("NFD", clean_text(value))
        if unicodedata.category(char) != "Mn"
    )


def slug_text(value):
    text = strip_accents(value).lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def parse_number(value):
    text = clean_text(value)
    if not text:
        return 0.0
    text = re.sub(r"[R$\s]", "", text)
    if "," in text and "." in text:
        text = text.replace(".", "").replace(",", ".")
    elif "," not in text and "." in text:
        parts = text.split(".")
        if len(parts) > 1 and len(parts[-1]) == 3 and all(part.isdigit() for part in parts):
            text = "".join(parts)
    elif "," in text:
        text = text.replace(".", "").replace(",", ".")
    try:
        return round(float(text), 2)
    except ValueError:
        return 0.0


def parse_year(value):
    text = clean_text(value)
    match = re.search(r"(19|20)\d{2}", text)
    return int(match.group(0)) if match else None


def parse_years_from_columns(row, vigencia_columns):
    years = []
    for column in vigencia_columns:
        if clean_text(row.get(column)).lower() != "sim":
            continue
        match = re.search(r"\[(\d{4})\]", column)
        if match:
            years.append(int(match.group(1)))
    return sorted(set(years))


def parse_types(value):
    return [clean_text(part) for part in str(value or "").split(",") if clean_text(part)]


def normalize_agency(raw_agency, edital_name, title):
    original = clean_text(raw_agency)
    haystack = strip_accents(" ".join([original, edital_name, title])).upper()

    if "FINEP" in haystack:
        return "FINEP", "FINEP"
    if "FACEPE" in haystack:
        return "FACEPE", "FACEPE"
    if "CAPES" in haystack:
        return "CAPES", "CAPES"
    if "CNPQ" in haystack:
        return "CNPq", "CNPq"
    if "FUNCAP" in haystack:
        return "FUNCAP", "Outras fontes"
    if any(token in haystack for token in ("PROPESQI", "PROPG", "PRO-REITORIA DE PESQUISA", "PRO REITORIA DE PESQUISA")):
        return "PROPESQI/UFPE", "UFPE/PROPG/PROPESQI/PROGRAD"
    if "PROGRAD" in haystack:
        return "PROGRAD/UFPE", "UFPE/PROPG/PROPESQI/PROGRAD"
    if "UFPE" in haystack:
        return "UFPE", "UFPE/PROPG/PROPESQI/PROGRAD"
    if any(keyword in haystack for keyword in INTERNATIONAL_KEYWORDS):
        return original or "Agência internacional", "Agências internacionais"
    if original and original.lower() != "outra":
        return original, "Outras fontes"
    return "Não informada", "Outras fontes"


def infer_international(title, edital_name, agency_normalized, agency_group):
    haystack = strip_accents(" ".join([title, edital_name, agency_normalized])).upper()
    if agency_group == "Agências internacionais":
        return True
    return any(keyword in haystack for keyword in INTERNATIONAL_KEYWORDS)


def infer_pq_dt(title, edital_name, edital_number, agency_normalized):
    haystack = strip_accents(" ".join([title, edital_name, edital_number, agency_normalized])).upper()
    produtividade_markers = (
        "BOLSA DE PRODUTIVIDADE",
        "PRODUTIVIDADE EM PESQUISA",
        "BOLSISTA DE PRODUTIVIDADE",
        "PESQUISADOR PRODUTIVIDADE",
        " BPI ",
    )
    desenvolvimento_markers = (
        "BOLSA DE PRODUTIVIDADE EM DESENVOLVIMENTO TECNOLOGICO",
        "DESENVOLVIMENTO TECNOLOGICO E EXTENSAO INOVADORA - DT",
        "DESENVOLVIMENTO TECNOLOGICO E EXTENSAO INOVADORA",
        "EXTENSAO INOVADORA - DT",
    )

    normalized = f" {haystack} "
    produtividade = any(marker in normalized for marker in produtividade_markers)
    desenvolvimento = any(marker in normalized for marker in desenvolvimento_markers)

    return produtividade, desenvolvimento


def compute_vigencia(years, edital_year):
    if years:
        return years[0], years[-1], len(years)
    if edital_year:
        return edital_year, edital_year, 1
    return None, None, 0


def classify_vigencia(ano_inicio, ano_fim):
    if ano_inicio is None or ano_fim is None:
        return "Sem vigência informada", False
    if ano_inicio > REFERENCE_YEAR:
        return "Futura", False
    if ano_fim < REFERENCE_YEAR:
        return "Encerrada", False
    return "Vigente", True


def intersects_recent_window(ano_inicio, ano_fim, edital_year):
    if ano_inicio is not None and ano_fim is not None:
        return ano_fim >= RECENT_WINDOW_START and ano_inicio <= REFERENCE_YEAR
    if edital_year is not None:
        return RECENT_WINDOW_START <= edital_year <= REFERENCE_YEAR
    return False


def build_auditoria_note(is_duplicate, duplicate_count, bolsa_produtividade, bolsa_dt, internacional, status_vigencia):
    notes = []
    if is_duplicate:
        notes.append(f"Possível duplicidade ({duplicate_count} registro(s) com mesma chave analítica).")
    if bolsa_produtividade or bolsa_dt:
        labels = []
        if bolsa_produtividade:
            labels.append("PQ")
        if bolsa_dt:
            labels.append("DT")
        notes.append(f"Marcador estratégico identificado: {'/'.join(labels)}.")
    if internacional:
        notes.append("Captação classificada como internacional.")
    notes.append(f"Situação de vigência: {status_vigencia}.")
    return " ".join(notes) if notes else "Sem observação adicional."


def load_docente_line_map():
    if not CORPO_DOCENTE_PATH.exists():
        return {}
    raw = CORPO_DOCENTE_PATH.read_text(encoding="utf-8")
    payload = json.loads(re.sub(r"^window\.CORPO_DOCENTE_PPGEF\s*=\s*", "", raw).rstrip(";\n "))
    docente_map = {}
    for item in payload.get("docentes", []):
        docente = clean_text(item.get("docente"))
        if not docente:
            continue
        linhas = []
        if item.get("ams"):
            linhas.append("AMS")
        if item.get("dfe"):
            linhas.append("DFE")
        docente_map[slug_text(docente)] = linhas or ["Não informada"]
    return docente_map


def main():
    source = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("data/captacao_recursos.csv")
    target = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("dashboard/captacao-recursos-data.js")
    docente_line_map = load_docente_line_map()

    with source.open("r", encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))

    if not rows:
        raise SystemExit("CSV vazio.")

    vigencia_columns = [column for column in rows[0].keys() if column.startswith("Anos de vigência da captação [")]
    normalized_rows = []
    duplicate_keys = []
    duplicate_counter = Counter()

    for index, row in enumerate(rows, start=1):
        docente = clean_text(row.get("Nome do docente"))
        titulo = clean_text(row.get("Título do projeto, auxílio, bolsa ou captação"))
        edital_nome = clean_text(row.get("Nome do edital ou chamada"))
        edital_numero = clean_text(row.get("Número do edital ou chamada"))
        edital_ano = parse_year(row.get("Ano do edital"))
        vigencia_years = parse_years_from_columns(row, vigencia_columns)
        tipos = parse_types(row.get("Tipo de captação"))
        agency_normalized, agency_group = normalize_agency(
            row.get("Agência ou fonte de fomento"),
            edital_nome,
            titulo,
        )
        ano_inicio, ano_fim, anos_vigencia = compute_vigencia(vigencia_years, edital_ano)
        status_vigencia, vigente_em_2026 = classify_vigencia(ano_inicio, ano_fim)
        bolsa_produtividade, bolsa_dt = infer_pq_dt(titulo, edital_nome, edital_numero, agency_normalized)
        internacional = infer_international(titulo, edital_nome, agency_normalized, agency_group)
        linha_pesquisa_lista = docente_line_map.get(slug_text(docente), ["Não informada"])
        edital_processo = " · ".join(
            part
            for part in [edital_nome, edital_numero, str(edital_ano) if edital_ano else ""]
            if clean_text(part)
        )

        duplicate_key = "|".join(
            [
                slug_text(docente),
                slug_text(titulo),
                slug_text(agency_normalized),
                slug_text(edital_numero or edital_nome),
                slug_text(row.get("Situação da captação")),
                str(ano_inicio or ""),
                str(ano_fim or ""),
            ]
        )
        duplicate_counter[duplicate_key] += 1
        duplicate_keys.append(duplicate_key)

        normalized_rows.append(
            {
                "id": index,
                "carimbo_data_hora": clean_text(row.get("Carimbo de data/hora")),
                "docente": docente,
                "titulo": titulo,
                "tipos": tipos,
                "tipo_lista": tipos,
                "status": clean_text(row.get("Situação da captação")) or "Não informada",
                "agencia": agency_normalized,
                "agencia_original": clean_text(row.get("Agência ou fonte de fomento")),
                "agencia_normalizada": agency_normalized,
                "agencia_grupo": agency_group,
                "edital_nome": edital_nome,
                "edital_numero": edital_numero,
                "edital_ano": edital_ano,
                "edital_processo": edital_processo,
                "vigencia_anos": [str(year) for year in vigencia_years],
                "ano_inicio": ano_inicio,
                "ano_fim": ano_fim,
                "anos_vigencia": anos_vigencia,
                "status_vigencia": status_vigencia,
                "vigente_em_2026": vigente_em_2026,
                "recorte_apcn_2022_2026": intersects_recent_window(ano_inicio, ano_fim, edital_ano),
                "valor_total": parse_number(row.get("Valor total aprovado")),
                "valor_capital": parse_number(row.get("Valor aprovado para capital")),
                "valor_custeio": parse_number(row.get("Valor aprovado para consumo/custeio")),
                "valor_bolsas_aprovado": parse_number(row.get("Valor aprovado para bolsas")),
                "bolsa_destinacao": clean_text(row.get("Caso a captação envolva bolsa, informe a destinação")),
                "quantidade_bolsas": int(parse_number(row.get("Quantidade de bolsas"))),
                "duracao_bolsas_meses": int(parse_number(row.get("Duração total das bolsas em meses"))),
                "valor_bolsas_destinado": parse_number(row.get("Valor total destinado às bolsas")),
                "alunos_mestrado": int(parse_number(row.get("Número de alunos de mestrado vinculados"))),
                "alunos_doutorado": int(parse_number(row.get("Número de alunos de doutorado vinculados"))),
                "bolsa_produtividade": bolsa_produtividade,
                "bolsa_desenvolvimento_tecnologico": bolsa_dt,
                "captacao_internacional": internacional,
                "linha_pesquisa": " + ".join(linha_pesquisa_lista),
                "linha_pesquisa_lista": linha_pesquisa_lista,
                "status_revisao": "Pendente" if False else "Sem alerta",
                "evidencia_documento": "",
                "link_edital_processo": "",
                "observacao_auditoria": "",
            }
        )

    for item, duplicate_key in zip(normalized_rows, duplicate_keys):
        is_duplicate = duplicate_counter[duplicate_key] > 1
        item["suspeita_duplicidade"] = is_duplicate
        item["duplicidade_suspeita"] = is_duplicate
        item["duplicidade_grupo"] = duplicate_counter[duplicate_key]
        item["chave_deduplicacao"] = duplicate_key
        item["motivo_alerta"] = (
            "Mesmo docente, título, agência, edital e janela de vigência em múltiplos registros."
            if is_duplicate
            else ""
        )
        item["status_revisao"] = "Pendente" if is_duplicate else "Sem alerta"
        item["observacao_auditoria"] = build_auditoria_note(
            is_duplicate,
            item["duplicidade_grupo"],
            item["bolsa_produtividade"],
            item["bolsa_desenvolvimento_tecnologico"],
            item["captacao_internacional"],
            item["status_vigencia"],
        )

    payload = {
        "updated_at": date.today().isoformat(),
        "source_csv": str(source),
        "reference_year": REFERENCE_YEAR,
        "recent_window_start": RECENT_WINDOW_START,
        "rows": normalized_rows,
    }

    target.write_text(
        "window.CAPTACAO_RECURSOS_PPGEF = " + json.dumps(payload, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
