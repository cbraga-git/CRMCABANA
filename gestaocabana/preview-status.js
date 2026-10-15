(async () => {
  const field = document.querySelector("#gestaoBackendStatus");
  try {
    const response = await fetch("api/index.php/health", { cache: "no-store" });
    const status = await response.json();
    field.textContent = !status.php_supported ? "É necessário PHP 8.1 ou superior."
      : !status.pdo_pgsql ? "Habilite a extensão pdo_pgsql na KingHost."
      : !status.configured ? "API PHP disponível. Aguardando configuração privada do PostgreSQL."
      : "API configurada. Valide a conexão, os usuários e a importação antes de usar este ambiente.";
  } catch {
    field.textContent = "API PHP aguardando configuração na hospedagem.";
  }
})();
