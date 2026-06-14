import csv
import json
import re
import sys
from collections import Counter
from pathlib import Path


def clean_text(value):
    return re.sub(r"\s+", " ", str(value or "").strip())


def parse_number(value):
    text = clean_text(value)
    if not text:
        return 0.0
    if "," in text and "." in text:
        text = text.replace(".", "").replace(",", ".")
    elif "," not in text and "." in text:
        parts = text.split(".")
        if len(parts[-1]) == 3 and all(part.isdigit() for part in parts):
            text = "".join(parts)
    elif "," in text:
        text = text.replace(",", ".")
    try:
        return round(float(text), 2)
    except ValueError:
        return 0.0


def slug_text(value):
    text = clean_text(value).lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def infer_agency(raw_agency, edital_name, title):
    agency = clean_text(raw_agency)
    if agency and agency.lower() != "outra":
        return agency

    haystack = " ".join([clean_text(edital_name), clean_text(title)]).upper()
    if "FUNCAP" in haystack:
        return "FUNCAP"
    if "PROGRAD" in haystack:
        return "PROGRAD/UFPE"
    if "PROPESQI" in haystack:
        return "PROPESQI/UFPE"
    return agency or "Não informada"


def main():
    source = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("data/captacao_recursos.csv")
    target = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("dashboard/captacao-recursos-data.js")

    with source.open("r", encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))

    if not rows:
        raise SystemExit("CSV vazio.")

    vigencia_columns = [column for column in rows[0].keys() if column.startswith("Anos de vigência da captação [")]
    normalized_rows = []
    duplicate_keys = []
    duplicate_counter = Counter()

    for index, row in enumerate(rows, start=1):
        vigencia_anos = [
            re.search(r"\[(\d{4})\]", column).group(1)
            for column in vigencia_columns
            if clean_text(row.get(column)).lower() == "sim"
        ]
        tipos = [clean_text(part) for part in str(row.get("Tipo de captação") or "").split(",") if clean_text(part)]
        agencia = infer_agency(
            row.get("Agência ou fonte de fomento"),
            row.get("Nome do edital ou chamada"),
            row.get("Título do projeto, auxílio, bolsa ou captação"),
        )
        duplicate_key = "|".join(
            [
                slug_text(row.get("Nome do docente")),
                slug_text(row.get("Título do projeto, auxílio, bolsa ou captação")),
                slug_text(agencia),
                slug_text(row.get("Número do edital ou chamada")),
                slug_text(row.get("Situação da captação")),
            ]
        )
        duplicate_counter[duplicate_key] += 1
        duplicate_keys.append(duplicate_key)

        normalized_rows.append(
            {
                "id": index,
                "carimbo_data_hora": clean_text(row.get("Carimbo de data/hora")),
                "docente": clean_text(row.get("Nome do docente")),
                "titulo": clean_text(row.get("Título do projeto, auxílio, bolsa ou captação")),
                "tipos": tipos,
                "status": clean_text(row.get("Situação da captação")) or "Não informada",
                "agencia": agencia,
                "agencia_original": clean_text(row.get("Agência ou fonte de fomento")),
                "edital_nome": clean_text(row.get("Nome do edital ou chamada")),
                "edital_numero": clean_text(row.get("Número do edital ou chamada")),
                "edital_ano": clean_text(row.get("Ano do edital")),
                "vigencia_anos": vigencia_anos,
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
            }
        )

    for item, duplicate_key in zip(normalized_rows, duplicate_keys):
        item["suspeita_duplicidade"] = duplicate_counter[duplicate_key] > 1
        item["duplicidade_grupo"] = duplicate_counter[duplicate_key]

    payload = {
        "updated_at": "2026-06-14",
        "source_csv": str(source),
        "rows": normalized_rows,
    }

    target.write_text(
        "window.CAPTACAO_RECURSOS_PPGEF = " + json.dumps(payload, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
