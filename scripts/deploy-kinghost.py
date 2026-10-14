import ftplib
import os
from pathlib import Path
import ssl


def deploy():
    required = ["KINGHOST_FTP_HOST", "KINGHOST_FTP_USER", "KINGHOST_FTP_PASSWORD", "KINGHOST_FTP_DIR"]
    if any(not os.environ.get(key) for key in required):
        raise RuntimeError("Configure as variáveis KingHost e o segredo KINGHOST_FTP_PASSWORD.")
    root = Path("release").resolve()
    files = sorted(path for path in root.rglob("*") if path.is_file())
    if not files or not (root / "crmcabana/index.html").is_file():
        raise RuntimeError("Pacote de publicação incompleto.")
    with ftplib.FTP_TLS(context=ssl.create_default_context(), timeout=60) as ftp:
        ftp.connect(os.environ["KINGHOST_FTP_HOST"], 21)
        ftp.login(os.environ["KINGHOST_FTP_USER"], os.environ["KINGHOST_FTP_PASSWORD"])
        ftp.prot_p()
        ftp.cwd(os.environ["KINGHOST_FTP_DIR"])
        destination = ftp.pwd()
        for path in files:
            relative = path.relative_to(root)
            ftp.cwd(destination)
            for folder in relative.parts[:-1]:
                try:
                    ftp.cwd(folder)
                except ftplib.error_perm:
                    ftp.mkd(folder)
                    ftp.cwd(folder)
            with path.open("rb") as content:
                ftp.storbinary("STOR " + relative.name, content)
            print("Publicado: " + relative.as_posix())
    print("Envio concluído. Valide o site e o login do CRM antes de alterar o DNS.")


if __name__ == "__main__":
    deploy()
