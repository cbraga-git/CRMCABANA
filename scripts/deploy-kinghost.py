import os
from pathlib import Path
import subprocess
import tempfile
from urllib.parse import quote


def deploy():
    required = ["KINGHOST_FTP_HOST", "KINGHOST_FTP_USER", "KINGHOST_FTP_PASSWORD", "KINGHOST_FTP_DIR"]
    if any(not os.environ.get(key) for key in required):
        raise RuntimeError("Configure as variáveis KingHost e o segredo KINGHOST_FTP_PASSWORD.")
    root = Path("release").resolve()
    files = sorted(path for path in root.rglob("*") if path.is_file())
    if not files or not (root / "crmcabana/index.html").is_file():
        raise RuntimeError("Pacote de publicação incompleto.")
    credentials = os.environ["KINGHOST_FTP_USER"] + ":" + os.environ["KINGHOST_FTP_PASSWORD"]
    escaped = credentials.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n").replace("\r", "\\r")
    with tempfile.TemporaryDirectory() as temporary:
        config = Path(temporary) / "curl.conf"
        config.write_text('user = "' + escaped + '"\n', encoding="utf-8")
        os.chmod(config, 0o600)
        for path in files:
            relative = path.relative_to(root)
            directory = os.environ["KINGHOST_FTP_DIR"].strip("/")
            url = "ftp://" + os.environ["KINGHOST_FTP_HOST"] + "/" + quote(directory + "/" + relative.as_posix(), safe="/")
            subprocess.run(["curl.exe", "--config", str(config), "--ssl-reqd", "--silent", "--show-error", "--connect-timeout", "30", "--max-time", "180", "--ftp-create-dirs", "--upload-file", str(path), url], check=True)
            print("Publicado: " + relative.as_posix())
    print("Envio concluído. Valide o site e o login do CRM antes de alterar o DNS.")


if __name__ == "__main__":
    deploy()
