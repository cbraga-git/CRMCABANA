"""Converte o CSV do SQL Editor em SQL, verificando integridade. Python 3.9+."""
import csv
import hashlib
import sys
from pathlib import Path


def convert(source, destination):
    csv.field_size_limit(1024 * 1024 * 1024)
    with Path(source).open(encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        if reader.fieldnames != ["seq", "total", "sql", "md5"]:
            raise ValueError("CSV incorreto. Exporte o resultado final com seq,total,sql,md5.")
        rows = list(reader)
    if not rows:
        raise ValueError("CSV vazio.")
    total = int(rows[0]["total"])
    if len(rows) != total:
        raise ValueError("Exportacao incompleta. Remova o limite de linhas no Supabase e exporte novamente.")
    for index, row in enumerate(rows, 1):
        if int(row["seq"]) != index or int(row["total"]) != total:
            raise ValueError("Exportacao fora de ordem ou incompleta.")
        if hashlib.md5(row["sql"].encode("utf-8")).hexdigest() != row["md5"]:
            raise ValueError(f"Texto truncado ou alterado na linha {index}. Exporte novamente.")
    if rows[0]["sql"] != "BEGIN;" or rows[-1]["sql"] != "COMMIT; -- CABANA_EXPORT_COMPLETO":
        raise ValueError("Inicio ou final da exportacao invalido.")
    # Recusa sobrescrever um arquivo existente.
    with Path(destination).open("x", encoding="utf-8", newline="\n") as handle:
        handle.write("-- PRIVADO: dados do CRM e hashes de senha. Nao publicar.\n")
        handle.write("\n".join(row["sql"] for row in rows) + "\n")
    return total


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit("Uso: python scripts/kinghost-preparar-importacao.py exportacao.csv importar-kinghost.sql")
    try:
        count = convert(sys.argv[1], sys.argv[2])
        print(f"SQL criado e verificado: {count} instrucoes. Importe no PostgreSQL KingHost.")
    except (ValueError, OSError, csv.Error) as error:
        sys.exit(f"Nao foi criado o SQL: {error}")
