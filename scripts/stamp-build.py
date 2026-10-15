"""Atualiza a identificacao do build antes da publicacao."""

import argparse
from datetime import datetime, timedelta, timezone
from pathlib import Path
import re
import subprocess


def stamp_build(root):
    revision = subprocess.run(
        ["git", "rev-parse", "--short=7", "HEAD"],
        cwd=Path(__file__).resolve().parent.parent,
        check=True, capture_output=True, text=True,
    ).stdout.strip()
    timestamp = datetime.now(timezone(timedelta(hours=-3))).strftime("%d/%m/%Y %H:%M")
    version = f"Build {timestamp} \u00b7 {revision}"
    updated = 0
    for app in ("crmcabana", "gestaocabana"):
        path = root / app / "index.html"
        if not path.is_file():
            continue
        html = path.read_text(encoding="utf-8")
        html, count = re.subn(
            r'(<div class="app-version"[^>]*>\s*<span class="app-version-label">.*?</span>\s*<strong>)[^<]*(</strong>)',
            lambda match: match[1] + version + match[2], html, count=1,
        )
        if count != 1:
            raise RuntimeError(f"Campo de versao nao encontrado: {path}")
        with path.open("w", encoding="utf-8", newline="\n") as output:
            output.write(html)
        updated += 1
    if not updated:
        raise RuntimeError("Nenhuma aplicacao encontrada no pacote.")
    print(version)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", type=Path, help="Pasta com crmcabana e/ou gestaocabana")
    stamp_build(parser.parse_args().root)
