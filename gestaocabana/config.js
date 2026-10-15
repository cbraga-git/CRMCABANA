window.CRM_CONFIG = {
  // Endereço público da API local. Nenhuma senha de banco é enviada ao navegador.
  supabaseUrl: new URL("api/index.php", window.location.href).href.replace(/\/$/, ""),
  supabaseAnonKey: "gestaocabana-local-api",
  clientsTable: "crm_clients",
  profilesTable: "crm_profiles",
};
