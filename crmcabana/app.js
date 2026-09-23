const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const STORAGE_KEY = "movelcrm-clients";
const SESSION_KEY = "movelcrm-session";
const ENVIRONMENT_STORAGE_KEY = "movelcrm-environments";
const SIDEBAR_COLLAPSED_KEY = "movelcrm-sidebar-collapsed";
const CLIENT_COLUMNS_WIDTH_KEY = "movelcrm-client-column-widths";
const BUDGET_COLUMNS_WIDTH_KEY = "movelcrm-budget-column-widths";
const BUDGET_STATUS_STORAGE_KEY = "movelcrm-budget-statuses";
const APP_PREFERENCES_KEY = "movelcrm-app-preferences";
const DEFAULT_APP_PREFERENCES = {
  budgetCodeSeparator: " - ",
  showStatusCounts: true,
  showNobiliaInList: true,
};
const STATUS = [
  "Todos",
  "Em Andamento",
  "Novo",
  "Contato Realizado",
  "Visita Agendada",
  "Projeto",
  "Orçamento",
  "Medição",
  "Entrega Fabrica",
  "Montagem",
  "Negociação",
  "Venda Fechada",
  "Não Fechou",
];
const DEFAULT_STATUS = "Novo";
const BUDGET_CLIENT_STATUS = "Orçamento";
const IN_PROGRESS_STATUS = "Em Andamento";
const WON_STATUS = "Venda Fechada";
const LOST_STATUS = "Não Fechou";
const FINISHED_STATUS = [WON_STATUS, LOST_STATUS];
const FINAL_USE_OPTIONS = ["Alugar", "Residir", "Negociar"];
const FINANCING_RATES = {
  30: {
    1: { coefficient: 1.0274, retention: 0.0267 },
    2: { coefficient: 0.52064, retention: 0.0396 },
    3: { coefficient: 0.35176, retention: 0.0524 },
    4: { coefficient: 0.26736, retention: 0.0649 },
    5: { coefficient: 0.21674, retention: 0.0772 },
    6: { coefficient: 0.18301, retention: 0.0893 },
    7: { coefficient: 0.15804, retention: 0.096 },
    8: { coefficient: 0.14, retention: 0.1072 },
    9: { coefficient: 0.12599, retention: 0.1181 },
    10: { coefficient: 0.11479, retention: 0.1288 },
    11: { coefficient: 0.10564, retention: 0.1394 },
    12: { coefficient: 0.09802, retention: 0.1498 },
    13: { coefficient: 0.09307, retention: 0.1735 },
    14: { coefficient: 0.08756, retention: 0.1843 },
    15: { coefficient: 0.0828, retention: 0.1948 },
    16: { coefficient: 0.07864, retention: 0.2052 },
    17: { coefficient: 0.07498, retention: 0.2154 },
    18: { coefficient: 0.07173, retention: 0.2255 },
    19: { coefficient: 0.06883, retention: 0.2353 },
    20: { coefficient: 0.06623, retention: 0.245 },
    21: { coefficient: 0.06388, retention: 0.2545 },
    22: { coefficient: 0.06175, retention: 0.2638 },
    23: { coefficient: 0.05981, retention: 0.273 },
    24: { coefficient: 0.05803, retention: 0.282 },
  },
  60: {
    1: { coefficient: 1.05555, retention: 0.0526 },
    2: { coefficient: 0.53491, retention: 0.0653 },
    3: { coefficient: 0.3614, retention: 0.0777 },
    4: { coefficient: 0.27468, retention: 0.0899 },
    5: { coefficient: 0.22267, retention: 0.1018 },
    6: { coefficient: 0.18802, retention: 0.1136 },
    7: { coefficient: 0.16213, retention: 0.1189 },
    8: { coefficient: 0.14363, retention: 0.1297 },
    9: { coefficient: 0.12925, retention: 0.1404 },
    10: { coefficient: 0.11776, retention: 0.1508 },
    11: { coefficient: 0.10837, retention: 0.1612 },
    12: { coefficient: 0.10056, retention: 0.1713 },
    13: { coefficient: 0.09571, retention: 0.1963 },
    14: { coefficient: 0.09005, retention: 0.2068 },
    15: { coefficient: 0.08515, retention: 0.2171 },
    16: { coefficient: 0.08087, retention: 0.2272 },
    17: { coefficient: 0.07711, retention: 0.2371 },
    18: { coefficient: 0.07377, retention: 0.2469 },
    19: { coefficient: 0.07078, retention: 0.2564 },
    20: { coefficient: 0.06811, retention: 0.2659 },
    21: { coefficient: 0.06569, retention: 0.2751 },
    22: { coefficient: 0.0635, retention: 0.2842 },
    23: { coefficient: 0.06151, retention: 0.2931 },
    24: { coefficient: 0.05968, retention: 0.3019 },
  },
};
const DEFAULT_BUDGET_SETTINGS = {
  discountRate: 0,
  freightValue: 0,
  releaseRate: 2,
  assemblyRate: 12,
  lelaRate: 0,
  irisRate: 0,
  taxRate: 4.9,
  entry: 0,
  entryTerm: 30,
  installments: 0,
  dailyQuantity: 0,
  dailyValue: 0,
  assemblerName: "",
  assemblyStartDate: "",
  assemblyEndDate: "",
};
const DEFAULT_BUDGET_STATUSES = [
  { name: "Novo", budget: true, order: false }, { name: "Negociação", budget: true, order: false },
  { name: "Aprovado", budget: true, order: true }, { name: "Pedido", budget: true, order: true },
  { name: "Emissão de NF", budget: true, order: true }, { name: "Finalizado", budget: true, order: false },
  { name: "Recusado", budget: true, order: false },
];
let BUDGET_STATUS = DEFAULT_BUDGET_STATUSES.map((status) => status.name);
let ORDER_STATUS = DEFAULT_BUDGET_STATUSES.filter((status) => status.order).map((status) => status.name);
const STATUS_MIGRATION = {
  Lead: "Novo",
  "Em negociacao": "Negociação",
  "Em negociação": "Negociação",
  Fechado: WON_STATUS,
  Cancelado: LOST_STATUS,
  "Fechado Ganho": WON_STATUS,
  "Fechado Perdido": LOST_STATUS,
};
const DEFAULT_ENVIRONMENTS = [
  "AMBIENTE",
  "COZINHA",
  "SALA",
  "DORMITORIO",
  "CLOSET",
  "BANHEIRO",
  "LAVANDERIA",
  "HOME OFFICE",
  "AREA GOURMET",
  "PAINEL",
  "ESCRITORIO",
];
const CONFIG = window.CRM_CONFIG || {};

const FINANCE_MODULE_VIEWS = {
  financeOverview: ["Visão geral", "Acompanhe o fluxo financeiro da empresa.", "Módulo financeiro iniciado", "Cadastre contas e importe um extrato para começar."],
  financeAccounts: ["Contas", "Organize contas bancárias, caixas e cartões.", "Nenhuma conta cadastrada", "As contas financeiras serão mantidas separadas dos cadastros atuais do CRM."],
  financeTransactions: ["Transações", "Consulte receitas, despesas e transferências.", "Nenhuma transação registrada", "Os lançamentos poderão ser incluídos manualmente ou por importação de extrato."],
  financePayable: ["Contas a pagar", "Controle compromissos, parcelas e vencimentos.", "Nenhuma conta a pagar", "Aqui ficarão as despesas pendentes, pagas e vencidas."],
  financeReceivable: ["Contas a receber", "Controle recebimentos e inadimplência.", "Nenhuma conta a receber", "Futuramente, parcelas de vendas poderão ser vinculadas sem alterar os pedidos existentes."],
  financeImport: ["Importar extrato", "Importe arquivos OFX ou CSV para conferência.", "Importação de extratos", "O fluxo terá pré-visualização, detecção de duplicidades, categorização e confirmação antes de gravar."],
  financeCategories: ["Categorias", "Classifique receitas e despesas.", "Nenhuma categoria financeira", "Categorias e centros de custo terão cadastros próprios."],
  financePlanning: ["Planejamento", "Projete receitas, despesas e saldo futuro.", "Planejamento financeiro", "Orçamentos mensais e lançamentos recorrentes serão exibidos aqui."],
};

function isFinanceModuleView(view) {
  return Boolean(FINANCE_MODULE_VIEWS[view]);
}

const state = {
  session: null,
  userRole: "user",
  userProfiles: [],
  userLogs: [],
  appPreferences: loadAppPreferences(),
  view: "clients",
  dashboardStatus: IN_PROGRESS_STATUS,
  clientStatus: IN_PROGRESS_STATUS,
  budgetStatus: "Todos",
  budgetSelectedStatuses: ["Todos"],
  financialStatuses: ["Todos"],
  budgetStartDate: "",
  budgetEndDate: "",
  search: "",
  projectSearch: "",
  budgetSearch: "",
  clientSort: { key: "created", direction: "desc" },
  budgetSort: { key: "updatedAt", direction: "desc" },
  budgetEditing: false,
  budgetDirty: false,
  budgetIsNew: false,
  budgetSourceId: null,
  budgetEditingId: null,
  budgetLastStatus: "",
  budgetDraft: null,
  selectedId: null,
  editingId: null,
  projectAction: "stay",
  projectReturnView: "clients",
  projectInlineEditing: false,
  projectDirty: false,
  clientDialogDirty: false,
  returnView: "clients",
  clients: [],
  environments: [],
  budgetStatuses: DEFAULT_BUDGET_STATUSES.map((status) => ({ ...status })),
  financialAccounts: [],
  financialCategories: [],
  financialEditingAccountId: null,
  financialEditingCategoryId: null,
  financialEntries: [],
  financialImports: [],
  financialEditingEntryId: null,
  financialEntryDraftTags: [],
  financialTagEntries: null,
  financialTagEditingName: null,
  financialTagUpdating: false,
  financialStatementItems: [],
  financialSelectedImportId: null,
  financialCategoryTargetItemId: null,
  financialCategoryTargetEntry: false,
  financialDashboardMonth: new Date().toISOString().slice(0, 7),
  financialEvolutionView: "chart",
  financialEvolutionAccountId: "",
  financialEntryAccountFilter: "",
  financialEntryMonthFilter: new Date().toISOString().slice(0, 7),
  financialEntryFilters: { search: "", type: "", accountId: "__bank_accounts__", categoryId: "", status: "", startDate: "", endDate: "" },
  financialEntryShowDailyBalance: true,
};

const elements = {
  authScreen: document.querySelector("#authScreen"),
  crmShell: document.querySelector("#crmShell"),
  authForm: document.querySelector("#authForm"),
  authTitle: document.querySelector("#authTitle"),
  authSubtitle: document.querySelector("#authSubtitle"),
  authEmail: document.querySelector("#authEmail"),
  authPassword: document.querySelector("#authPassword"),
  authMessage: document.querySelector("#authMessage"),
  authSubmit: document.querySelector("#authSubmit"),
  logoutBtn: document.querySelector("#logoutBtn"),
  sidebarToggle: document.querySelector("#sidebarToggle"),
  syncPendingChip: document.querySelector("#syncPendingChip"),
  userName: document.querySelector("#userName"),
  userEmail: document.querySelector("#userEmail"),
  usersNavItem: document.querySelector("#usersNavItem"),
  budgetStatusesNavItem: document.querySelector("#budgetStatusesNavItem"),
  maintenanceNavItem: document.querySelector("#maintenanceNavItem"),
  reportsNavItem: document.querySelector("#reportsNavItem"),
  budgetNavItem: document.querySelector("#budgetNavItem"),
  orderNavItem: document.querySelector("#orderNavItem"),
  financialNavGroup: document.querySelector("#financialNavGroup"),
  financialNavToggle: document.querySelector("#financialNavToggle"),
  financialSubmenu: document.querySelector("#financialSubmenu"),
  backupSiteDataBtn: document.querySelector("#backupSiteDataBtn"),
  backupStatus: document.querySelector("#backupStatus"),
  userRows: document.querySelector("#userRows"),
  userLogRows: document.querySelector("#userLogRows"),
  userAdminForm: document.querySelector("#userAdminForm"),
  newUserEmail: document.querySelector("#newUserEmail"),
  newUserPassword: document.querySelector("#newUserPassword"),
  newUserRole: document.querySelector("#newUserRole"),
  navItems: document.querySelectorAll(".nav-item"),
  views: document.querySelectorAll(".view"),
  dashboardFilters: document.querySelector('[data-filter-group="dashboard"]'),
  clientFilters: document.querySelector('[data-filter-group="clients"]'),
  budgetFilters: document.querySelector('[data-filter-group="budget"]'),
  financialFilters: document.querySelector('[data-filter-group="financial"]'),
  budgetStartDate: document.querySelector("#budgetStartDate"),
  budgetEndDate: document.querySelector("#budgetEndDate"),
  financialStartDate: document.querySelector("#financialStartDate"),
  financialEndDate: document.querySelector("#financialEndDate"),
  financialModuleStats: document.querySelector("#financialModuleStats"),
  financialModuleEmpty: document.querySelector(".financial-module-empty"),
  financialAccountsPanel: document.querySelector("#financialAccountsPanel"),
  financialCategoriesPanel: document.querySelector("#financialCategoriesPanel"),
  financialAccountRows: document.querySelector("#financialAccountRows"),
  financialCategoryRows: document.querySelector("#financialCategoryRows"),
  financialAccountDialog: document.querySelector("#financialAccountDialog"),
  financialAccountForm: document.querySelector("#financialAccountForm"),
  financialCategoryDialog: document.querySelector("#financialCategoryDialog"),
  financialCategoryForm: document.querySelector("#financialCategoryForm"),
  financialEntriesPanel: document.querySelector("#financialEntriesPanel"),
  financialTransactionSummary: document.querySelector("#financialTransactionSummary"),
  financialEntryRows: document.querySelector("#financialEntryRows"),
  financialEntryDialog: document.querySelector("#financialEntryDialog"),
  financialEntryForm: document.querySelector("#financialEntryForm"),
  financialImportPanel: document.querySelector("#financialImportPanel"),
  financialImportRows: document.querySelector("#financialImportRows"),
  financialStatementFile: document.querySelector("#financialStatementFile"),
  financialMigrationFile: document.querySelector("#financialMigrationFile"),
  financialImportDetail: document.querySelector("#financialImportDetail"),
  financialStatementItemRows: document.querySelector("#financialStatementItemRows"),
  clientsHeader: document.querySelector("#clientsHeader"),
  clientsDashboardFilters: document.querySelector("#clientsDashboardFilters"),
  clientsDashboardStats: document.querySelector("#clientsDashboardStats"),
  clientsListCard: document.querySelector("#clientsListCard"),
  clientInlineEditor: document.querySelector("#clientInlineEditor"),
  clientRows: document.querySelector("#clientRows"),
  projectCards: document.querySelector("#projectCards"),
  projectListRows: document.querySelector("#projectListRows"),
  projectSearch: document.querySelector("#projectSearch"),
  budgetSearch: document.querySelector("#budgetSearch"),
  budgetListRows: document.querySelector("#budgetListRows"),
  budgetListCard: document.querySelector("#budgetListCard"),
  budgetEditor: document.querySelector("#budgetEditor"),
  budgetPrintPreview: document.querySelector("#budgetPrintPreview"),
  budgetPrintPreviewTitle: document.querySelector("#budgetPrintPreviewTitle"),
  budgetPrintPreviewContent: document.querySelector("#budgetPrintPreviewContent"),
  budgetPreviewPrintBtn: document.querySelector("#budgetPreviewPrintBtn"),
  budgetPreviewCloseBtn: document.querySelector("#budgetPreviewCloseBtn"),
  budgetDeleteBtn: document.querySelector("#budgetDeleteBtn"),
  budgetSaleAt: document.querySelector("#budgetSaleAt"),
  budgetSaleAtField: document.querySelector("#budgetSaleAtField"),
  orderDeliveryForecastAt: document.querySelector("#orderDeliveryForecastAt"),
  clientSearch: document.querySelector("#clientSearch"),
  chart: document.querySelector("#statusChart"),
  dialog: document.querySelector("#clientDialog"),
  form: document.querySelector("#clientForm"),
  projectDialog: document.querySelector("#projectDialog"),
  projectForm: document.querySelector("#projectForm"),
  projectRows: document.querySelector("#projectEnvironmentRows"),
  environmentOptions: document.querySelector("#environmentOptions"),
  environmentRows: document.querySelector("#environmentRows"),
  environmentCount: document.querySelector("#environmentCount"),
  environmentForm: document.querySelector("#environmentForm"),
  environmentNameInput: document.querySelector("#environmentNameInput"),
  budgetStatusAdminForm: document.querySelector("#budgetStatusAdminForm"),
  newBudgetStatusName: document.querySelector("#newBudgetStatusName"),
  newBudgetStatusBudget: document.querySelector("#newBudgetStatusBudget"),
  newBudgetStatusOrder: document.querySelector("#newBudgetStatusOrder"),
  budgetStatusAdminRows: document.querySelector("#budgetStatusAdminRows"),
  budgetStatusAdminMessage: document.querySelector("#budgetStatusAdminMessage"),
  leadImportFile: document.querySelector("#leadImportFile"),
  promobImportFile: document.querySelector("#promobImportFile"),
  budgetClientSelect: document.querySelector("#budgetClientSelect"),
  budgetRows: document.querySelector("#budgetRows"),
  orderMaterialEditor: document.querySelector("#orderMaterialEditor"),
  orderMaterialRows: document.querySelector("#orderMaterialRows"),
};

function createId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `client-${Date.now()}-${Math.round(Math.random() * 100000)}`;
}

function remoteDatabaseEnabled() {
  return Boolean(CONFIG.supabaseUrl && CONFIG.supabaseAnonKey);
}

function authEnabled() {
  return remoteDatabaseEnabled();
}

function currentUserId() {
  return state.session?.user?.id || null;
}

function currentAccessToken() {
  return state.session?.access_token || CONFIG.supabaseAnonKey;
}

function supabaseAuthEndpoint(path = "") {
  const baseUrl = CONFIG.supabaseUrl.replace(/\/$/, "");
  return `${baseUrl}/auth/v1${path}`;
}

function supabaseHeaders(prefer = "return=minimal") {
  return {
    apikey: CONFIG.supabaseAnonKey,
    Authorization: `Bearer ${currentAccessToken()}`,
    "Content-Type": "application/json",
    Prefer: prefer,
  };
}

function supabaseEndpoint(path = "") {
  const baseUrl = CONFIG.supabaseUrl.replace(/\/$/, "");
  return `${baseUrl}/rest/v1/${CONFIG.clientsTable || "crm_clients"}${path}`;
}

function supabaseProfilesEndpoint(path = "") {
  const baseUrl = CONFIG.supabaseUrl.replace(/\/$/, "");
  return `${baseUrl}/rest/v1/${CONFIG.profilesTable || "crm_profiles"}${path}`;
}

function supabaseTableEndpoint(table, path = "") {
  const baseUrl = CONFIG.supabaseUrl.replace(/\/$/, "");
  return `${baseUrl}/rest/v1/${table}${path}`;
}

function supabaseRpcEndpoint(functionName) {
  const baseUrl = CONFIG.supabaseUrl.replace(/\/$/, "");
  return `${baseUrl}/rest/v1/rpc/${functionName}`;
}

function authHeaders() {
  return {
    apikey: CONFIG.supabaseAnonKey,
    "Content-Type": "application/json",
  };
}

// O access_token do Supabase expira (padrao 1h) e nunca era renovado: uma sessao aberta por
// mais tempo passava a levar 401 em toda chamada, inclusive ao salvar, e a mensagem de erro
// (generica, "verifique a conexao") escondia que o problema era sessao expirada, nao rede.
async function refreshAccessToken() {
  const refreshToken = state.session?.refresh_token;
  if (!refreshToken) return false;
  try {
    const response = await fetch(supabaseAuthEndpoint("/token?grant_type=refresh_token"), {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.access_token) return false;
    saveSession(payload);
    return true;
  } catch (error) {
    console.warn(error);
    return false;
  }
}

// requestInit e uma funcao (nao um objeto) para que, se a 1a tentativa vier 401, os headers
// sejam remontados com o token renovado antes de tentar de novo.
async function authorizedFetch(url, requestInit) {
  let response = await fetch(url, requestInit());
  if (response.status === 401 && (await refreshAccessToken())) {
    response = await fetch(url, requestInit());
  }
  return response;
}

function loadStoredSession() {
  try {
    // A sessao fica limitada a esta aba. Migra uma sessao antiga do localStorage uma unica
    // vez para evitar manter refresh tokens persistentes no disco do navegador.
    const saved = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
    if (saved) sessionStorage.setItem(SESSION_KEY, saved);
    return saved ? JSON.parse(saved) : null;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function saveSession(session) {
  state.session = session;
  if (session) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
}

function userStorageKey() {
  return `${STORAGE_KEY}-${currentUserId() || "local"}`;
}

function pendingSyncKey() {
  return `crm-pending-sync-${currentUserId() || "local"}`;
}

function loadPendingSyncIds() {
  try {
    const saved = localStorage.getItem(pendingSyncKey());
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(pendingSyncKey());
    return [];
  }
}

function markPendingSyncIds(ids, pending) {
  const current = new Set(loadPendingSyncIds());
  ids.forEach((id) => (pending ? current.add(id) : current.delete(id)));
  if (current.size) localStorage.setItem(pendingSyncKey(), JSON.stringify(Array.from(current)));
  else localStorage.removeItem(pendingSyncKey());
}

function hasPendingSync() {
  return loadPendingSyncIds().length > 0;
}

function environmentStorageKey() {
  return `${ENVIRONMENT_STORAGE_KEY}-${currentUserId() || "local"}`;
}

function clearSyncedBrowserCache(userId) {
  if (!userId) return;
  const userPendingKey = `crm-pending-sync-${userId}`;
  try {
    const pending = JSON.parse(localStorage.getItem(userPendingKey) || "[]");
    // Nunca apagamos a unica copia de uma alteracao que ainda nao chegou ao servidor.
    if (Array.isArray(pending) && pending.length) return;
  } catch {
    return;
  }
  localStorage.removeItem(`${STORAGE_KEY}-${userId}`);
  localStorage.removeItem(`${ENVIRONMENT_STORAGE_KEY}-${userId}`);
  localStorage.removeItem(userPendingKey);
}

function showAuthMessage(message = "") {
  elements.authMessage.textContent = message;
}

function showAuthenticatedApp() {
  elements.authScreen.hidden = true;
  elements.crmShell.hidden = false;
  const email = state.session?.user?.email || "Usuario";
  elements.userName.textContent = currentUserName();
  elements.userEmail.textContent = `${email} - ${isAdmin() ? "Admin" : "User"}`;
  if (elements.usersNavItem) {
    elements.usersNavItem.hidden = !isAdmin();
  }
  if (elements.budgetStatusesNavItem) elements.budgetStatusesNavItem.hidden = !isAdmin();
  if (elements.reportsNavItem) elements.reportsNavItem.hidden = !isAdmin();
  if (elements.maintenanceNavItem) {
    elements.maintenanceNavItem.hidden = !isAdmin();
  }
  if (elements.budgetNavItem) {
    elements.budgetNavItem.hidden = !isAdmin();
  }
  if (elements.orderNavItem) {
    elements.orderNavItem.hidden = !isAdmin();
  }
  if (elements.financialNavGroup) {
    elements.financialNavGroup.hidden = !isAdmin();
  }
}

function currentUserName() {
  const email = state.session?.user?.email || "";
  return email.split("@")[0] || "Usuario";
}

function registrationDateTime() {
  return new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function registeredBy(client) {
  return client.createdBy || currentUserName();
}

function responsibleSeller(client) {
  return !client.owner || client.owner === "Usuario" ? currentUserName() : client.owner;
}

function normalizeLeadStatus(status) {
  return STATUS_MIGRATION[status] || (STATUS.includes(status) ? status : DEFAULT_STATUS);
}

function normalizeBudgetStatusValue(status, fallback = DEFAULT_STATUS) {
  const value = String(status || "").trim();
  if (!value) return fallback;
  const legacyMap = {
    [["Novo", " ", "Orçamento"].join("")]: "Novo",
    [["Novo", " ", "Orcamento"].join("")]: "Novo",
  };
  const normalized = legacyMap[value] || value;
  return BUDGET_STATUS.includes(normalized) ? normalized : fallback;
}

function normalizeBudgetStatusConfig(rows) {
  if (!Array.isArray(rows)) return DEFAULT_BUDGET_STATUSES.map((status) => ({ ...status }));
  const seen = new Set();
  const legacyBudgetStatusNames = new Set([
    ["Novo", " ", "Orçamento"].join(""),
    ["Novo", " ", "Orcamento"].join(""),
    ["Novo", " ", "Orçamento", " "].join(""),
    ["Novo", " ", "Orcamento", " "].join(""),
  ]);
  const normalized = rows.map((row) => {
    const legacyName = String(row?.name || "").trim();
    const name = legacyBudgetStatusNames.has(legacyName) ? "Novo" : legacyName;
    return { name, budget: Boolean(row?.budget), order: Boolean(row?.order) };
  })
    .filter((row) => {
      const key = row.name.toLocaleLowerCase("pt-BR");
      if (!row.name || (!row.budget && !row.order) || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  return normalized.length ? normalized : DEFAULT_BUDGET_STATUSES.map((status) => ({ ...status }));
}

function applyBudgetStatusConfig(rows) {
  state.budgetStatuses = normalizeBudgetStatusConfig(rows);
  BUDGET_STATUS = state.budgetStatuses.filter((status) => status.budget).map((status) => status.name);
  ORDER_STATUS = state.budgetStatuses.filter((status) => status.order).map((status) => status.name);
  if (!BUDGET_STATUS.length) BUDGET_STATUS = [DEFAULT_BUDGET_STATUSES[0].name];
  state.budgetSelectedStatuses = state.budgetSelectedStatuses.filter((status) => status === "Todos" || BUDGET_STATUS.includes(status));
  if (!state.budgetSelectedStatuses.length) state.budgetSelectedStatuses = ["Todos"];
  refreshBudgetStatusSelect();
}

function refreshBudgetStatusSelect() {
  const select = document.querySelector("#budgetStatus");
  if (!select) return;
  const previous = select.value;
  const statuses = state.view === "order" ? ORDER_STATUS : BUDGET_STATUS;
  select.replaceChildren(...statuses.map((name) => new Option(name, name)));
  select.value = statuses.includes(previous) ? previous : statuses[0] || "";
}

function configuredDocumentStatuses() {
  return state.budgetStatuses.map((status) => status.name);
}

async function loadBudgetStatuses() {
  let rows = null;
  if (remoteDatabaseEnabled() && currentUserId()) {
    const response = await authorizedFetch(supabaseTableEndpoint("crm_budget_statuses", "?select=name,applies_to_budget,applies_to_order,sort_order&order=sort_order.asc,name.asc"), () => ({ headers: supabaseHeaders() }));
    if (response.ok) rows = (await response.json()).map((row) => ({ name: row.name, budget: row.applies_to_budget, order: row.applies_to_order }));
  }
  if (!rows?.length) {
    try { rows = JSON.parse(localStorage.getItem(BUDGET_STATUS_STORAGE_KEY) || "null"); } catch { rows = null; }
  }
  applyBudgetStatusConfig(rows || DEFAULT_BUDGET_STATUSES);
}

async function saveBudgetStatuses(nextStatuses = state.budgetStatuses) {
  if (!isAdmin()) throw new Error("Acesso restrito a administradores.");
  const normalized = normalizeBudgetStatusConfig(nextStatuses);
  if (remoteDatabaseEnabled() && currentUserId()) {
    const response = await authorizedFetch(supabaseRpcEndpoint("crm_admin_replace_budget_statuses"), () => ({ method: "POST", headers: supabaseHeaders("return=minimal"), body: JSON.stringify({ statuses: normalized.map((status, index) => ({ ...status, sort_order: index })) }) }));
    if (!response.ok) {
      let details = "";
      try {
        const payload = await response.json();
        details = payload.message || payload.details || payload.hint || payload.code || "";
      } catch {
        details = await response.text().catch(() => "");
      }
      throw new Error(`Não foi possível salvar no banco${details ? `: ${details}` : ` (HTTP ${response.status})`}.`);
    }
  }
  localStorage.setItem(BUDGET_STATUS_STORAGE_KEY, JSON.stringify(normalized));
  applyBudgetStatusConfig(normalized);
  render();
}

function normalizeFinalUse(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (["alugar", "aluguel", "vai alugar"].includes(normalized)) return "Alugar";
  if (["residir", "moradia", "morar"].includes(normalized)) return "Residir";
  if (["negociar", "negociacao", "negociação"].includes(normalized)) return "Negociar";
  return "";
}

function normalizeClientActive(value, status = DEFAULT_STATUS) {
  if (typeof value === "boolean") return value ? "SIM" : "NAO";
  const normalized = String(value || "").trim().toLowerCase();
  if (["nao", "nÃ£o", "não", "no", "false", "0", "n"].includes(normalized)) return "NAO";
  if (["sim", "yes", "true", "1", "s"].includes(normalized)) return "SIM";
  return normalizeLeadStatus(status) === LOST_STATUS ? "NAO" : "SIM";
}

function clientIsActive(client) {
  return normalizeClientActive(client?.active, client?.status) === "SIM";
}

function clientCanHaveBudget(client) {
  return clientIsActive(client) && normalizeLeadStatus(client?.status) !== DEFAULT_STATUS;
}

function normalizeClientStatus(client) {
  const status = normalizeLeadStatus(client.status);
  return {
    ...client,
    status,
    active: normalizeClientActive(client.active, status),
    finalUse: FINAL_USE_OPTIONS.includes(client.finalUse) ? client.finalUse : normalizeFinalUse(client.finalUse),
    leadHunter: client.leadHunter || "",
  };
}

function normalizeClientBudgetStatus(client) {
  if (!client || typeof client !== "object") return client;
  const budget = client.budget && typeof client.budget === "object" ? { ...client.budget, status: normalizeBudgetStatusValue(client.budget.status, DEFAULT_STATUS) } : client.budget;
  const budgets = Array.isArray(client.budgets)
    ? client.budgets.map((savedBudget) => ({
        ...savedBudget,
        status: normalizeBudgetStatusValue(savedBudget?.status, DEFAULT_STATUS),
      }))
    : client.budgets;

  return {
    ...client,
    budget,
    budgets,
  };
}

function normalizeClients(clients) {
  return clients.map((client) => normalizeClientBudgetStatus(normalizeClientStatus(client)));
}

function showAuthScreen(message = "") {
  elements.crmShell.hidden = true;
  elements.authScreen.hidden = false;
  renderAuthMode();
  showAuthMessage(message);
}

function defaultClients() {
  return [
    {
      id: createId(),
      name: "Patricia Maria Abreu Marques de Oliveira",
      email: "patriciaoli68@yahoo.com",
      phone: "(11) 98244-0709",
      city: "Sao Paulo",
      state: "SP",
      status: WON_STATUS,
      owner: "Daniela Moreira",
      cpf: "135.569.258-00",
      address: {
        cep: "04088-002",
        street: "Alameda dos Jurupis",
        number: "586",
        complement: "Apto 52",
        district: "Moema",
      },
      project: {
        style: "Moderno",
        deadline: "01/08/2026",
        created: "01/06/2026",
        notes: "MDF Branco tx MDF Cinza Puro Slim Aluminio Natural",
        environments: [
          { name: "COZINHA", budget: 7800, factory: 5200, assembly: 1500 },
          { name: "SALA", budget: 15700, factory: 8900, assembly: 2000 },
        ],
      },
    },
    {
      id: createId(),
      name: "Eliezer Pereira Souza",
      email: "",
      phone: "",
      city: "",
      state: "",
      status: DEFAULT_STATUS,
      owner: "Usuario",
      cpf: "",
      address: { cep: "", street: "", number: "", complement: "", district: "" },
      project: {
        style: "Contemporaneo",
        deadline: "15/09/2026",
        created: "03/06/2026",
        notes: "Projeto em levantamento de medidas.",
        environments: [{ name: "DORMITORIO", budget: 21400, factory: 12800, assembly: 2600 }],
      },
    },
    {
      id: createId(),
      name: "Mariana Alves Nogueira",
      email: "",
      phone: "",
      city: "",
      state: "",
      status: DEFAULT_STATUS,
      owner: "Usuario",
      cpf: "",
      address: { cep: "", street: "", number: "", complement: "", district: "" },
      project: {
        style: "Classico",
        deadline: "20/08/2026",
        created: "05/06/2026",
        notes: "Aguardando escolha de acabamentos.",
        environments: [{ name: "CLOSET", budget: 118912, factory: 60204, assembly: 15300 }],
      },
    },
  ];
}

function normalizeEnvironmentName(name) {
  return name.trim().replace(/\s+/g, " ").toUpperCase();
}

function loadStoredEnvironments() {
  try {
    const saved = localStorage.getItem(environmentStorageKey());
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed.map(normalizeEnvironmentName).filter(Boolean) : [];
  } catch {
    localStorage.removeItem(environmentStorageKey());
    return [];
  }
}

function hasStoredEnvironmentCatalog() {
  return localStorage.getItem(environmentStorageKey()) !== null;
}

function saveEnvironmentCatalog() {
  localStorage.setItem(environmentStorageKey(), JSON.stringify(state.environments));
}

function clientEnvironmentNames() {
  return state.clients.flatMap((client) =>
    [...(client.project?.environments || []), ...(client.budget?.rows || [])].map((environment) => normalizeEnvironmentName(environment.name || ""))
  );
}

function renderEnvironmentOptions() {
  elements.environmentOptions.innerHTML = "";
  state.environments.forEach((environment) => {
    const option = document.createElement("option");
    option.value = environment;
    elements.environmentOptions.appendChild(option);
  });
}

function refreshEnvironmentCatalog(extraEnvironments = []) {
  const baseEnvironments = hasStoredEnvironmentCatalog() ? loadStoredEnvironments() : DEFAULT_ENVIRONMENTS;
  const names = [...baseEnvironments, ...clientEnvironmentNames(), ...extraEnvironments]
    .map(normalizeEnvironmentName)
    .filter(Boolean);
  state.environments = Array.from(new Set(names)).sort((first, second) => first.localeCompare(second, "pt-BR"));
  saveEnvironmentCatalog();
  renderEnvironmentOptions();
}

function registerEnvironmentName(name) {
  const normalized = normalizeEnvironmentName(name);
  if (!normalized || state.environments.includes(normalized)) return normalized;
  state.environments = [...state.environments, normalized].sort((first, second) => first.localeCompare(second, "pt-BR"));
  saveEnvironmentCatalog();
  renderEnvironmentOptions();
  return normalized;
}

function createEnvironmentSelect(selectedName = "") {
  const normalizedSelected = registerEnvironmentName(selectedName);
  const select = document.createElement("select");
  select.dataset.field = "name";

  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = "Selecione";
  select.appendChild(placeholderOption);

  state.environments.forEach((environment) => {
    const option = document.createElement("option");
    option.value = environment;
    option.textContent = environment;
    select.appendChild(option);
  });

  const customOption = document.createElement("option");
  customOption.value = "__new__";
  customOption.textContent = "+ Novo ambiente";
  select.appendChild(customOption);
  select.value = normalizedSelected;

  return select;
}

function addEnvironmentOptionToSelect(select, environment) {
  if (!environment || Array.from(select.options).some((option) => option.value === environment)) return;
  const customOption = select.querySelector('option[value="__new__"]');
  const option = document.createElement("option");
  option.value = environment;
  option.textContent = environment;
  select.insertBefore(option, customOption);
}

function focusAndOpenSelect(select) {
  if (!select) return;
  select.focus();
  if (typeof select.showPicker !== "function") return;
  try {
    select.showPicker();
  } catch {
    // Some browsers only allow showPicker during direct user interaction.
  }
}

function focusEmptyEnvironmentSelect(select) {
  if (!select || select.value) return;
  window.setTimeout(() => focusAndOpenSelect(select), 0);
}

function persistEnvironmentCatalog() {
  state.environments = Array.from(new Set(state.environments.map(normalizeEnvironmentName).filter(Boolean))).sort((first, second) =>
    first.localeCompare(second, "pt-BR")
  );
  saveEnvironmentCatalog();
  renderEnvironmentOptions();
  renderEnvironmentManager();
}

function addEnvironmentToCatalog(name) {
  const normalized = normalizeEnvironmentName(name);
  if (!normalized) return false;
  if (state.environments.includes(normalized)) return false;
  state.environments = [...state.environments, normalized];
  persistEnvironmentCatalog();
  return true;
}

function focusEnvironmentManagerRow(name) {
  const normalized = normalizeEnvironmentName(name);
  if (!normalized || !elements.environmentRows) return;
  const input = elements.environmentRows.querySelector(`input[data-environment-name="${CSS.escape(normalized)}"]`);
  if (!input) return;
  input.focus();
  input.select();
}

function renameEnvironmentInCatalog(previousName, nextName) {
  const previous = normalizeEnvironmentName(previousName);
  const next = normalizeEnvironmentName(nextName);
  if (!previous || !next) return previous;
  if (previous === next) return next;
  state.environments = state.environments.map((environment) => (environment === previous ? next : environment));
  persistEnvironmentCatalog();
  return next;
}

function removeEnvironmentFromCatalog(name) {
  const normalized = normalizeEnvironmentName(name);
  if (!normalized) return;
  state.environments = state.environments.filter((environment) => environment !== normalized);
  persistEnvironmentCatalog();
}

function createEnvironmentPicker(selectedName = "", onChange = () => {}) {
  const wrapper = document.createElement("div");
  const environmentSelect = createEnvironmentSelect(selectedName);
  const customEnvironmentInput = document.createElement("input");
  customEnvironmentInput.className = "environment-custom-input";
  customEnvironmentInput.placeholder = "Digite o novo ambiente";
  customEnvironmentInput.hidden = true;

  const commitCustomEnvironment = () => {
    const normalized = registerEnvironmentName(customEnvironmentInput.value);
    if (!normalized) return;
    addEnvironmentOptionToSelect(environmentSelect, normalized);
    environmentSelect.value = normalized;
    customEnvironmentInput.hidden = true;
    onChange();
  };

  environmentSelect.addEventListener("change", () => {
    const creatingNewEnvironment = environmentSelect.value === "__new__";
    customEnvironmentInput.hidden = !creatingNewEnvironment;
    if (creatingNewEnvironment) {
      customEnvironmentInput.focus();
      return;
    }
    onChange();
  });

  environmentSelect.addEventListener("focus", () => {
    if (!environmentSelect.value) focusAndOpenSelect(environmentSelect);
  });

  customEnvironmentInput.addEventListener("blur", commitCustomEnvironment);
  customEnvironmentInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    event.stopPropagation();
    commitCustomEnvironment();
  });

  wrapper.append(environmentSelect, customEnvironmentInput);
  return { wrapper, select: environmentSelect, customInput: customEnvironmentInput };
}

function parseMoney(value) {
  if (typeof value === "number") return value;
  const normalized = String(value || "")
    .replace(/[R$\s]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  return Number(normalized) || 0;
}

// Permite digitar contas nos campos de valor (ex: "1.200,00+350,50*2") em vez de so um
// numero fechado. So entra em acao quando ha um operador alem de um eventual sinal de
// negativo no inicio do texto; senao o comportamento de sempre (parseMoney) e mantido.
// Multiplicacao e divisao tem precedencia sobre soma e subtracao, como numa calculadora.
function evaluateMoneyExpression(value) {
  // Numeros ja resolvidos (ex: valor calculado vindo do orcamento salvo) nunca passam pela
  // leitura de texto: "." e separador de milhar no parser, entao converter um numero como
  // 12504.5 para string e reinterpretar geraria 1250450 em vez de 12504,50.
  if (typeof value === "number") return value;
  const text = String(value || "").trim();
  if (!/[+\-*/]/.test(text.slice(1))) return parseMoney(text);

  const parts = text.split(/([+\-*/])/).filter((part) => part.trim() !== "");
  if (!parts.length) return 0;

  let index = 1;
  let first = parseMoney(parts[0]);
  if (parts[0] === "-") {
    first = -parseMoney(parts[1]);
    index = 2;
  }

  const terms = [first];
  const operators = [];
  while (index < parts.length - 1) {
    const operator = parts[index];
    const operand = parseMoney(parts[index + 1]);
    if (operator === "*" || operator === "/") {
      const previous = terms.pop();
      terms.push(operator === "*" ? previous * operand : operand ? previous / operand : previous);
    } else {
      operators.push(operator);
      terms.push(operand);
    }
    index += 2;
  }

  return terms.reduce((total, term, position) => {
    if (position === 0) return term;
    return operators[position - 1] === "+" ? total + term : total - term;
  }, 0);
}

function formatMoneyInput(value) {
  return BRL.format(evaluateMoneyExpression(value));
}

function suggestedFactoryValue(budget) {
  return Math.round(parseMoney(budget) * 50) / 100;
}

function suggestedAssemblyValue(budget) {
  return Math.round(parseMoney(budget) * 12) / 100;
}

function isAdmin() {
  return state.userRole === "admin";
}

function serializeClientData(client) {
  const { _recordUserId, _remoteUpdatedAt, ...data } = client;
  return data;
}

function shouldAutoCalculateCost(input) {
  return input.dataset.manual !== "true" || parseMoney(input.value) === parseMoney(input.dataset.autoValue);
}

function updateSuggestedProjectCosts(inputs) {
  const budget = parseMoney(inputs.budget.value);
  const nextFactory = suggestedFactoryValue(budget);
  const nextAssembly = suggestedAssemblyValue(budget);

  if (shouldAutoCalculateCost(inputs.factory)) {
    inputs.factory.value = formatMoneyInput(nextFactory);
    inputs.factory.dataset.manual = "false";
  }

  if (shouldAutoCalculateCost(inputs.assembly)) {
    inputs.assembly.value = formatMoneyInput(nextAssembly);
    inputs.assembly.dataset.manual = "false";
  }

  inputs.factory.dataset.autoValue = String(nextFactory);
  inputs.assembly.dataset.autoValue = String(nextAssembly);
}

function loadLocalClients() {
  const saved = localStorage.getItem(userStorageKey());

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.every((client) => client.project && client.address)) {
        return normalizeClients(parsed);
      }
      localStorage.removeItem(userStorageKey());
    } catch {
      localStorage.removeItem(userStorageKey());
    }
  }

  return normalizeClients(defaultClients());
}

async function signIn(email, password) {
  const response = await fetch(supabaseAuthEndpoint("/token?grant_type=password"), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ email, password }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error_description || payload.msg || "Nao foi possivel entrar.");
  saveSession(payload);
}

async function signOut() {
  const signingOutUserId = currentUserId();
  if (state.session?.access_token) {
    try {
      await fetch(supabaseAuthEndpoint("/logout"), {
        method: "POST",
        headers: {
          apikey: CONFIG.supabaseAnonKey,
          Authorization: `Bearer ${state.session.access_token}`,
        },
      });
    } catch (error) {
      console.warn(error);
    }
  }
  saveSession(null);
  clearSyncedBrowserCache(signingOutUserId);
  state.userRole = "user";
  state.userProfiles = [];
  state.clients = [];
  state.selectedId = null;
  if (elements.budgetNavItem) elements.budgetNavItem.hidden = true;
  if (elements.orderNavItem) elements.orderNavItem.hidden = true;
  if (elements.financialNavGroup) elements.financialNavGroup.hidden = true;
  if (elements.maintenanceNavItem) elements.maintenanceNavItem.hidden = true;
  if (elements.reportsNavItem) elements.reportsNavItem.hidden = true;
  if (elements.budgetStatusesNavItem) elements.budgetStatusesNavItem.hidden = true;
  showAuthScreen();
}

async function ensureUserProfile() {
  if (!remoteDatabaseEnabled() || !currentUserId()) {
    state.userRole = "user";
    return !authEnabled();
  }

  const email = state.session?.user?.email || "";
  try {
    let response = await authorizedFetch(supabaseProfilesEndpoint(`?id=eq.${encodeURIComponent(currentUserId())}&select=id,email,role,blocked,updated_at`), () => ({
      headers: supabaseHeaders(),
    }));
    if (!response.ok) {
      response = await authorizedFetch(supabaseProfilesEndpoint(`?id=eq.${encodeURIComponent(currentUserId())}&select=id,email,role,updated_at`), () => ({
        headers: supabaseHeaders(),
      }));
    }
    if (!response.ok) throw new Error("profiles_unavailable");

    const rows = await response.json();
    if (rows[0]) {
      if (rows[0].blocked) {
        alert("Usuario bloqueado. Fale com um administrador.");
        await signOut();
        return false;
      }
      state.userRole = rows[0].role === "admin" ? "admin" : "user";
      return true;
    }

    const createResponse = await authorizedFetch(supabaseProfilesEndpoint(), () => ({
      method: "POST",
      headers: supabaseHeaders(),
      body: JSON.stringify({ id: currentUserId(), email, role: "user", blocked: false }),
    }));
    if (!createResponse.ok) throw new Error("profile_create_failed");
    state.userRole = "user";
    return true;
  } catch (error) {
    console.warn(error);
    state.userRole = "user";
    // Falhas de rede ainda permitem trabalhar no cache; uma sessao recusada, nao.
    if (error instanceof TypeError) return true;
    await signOut();
    showAuthMessage("Sua sessao nao e mais valida. Entre novamente.");
    return false;
  }
}

async function loadUserProfiles() {
  if (!remoteDatabaseEnabled() || !currentUserId() || !isAdmin()) {
    state.userProfiles = [];
    state.userLogs = [];
    return;
  }

  let response = await authorizedFetch(supabaseProfilesEndpoint("?select=id,email,role,blocked,updated_at&order=email.asc"), () => ({
    headers: supabaseHeaders(),
  }));
  if (!response.ok) {
    response = await authorizedFetch(supabaseProfilesEndpoint("?select=id,email,role,updated_at&order=email.asc"), () => ({
      headers: supabaseHeaders(),
    }));
  }
  if (!response.ok) throw new Error("Nao foi possivel carregar os usuarios.");
  state.userProfiles = await response.json();

  const logsResponse = await authorizedFetch(supabaseTableEndpoint("crm_audit_logs", "?select=created_at,action,target_user_id,target_email,details,actor_email&order=created_at.desc&limit=50"), () => ({
    headers: supabaseHeaders(),
  }));
  state.userLogs = logsResponse.ok ? await logsResponse.json() : [];
}

async function callAdminRpc(functionName, payload) {
  const response = await authorizedFetch(supabaseRpcEndpoint(functionName), () => ({
    method: "POST",
    headers: supabaseHeaders("return=representation"),
    body: JSON.stringify(payload),
  }));
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const details = [data?.message, data?.hint, data?.details].filter(Boolean).join(" ");
    const schemaCacheMissing = data?.code === "PGRST202" || /schema cache|Could not find the function/i.test(details);
    const message = schemaCacheMissing
      ? "Funcao administrativa nao encontrada no Supabase. Rode o supabase-schema.sql atualizado no SQL Editor e tente novamente."
      : data?.message || data?.error_description || data?.hint || "Nao foi possivel executar a acao.";
    throw new Error(message);
  }
  return data;
}

async function createManagedUser(email, password, role) {
  await callAdminRpc("crm_admin_create_user", { user_email: email, user_password: password, user_role: role });
  await loadUserProfiles();
  renderUsers();
}

async function updateUserProfile(userId, role, blocked, email) {
  if (!isAdmin()) return;
  await callAdminRpc("crm_admin_update_user", { target_user_id: userId, user_email: email, user_role: role, user_blocked: blocked });

  if (userId === currentUserId()) {
    state.userRole = role;
    showAuthenticatedApp();
    if (!isAdmin()) showView("clients");
  }
  await loadUserProfiles();
  renderUsers();
}

async function updateUserPassword(userId, password) {
  await callAdminRpc("crm_admin_set_password", { target_user_id: userId, user_password: password });
  await loadUserProfiles();
  renderUsers();
}

async function loadRemoteClients() {
  const response = await authorizedFetch(supabaseEndpoint("?select=user_id,data,updated_at&order=updated_at.desc"), () => ({
    headers: supabaseHeaders(),
  }));
  if (!response.ok) {
    const message = response.status === 401 ? "Sessao expirada. Entre novamente." : "Nao foi possivel carregar os clientes do banco.";
    throw new Error(message);
  }
  const rows = await response.json();
  return normalizeClients(
    rows
      .map((row) => (row.data ? { ...row.data, _recordUserId: row.user_id, _remoteUpdatedAt: row.updated_at } : null))
      .filter((client) => client && client.project && client.address)
  );
}

async function loadClients() {
  if (!remoteDatabaseEnabled() || !currentUserId()) {
    return loadLocalClients();
  }

  try {
    const remoteClients = await loadRemoteClients();
    if (!remoteClients.length && !hasPendingSync()) {
      const seeded = loadLocalClients();
      await saveRemoteClients(seeded);
      return seeded;
    }

    // Sobrepomos ao dado fresco do servidor apenas os clientes com edicao pendente (falha de
    // rede anterior), nunca o cache local inteiro — assim o resto da lista fica sempre
    // atualizado com o que outras sessoes possam ter salvo nesse meio tempo.
    const pendingIds = loadPendingSyncIds();
    if (!pendingIds.length) return remoteClients;

    const localClients = loadLocalClients();
    const clientsById = new Map(remoteClients.map((client) => [client.id, client]));
    const pendingClients = [];
    pendingIds.forEach((id) => {
      const localVersion = localClients.find((client) => client.id === id);
      if (localVersion) {
        clientsById.set(id, localVersion);
        pendingClients.push(localVersion);
      } else {
        markPendingSyncIds([id], false);
      }
    });
    if (pendingClients.length) trySyncPendingClients(pendingClients);
    return Array.from(clientsById.values());
  } catch (error) {
    console.warn(error);
    if (error.message.includes("Sessao expirada")) {
      await signOut();
      return [];
    }
    return loadLocalClients();
  }
}

async function saveRemoteClients(clients) {
  if (!clients.length) return;

  const nowIso = new Date().toISOString();
  const rows = clients.map((client) => ({
    id: client.id,
    user_id: client._recordUserId || currentUserId(),
    data: serializeClientData(client),
    updated_at: nowIso,
  }));
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await authorizedFetch(supabaseEndpoint("?on_conflict=id"), () => ({
      method: "POST",
      headers: supabaseHeaders("resolution=merge-duplicates,return=minimal"),
      body: JSON.stringify(rows),
      signal: controller.signal,
    }));
    if (!response.ok) throw new Error("Nao foi possivel salvar os clientes no banco.");
    clients.forEach((client) => {
      client._remoteUpdatedAt = nowIso;
    });
  } catch (error) {
    if (error.name === "AbortError") throw new Error("Tempo esgotado ao salvar no banco. Verifique a conexao.");
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Salva um unico cliente. Se ja existia (client._remoteUpdatedAt conhecido), usa PATCH
// condicionado a updated_at=eq.<valor que carregamos> como trava otimista: se outra sessao
// salvou esse mesmo cliente entretanto, 0 linhas casam e detectamos o conflito em vez de
// sobrescrever silenciosamente o que a outra sessao gravou.
async function saveRemoteClient(client) {
  const isNew = !client._remoteUpdatedAt;
  const nowIso = new Date().toISOString();
  const payload = {
    id: client.id,
    user_id: client._recordUserId || currentUserId(),
    data: serializeClientData(client),
    updated_at: nowIso,
  };
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  try {
    const path = isNew
      ? supabaseEndpoint("?on_conflict=id")
      : supabaseEndpoint(`?id=eq.${encodeURIComponent(client.id)}&updated_at=eq.${encodeURIComponent(client._remoteUpdatedAt)}`);
    const response = await authorizedFetch(path, () => ({
      method: isNew ? "POST" : "PATCH",
      headers: supabaseHeaders(isNew ? "resolution=merge-duplicates,return=representation" : "return=representation"),
      body: JSON.stringify(isNew ? [payload] : payload),
      signal: controller.signal,
    }));
    if (!response.ok) throw new Error("Nao foi possivel salvar o cliente no banco.");
    const saved = await response.json();
    if (saved.length === 0) {
      const conflictError = new Error(
        isNew
          ? "O banco recusou a gravacao deste cadastro (sem permissao ou linha ja existente). Recarregue a pagina e tente novamente."
          : "Este cadastro foi alterado em outra aba, dispositivo ou por outro usuario enquanto voce editava. Recarregue a pagina para ver a versao mais recente antes de salvar de novo."
      );
      conflictError.conflict = true;
      throw conflictError;
    }
    client._remoteUpdatedAt = nowIso;
  } catch (error) {
    if (error.name === "AbortError") throw new Error("Tempo esgotado ao salvar no banco. Verifique a conexao.");
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function trySyncPendingClients(clients) {
  let allSucceeded = true;
  for (const client of clients) {
    try {
      await saveRemoteClient(client);
      markPendingSyncIds([client.id], false);
    } catch (error) {
      console.warn(error);
      allSucceeded = false;
      // Conflito: outra sessao ja gravou algo mais novo. Nao insistimos em cima do cache
      // local desatualizado; o proximo carregamento traz a versao atual do servidor.
      if (error.conflict) markPendingSyncIds([client.id], false);
    }
  }
  updateSyncIndicator();
  return allSucceeded;
}

async function deleteRemoteClient(clientId) {
  if (!remoteDatabaseEnabled() || !currentUserId()) return;

  const response = await authorizedFetch(supabaseEndpoint(`?id=eq.${encodeURIComponent(clientId)}`), () => ({
    method: "DELETE",
    headers: supabaseHeaders(),
  }));
  if (!response.ok) throw new Error("Nao foi possivel excluir o cliente no banco.");
  markPendingSyncIds([clientId], false);
}

// changedIds identifica quais clientes tiveram dados alterados nesta operacao. Enviamos ao
// banco apenas esses registros (nunca o array inteiro em memoria), para que uma sessao com
// dados desatualizados de OUTROS clientes nunca sobrescreva o que outra sessao salvou.
async function saveClients(changedIds = [], options = {}) {
  state.clients = state.clients.map((client) => normalizeClientBudgetStatus(normalizeClientStatus(client)));
  localStorage.setItem(userStorageKey(), JSON.stringify(state.clients));
  if (!remoteDatabaseEnabled() || !currentUserId() || !changedIds.length) return true;

  const clientsToSync = changedIds.map((id) => state.clients.find((client) => client.id === id)).filter(Boolean);
  if (!clientsToSync.length) return true;

  try {
    if (clientsToSync.length > 1) {
      await saveRemoteClients(clientsToSync);
    } else {
      await saveRemoteClient(clientsToSync[0]);
    }
    markPendingSyncIds(changedIds, false);
    updateSyncIndicator();
    return true;
  } catch (error) {
    console.warn(error);
    if (error.conflict) {
      if (options.onConflict) {
        try {
          const recovered = await options.onConflict(error);
          if (recovered) {
            markPendingSyncIds(changedIds, false);
            localStorage.setItem(userStorageKey(), JSON.stringify(state.clients));
            updateSyncIndicator();
            return true;
          }
        } catch (recoveryError) {
          console.warn(recoveryError);
          alert(recoveryError.message);
          updateSyncIndicator();
          return false;
        }
      }
      alert(error.message);
    } else {
      markPendingSyncIds(changedIds, true);
      alert("Nao foi possivel confirmar a gravacao no banco. Os dados ficaram salvos neste navegador, mas podem nao aparecer em outro dispositivo. Verifique a conexao e tente salvar novamente.");
    }
    updateSyncIndicator();
    return false;
  }
}

function selectedClient() {
  return state.clients.find((item) => item.id === state.selectedId) || state.clients[0];
}

function openClientRegistration(clientId = state.selectedId, returnView = state.view) {
  const client = state.clients.find((item) => item.id === clientId);
  if (!client) return;

  const fallbackView = returnView && returnView !== "detail" ? returnView : state.returnView || "clients";
  state.selectedId = client.id;
  state.returnView = fallbackView;

  if (state.view === "detail") {
    showView(fallbackView);
  }

  openProjectDialog(client, { inline: fallbackView === "clients" });
}

function clientTotals(client) {
  return client.project.environments.reduce(
    (totals, item) => ({
      revenue: totals.revenue + item.budget,
      factory: totals.factory + item.factory,
      assembly: totals.assembly + item.assembly,
      cost: totals.cost + item.factory + item.assembly,
      profit: totals.profit + item.budget - item.factory - item.assembly,
    }),
    { revenue: 0, factory: 0, assembly: 0, cost: 0, profit: 0 }
  );
}

function clientBudgetTotals(client) {
  if (!client.budget?.updatedAt) {
    return { gross: 0, net: 0, cost: 0, profit: 0, margin: 0, financedBase: 0, installmentValue: 0, retentionValue: 0, financingTotal: 0 };
  }
  return budgetSummaryForClient(client);
}

function statusClass(status) {
  const normalized = normalizeLeadStatus(status)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `status-${normalized}`;
}

function confirmDiscardProjectChanges() {
  return !state.projectDirty || confirm("Existem alteracoes nao salvas no cadastro. Deseja sair sem salvar?");
}

function confirmDiscardClientDialogChanges() {
  return !state.clientDialogDirty || confirm("Existem alteracoes nao salvas no cadastro. Deseja sair sem salvar?");
}

function askSaveBudgetChanges() {
  return new Promise((resolve) => {
    const dialog = document.createElement("dialog");
    dialog.className = "save-choice-dialog";
    dialog.innerHTML = `
      <form method="dialog" class="save-choice-card">
        <h2>Deseja salvar?</h2>
        <p>Existem alteracoes nao salvas no orcamento.</p>
        <div class="save-choice-actions">
          <button class="button secondary" value="no" type="submit">NÃO</button>
          <button class="button primary" value="yes" type="submit">SIM</button>
        </div>
      </form>
    `;
    document.body.appendChild(dialog);
    dialog.addEventListener(
      "close",
      () => {
        const value = dialog.returnValue;
        dialog.remove();
        resolve(value === "yes" ? "save" : "discard");
      },
      { once: true }
    );
    dialog.showModal();
  });
}

async function confirmDiscardBudgetChanges() {
  if (!state.budgetDirty) return true;
  const choice = await askSaveBudgetChanges();
  if (choice === "save") {
    await saveBudget({ silent: true });
    return !state.budgetEditing && !state.budgetDirty;
  }
  state.budgetDirty = false;
  return true;
}

function markProjectDirty() {
  state.projectDirty = true;
}

async function showView(view, selectedId) {
  if ((view === "users" || view === "maintenance" || view === "reports" || view === "budgetStatuses" || view === "budget" || view === "order" || view === "financial" || isFinanceModuleView(view)) && !isAdmin()) {
    alert("Acesso restrito a administradores.");
    view = "clients";
  }

  const previousView = state.view;
  if (state.projectInlineEditing && !confirmDiscardProjectChanges()) return;
  if (state.budgetEditing && view !== "budget" && view !== "order" && !(await confirmDiscardBudgetChanges())) return;
  if (state.budgetEditing && (view === "budget" || view === "order")) {
    if (!(await confirmDiscardBudgetChanges())) return;
    resetBudgetEditorState();
  }

  if (view === "detail") {
    openClientRegistration(selectedId || state.selectedId, previousView);
    return;
  }
  if (state.projectInlineEditing) {
    state.projectDirty = false;
    setClientInlineEditing(false);
  }
  if (state.budgetEditing && !["budget", "order"].includes(view)) {
    resetBudgetEditorState();
  }

  if (view === "budget" && view !== previousView) state.budgetSelectedStatuses = ["Todos"];
  if (view === "order" && view !== previousView) state.budgetStatus = "Todos";
  state.view = view;
  document.body.dataset.view = view;
  setMobileMenuOpen(false);
  state.selectedId = selectedId || state.selectedId;
  if (view === "detail" && previousView !== "detail") {
    state.returnView = previousView;
  }

  elements.views.forEach((viewElement) => viewElement.classList.remove("active"));
  const viewElementId = view === "order" ? "budgetView" : isFinanceModuleView(view) ? "financialModuleView" : `${view}View`;
  document.querySelector(`#${viewElementId}`)?.classList.add("active");

  elements.navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.view === view);
  });
  elements.financialNavGroup?.classList.toggle("active", view === "financial" || isFinanceModuleView(view));
  if (isFinanceModuleView(view)) renderFinanceModuleView(view);
  if (view === "reports") renderReportsView();
  if (view === "budget" || view === "order") refreshBudgetStatusSelect();

  render();
}

function renderFinanceModuleView(view) {
  const content = FINANCE_MODULE_VIEWS[view] || FINANCE_MODULE_VIEWS.financeOverview;
  const [title, description, emptyTitle, emptyText] = content;
  const titleElement = document.querySelector("#financialModuleTitle");
  const descriptionElement = document.querySelector("#financialModuleDescription");
  const emptyTitleElement = document.querySelector("#financialModuleEmptyTitle");
  const emptyTextElement = document.querySelector("#financialModuleEmptyText");
  if (titleElement) titleElement.textContent = title;
  if (descriptionElement) descriptionElement.textContent = description;
  if (emptyTitleElement) emptyTitleElement.textContent = emptyTitle;
  if (emptyTextElement) emptyTextElement.textContent = emptyText;
  const showingAccounts = view === "financeAccounts";
  const showingCategories = view === "financeCategories";
  const showingEntries = ["financeTransactions", "financePayable", "financeReceivable"].includes(view);
  const showingImport = view === "financeImport";
  const showingDashboard = view === "financeOverview";
  if (elements.financialAccountsPanel) elements.financialAccountsPanel.hidden = !showingAccounts;
  if (elements.financialCategoriesPanel) elements.financialCategoriesPanel.hidden = !showingCategories;
  if (elements.financialEntriesPanel) elements.financialEntriesPanel.hidden = !showingEntries;
  if (elements.financialTransactionSummary) elements.financialTransactionSummary.hidden = view !== "financeTransactions";
  if (elements.financialImportPanel) elements.financialImportPanel.hidden = !showingImport;
  const dashboardContent = document.querySelector("#financialDashboardContent"); if (dashboardContent) dashboardContent.hidden = !showingDashboard;
  const periodFilter = document.querySelector("#financialPeriodFilter"); if (periodFilter) periodFilter.hidden = !showingDashboard;
  if (elements.financialModuleEmpty) elements.financialModuleEmpty.hidden = showingDashboard || showingAccounts || showingCategories || showingEntries || showingImport;
  if (elements.financialModuleStats) elements.financialModuleStats.hidden = !showingDashboard;
  if (showingDashboard) renderFinancialDashboard();
  if (showingAccounts) renderFinancialAccounts();
  if (showingCategories) renderFinancialCategories();
  if (showingEntries) renderFinancialEntries(view);
  if (showingImport) renderFinancialImports();
  if (elements.financialSubmenu?.hidden) {
    elements.financialSubmenu.hidden = false;
    elements.financialNavToggle?.setAttribute("aria-expanded", "true");
  }
}

const FINANCIAL_CHART_COLORS = ["#aa8e34", "#22a657", "#0e9b78", "#f59b05", "#f43f68", "#2563eb", "#8b5cf6", "#64748b", "#d97706", "#0891b2"];

function financialEntryDate(entry) { return entry.due_date || entry.competence_date || entry.issue_date || ""; }
function financialMonthBounds(month) { const [year, monthNumber] = month.split("-").map(Number); return { start: `${year}-${String(monthNumber).padStart(2, "0")}-01`, end: `${year}-${String(monthNumber).padStart(2, "0")}-${String(new Date(year, monthNumber, 0).getDate()).padStart(2, "0")}` }; }

function financialAccountBalance(account, endDate, projected) {
  // O saldo inicial e a base de todo o historico; sua data e apenas uma referencia cadastral.
  let balance = Number(account.initial_balance) || 0;
  state.financialEntries.forEach((entry) => {
    if (entry.status === "cancelled" || financialEntryDate(entry) > endDate || (!projected && entry.status !== "paid")) return;
    const amount = Number(entry.amount) || 0;
    if (entry.entry_type === "income" && entry.account_id === account.id) balance += amount;
    if (entry.entry_type === "expense" && entry.account_id === account.id) balance -= amount;
    if (entry.entry_type === "transfer" && entry.account_id === account.id) balance -= amount;
    if (entry.entry_type === "transfer" && entry.transfer_account_id === account.id) balance += amount;
  });
  return balance;
}

function financialCategorySummary(entries, type) {
  const categories = new Map(state.financialCategories.map((category) => [category.id, category])); const totals = new Map();
  entries.filter((entry) => entry.entry_type === type && entry.status !== "cancelled").forEach((entry) => { const category = categories.get(entry.category_id); const parent = category?.parent_id ? categories.get(category.parent_id) : category; const name = parent?.name || "Sem categoria"; totals.set(name, (totals.get(name) || 0) + (Number(entry.amount) || 0)); });
  return Array.from(totals, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

function prepareFinancialCanvas(canvas, height) {
  const width = canvas.clientWidth || 500; const ratio = window.devicePixelRatio || 1; canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio); const context = canvas.getContext("2d"); context.setTransform(ratio, 0, 0, ratio, 0, 0); context.clearRect(0, 0, width, height); return { context, width, height };
}

function renderFinancialDonut(canvasId, legendId, data) {
  const canvas = document.querySelector(`#${canvasId}`); const legend = document.querySelector(`#${legendId}`); if (!canvas || !legend) return;
  const { context, width, height } = prepareFinancialCanvas(canvas, 280); const total = data.reduce((sum, item) => sum + item.value, 0); const radius = Math.min(width, height) * 0.32; const thickness = Math.max(26, radius * .28); const centerX = width / 2; const centerY = height / 2; let angle = -Math.PI / 2;
  if (!total) { context.strokeStyle = "#e6dcc0"; context.lineWidth = thickness; context.beginPath(); context.arc(centerX, centerY, radius, 0, Math.PI * 2); context.stroke(); }
  data.forEach((item, index) => { const next = angle + item.value / total * Math.PI * 2; context.strokeStyle = FINANCIAL_CHART_COLORS[index % FINANCIAL_CHART_COLORS.length]; context.lineWidth = thickness; context.beginPath(); context.arc(centerX, centerY, radius, angle, next); context.stroke(); angle = next; });
  context.fillStyle = "#1b1606"; context.textAlign = "center"; context.font = "700 18px Arial"; context.fillText(BRL.format(total), centerX, centerY + 2); context.font = "12px Arial"; context.fillStyle = "#6e6135"; context.fillText("Total", centerX, centerY + 23);
  legend.innerHTML = data.length ? data.slice(0, 8).map((item, index) => `<span><i style="background:${FINANCIAL_CHART_COLORS[index % FINANCIAL_CHART_COLORS.length]}"></i>${escapeHtml(item.name)} <strong>${BRL.format(item.value)}</strong></span>`).join("") : "<span>Sem lançamentos no período.</span>";
}

const FINANCIAL_BANK_ACCOUNTS_FILTER = "__bank_accounts__";

function financialEvolutionAccounts() {
  return state.financialAccounts.filter((account) => account.active && (
    !state.financialEvolutionAccountId ||
    (state.financialEvolutionAccountId === FINANCIAL_BANK_ACCOUNTS_FILTER && account.account_type === "bank") ||
    account.id === state.financialEvolutionAccountId
  ));
}

function renderFinancialBalanceChart(year) {
  const canvas = document.querySelector("#financialBalanceChart"); if (!canvas) return; const { context, width, height } = prepareFinancialCanvas(canvas, 300); const accounts = financialEvolutionAccounts(); const values = Array.from({ length: 12 }, (_, index) => accounts.reduce((sum, account) => sum + financialAccountBalance(account, `${year}-${String(index + 1).padStart(2, "0")}-${String(new Date(year, index + 1, 0).getDate()).padStart(2, "0")}`, true), 0));
  const padding = { top: 25, right: 25, bottom: 45, left: 78 }; const min = Math.min(0, ...values); const max = Math.max(1, ...values); const range = max - min || 1; const chartWidth = width - padding.left - padding.right; const chartHeight = height - padding.top - padding.bottom;
  context.font = "11px Arial"; context.strokeStyle = "#e0d3aa"; context.fillStyle = "#6e6135"; context.textAlign = "right";
  for (let tick = 0; tick <= 4; tick += 1) { const value = min + range * tick / 4; const y = height - padding.bottom - chartHeight * tick / 4; context.beginPath(); context.moveTo(padding.left, y); context.lineTo(width - padding.right, y); context.stroke(); context.fillText(BRL.format(value), padding.left - 8, y + 4); }
  const points = values.map((value, index) => ({ x: padding.left + chartWidth * index / 11, y: padding.top + (max - value) / range * chartHeight })); context.strokeStyle = "#aa8e34"; context.lineWidth = 3; context.beginPath(); points.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y)); context.stroke();
  points.forEach((point, index) => { context.fillStyle = "#aa8e34"; context.beginPath(); context.arc(point.x, point.y, 4, 0, Math.PI * 2); context.fill(); context.fillStyle = "#6e6135"; context.textAlign = "center"; context.fillText(["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"][index], point.x, height - 18); });
}

function renderFinancialEvolutionTable(year) {
  const rows = document.querySelector("#financialEvolutionRows"); if (!rows) return; const accounts = financialEvolutionAccounts(); const accountIds = new Set(accounts.map((account) => account.id)); const monthNames = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  rows.innerHTML = Array.from({ length: 12 }, (_, index) => {
    const month = `${year}-${String(index + 1).padStart(2, "0")}`; const { start, end } = financialMonthBounds(month); const entries = state.financialEntries.filter((entry) => entry.status !== "cancelled" && financialEntryDate(entry) >= start && financialEntryDate(entry) <= end); const incomingTransfers = entries.filter((entry) => entry.entry_type === "transfer" && accountIds.has(entry.transfer_account_id)).reduce((sum, entry) => sum + Number(entry.amount), 0); const outgoingTransfers = entries.filter((entry) => entry.entry_type === "transfer" && accountIds.has(entry.account_id)).reduce((sum, entry) => sum + Number(entry.amount), 0); const income = entries.filter((entry) => entry.entry_type === "income" && accountIds.has(entry.account_id)).reduce((sum, entry) => sum + Number(entry.amount), 0); const expense = entries.filter((entry) => entry.entry_type === "expense" && accountIds.has(entry.account_id)).reduce((sum, entry) => sum + Number(entry.amount), 0); const projected = accounts.reduce((sum, account) => sum + financialAccountBalance(account, end, true), 0);
    return `<tr><td data-sort-value="${month}"><strong>${monthNames[index]} ${year}</strong></td><td>${BRL.format(incomingTransfers)}</td><td>${BRL.format(outgoingTransfers)}</td><td class="financial-positive">${BRL.format(income)}</td><td class="financial-negative">${BRL.format(expense)}</td><td><strong>${BRL.format(projected)}</strong></td></tr>`;
  }).join("");
  applyFinancialTableSort(rows.closest("table"));
}

function renderFinancialEvolution() {
  const year = Number(state.financialDashboardMonth.slice(0, 4)); const accountSelect = document.querySelector("#financialEvolutionAccount"); const validAccount = state.financialEvolutionAccountId === FINANCIAL_BANK_ACCOUNTS_FILTER || state.financialAccounts.some((account) => account.active && account.id === state.financialEvolutionAccountId); if (!validAccount) state.financialEvolutionAccountId = "";
  accountSelect.innerHTML = `<option value="">Todas as contas</option><option value="${FINANCIAL_BANK_ACCOUNTS_FILTER}">Contas bancárias</option>` + state.financialAccounts.filter((account) => account.active).map((account) => `<option value="${account.id}">${escapeHtml(account.name)}</option>`).join(""); accountSelect.value = state.financialEvolutionAccountId;
  document.querySelector("#financialEvolutionPeriod").textContent = `janeiro ${year} — dezembro ${year}`;
  const chartMode = state.financialEvolutionView === "chart"; document.querySelector("#financialEvolutionChartPanel").hidden = !chartMode; document.querySelector("#financialEvolutionTablePanel").hidden = chartMode; document.querySelector("#financialEvolutionChartBtn").classList.toggle("active", chartMode); document.querySelector("#financialEvolutionTableBtn").classList.toggle("active", !chartMode);
  if (chartMode) renderFinancialBalanceChart(year); else renderFinancialEvolutionTable(year);
}

function renderFinancialDashboard() {
  const input = document.querySelector("#financialDashboardMonth"); if (!input) return; input.value = state.financialDashboardMonth; const { start, end } = financialMonthBounds(state.financialDashboardMonth); const monthEntries = state.financialEntries.filter((entry) => { const date = financialEntryDate(entry); return date >= start && date <= end; }); const accountPriority = ["mercado pago", "itau", "santander"]; const normalizedAccountName = (value) => String(value || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("pt-BR"); const accounts = state.financialAccounts.filter((account) => account.active).sort((first, second) => { const firstName = normalizedAccountName(first.name); const secondName = normalizedAccountName(second.name); const firstPriority = accountPriority.findIndex((name) => firstName.includes(name)); const secondPriority = accountPriority.findIndex((name) => secondName.includes(name)); const firstRank = firstPriority < 0 ? accountPriority.length : firstPriority; const secondRank = secondPriority < 0 ? accountPriority.length : secondPriority; return firstRank - secondRank || first.name.localeCompare(second.name, "pt-BR", { sensitivity: "base", numeric: true }); });
  const income = monthEntries.filter((entry) => entry.entry_type === "income" && entry.status !== "cancelled").reduce((sum, entry) => sum + Number(entry.amount), 0); const expense = monthEntries.filter((entry) => entry.entry_type === "expense" && entry.status !== "cancelled").reduce((sum, entry) => sum + Number(entry.amount), 0); const balance = accounts.reduce((sum, account) => sum + financialAccountBalance(account, end, false), 0); const projected = accounts.reduce((sum, account) => sum + financialAccountBalance(account, end, true), 0);
  document.querySelector("#financialDashboardBalance").textContent = BRL.format(balance); document.querySelector("#financialDashboardIncome").textContent = BRL.format(income); document.querySelector("#financialDashboardExpense").textContent = BRL.format(expense); document.querySelector("#financialDashboardProjected").textContent = BRL.format(projected);
  renderFinancialDonut("financialExpenseChart", "financialExpenseLegend", financialCategorySummary(monthEntries, "expense")); renderFinancialDonut("financialIncomeChart", "financialIncomeLegend", financialCategorySummary(monthEntries, "income"));
  renderFinancialEvolution();
}

const FINANCIAL_ACCOUNT_TYPES = { bank: "Conta bancária", cash: "Caixa", credit_card: "Cartão de crédito", investment: "Investimento", other: "Outra" };
const FINANCIAL_CATEGORY_TYPES = { income: "Receita", expense: "Despesa", both: "Receita e despesa" };

function financialAccountBrand(accountOrName, large = false) {
  const name = typeof accountOrName === "string" ? accountOrName : `${accountOrName?.name || ""} ${accountOrName?.institution || ""}`;
  const normalized = String(name).normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("pt-BR");
  let brand = "default"; let mark = "$";
  if (normalized.includes("mercado pago")) { brand = "mercado-pago"; mark = "MP"; }
  else if (normalized.includes("itau")) { brand = "itau"; mark = "Itaú"; }
  else if (normalized.includes("santander")) { brand = "santander"; mark = "S"; }
  else if (normalized.includes("ton")) { brand = "ton"; mark = "TON"; }
  return `<span class="financial-bank-logo ${brand} ${large ? "large" : ""}" aria-hidden="true">${mark}</span>`;
}

function financialAccountReference(name) {
  if (!name || name === "—") return "—";
  return `<span class="financial-account-reference">${financialAccountBrand(name)}<span>${escapeHtml(name)}</span></span>`;
}

async function loadFinancialRegisters() {
  if (!remoteDatabaseEnabled() || !currentUserId() || !isAdmin()) return;
  const [accountsResponse, categoriesResponse, entriesResponse, importsResponse] = await Promise.all([
    authorizedFetch(supabaseTableEndpoint("crm_financial_accounts", "?select=*&order=active.desc,name.asc"), () => ({ headers: supabaseHeaders() })),
    authorizedFetch(supabaseTableEndpoint("crm_financial_categories", "?select=*&order=active.desc,name.asc"), () => ({ headers: supabaseHeaders() })),
    authorizedFetch(supabaseTableEndpoint("crm_financial_entries", "?select=*&order=competence_date.desc,created_at.desc"), () => ({ headers: supabaseHeaders() })),
    authorizedFetch(supabaseTableEndpoint("crm_financial_statement_imports", "?select=*&order=created_at.desc"), () => ({ headers: supabaseHeaders() })),
  ]);
  if (!accountsResponse.ok || !categoriesResponse.ok || !entriesResponse.ok || !importsResponse.ok) throw new Error("Não foi possível carregar os dados financeiros. Confirme se o script do Supabase foi executado.");
  state.financialAccounts = await accountsResponse.json();
  state.financialCategories = await categoriesResponse.json();
  state.financialEntries = await entriesResponse.json();
  state.financialImports = await importsResponse.json();
}

function renderFinancialAccounts() {
  if (!elements.financialAccountRows) return;
  const period = state.financialDashboardMonth;
  document.querySelector("#financialAccountsMonth").value = period;
  const { end } = financialMonthBounds(period);
  const priority = ["mercado pago", "itau", "santander"];
  const normalizedName = (value) => String(value || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("pt-BR");
  const accounts = [...state.financialAccounts].sort((first, second) => {
    const rank = (account) => { const index = priority.findIndex((name) => normalizedName(`${account.name} ${account.institution}`).includes(name)); return index < 0 ? priority.length : index; };
    return Number(second.active) - Number(first.active) || rank(first) - rank(second) || financialSortCollator.compare(first.name, second.name);
  });
  const activeAccounts = accounts.filter((account) => account.active);
  document.querySelector("#financialAccountsBalance").textContent = BRL.format(activeAccounts.reduce((sum, account) => sum + financialAccountBalance(account, end, false), 0));
  document.querySelector("#financialAccountsProjected").textContent = BRL.format(activeAccounts.reduce((sum, account) => sum + financialAccountBalance(account, end, true), 0));
  elements.financialAccountRows.innerHTML = `<button class="financial-new-account-card" type="button" data-new-financial-account><span aria-hidden="true">+</span><strong>Nova conta</strong></button>` + accounts.map((account) => {
    const id = escapeHtml(account.id);
    return `<article class="financial-account-card ${account.active ? "" : "inactive"}"><header>${financialAccountBrand(account, true)}<div><h3>${escapeHtml(account.name)}</h3><small>${escapeHtml(FINANCIAL_ACCOUNT_TYPES[account.account_type] || account.account_type)}${account.active ? "" : " · Inativa"}</small></div><div class="financial-account-actions"><button class="financial-account-menu-button" type="button" data-financial-account-menu aria-label="Ações de ${escapeHtml(account.name)}" aria-expanded="false" aria-haspopup="menu">⋮</button><div class="financial-account-actions-menu" role="menu" hidden><button type="button" role="menuitem" data-edit-financial-account="${id}">Editar</button><button type="button" role="menuitem" data-toggle-financial-account="${id}">${account.active ? "Inativar" : "Ativar"}</button><button type="button" role="menuitem" data-financial-account-transactions="${id}">Transações</button><button class="danger" type="button" role="menuitem" data-delete-financial-account="${id}">Excluir</button></div></div></header><dl><div><dt>Saldo atual</dt><dd>${BRL.format(financialAccountBalance(account, end, false))}</dd></div><div><dt>Saldo previsto</dt><dd>${BRL.format(financialAccountBalance(account, end, true))}</dd></div></dl><footer><button type="button" data-financial-account-transactions="${id}">Ver transações</button>${account.active ? `<button type="button" data-financial-account-expense="${id}">+ Despesa</button>` : ""}</footer></article>`;
  }).join("");
}

function renderFinancialCategories() {
  if (!elements.financialCategoryRows) return;
  const byId = new Map(state.financialCategories.map((category) => [category.id, category.name]));
  const safeColor = (value) => /^#[0-9a-f]{6}$/i.test(value || "") ? value : "#aa8e34";
  elements.financialCategoryRows.innerHTML = state.financialCategories.length ? state.financialCategories.map((category) => `<tr><td><span class="financial-color" style="background:${safeColor(category.color)}"></span><strong>${escapeHtml(category.name)}</strong></td><td>${escapeHtml(FINANCIAL_CATEGORY_TYPES[category.category_type] || category.category_type)}</td><td>${escapeHtml(byId.get(category.parent_id) || "—")}</td><td><span class="financial-status ${category.active ? "active" : "inactive"}">${category.active ? "Ativa" : "Inativa"}</span></td><td><button class="link-button" type="button" data-edit-financial-category="${category.id}">Editar</button> <button class="link-button" type="button" data-toggle-financial-category="${category.id}">${category.active ? "Inativar" : "Ativar"}</button> <button class="link-button danger" type="button" data-delete-financial-category="${category.id}">Excluir</button></td></tr>`).join("") : '<tr><td colspan="5" class="empty-table-cell">Nenhuma categoria cadastrada.</td></tr>';
  applyFinancialTableSort(elements.financialCategoryRows.closest("table"));
}

function syncFinancialCreditCardFields() {
  const visible = document.querySelector("#financialAccountType")?.value === "credit_card";
  document.querySelectorAll(".credit-card-field").forEach((field) => { field.hidden = !visible; });
}

function openFinancialAccountDialog(accountId = null) {
  const account = state.financialAccounts.find((item) => item.id === accountId);
  state.financialEditingAccountId = account?.id || null;
  elements.financialAccountForm.reset();
  document.querySelector("#financialAccountDialogTitle").textContent = account ? "Editar conta" : "Nova conta";
  document.querySelector("#financialAccountName").value = account?.name || "";
  document.querySelector("#financialAccountType").value = account?.account_type || "bank";
  document.querySelector("#financialAccountInstitution").value = account?.institution || "";
  document.querySelector("#financialAccountBalance").value = account?.initial_balance ?? 0;
  document.querySelector("#financialAccountBalanceDate").value = account?.initial_balance_date || new Date().toISOString().slice(0, 10);
  document.querySelector("#financialAccountActive").value = String(account?.active ?? true);
  document.querySelector("#financialAccountClosingDay").value = account?.closing_day || "";
  document.querySelector("#financialAccountDueDay").value = account?.due_day || "";
  document.querySelector("#financialAccountCreditLimit").value = account?.credit_limit ?? "";
  syncFinancialCreditCardFields();
  elements.financialAccountDialog.showModal();
}

function refreshFinancialCategoryParentOptions(excludedId = null) {
  const select = document.querySelector("#financialCategoryParent");
  select.innerHTML = '<option value="">Nenhuma</option>' + state.financialCategories.filter((category) => category.active && category.id !== excludedId && !category.parent_id).map((category) => `<option value="${category.id}">${escapeHtml(category.name)}</option>`).join("");
}

function openFinancialCategoryDialog(categoryId = null) {
  const category = state.financialCategories.find((item) => item.id === categoryId);
  state.financialEditingCategoryId = category?.id || null;
  elements.financialCategoryForm.reset();
  refreshFinancialCategoryParentOptions(category?.id);
  document.querySelector("#financialCategoryDialogTitle").textContent = category ? "Editar categoria" : "Nova categoria";
  document.querySelector("#financialCategoryName").value = category?.name || "";
  document.querySelector("#financialCategoryType").value = category?.category_type || "expense";
  document.querySelector("#financialCategoryParent").value = category?.parent_id || "";
  document.querySelector("#financialCategoryColor").value = category?.color || "#aa8e34";
  document.querySelector("#financialCategoryActive").value = String(category?.active ?? true);
  elements.financialCategoryDialog.showModal();
}

async function saveFinancialRecord(table, id, payload) {
  const path = id ? `?id=eq.${encodeURIComponent(id)}` : "";
  const response = await authorizedFetch(supabaseTableEndpoint(table, path), () => ({ method: id ? "PATCH" : "POST", headers: supabaseHeaders("return=representation"), body: JSON.stringify(payload) }));
  if (!response.ok) { const details = await response.json().catch(() => null); throw new Error(details?.message || "Não foi possível salvar o registro financeiro."); }
  const saved = await response.json().catch(() => []);
  return saved[0] || null;
}

async function submitFinancialAccount(event) {
  event.preventDefault();
  const type = document.querySelector("#financialAccountType").value;
  const numberOrNull = (selector) => document.querySelector(selector).value ? Number(document.querySelector(selector).value) : null;
  const payload = { name: document.querySelector("#financialAccountName").value.trim(), account_type: type, institution: document.querySelector("#financialAccountInstitution").value.trim() || null, initial_balance: Number(document.querySelector("#financialAccountBalance").value), initial_balance_date: document.querySelector("#financialAccountBalanceDate").value, active: document.querySelector("#financialAccountActive").value === "true", closing_day: type === "credit_card" ? numberOrNull("#financialAccountClosingDay") : null, due_day: type === "credit_card" ? numberOrNull("#financialAccountDueDay") : null, credit_limit: type === "credit_card" ? numberOrNull("#financialAccountCreditLimit") : null };
  try { await saveFinancialRecord("crm_financial_accounts", state.financialEditingAccountId, payload); await loadFinancialRegisters(); renderFinancialAccounts(); elements.financialAccountDialog.close(); } catch (error) { alert(error.message); }
}

async function submitFinancialCategory(event) {
  event.preventDefault();
  const payload = { name: document.querySelector("#financialCategoryName").value.trim(), category_type: document.querySelector("#financialCategoryType").value, parent_id: document.querySelector("#financialCategoryParent").value || null, color: document.querySelector("#financialCategoryColor").value, active: document.querySelector("#financialCategoryActive").value === "true" };
  try {
    const saved = await saveFinancialRecord("crm_financial_categories", state.financialEditingCategoryId, payload);
    await loadFinancialRegisters();
    renderFinancialCategories();
    elements.financialCategoryDialog.close();
    if (state.financialCategoryTargetItemId && !elements.financialImportDetail.hidden) {
      const targetItemId = state.financialCategoryTargetItemId;
      const checkedIds = new Set(selectedStatementItems().map((item) => item.id));
      const selectedCategories = new Map(Array.from(elements.financialStatementItemRows.querySelectorAll("[data-statement-category]")).map((select) => [select.dataset.statementCategory, select.value]));
      renderFinancialStatementItems();
      checkedIds.add(targetItemId);
      checkedIds.forEach((id) => { const checkbox = elements.financialStatementItemRows.querySelector(`[data-statement-select="${id}"]`); if (checkbox) checkbox.checked = true; });
      selectedCategories.forEach((value, id) => { const select = elements.financialStatementItemRows.querySelector(`[data-statement-category="${id}"]`); if (select && value !== "__new__") select.value = value; });
      elements.financialStatementItemRows.querySelectorAll("[data-statement-category]").forEach(syncStatementTransferField);
      const targetSelect = elements.financialStatementItemRows.querySelector(`[data-statement-category="${targetItemId}"]`);
      if (targetSelect && saved?.id) targetSelect.value = saved.id;
      state.financialCategoryTargetItemId = null;
    } else if (state.financialCategoryTargetEntry) {
      const categorySelect = document.querySelector("#financialEntryCategory");
      if (categorySelect && saved?.id) {
        const option = document.createElement("option");
        option.value = saved.id;
        option.textContent = saved.name;
        categorySelect.insertBefore(option, categorySelect.querySelector('option[value="__new__"]'));
        categorySelect.value = saved.id;
      }
      state.financialCategoryTargetEntry = false;
    }
  } catch (error) { alert(error.message); }
}

async function toggleFinancialRecord(table, id, active, renderFunction) {
  try { await saveFinancialRecord(table, id, { active }); await loadFinancialRegisters(); renderFunction(); } catch (error) { alert(error.message); }
}

async function deleteFinancialRecord(table, id, label) {
  if (!confirm(`Excluir ${label}? Esta ação não poderá ser desfeita.`)) return false;
  const response = await authorizedFetch(supabaseTableEndpoint(table, `?id=eq.${encodeURIComponent(id)}`), () => ({ method: "DELETE", headers: supabaseHeaders() }));
  if (!response.ok) {
    const details = await response.json().catch(() => null);
    throw new Error(details?.code === "23503" ? "Este registro está em uso e não pode ser excluído. Inative-o em vez disso." : details?.message || "Não foi possível excluir o registro.");
  }
  await loadFinancialRegisters();
  return true;
}

function financialEntryViewType(view = state.view) {
  return view === "financePayable" ? "expense" : view === "financeReceivable" ? "income" : null;
}

function financialAccountFilterMatches(entry, accountId, bankAccountIds) {
  if (!accountId) return true;
  if (accountId === FINANCIAL_BANK_ACCOUNTS_FILTER) {
    return bankAccountIds.has(entry.account_id) || (entry.entry_type === "transfer" && bankAccountIds.has(entry.transfer_account_id));
  }
  return entry.account_id === accountId || (entry.entry_type === "transfer" && entry.transfer_account_id === accountId);
}

function financialAccountFilterMovement(entry, accountId, bankAccountIds) {
  const amount = Number(entry.amount) || 0;
  if (entry.entry_type === "income" || entry.entry_type === "expense") {
    const accountMatches = !accountId || (accountId === FINANCIAL_BANK_ACCOUNTS_FILTER && bankAccountIds.has(entry.account_id)) || entry.account_id === accountId;
    return accountMatches ? (entry.entry_type === "income" ? amount : -amount) : 0;
  }
  if (entry.entry_type !== "transfer" || !accountId) return 0;
  if (accountId === FINANCIAL_BANK_ACCOUNTS_FILTER) {
    return (bankAccountIds.has(entry.transfer_account_id) ? amount : 0) - (bankAccountIds.has(entry.account_id) ? amount : 0);
  }
  return (entry.transfer_account_id === accountId ? amount : 0) - (entry.account_id === accountId ? amount : 0);
}

function formatFinancialDate(value) {
  if (!value) return "—";
  const dateOnly = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateOnly) return `${dateOnly[3]}/${dateOnly[2]}/${dateOnly[1]}`;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("pt-BR");
}

function formatFinancialDescription(value) {
  const description = String(value || "").trim().toLocaleLowerCase("pt-BR");
  return description.replace(/(^|[^\p{L}\p{N}])(\p{L})/gu, (_, separator, letter) => separator + letter.toLocaleUpperCase("pt-BR"));
}

const FINANCIAL_TAGS_MARKER = /(?:\r?\n)?\[\[crm-tags:([^\]]*)\]\]\s*$/;

function normalizeFinancialTag(value) {
  return String(value || "").trim().replace(/\s+/g, " ").toLocaleLowerCase("pt-BR").slice(0, 60);
}

function financialEntryTags(entry) {
  const match = String(entry?.notes || "").match(FINANCIAL_TAGS_MARKER);
  if (!match?.[1]) return [];
  return match[1].split(",").map((tag) => { try { return decodeURIComponent(tag); } catch { return tag; } }).map(normalizeFinancialTag).filter(Boolean);
}

function financialEntryNotes(entry) {
  return String(entry?.notes || "").replace(FINANCIAL_TAGS_MARKER, "").trim();
}

function notesWithFinancialTags(notes, tags) {
  const cleanNotes = String(notes || "").replace(FINANCIAL_TAGS_MARKER, "").trim();
  const cleanTags = Array.from(new Set(tags.map(normalizeFinancialTag).filter(Boolean)));
  const marker = cleanTags.length ? `[[crm-tags:${cleanTags.map(encodeURIComponent).join(",")}]]` : "";
  return [cleanNotes, marker].filter(Boolean).join("\n") || null;
}

function availableFinancialTags() {
  const entries = [...state.financialEntries, ...(state.financialTagEntries || [])];
  return Array.from(new Set(entries.flatMap(financialEntryTags))).sort((first, second) => financialSortCollator.compare(first, second));
}

async function fetchFinancialTagEntries() {
  const entries = [];
  let cursor = null;
  while (true) {
    const query = new URLSearchParams({ select: "id,notes", order: "id.asc", limit: "1000" });
    if (cursor !== null) query.set("id", `gt.${cursor}`);
    const response = await authorizedFetch(supabaseTableEndpoint("crm_financial_entries", `?${query}`), () => ({ headers: supabaseHeaders() }));
    if (!response.ok) throw new Error("Não foi possível carregar as tags das transações.");
    const page = await response.json();
    if (!Array.isArray(page) || page.some((entry) => !entry.id)) throw new Error("Resposta inválida ao carregar as tags.");
    entries.push(...page);
    if (page.length < 1000) break;
    const nextCursor = page.at(-1).id;
    if (nextCursor === cursor) throw new Error("A leitura das tags foi interrompida.");
    cursor = nextCursor;
  }
  return entries;
}

function renderFinancialTagManager() {
  const list = document.querySelector("#financialTagManagerList");
  if (!list) return;
  const counts = new Map();
  (state.financialTagEntries || []).forEach((entry) => {
    new Set(financialEntryTags(entry)).forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1));
  });
  const tags = Array.from(counts.keys()).sort((first, second) => financialSortCollator.compare(first, second));
  list.innerHTML = tags.length ? tags.map((tag) => {
    const safeTag = escapeHtml(tag);
    const editing = state.financialTagEditingName === tag;
    return `<div class="financial-tag-manager-row">${editing ? `<input id="financialTagRenameInput" value="${safeTag}" maxlength="60" aria-label="Novo nome da tag" /><button class="button primary" type="button" data-save-financial-tag>Salvar</button><button class="button secondary" type="button" data-cancel-financial-tag>Cancelar</button>` : `<span class="financial-entry-tag-chip">${safeTag}</span><small>${counts.get(tag)} ${counts.get(tag) === 1 ? "lançamento" : "lançamentos"}</small><button class="link-button" type="button" data-edit-financial-tag="${safeTag}">Alterar</button><button class="link-button danger" type="button" data-delete-financial-tag="${safeTag}">Excluir</button>`}</div>`;
  }).join("") : '<p class="financial-tag-manager-empty">Nenhuma tag cadastrada.</p>';
  if (state.financialTagEditingName) document.querySelector("#financialTagRenameInput")?.focus();
}

async function openFinancialTagManager() {
  const button = document.querySelector("#manageFinancialTagsBtn");
  button.disabled = true;
  try {
    state.financialTagEntries = await fetchFinancialTagEntries();
    state.financialTagEditingName = null;
    document.querySelector("#financialTagManagerMessage").textContent = "";
    renderFinancialTagManager();
    document.querySelector("#financialTagManagerDialog").showModal();
  } catch (error) { alert(error.message); }
  finally { button.disabled = false; }
}

function changedFinancialTagNotes(entry, previousTag, replacementTag) {
  const tags = financialEntryTags(entry);
  if (!tags.includes(previousTag)) return null;
  return notesWithFinancialTags(financialEntryNotes(entry), tags.flatMap((tag) => tag === previousTag ? (replacementTag ? [replacementTag] : []) : [tag]));
}

async function updateFinancialTag(previousTag, replacementTag) {
  const affected = (state.financialTagEntries || []).filter((entry) => financialEntryTags(entry).includes(previousTag));
  const action = replacementTag ? `Alterar a tag "${previousTag}" para "${replacementTag}"` : `Excluir a tag "${previousTag}"`;
  if (!confirm(`${action} em ${affected.length} ${affected.length === 1 ? "lançamento" : "lançamentos"}? Os lançamentos serão preservados.`)) return;
  const dialog = document.querySelector("#financialTagManagerDialog");
  const message = document.querySelector("#financialTagManagerMessage");
  state.financialTagUpdating = true;
  dialog.querySelectorAll("button").forEach((button) => { button.disabled = true; });
  let completed = 0;
  let failure = null;
  try {
    for (const entry of affected) {
      await saveFinancialRecord("crm_financial_entries", entry.id, { notes: changedFinancialTagNotes(entry, previousTag, replacementTag) });
      completed += 1;
      message.textContent = `Atualizando tags: ${completed} de ${affected.length}`;
    }
    state.financialEntryDraftTags = Array.from(new Set(state.financialEntryDraftTags.flatMap((tag) => tag === previousTag ? (replacementTag ? [replacementTag] : []) : [tag])));
    const tagInput = document.querySelector("#financialEntryTagInput");
    if (normalizeFinancialTag(tagInput?.value) === previousTag) tagInput.value = replacementTag || "";
    state.financialTagEditingName = null;
  } catch (error) { failure = error; }
  try {
    await loadFinancialRegisters();
    state.financialTagEntries = await fetchFinancialTagEntries();
    if (failure && completed && state.financialEditingEntryId) {
      const editingEntry = state.financialEntries.find((entry) => entry.id === state.financialEditingEntryId);
      if (editingEntry) state.financialEntryDraftTags = financialEntryTags(editingEntry);
    }
    renderFinancialEntries();
    renderFinancialEntryTagEditor();
    syncFinancialEntryTagAction();
    renderFinancialTagManager();
  } catch (error) { failure ||= error; }
  dialog.querySelectorAll("button").forEach((button) => { button.disabled = false; });
  state.financialTagUpdating = false;
  message.textContent = failure ? `Atualização incompleta (${completed} de ${affected.length}): ${failure.message}` : replacementTag ? "Tag alterada em todos os lançamentos." : "Tag excluída dos lançamentos.";
}

function renderFinancialEntryTagEditor() {
  const suggestions = document.querySelector("#financialEntryTagSuggestions");
  const chips = document.querySelector("#financialEntryTagChips");
  if (suggestions) suggestions.innerHTML = availableFinancialTags().filter((tag) => !state.financialEntryDraftTags.includes(tag)).map((tag) => `<option value="${escapeHtml(tag)}"></option>`).join("");
  if (chips) chips.innerHTML = state.financialEntryDraftTags.map((tag) => `<button class="financial-entry-tag-chip" type="button" data-remove-financial-entry-tag="${escapeHtml(tag)}" title="Remover tag"><span>${escapeHtml(tag)}</span> ×</button>`).join("");
}

function addFinancialEntryTag() {
  const input = document.querySelector("#financialEntryTagInput");
  const tag = normalizeFinancialTag(input?.value);
  if (!tag) return;
  if (!state.financialEntryDraftTags.includes(tag)) state.financialEntryDraftTags.push(tag);
  input.value = "";
  renderFinancialEntryTagEditor();
  syncFinancialEntryTagAction();
  input.focus();
}

function syncFinancialEntryTagAction() {
  const input = document.querySelector("#financialEntryTagInput");
  const button = document.querySelector("#addFinancialEntryTagBtn");
  if (!button) return;
  const tag = normalizeFinancialTag(input?.value);
  button.textContent = tag && !availableFinancialTags().includes(tag) ? "Cadastrar" : "Adicionar";
}

function formatFinancialMonth(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})$/);
  if (!match) return "Todos os meses";
  const month = new Date(Number(match[1]), Number(match[2]) - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return month.charAt(0).toUpperCase() + month.slice(1);
}

function currentFinancialMonth() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
}

function stepFinancialEntryMonth(step) {
  const base = state.financialEntryMonthFilter || new Date().toISOString().slice(0, 7);
  const [year, month] = base.split("-").map(Number);
  const target = new Date(year, month - 1 + step, 1);
  state.financialEntryMonthFilter = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}`;
  renderFinancialEntries();
}

function renderFinancialTransactionSummary(start, end) {
  const entries = state.financialEntries.filter((entry) => {
    const date = financialEntryDate(entry);
    return entry.status !== "cancelled" && (!state.financialEntryMonthFilter || (date >= start && date <= end));
  });
  const income = entries.filter((entry) => entry.entry_type === "income").reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
  const expense = entries.filter((entry) => entry.entry_type === "expense").reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
  const accounts = state.financialAccounts.filter((account) => account.active);
  const balanceDate = state.financialEntryMonthFilter ? end : new Date().toISOString().slice(0, 10);
  const balance = accounts.reduce((sum, account) => sum + financialAccountBalance(account, balanceDate, false), 0);
  document.querySelector("#financialTransactionBalance").textContent = BRL.format(balance);
  document.querySelector("#financialTransactionIncome").textContent = BRL.format(income);
  document.querySelector("#financialTransactionExpense").textContent = BRL.format(expense);
  document.querySelector("#financialTransactionNet").textContent = BRL.format(income - expense);
}

const financialTableSorts = new WeakMap();
const financialSortCollator = new Intl.Collator("pt-BR", { sensitivity: "base", numeric: true });

function financialSortCellValue(cell, type) {
  const raw = cell?.dataset.sortValue ?? cell?.querySelector("select")?.selectedOptions[0]?.textContent ?? cell?.textContent ?? "";
  const value = raw.trim();
  if (type === "number") {
    if (!value || value === "—") return Number.NEGATIVE_INFINITY;
    const normalized = value.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
    const number = Number(normalized);
    return Number.isNaN(number) ? Number.NEGATIVE_INFINITY : number;
  }
  if (type === "date") {
    const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    return match ? Number(`${match[3]}${match[2]}${match[1]}`) : Number.NEGATIVE_INFINITY;
  }
  return value;
}

function applyFinancialTableSort(table) {
  const sort = financialTableSorts.get(table);
  const body = table?.tBodies[0];
  if (!sort || !body) return;
  body.querySelectorAll(".financial-daily-balance-row, .financial-filter-balance-row").forEach((row) => row.remove());
  const rows = Array.from(body.rows);
  if (rows.length < 2 || rows.some((row) => row.querySelector(".empty-table-cell"))) return;
  rows.map((row, position) => ({ row, position, value: financialSortCellValue(row.cells[sort.column], sort.type) }))
    .sort((first, second) => {
      if (table.classList.contains("financial-entry-table") && sort.column !== 1) {
        const dateResult = String(second.row.dataset.financialEntryDate || "").localeCompare(first.row.dataset.financialEntryDate || "");
        if (dateResult) return dateResult;
      }
      const result = sort.type === "text" ? financialSortCollator.compare(first.value, second.value) : first.value - second.value;
      return result ? result * (sort.direction === "asc" ? 1 : -1) : first.position - second.position;
    })
    .forEach(({ row }) => body.appendChild(row));
  if (table.classList.contains("financial-entry-table")) renderFinancialDailyBalanceBreaks(table);
}

function renderFinancialDailyBalanceBreaks(table) {
  const body = table?.tBodies[0];
  body?.querySelectorAll(".financial-daily-balance-row, .financial-filter-balance-row").forEach((row) => row.remove());
  if (!body || state.view !== "financeTransactions") return;
  const filters = state.financialEntryFilters;
  const hasExplicitFilter = Boolean(filters.search || filters.type || (filters.accountId && filters.accountId !== FINANCIAL_BANK_ACCOUNTS_FILTER) || filters.categoryId || filters.status || filters.startDate || filters.endDate);
  const rows = Array.from(body.rows).filter((row) => row.dataset.financialEntryDate);
  const bankAccountIds = new Set(state.financialAccounts.filter((account) => account.active && account.account_type === "bank").map((account) => account.id));
  if (hasExplicitFilter) {
    const accountId = state.financialEntryAccountFilter || filters.accountId;
    const visibleIds = new Set(rows.map((row) => row.dataset.financialEntryId));
    const dailyMovements = new Map();
    state.financialEntries.filter((entry) => visibleIds.has(entry.id) && entry.status !== "cancelled").forEach((entry) => {
      const movement = financialAccountFilterMovement(entry, accountId, bankAccountIds);
      const date = financialEntryDate(entry);
      dailyMovements.set(date, (dailyMovements.get(date) || 0) + movement);
    });
    let balance = 0;
    const balanceByDate = new Map();
    Array.from(dailyMovements.keys()).sort().forEach((date) => {
      balance += dailyMovements.get(date);
      balanceByDate.set(date, balance);
    });
    if (!state.financialEntryShowDailyBalance && rows.length) {
      const summary = document.createElement("tr");
      summary.className = "financial-filter-balance-row";
      summary.innerHTML = `<td colspan="7"><span>Saldo total do filtro <strong>${BRL.format(balance)}</strong></span></td>`;
      body.appendChild(summary);
    }
    if (state.financialEntryShowDailyBalance) rows.forEach((row, index) => {
      const date = row.dataset.financialEntryDate;
      if (rows[index + 1]?.dataset.financialEntryDate === date) return;
      const summary = document.createElement("tr");
      summary.className = "financial-daily-balance-row";
      summary.innerHTML = `<td colspan="7"><span>Saldo do filtro até o dia <strong>${BRL.format(balanceByDate.get(date) || 0)}</strong></span></td>`;
      row.after(summary);
    });
    return;
  }
  if (!state.financialEntryShowDailyBalance) return;
  const selectedAccountId = state.financialEntryAccountFilter || filters.accountId;
  const accounts = state.financialAccounts.filter((account) => account.active && (!selectedAccountId || (selectedAccountId === FINANCIAL_BANK_ACCOUNTS_FILTER && account.account_type === "bank") || account.id === selectedAccountId));
  rows.forEach((row, index) => {
    const date = row.dataset.financialEntryDate;
    if (rows[index + 1]?.dataset.financialEntryDate === date) return;
    const balance = accounts.reduce((sum, account) => sum + financialAccountBalance(account, date, true), 0);
    const summary = document.createElement("tr");
    summary.className = "financial-daily-balance-row";
    summary.innerHTML = `<td colspan="7"><span>Saldo previsto no final do dia <strong>${BRL.format(balance)}</strong></span></td>`;
    row.after(summary);
  });
}

function initializeFinancialTableSorting() {
  document.querySelectorAll("table[data-financial-sortable]").forEach((table) => {
    table.querySelectorAll("thead th[data-sort-type]").forEach((header) => {
      header.tabIndex = 0;
      header.setAttribute("aria-sort", "none");
      const sort = () => {
        const column = header.cellIndex;
        const current = financialTableSorts.get(table);
        const direction = current?.column === column && current.direction === "asc" ? "desc" : "asc";
        financialTableSorts.set(table, { column, direction, type: header.dataset.sortType });
        table.querySelectorAll("thead th[data-sort-type]").forEach((item) => item.setAttribute("aria-sort", item === header ? (direction === "asc" ? "ascending" : "descending") : "none"));
        applyFinancialTableSort(table);
      };
      header.addEventListener("click", sort);
      header.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); sort(); } });
    });
  });
}

function renderFinancialEntries(view = state.view) {
  const filterType = financialEntryViewType(view);
  const { start, end } = financialMonthBounds(state.financialEntryMonthFilter || state.financialDashboardMonth);
  const filters = state.financialEntryFilters;
  const hasGlobalFilter = Boolean(filters.search || (view === "financeTransactions" && filters.type) || (filters.accountId && filters.accountId !== FINANCIAL_BANK_ACCOUNTS_FILTER) || filters.categoryId || filters.status || filters.startDate || filters.endDate);
  const bankAccountIds = new Set(state.financialAccounts.filter((account) => account.active && account.account_type === "bank").map((account) => account.id));
  if (view === "financeTransactions") renderFinancialTransactionSummary(start, end);
  const entries = state.financialEntries.filter((entry) => {
    if (filterType && entry.entry_type !== filterType) return false;
    if (view === "financeTransactions" && filters.type && entry.entry_type !== filters.type) return false;
    const entryDate = financialEntryDate(entry);
    if (state.financialEntryMonthFilter && !hasGlobalFilter && (entryDate < start || entryDate > end)) return false;
    const contextualAccount = view === "financeTransactions" ? state.financialEntryAccountFilter : "";
    const accountId = contextualAccount || filters.accountId;
    if (!financialAccountFilterMatches(entry, accountId, bankAccountIds)) return false;
    if (contextualAccount && !hasGlobalFilter && (entryDate < start || entryDate > end)) return false;
    if (filters.startDate && entryDate < filters.startDate) return false;
    if (filters.endDate && entryDate > filters.endDate) return false;
    if (filters.categoryId && entry.category_id !== filters.categoryId) return false;
    if (filters.status && entry.status !== filters.status) return false;
    if (filters.search) {
      const search = filters.search.toLocaleLowerCase("pt-BR");
      const matchesDescription = String(entry.description || "").toLocaleLowerCase("pt-BR").includes(search);
      const matchesTag = financialEntryTags(entry).some((tag) => tag.includes(search));
      if (!matchesDescription && !matchesTag) return false;
    }
    return true;
  });
  const accounts = new Map(state.financialAccounts.map((account) => [account.id, account.name]));
  const categories = new Map(state.financialCategories.map((category) => [category.id, category.name]));
  const accountSelect = document.querySelector("#financialEntryFilterAccount");
  const categorySelect = document.querySelector("#financialEntryFilterCategory");
  if (accountSelect) { accountSelect.innerHTML = `<option value="">Todas as contas</option><option value="${FINANCIAL_BANK_ACCOUNTS_FILTER}">Contas bancárias</option>` + state.financialAccounts.filter((account) => account.active).map((account) => `<option value="${account.id}">${escapeHtml(account.name)}</option>`).join(""); accountSelect.value = state.financialEntryAccountFilter || filters.accountId; accountSelect.disabled = Boolean(state.financialEntryAccountFilter); }
  if (categorySelect) { const eligibleCategories = state.financialCategories.filter((category) => category.active && (!filterType || category.category_type === filterType || category.category_type === "both")); categorySelect.innerHTML = '<option value="">Todas as categorias</option>' + financialGroupedCategoryOptions(eligibleCategories) ; categorySelect.value = filters.categoryId; }
  document.querySelector("#financialEntryFilterSearch").value = filters.search;
  document.querySelector("#financialEntryTypeFilter").hidden = view !== "financeTransactions";
  document.querySelector("#financialEntryFilterType").value = filters.type;
  document.querySelector("#financialEntryMonth").value = state.financialEntryMonthFilter;
  document.querySelector("#financialEntryMonthLabel").textContent = formatFinancialMonth(state.financialEntryMonthFilter);
  document.querySelector("#financialEntryFilterStatus").value = filters.status;
  const balanceControls = document.querySelector("#financialEntryBalanceControls");
  if (balanceControls) balanceControls.hidden = view !== "financeTransactions";
  const dailyBalanceToggle = document.querySelector("#financialEntryShowDailyBalance");
  if (dailyBalanceToggle) dailyBalanceToggle.checked = state.financialEntryShowDailyBalance;
  document.querySelector("#financialEntryFilterStart").value = state.financialEntryMonthFilter && !hasGlobalFilter ? start : filters.startDate;
  document.querySelector("#financialEntryFilterEnd").value = state.financialEntryMonthFilter && !hasGlobalFilter ? end : filters.endDate;
  document.querySelector("#financialEntryFilterStart").disabled = Boolean(state.financialEntryMonthFilter && !hasGlobalFilter);
  document.querySelector("#financialEntryFilterEnd").disabled = Boolean(state.financialEntryMonthFilter && !hasGlobalFilter);
  const title = document.querySelector("#financialEntriesTitle");
  if (title) title.textContent = filterType === "expense" ? "Contas a pagar" : filterType === "income" ? "Contas a receber" : "Transações";
  const context = document.querySelector("#financialEntriesContext");
  if (context) {
    const accountName = accounts.get(state.financialEntryAccountFilter);
    context.hidden = view !== "financeTransactions" || !accountName;
    if (accountName) context.querySelector("span").textContent = `${accountName} • ${formatFinancialDate(start)} a ${formatFinancialDate(end)}`;
  }
  elements.financialEntryRows.innerHTML = entries.length ? entries.map((entry) => {
    const accountLabel = entry.entry_type === "transfer" ? `${accounts.get(entry.account_id) || "—"} → ${accounts.get(entry.transfer_account_id) || "—"}` : accounts.get(entry.account_id) || "—";
    const accountDisplay = entry.entry_type === "transfer" ? `${financialAccountReference(accounts.get(entry.account_id))}<span class="financial-account-arrow">→</span>${financialAccountReference(accounts.get(entry.transfer_account_id))}` : financialAccountReference(accounts.get(entry.account_id));
    const statusLabel = { pending: "Pendente", paid: "Pago/recebido", overdue: "Vencido", cancelled: "Cancelado" }[entry.status] || entry.status;
    const statusIcon = { paid: "✓", pending: "!", overdue: "!", cancelled: "×" }[entry.status] || "•";
    const categoryLabel = entry.entry_type === "transfer" ? "Transferência" : categories.get(entry.category_id) || "Sem categoria";
    const tags = financialEntryTags(entry);
    const tagList = tags.length ? `<div class="financial-entry-list-tags">${tags.map((tag) => `<span class="financial-entry-tag-chip"><span>${escapeHtml(tag)}</span></span>`).join("")}</div>` : "";
    return `<tr class="${entry.status === "paid" ? "financial-entry-paid" : ""}" data-financial-entry-id="${entry.id}" data-financial-entry-date="${financialEntryDate(entry)}"><td data-sort-value="${escapeHtml(statusLabel)}"><span class="financial-entry-status-icon ${entry.status}" role="img" aria-label="${escapeHtml(statusLabel)}" title="${escapeHtml(statusLabel)}">${statusIcon}</span></td><td>${escapeHtml(formatFinancialDate(entry.due_date || entry.competence_date))}</td><td><strong>${escapeHtml(formatFinancialDescription(entry.description))}</strong>${entry.installment_count ? `<small class="financial-installment-label">Parcela ${entry.installment_number}/${entry.installment_count}</small>` : ""}</td><td data-sort-value="${escapeHtml(categoryLabel)}">${escapeHtml(categoryLabel)}${tagList}</td><td data-sort-value="${escapeHtml(accountLabel)}"><span class="financial-entry-account-display">${accountDisplay}</span></td><td class="financial-entry-value ${entry.entry_type}">${BRL.format(Number(entry.amount) || 0)}</td><td><div class="financial-entry-actions"><button class="financial-entry-menu-button" type="button" data-financial-entry-menu="${entry.id}" aria-label="Ações de ${escapeHtml(formatFinancialDescription(entry.description))}" aria-haspopup="menu" aria-expanded="false">⋮</button><div class="financial-entry-actions-menu" role="menu" hidden><button type="button" role="menuitem" data-edit-financial-entry="${entry.id}"><span class="financial-entry-action-icon">✎</span>Editar</button><button type="button" role="menuitem" data-duplicate-financial-entry="${entry.id}"><span class="financial-entry-action-icon">⧉</span>Duplicar</button><button class="danger" type="button" role="menuitem" data-delete-financial-entry="${entry.id}"><span class="financial-entry-action-icon">⌫</span>Excluir</button></div></div></td></tr>`;
  }).join("") : '<tr><td colspan="7" class="empty-table-cell">Nenhum lançamento encontrado para esta conta no período.</td></tr>';
  const entryTable = elements.financialEntryRows.closest("table");
  if (!financialTableSorts.has(entryTable)) {
    financialTableSorts.set(entryTable, { column: 1, direction: "desc", type: "date" });
    entryTable.querySelector("thead th:nth-child(2)")?.setAttribute("aria-sort", "descending");
  }
  applyFinancialTableSort(entryTable);
  renderFinancialDailyBalanceBreaks(entryTable);
}

function compareFinancialCategoryPriority(first, second) {
  const normalizeName = (value) => String(value || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("pt-BR");
  const firstOperation = normalizeName(first.name).includes("operacao");
  const secondOperation = normalizeName(second.name).includes("operacao");
  return Number(secondOperation) - Number(firstOperation) || financialSortCollator.compare(first.name, second.name);
}

function financialGroupedCategoryOptions(eligibleCategories, markPrincipal = false) {
  const activeCategories = state.financialCategories.filter((category) => category.active);
  const activeIds = new Set(activeCategories.map((category) => category.id));
  const eligibleIds = new Set(eligibleCategories.map((category) => category.id));
  const byParent = new Map();
  activeCategories.forEach((category) => {
    const parentId = category.parent_id && activeIds.has(category.parent_id) ? category.parent_id : null;
    if (!byParent.has(parentId)) byParent.set(parentId, []);
    byParent.get(parentId).push(category);
  });
  return (byParent.get(null) || []).sort(compareFinancialCategoryPriority).map((parent) => {
    const children = (byParent.get(parent.id) || []).filter((child) => eligibleIds.has(child.id)).sort(compareFinancialCategoryPriority);
    const parentOption = eligibleIds.has(parent.id) ? `<option value="${parent.id}">${escapeHtml(parent.name)}${markPrincipal && children.length ? " (principal)" : ""}</option>` : "";
    if (!children.length) return parentOption;
    return `<optgroup label="${escapeHtml(parent.name)}">${parentOption}${children.map((child) => `<option value="${child.id}">↳ ${escapeHtml(child.name)}</option>`).join("")}</optgroup>`;
  }).join("");
}

function fillFinancialEntryOptions() {
  const accountOptions = state.financialAccounts.filter((item) => item.active).map((item) => `<option value="${item.id}">${escapeHtml(item.name)}</option>`).join("");
  document.querySelector("#financialEntryAccount").innerHTML = accountOptions;
  document.querySelector("#financialEntryTransferAccount").innerHTML = accountOptions;
  const activeCategories = state.financialCategories.filter((item) => item.active);
  const categoryOptions = financialGroupedCategoryOptions(activeCategories, true);
  document.querySelector("#financialEntryCategory").innerHTML = '<option value="">Sem categoria</option>' + categoryOptions + '<option value="__new__">+ Criar nova categoria...</option>';
}

function syncFinancialEntryTypeFields() {
  const transfer = document.querySelector("#financialEntryType").value === "transfer";
  document.querySelector("#financialEntryTransferField").hidden = !transfer;
  document.querySelector("#financialEntryCategoryField").hidden = transfer;
  document.querySelector("#financialEntryTransferAccount").required = transfer;
  const installmentField = document.querySelector("#financialEntryInstallmentField");
  if (installmentField) installmentField.hidden = transfer || Boolean(state.financialEditingEntryId);
  if (transfer) document.querySelector("#financialEntryInstallment").value = "false";
  syncFinancialInstallmentFields();
}

function syncFinancialInstallmentFields() {
  const installment = !state.financialEditingEntryId && document.querySelector("#financialEntryType").value !== "transfer" && document.querySelector("#financialEntryInstallment").value === "true";
  document.querySelector("#financialEntryInstallmentCountField").hidden = !installment;
  document.querySelector("#financialEntryInstallmentHint").hidden = !installment;
  document.querySelector("#financialEntryInstallmentCount").required = installment;
  document.querySelector("#financialEntryAmountLabel").textContent = installment || state.financialEntries.find((item) => item.id === state.financialEditingEntryId)?.installment_count ? "Valor da parcela *" : "Valor *";
}

function addMonthsToFinancialDate(value, months) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return value;
  const year = Number(match[1]); const month = Number(match[2]) - 1; const day = Number(match[3]);
  const targetFirst = new Date(year, month + months, 1);
  const lastDay = new Date(targetFirst.getFullYear(), targetFirst.getMonth() + 1, 0).getDate();
  const target = new Date(targetFirst.getFullYear(), targetFirst.getMonth(), Math.min(day, lastDay));
  return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}-${String(target.getDate()).padStart(2, "0")}`;
}

function calculateFinancialEntryAmount(expression) {
  const compact = String(expression || "").replace(/\s+/g, "").replace(/[×]/g, "*").replace(/[÷]/g, "/");
  if (compact.length > 120) return null;
  const tokens = compact.match(/\d[\d.,]*|[()+*/-]/g) || [];
  if (!compact || tokens.join("") !== compact) return null;
  let position = 0;
  const number = (token) => {
    if (!/^\d+(?:[.,]\d+)*$/.test(token) || token.includes(",") && !/^\d{1,3}(?:\.\d{3})*,\d+$/.test(token) && !/^\d+,\d+$/.test(token)) return NaN;
    const normalized = token.includes(",") ? token.replace(/\./g, "").replace(",", ".") : /^\d{1,3}(?:\.\d{3})+$/.test(token) ? token.replace(/\./g, "") : token;
    return Number(normalized);
  };
  const factor = () => {
    if (tokens[position] === "+" || tokens[position] === "-") { const sign = tokens[position++] === "-" ? -1 : 1; return sign * factor(); }
    if (tokens[position] === "(") { position++; const result = sum(); if (tokens[position++] !== ")") return NaN; return result; }
    return number(tokens[position++] || "");
  };
  const product = () => {
    let result = factor();
    while (tokens[position] === "*" || tokens[position] === "/") { const operator = tokens[position++]; const right = factor(); result = operator === "*" ? result * right : result / right; }
    return result;
  };
  const sum = () => {
    let result = product();
    while (tokens[position] === "+" || tokens[position] === "-") { const operator = tokens[position++]; const right = product(); result = operator === "+" ? result + right : result - right; }
    return result;
  };
  const result = sum();
  if (position !== tokens.length || !Number.isFinite(result)) return null;
  const rounded = Math.round((result + Number.EPSILON) * 100) / 100;
  return Number.isFinite(rounded) && rounded > 0 ? rounded : null;
}

function resolveFinancialEntryAmount(showError = false) {
  const field = document.querySelector("#financialEntryAmount");
  const amount = calculateFinancialEntryAmount(field.value);
  field.setCustomValidity(amount === null ? "Informe um valor maior que zero usando apenas números, +, -, * e /." : "");
  if (amount === null) { if (showError) field.reportValidity(); return null; }
  field.value = amount.toFixed(2);
  return amount;
}

function openFinancialEntryDialog(entryId = null, duplicate = false) {
  if (!state.financialAccounts.some((item) => item.active)) { alert("Cadastre uma conta ativa antes de criar lançamentos."); return; }
  const entry = state.financialEntries.find((item) => item.id === entryId);
  if (entryId && !entry) { alert("Transação não encontrada. Atualize a lista e tente novamente."); return; }
  state.financialEditingEntryId = duplicate ? null : entry?.id || null;
  elements.financialEntryForm.reset();
  fillFinancialEntryOptions();
  const today = new Date().toISOString().slice(0, 10);
  document.querySelector("#financialEntryDialogTitle").textContent = duplicate ? "Duplicar lançamento" : entry ? "Editar lançamento" : "Novo lançamento";
  document.querySelector("#financialEntryType").value = entry?.entry_type || financialEntryViewType() || "expense";
  document.querySelector("#financialEntryStatus").value = entry?.status === "overdue" ? "pending" : entry?.status || "pending";
  document.querySelector("#financialEntryDescription").value = formatFinancialDescription(entry?.description);
  document.querySelector("#financialEntryAmount").value = entry?.amount || "";
  document.querySelector("#financialEntryAmount").setCustomValidity("");
  document.querySelector("#financialEntryAccount").value = entry?.account_id || state.financialAccounts.find((item) => item.active)?.id || "";
  document.querySelector("#financialEntryTransferAccount").value = entry?.transfer_account_id || "";
  document.querySelector("#financialEntryCategory").value = entry?.category_id || "";
  document.querySelector("#financialEntryIssueDate").value = entry?.issue_date || today;
  document.querySelector("#financialEntryCompetenceDate").value = entry?.competence_date || today;
  document.querySelector("#financialEntryDueDate").value = entry?.due_date || "";
  state.financialEntryDraftTags = financialEntryTags(entry);
  document.querySelector("#financialEntryTagInput").value = "";
  document.querySelector("#financialEntryNotes").value = financialEntryNotes(entry);
  document.querySelector("#financialEntryInstallment").value = "false";
  document.querySelector("#financialEntryInstallmentCount").value = "2";
  renderFinancialEntryTagEditor();
  syncFinancialEntryTagAction();
  syncFinancialEntryTypeFields();
  elements.financialEntryDialog.showModal();
}

async function submitFinancialEntry(event) {
  event.preventDefault();
  const amount = resolveFinancialEntryAmount(true);
  if (amount === null) return;
  const type = document.querySelector("#financialEntryType").value;
  const status = document.querySelector("#financialEntryStatus").value;
  const pendingTag = normalizeFinancialTag(document.querySelector("#financialEntryTagInput").value);
  const tags = pendingTag ? [...state.financialEntryDraftTags, pendingTag] : state.financialEntryDraftTags;
  const payload = { entry_type: type, status, account_id: document.querySelector("#financialEntryAccount").value, transfer_account_id: type === "transfer" ? document.querySelector("#financialEntryTransferAccount").value : null, category_id: type === "transfer" ? null : document.querySelector("#financialEntryCategory").value || null, description: formatFinancialDescription(document.querySelector("#financialEntryDescription").value), amount, issue_date: document.querySelector("#financialEntryIssueDate").value, competence_date: document.querySelector("#financialEntryCompetenceDate").value, due_date: document.querySelector("#financialEntryDueDate").value || null, paid_at: status === "paid" ? new Date().toISOString() : null, notes: notesWithFinancialTags(document.querySelector("#financialEntryNotes").value, tags) };
  if (type === "transfer" && payload.account_id === payload.transfer_account_id) { alert("A conta de destino deve ser diferente da conta de origem."); return; }
  const installmentCount = !state.financialEditingEntryId && document.querySelector("#financialEntryInstallment").value === "true" ? Number(document.querySelector("#financialEntryInstallmentCount").value) : 1;
  if (installmentCount > 1 && !payload.due_date) return alert("Informe o vencimento da primeira parcela.");
  const groupId = installmentCount > 1 ? crypto.randomUUID() : null;
  const records = Array.from({ length: installmentCount }, (_, index) => ({ ...payload, id: installmentCount > 1 ? crypto.randomUUID() : undefined, status: index === 0 ? payload.status : "pending", paid_at: index === 0 ? payload.paid_at : null, competence_date: addMonthsToFinancialDate(payload.competence_date, index), due_date: payload.due_date ? addMonthsToFinancialDate(payload.due_date, index) : null, installment_number: installmentCount > 1 ? index + 1 : null, installment_count: installmentCount > 1 ? installmentCount : null, installment_group_id: groupId }));
  if (installmentCount === 1) ["id", "installment_number", "installment_count", "installment_group_id"].forEach((key) => delete records[0][key]);
  try { await saveFinancialRecord("crm_financial_entries", state.financialEditingEntryId, installmentCount > 1 ? records : records[0]); await loadFinancialRegisters(); renderFinancialEntries(); elements.financialEntryDialog.close(); } catch (error) { alert(error.message); }
}

function renderFinancialImports() {
  const accounts = new Map(state.financialAccounts.map((account) => [account.id, account.name]));
  const select = document.querySelector("#financialImportAccount");
  const selected = select.value;
  select.innerHTML = '<option value="">Selecione uma conta</option>' + state.financialAccounts.filter((item) => item.active && item.account_type !== "credit_card").map((item) => `<option value="${item.id}">${escapeHtml(item.name)}</option>`).join("");
  if (selected) select.value = selected;
  elements.financialImportRows.innerHTML = state.financialImports.length ? state.financialImports.map((item) => `<tr class="${state.financialSelectedImportId === item.id ? "selected-row" : ""}"><td>${escapeHtml(item.file_name)}</td><td>${escapeHtml(accounts.get(item.account_id) || "—")}</td><td>${escapeHtml(item.file_type.toUpperCase())}</td><td>${item.item_count}</td><td>${escapeHtml(formatFinancialDate(item.created_at))}</td><td><button class="link-button" type="button" data-view-financial-import="${item.id}">Visualizar</button> <button class="link-button danger" type="button" data-delete-financial-import="${item.id}">Excluir</button></td></tr>`).join("") : '<tr><td colspan="6" class="empty-table-cell">Nenhum extrato importado.</td></tr>';
  applyFinancialTableSort(elements.financialImportRows.closest("table"));
  if (!state.financialSelectedImportId && elements.financialImportDetail) elements.financialImportDetail.hidden = true;
}

async function openFinancialImport(importId) {
  const response = await authorizedFetch(supabaseTableEndpoint("crm_financial_statement_items", `?import_id=eq.${encodeURIComponent(importId)}&select=*&order=transaction_date.asc,created_at.asc`), () => ({ headers: supabaseHeaders() }));
  if (!response.ok) throw new Error("Não foi possível carregar os lançamentos importados.");
  state.financialSelectedImportId = importId;
  state.financialStatementItems = await response.json();
  renderFinancialImports();
  renderFinancialStatementItems();
  elements.financialImportDetail.hidden = false;
  elements.financialImportDetail.scrollIntoView({ behavior: "smooth", block: "start" });
}

function statementCategoryOptions(item) {
  const expectedType = Number(item.amount) >= 0 ? "income" : "expense";
  return '<option value="">Selecione</option><option value="__transfer__">Transferência entre contas</option>' + state.financialCategories.filter((category) => category.active && (category.category_type === expectedType || category.category_type === "both")).map((category) => `<option value="${category.id}">${escapeHtml(category.name)}</option>`).join("") + '<option value="__new__">+ Criar nova categoria...</option>';
}

function statementTransferAccountOptions(item) {
  return '<option value="">Selecione a outra conta</option>' + state.financialAccounts.filter((account) => account.active && account.id !== item.account_id).map((account) => `<option value="${account.id}">${escapeHtml(account.name)}</option>`).join("");
}

function renderFinancialStatementItems() {
  const statusLabels = { pending: "Pendente", reconciled: "Confirmado", ignored: "Ignorado" };
  elements.financialStatementItemRows.innerHTML = state.financialStatementItems.length ? state.financialStatementItems.map((item) => { const pending = item.reconciliation_status === "pending"; return `<tr><td><input type="checkbox" data-statement-select="${item.id}" ${pending ? "" : "disabled"} aria-label="Selecionar lançamento" /></td><td>${formatFinancialDate(item.transaction_date)}</td><td><strong>${escapeHtml(formatFinancialDescription(item.description))}</strong></td><td class="${Number(item.amount) >= 0 ? "financial-positive" : "financial-negative"}">${BRL.format(Number(item.amount))}</td><td>${item.balance == null ? "—" : BRL.format(Number(item.balance))}</td><td>${pending ? `<select data-statement-category="${item.id}">${statementCategoryOptions(item)}</select><select class="statement-transfer-account" data-statement-transfer-account="${item.id}" hidden>${statementTransferAccountOptions(item)}</select>` : "—"}</td><td><span class="financial-status ${item.reconciliation_status}">${statusLabels[item.reconciliation_status] || item.reconciliation_status}</span></td></tr>`; }).join("") : '<tr><td colspan="7" class="empty-table-cell">O arquivo não possui lançamentos.</td></tr>';
  applyFinancialTableSort(elements.financialStatementItemRows.closest("table"));
  const selectAll = document.querySelector("#selectAllStatementItems"); if (selectAll) selectAll.checked = false;
}

function selectedStatementItems() {
  return Array.from(elements.financialStatementItemRows.querySelectorAll("[data-statement-select]:checked")).map((checkbox) => state.financialStatementItems.find((item) => item.id === checkbox.dataset.statementSelect)).filter(Boolean);
}

async function patchStatementItemStatus(ids, status) {
  const response = await authorizedFetch(supabaseTableEndpoint("crm_financial_statement_items", `?id=in.(${ids.join(",")})`), () => ({ method: "PATCH", headers: supabaseHeaders(), body: JSON.stringify({ reconciliation_status: status }) }));
  if (!response.ok) throw new Error("Não foi possível atualizar os lançamentos selecionados.");
}

async function ignoreSelectedStatementItems() {
  const items = selectedStatementItems(); if (!items.length) return alert("Selecione ao menos um lançamento.");
  if (!confirm(`Ignorar ${items.length} lançamento(s) selecionado(s)?`)) return;
  try { await patchStatementItemStatus(items.map((item) => item.id), "ignored"); await openFinancialImport(state.financialSelectedImportId); } catch (error) { alert(error.message); }
}

async function confirmSelectedStatementItems() {
  const items = selectedStatementItems(); if (!items.length) return alert("Selecione ao menos um lançamento.");
  const selections = items.map((item) => ({ item, categoryId: elements.financialStatementItemRows.querySelector(`[data-statement-category="${item.id}"]`)?.value || "", transferAccountId: elements.financialStatementItemRows.querySelector(`[data-statement-transfer-account="${item.id}"]`)?.value || "" }));
  if (selections.some(({ categoryId }) => !categoryId || categoryId === "__new__")) return alert("Selecione a categoria de todos os lançamentos marcados.");
  if (selections.some(({ categoryId, transferAccountId }) => categoryId === "__transfer__" && !transferAccountId)) return alert("Selecione a outra conta em todas as transferências marcadas.");
  const entries = selections.map(({ item, categoryId, transferAccountId }) => {
    const transfer = categoryId === "__transfer__";
    const incoming = Number(item.amount) >= 0;
    return { id: createId(), entry_type: transfer ? "transfer" : incoming ? "income" : "expense", status: "paid", account_id: transfer && incoming ? transferAccountId : item.account_id, transfer_account_id: transfer ? (incoming ? item.account_id : transferAccountId) : null, category_id: transfer ? null : categoryId, description: formatFinancialDescription(item.description), amount: Math.abs(Number(item.amount)), issue_date: item.transaction_date, competence_date: item.transaction_date, due_date: item.transaction_date, paid_at: `${item.transaction_date}T12:00:00.000Z`, source_type: "statement" };
  });
  try {
    const entryResponse = await authorizedFetch(supabaseTableEndpoint("crm_financial_entries"), () => ({ method: "POST", headers: supabaseHeaders(), body: JSON.stringify(entries) }));
    if (!entryResponse.ok) throw new Error("Não foi possível criar as transações do extrato.");
    const reconciliations = entries.map((entry, index) => ({ statement_item_id: selections[index].item.id, entry_id: entry.id, amount: entry.amount }));
    const reconciliationResponse = await authorizedFetch(supabaseTableEndpoint("crm_financial_reconciliations"), () => ({ method: "POST", headers: supabaseHeaders(), body: JSON.stringify(reconciliations) }));
    if (!reconciliationResponse.ok) throw new Error("Não foi possível conciliar as transações do extrato.");
    await patchStatementItemStatus(items.map((item) => item.id), "reconciled");
    await loadFinancialRegisters(); await openFinancialImport(state.financialSelectedImportId);
    alert(`${items.length} lançamento(s) confirmado(s) e enviado(s) para Transações.`);
  } catch (error) {
    const ids = entries.map((entry) => entry.id).join(",");
    await authorizedFetch(supabaseTableEndpoint("crm_financial_entries", `?id=in.(${ids})`), () => ({ method: "DELETE", headers: supabaseHeaders() })).catch(() => null);
    alert(error.message);
  }
}

function parseCsvLine(line, delimiter) {
  const values = []; let value = ""; let quoted = false;
  for (let i = 0; i < line.length; i += 1) { const char = line[i]; if (char === '"' && line[i + 1] === '"' && quoted) { value += '"'; i += 1; } else if (char === '"') quoted = !quoted; else if (char === delimiter && !quoted) { values.push(value.trim()); value = ""; } else value += char; }
  values.push(value.trim()); return values;
}

function normalizeStatementDate(value) {
  const text = String(value || "").trim();
  const br = text.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})/); if (br) return `${br[3]}-${br[2]}-${br[1]}`;
  const iso = text.match(/^(\d{4})-?(\d{2})-?(\d{2})/); return iso ? `${iso[1]}-${iso[2]}-${iso[3]}` : null;
}

function parseStatementAmount(value) {
  const cleaned = String(value || "").trim().replace(/[^0-9,.-]/g, "");
  const comma = cleaned.lastIndexOf(",");
  const dot = cleaned.lastIndexOf(".");
  if (comma > dot) return Number(cleaned.replace(/\./g, "").replace(",", "."));
  if (dot > comma && comma >= 0) return Number(cleaned.replace(/,/g, ""));
  if (comma >= 0) return Number(cleaned.replace(",", "."));
  return Number(cleaned);
}

function parseStatementFile(text, extension) {
  if (extension === "ofx") return Array.from(text.matchAll(/<STMTTRN>([\s\S]*?)(?:<\/STMTTRN>|(?=<STMTTRN>))/gi)).map((match) => { const block = match[1]; const get = (tag) => block.match(new RegExp(`<${tag}>([^<\\r\\n]+)`, "i"))?.[1]?.trim() || ""; return { date: normalizeStatementDate(get("DTPOSTED")), amount: Number(get("TRNAMT").replace(",", ".")), description: get("MEMO") || get("NAME") || "Lançamento importado", externalId: get("FITID") || null }; }).filter((item) => item.date && item.amount);
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim()); if (lines.length < 2) throw new Error("O CSV não contém lançamentos.");
  const headerLineIndex = lines.findIndex((line) => /(?:data|date|release_date)/i.test(line) && /(?:valor|amount)/i.test(line));
  if (headerLineIndex < 0) throw new Error("Não foi possível localizar o cabeçalho de lançamentos do CSV.");
  const delimiter = lines[headerLineIndex].includes(";") ? ";" : ","; const headers = parseCsvLine(lines[headerLineIndex], delimiter).map((item) => item.toLowerCase());
  const find = (...names) => headers.findIndex((header) => names.some((name) => header.includes(name)));
  const dateIndex = find("release_date", "data", "date"); const descriptionIndex = find("transaction_type", "descr", "hist", "memo"); const amountIndex = find("transaction_net_amount", "valor", "amount");
  const externalIdIndex = find("reference_id", "fitid", "identificador"); const balanceIndex = find("partial_balance", "saldo", "balance");
  if ([dateIndex, descriptionIndex, amountIndex].some((index) => index < 0)) throw new Error("O CSV precisa ter colunas de data, descrição e valor.");
  return lines.slice(headerLineIndex + 1).map((line) => { const row = parseCsvLine(line, delimiter); return { date: normalizeStatementDate(row[dateIndex]), description: row[descriptionIndex] || "Lançamento importado", amount: parseStatementAmount(row[amountIndex]), externalId: externalIdIndex >= 0 ? row[externalIdIndex] || null : null, balance: balanceIndex >= 0 ? parseStatementAmount(row[balanceIndex]) : null }; }).filter((item) => item.date && item.amount);
}

async function sha256(value) { const data = value instanceof ArrayBuffer ? new Uint8Array(value) : new TextEncoder().encode(value); const hash = await crypto.subtle.digest("SHA-256", data); return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, "0")).join(""); }

async function importFinancialStatement(file) {
  const accountId = document.querySelector("#financialImportAccount").value;
  if (!accountId) throw new Error("Selecione a conta antes do arquivo.");
  const extension = file.name.split(".").pop().toLowerCase(); if (!["ofx", "csv"].includes(extension)) throw new Error("Use um arquivo OFX ou CSV.");
  const text = await file.text(); const items = parseStatementFile(text, extension); if (!items.length) throw new Error("Nenhum lançamento válido foi encontrado.");
  const fileHash = await sha256(text); const importResponse = await authorizedFetch(supabaseTableEndpoint("crm_financial_statement_imports"), () => ({ method: "POST", headers: supabaseHeaders("return=representation"), body: JSON.stringify({ account_id: accountId, file_name: file.name, file_type: extension, file_hash: fileHash, period_start: items.map((item) => item.date).sort()[0], period_end: items.map((item) => item.date).sort().at(-1), item_count: items.length, status: "completed", completed_at: new Date().toISOString() }) }));
  if (!importResponse.ok) { const details = await importResponse.json().catch(() => null); throw new Error(details?.code === "23505" ? "Este extrato já foi importado para essa conta." : details?.message || "Não foi possível registrar a importação."); }
  const importRow = (await importResponse.json())[0];
  const rows = await Promise.all(items.map(async (item, index) => ({ import_id: importRow.id, account_id: accountId, external_id: item.externalId, transaction_date: item.date, description: formatFinancialDescription(item.description).slice(0, 500), amount: item.amount, balance: Number.isFinite(item.balance) ? item.balance : null, fingerprint: await sha256(`${accountId}|${item.externalId || ""}|${item.date}|${item.amount}|${item.description}|${index}`), raw_data: item })));
  const itemResponse = await authorizedFetch(supabaseTableEndpoint("crm_financial_statement_items"), () => ({ method: "POST", headers: supabaseHeaders(), body: JSON.stringify(rows) }));
  if (!itemResponse.ok) { await authorizedFetch(supabaseTableEndpoint("crm_financial_statement_imports", `?id=eq.${importRow.id}`), () => ({ method: "DELETE", headers: supabaseHeaders() })); throw new Error("Não foi possível salvar os itens do extrato."); }
  await loadFinancialRegisters(); renderFinancialImports();
}

async function unzipXlsxFiles(arrayBuffer) {
  const view = new DataView(arrayBuffer);
  let eocd = view.byteLength - 22;
  while (eocd >= Math.max(0, view.byteLength - 65557) && view.getUint32(eocd, true) !== 0x06054b50) eocd -= 1;
  if (eocd < 0 || view.getUint32(eocd, true) !== 0x06054b50) throw new Error("Arquivo XLSX inválido.");
  const entryCount = view.getUint16(eocd + 10, true);
  let offset = view.getUint32(eocd + 16, true);
  const decoder = new TextDecoder("utf-8");
  const files = new Map();
  for (let index = 0; index < entryCount; index += 1) {
    if (view.getUint32(offset, true) !== 0x02014b50) throw new Error("Estrutura interna do XLSX inválida.");
    const method = view.getUint16(offset + 10, true); const compressedSize = view.getUint32(offset + 20, true);
    const nameLength = view.getUint16(offset + 28, true); const extraLength = view.getUint16(offset + 30, true); const commentLength = view.getUint16(offset + 32, true); const localOffset = view.getUint32(offset + 42, true);
    const name = decoder.decode(new Uint8Array(arrayBuffer, offset + 46, nameLength));
    const localNameLength = view.getUint16(localOffset + 26, true); const localExtraLength = view.getUint16(localOffset + 28, true); const dataOffset = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = new Uint8Array(arrayBuffer.slice(dataOffset, dataOffset + compressedSize));
    let content;
    if (method === 0) content = compressed;
    else if (method === 8 && typeof DecompressionStream === "function") content = new Uint8Array(await new Response(new Blob([compressed]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer());
    else throw new Error("Este navegador não consegue descompactar o XLSX. Use uma versão atual do Chrome ou Edge.");
    files.set(name, decoder.decode(content));
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return files;
}

function xmlDocument(text, label) {
  const documentNode = new DOMParser().parseFromString(text || "", "application/xml");
  if (documentNode.querySelector("parsererror")) throw new Error(`Não foi possível ler ${label} da planilha.`);
  return documentNode;
}

function xlsxColumnIndex(reference) {
  return Array.from(String(reference).match(/^[A-Z]+/)?.[0] || "A").reduce((total, letter) => total * 26 + letter.charCodeAt(0) - 64, 0) - 1;
}

async function readMobillsWorkbook(file) {
  if (file.size > 20 * 1024 * 1024) throw new Error("A planilha excede o limite de 20 MB.");
  const files = await unzipXlsxFiles(await file.arrayBuffer());
  const sharedDocument = files.has("xl/sharedStrings.xml") ? xmlDocument(files.get("xl/sharedStrings.xml"), "os textos") : null;
  const shared = sharedDocument ? Array.from(sharedDocument.querySelectorAll("si")).map((item) => Array.from(item.querySelectorAll("t")).map((text) => text.textContent).join("")) : [];
  const workbook = xmlDocument(files.get("xl/workbook.xml"), "as abas");
  const relationships = xmlDocument(files.get("xl/_rels/workbook.xml.rels"), "os relacionamentos");
  const targets = new Map(Array.from(relationships.querySelectorAll("Relationship")).map((item) => [item.getAttribute("Id"), item.getAttribute("Target")]));
  const result = new Map();
  for (const sheet of workbook.querySelectorAll("sheet")) {
    const relationId = sheet.getAttribute("r:id") || sheet.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id");
    const target = targets.get(relationId); if (!target) continue;
    const path = target.startsWith("/") ? target.slice(1) : `xl/${target.replace(/^\.\//, "")}`;
    const sheetDocument = xmlDocument(files.get(path), `a aba ${sheet.getAttribute("name")}`);
    const rows = Array.from(sheetDocument.querySelectorAll("row")).map((row) => {
      const values = [];
      row.querySelectorAll("c").forEach((cell) => { const type = cell.getAttribute("t"); const raw = cell.querySelector("v")?.textContent ?? ""; const value = type === "s" ? shared[Number(raw)] ?? "" : type === "inlineStr" ? Array.from(cell.querySelectorAll("t")).map((node) => node.textContent).join("") : type === "str" ? raw : raw === "" ? "" : Number(raw); values[xlsxColumnIndex(cell.getAttribute("r"))] = value; });
      return values;
    });
    result.set(sheet.getAttribute("name"), rows);
  }
  return result;
}

function normalizedMigrationText(value) { return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase(); }
function cleanMobillsAccountName(value) { return String(value || "").trim().replace(/^\d+\s*-\s*/, "").trim(); }

async function deterministicMigrationUuid(key) {
  const hex = await sha256(key); const chars = hex.slice(0, 32).split(""); chars[12] = "4"; chars[16] = "89ab"[parseInt(chars[16], 16) % 4];
  const value = chars.join(""); return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}

async function postFinancialRows(table, rows, prefer = "return=representation") {
  if (!rows.length) return [];
  const response = await authorizedFetch(supabaseTableEndpoint(table), () => ({ method: "POST", headers: supabaseHeaders(prefer), body: JSON.stringify(rows) }));
  if (!response.ok) { const details = await response.json().catch(() => null); throw new Error(details?.message || `Não foi possível gravar ${table}.`); }
  return prefer.includes("return=representation") ? response.json() : [];
}

async function migrateMobillsWorkbook(file) {
  const workbook = await readMobillsWorkbook(file); const normalize = normalizedMigrationText;
  const findSheet = (prefix) => Array.from(workbook).find(([name]) => normalize(name).startsWith(prefix))?.[1];
  const regularSheet = findSheet("receitas e despesas"); const transferSheet = findSheet("transfer");
  if (!regularSheet?.length) throw new Error("A aba Receitas e Despesas não foi encontrada.");
  const objects = (rows) => { const headers = rows[0].map(normalize); return rows.slice(1).filter((row) => row.some((value) => value !== "" && value != null)).map((row, rowIndex) => ({ rowIndex: rowIndex + 2, values: Object.fromEntries(headers.map((header, index) => [header, row[index]])) })); };
  const regular = objects(regularSheet); const transfers = transferSheet?.length ? objects(transferSheet) : [];
  if (!confirm(`Migrar ${regular.length} receitas/despesas e ${transfers.length} transferências do Mobills?`)) return null;
  await loadFinancialRegisters();
  const accountMap = new Map(state.financialAccounts.map((account) => [normalize(cleanMobillsAccountName(account.name)), account]));
  const allAccountNames = new Set([...regular.map(({ values }) => values.conta), ...transfers.flatMap(({ values }) => [values["conta origem"], values["conta destino"]])].map(cleanMobillsAccountName).filter(Boolean));
  for (const name of allAccountNames) {
    const key = normalize(name); if (accountMap.has(key)) continue;
    const [created] = await postFinancialRows("crm_financial_accounts", [{ name, account_type: "bank", initial_balance: 0, initial_balance_date: normalizeStatementDate(regular[0]?.values.data) || new Date().toISOString().slice(0, 10) }]); accountMap.set(key, created);
  }
  const categoryMap = new Map(state.financialCategories.map((category) => [`${category.category_type}|${normalize(category.name)}`, category]));
  async function ensureCategory(name, type, parentId = null) { if (!String(name || "").trim()) return null; const key = `${type}|${normalize(name)}`; if (categoryMap.has(key)) return categoryMap.get(key); const [created] = await postFinancialRows("crm_financial_categories", [{ name: String(name).trim(), category_type: type, parent_id: parentId, active: true }]); categoryMap.set(key, created); return created; }
  const fileHash = await sha256(await file.arrayBuffer()); const entries = [];
  for (const { rowIndex, values } of regular) {
    const amount = Number(values.valor); if (!Number.isFinite(amount) || amount === 0) continue;
    const type = amount > 0 ? "income" : "expense"; const parent = await ensureCategory(values.categoria, type); const child = await ensureCategory(values.subcategoria, type, parent?.id || null);
    const date = normalizeStatementDate(values.data); if (!date) continue; const paid = normalize(values.situacao).startsWith("paga");
    entries.push({ id: await deterministicMigrationUuid(`${fileHash}|regular|${rowIndex}`), entry_type: type, status: paid ? "paid" : "pending", account_id: accountMap.get(normalize(cleanMobillsAccountName(values.conta)))?.id || null, transfer_account_id: null, category_id: child?.id || parent?.id || null, description: formatFinancialDescription(values.descricao || "Migração Mobills").slice(0, 240), notes: values.tags ? `Tags Mobills: ${values.tags}` : null, amount: Math.abs(amount), issue_date: date, competence_date: date, due_date: date, paid_at: paid ? `${date}T12:00:00.000Z` : null, source_type: "adjustment" });
  }
  for (const { rowIndex, values } of transfers) {
    const amount = Math.abs(Number(values.valor)); const date = normalizeStatementDate(values.data); if (!amount || !date) continue;
    entries.push({ id: await deterministicMigrationUuid(`${fileHash}|transfer|${rowIndex}`), entry_type: "transfer", status: "paid", account_id: accountMap.get(normalize(cleanMobillsAccountName(values["conta origem"])))?.id || null, transfer_account_id: accountMap.get(normalize(cleanMobillsAccountName(values["conta destino"])))?.id || null, category_id: null, description: "Transferência migrada do Mobills", notes: values.tags ? `Tags Mobills: ${values.tags}` : null, amount, issue_date: date, competence_date: date, due_date: date, paid_at: `${date}T12:00:00.000Z`, source_type: "adjustment" });
  }
  const response = await authorizedFetch(supabaseTableEndpoint("crm_financial_entries", "?on_conflict=id"), () => ({ method: "POST", headers: supabaseHeaders("resolution=ignore-duplicates,return=representation"), body: JSON.stringify(entries) }));
  if (!response.ok) { const details = await response.json().catch(() => null); throw new Error(details?.message || "Não foi possível gravar as transações migradas."); }
  const inserted = await response.json(); await loadFinancialRegisters();
  return { total: entries.length, inserted: inserted.length, accounts: allAccountNames.size, categories: categoryMap.size };
}

function nextSelectedStatuses(selected, status, additive) {
  if (!additive || status === "Todos") return [status];
  const current = selected.filter((item) => item !== "Todos");
  const next = current.includes(status) ? current.filter((item) => item !== status) : [...current, status];
  return next.length ? next : ["Todos"];
}

function setStatusFilter(group, status, additive = false) {
  if (group === "dashboard") {
    state.dashboardStatus = status;
    state.clientStatus = status;
  }
  if (group === "clients") state.clientStatus = status;
  if (group === "budget") {
    if (state.view === "budget") state.budgetSelectedStatuses = nextSelectedStatuses(state.budgetSelectedStatuses, status, additive);
    else state.budgetStatus = status;
  }
  if (group === "financial") state.financialStatuses = nextSelectedStatuses(state.financialStatuses, status, additive);
  render();
}

function parseSortableDate(value) {
  if (!value) return 0;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? 0 : value.getTime();
  const text = String(value).trim();
  const brDateTime = text.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:,\s*|\s+)?(\d{2})?:?(\d{2})?:?(\d{2})?$/);
  if (brDateTime) {
    const [, day, month, year, hour = "00", minute = "00", second = "00"] = brDateTime;
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)).getTime() || 0;
  }
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function compareSortableValues(first, second, direction = "asc") {
  const multiplier = direction === "desc" ? -1 : 1;
  const firstEmpty = first === undefined || first === null || first === "";
  const secondEmpty = second === undefined || second === null || second === "";
  if (firstEmpty && secondEmpty) return 0;
  if (firstEmpty) return 1;
  if (secondEmpty) return -1;
  if (typeof first === "number" && typeof second === "number") return (first - second) * multiplier;
  return String(first).localeCompare(String(second), "pt-BR", { numeric: true, sensitivity: "base" }) * multiplier;
}

function setTableSort(type, key) {
  const sort = type === "budget" ? state.budgetSort : state.clientSort;
  const nextDirection = sort.key === key && sort.direction === "asc" ? "desc" : "asc";
  if (type === "budget") state.budgetSort = { key, direction: nextDirection };
  else state.clientSort = { key, direction: nextDirection };
  render();
}

function updateSortHeaders(type) {
  const selector = type === "budget" ? "#budgetListCard th[data-sort]" : "#clientsView th[data-sort]";
  const sort = type === "budget" ? state.budgetSort : state.clientSort;
  document.querySelectorAll(selector).forEach((header) => {
    const active = header.dataset.sort === sort.key;
    header.classList.toggle("sort-active", active);
    header.dataset.sortDirection = active ? sort.direction : "";
    header.setAttribute("aria-sort", active ? (sort.direction === "asc" ? "ascending" : "descending") : "none");
  });
}

function loadColumnWidths(storageKey) {
  try {
    const widths = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return Array.isArray(widths) ? widths.map(Number).filter((width) => Number.isFinite(width) && width > 0) : [];
  } catch {
    localStorage.removeItem(storageKey);
    return [];
  }
}

function saveColumnWidths(storageKey, table) {
  const widths = Array.from(table.querySelectorAll('colgroup[data-resizable-columns] col')).map((col) => Math.round(parseFloat(col.style.width) || 0));
  localStorage.setItem(storageKey, JSON.stringify(widths));
}

function syncResizableTableWidth(table) {
  const columns = Array.from(table.querySelectorAll('colgroup[data-resizable-columns] col'));
  const totalWidth = columns.reduce((total, col) => total + (parseFloat(col.style.width) || 0), 0);
  if (totalWidth > 0) {
    table.style.minWidth = `${Math.max(760, totalWidth)}px`;
  }
}

function ensureResizableColGroup(table, storageKey) {
  const headers = Array.from(table.querySelectorAll("thead th"));
  const savedWidths = loadColumnWidths(storageKey);
  const hasSavedWidths = savedWidths.length === headers.length;
  const tableWidth = table.getBoundingClientRect().width;
  if (!hasSavedWidths && tableWidth <= 0) return null;

  let colgroup = table.querySelector('colgroup[data-resizable-columns]');
  if (!colgroup) {
    colgroup = document.createElement("colgroup");
    colgroup.dataset.resizableColumns = "true";
    table.insertBefore(colgroup, table.tHead || table.firstChild);
  }

  while (colgroup.children.length < headers.length) colgroup.appendChild(document.createElement("col"));
  while (colgroup.children.length > headers.length) colgroup.lastElementChild.remove();

  headers.forEach((header, index) => {
    const width = hasSavedWidths ? savedWidths[index] : Math.round(header.getBoundingClientRect().width);
    colgroup.children[index].style.width = `${Math.max(56, width || 120)}px`;
  });
  syncResizableTableWidth(table);
  return colgroup;
}

function setupResizableTable(table, storageKey) {
  if (!table) return;
  const colgroup = ensureResizableColGroup(table, storageKey);
  if (!colgroup || table.dataset.resizableColumnsReady === "true") return;

  table.dataset.resizableColumnsReady = "true";
  table.classList.add("resizable-table");
  Array.from(table.querySelectorAll("thead th")).forEach((header, index) => {
    header.classList.add("resizable-header");
    const handle = document.createElement("span");
    handle.className = "column-resizer";
    handle.setAttribute("aria-hidden", "true");
    handle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
    });
    handle.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const column = colgroup.children[index];
      const startX = event.clientX;
      const startWidth = parseFloat(column.style.width) || header.getBoundingClientRect().width;

      const onPointerMove = (moveEvent) => {
        const nextWidth = Math.max(56, startWidth + moveEvent.clientX - startX);
        column.style.width = `${Math.round(nextWidth)}px`;
        syncResizableTableWidth(table);
      };
      const onPointerUp = () => {
        document.body.classList.remove("is-resizing-columns");
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerup", onPointerUp);
        saveColumnWidths(storageKey, table);
      };

      document.body.classList.add("is-resizing-columns");
      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", onPointerUp, { once: true });
    });
    header.appendChild(handle);
  });
}

function setupResizableTables() {
  setupResizableTable(document.querySelector("#clientsListCard table"), CLIENT_COLUMNS_WIDTH_KEY);
  setupResizableTable(document.querySelector("#budgetListCard table"), BUDGET_COLUMNS_WIDTH_KEY);
}

function clientSortValue(client, key) {
  const values = {
    name: client.name || "",
    mobile: client.mobile || "",
    status: normalizeLeadStatus(client.status),
    leadHunter: client.leadHunter || "",
    street: client.address?.street || "",
    number: Number(client.address?.number) || client.address?.number || "",
    complement: client.address?.complement || "",
    district: client.address?.district || "",
    finalUse: client.finalUse || "",
    email: client.email || "",
    created: parseSortableDate(client.project?.created || client.createdAt || client.updatedAt),
  };
  return values[key] ?? "";
}

function sortClients(clients) {
  const { key, direction } = state.clientSort;
  return [...clients].sort((first, second) => compareSortableValues(clientSortValue(first, key), clientSortValue(second, key), direction));
}

function budgetSortValue(item, key) {
  const totals = budgetSummary(item.budget);
  const values = {
    code: formatBudgetCodeForList(item.budget.code),
    client: item.client.name || "",
    seller: responsibleSeller(item.client),
    status: item.budget.status || "",
    gross: totals.gross,
    net: totals.net,
    factoryFreight: totals.factoryFreight,
    cost: totals.cost,
    profit: totals.profit,
    margin: totals.margin,
    deliveryForecastAt: parseSortableDate(item.budget.deliveryForecastAt),
    updatedAt: parseSortableDate(item.budget.updatedAt || item.budget.createdAt),
  };
  return values[key] ?? "";
}

function sortBudgets(budgets) {
  const { key, direction } = state.budgetSort;
  return [...budgets].sort((first, second) => compareSortableValues(budgetSortValue(first, key), budgetSortValue(second, key), direction));
}

function filteredClients(group) {
  const status = group === "dashboard" ? state.dashboardStatus : state.clientStatus;
  const search = state.search.toLowerCase();

  const clients = state.clients.filter((client) => {
    const normalizedStatus = normalizeLeadStatus(client.status);
    const matchesStatus =
      status === "Todos" ||
      (status === IN_PROGRESS_STATUS ? normalizedStatus !== DEFAULT_STATUS && !FINISHED_STATUS.includes(normalizedStatus) : normalizedStatus === status);
    const matchesSearch =
      !search ||
      [client.name, client.email, client.phone, client.cpf, client.mobile].some((value) => String(value || "").toLowerCase().includes(search));

    return matchesStatus && (group === "clients" ? matchesSearch : true);
  });
  return group === "clients" ? sortClients(clients) : clients;
}

function loadAppPreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem(APP_PREFERENCES_KEY) || "null");
    return { ...DEFAULT_APP_PREFERENCES, ...(saved || {}) };
  } catch (error) {
    console.warn("Não foi possível carregar preferências do app.", error);
    return { ...DEFAULT_APP_PREFERENCES };
  }
}

function saveAppPreferences() {
  localStorage.setItem(APP_PREFERENCES_KEY, JSON.stringify(state.appPreferences || DEFAULT_APP_PREFERENCES));
}

function setAppPreference(key, value) {
  state.appPreferences = { ...loadAppPreferences(), ...state.appPreferences, [key]: value };
  saveAppPreferences();
}

function budgetStatusCounts() {
  const orderMode = state.view === "order";
  const budgets = state.clients
    .flatMap((client) => clientBudgetHistory(client).map((budget) => ({ client, budget })))
    .filter(({ client, budget }) => {
      const searchableValues = orderMode ? [client.name] : [budget.code, budget.status, client.name, client.status, responsibleSeller(client), client.id];
      const search = state.budgetSearch.toLowerCase();
      const matchesSearch = searchableValues.some((value) => String(value || "").toLowerCase().includes(search));
      const matchesDate = dateInRange(budgetDateValue(budget), state.budgetStartDate, state.budgetEndDate);
      return matchesSearch && matchesDate;
    });

  const statusNames = orderMode ? ORDER_STATUS : BUDGET_STATUS;
  const counts = { Todos: budgets.length };
  statusNames.forEach((status) => {
    counts[status] = budgets.filter(({ budget }) => budget.status === status).length;
  });
  return counts;
}

function renderStatusFilters(container, activeStatus, group) {
  if (!container) return;
  container.innerHTML = "";

  const documentStatuses = group === "budget" && state.view === "order" ? ORDER_STATUS : BUDGET_STATUS;
  const statuses = group === "budget" || group === "financial" ? ["Todos", ...documentStatuses] : STATUS;
  const statusCounts = group === "budget" || group === "financial" ? budgetStatusCounts() : {};
  const showCounts = state.appPreferences?.showStatusCounts !== false;

  statuses.forEach((status) => {
    const button = document.createElement("button");
    const multiSelect = group === "financial" || (group === "budget" && state.view === "budget");
    const active = group === "financial" ? state.financialStatuses.includes(status) : group === "budget" && state.view === "budget" ? state.budgetSelectedStatuses.includes(status) : status === activeStatus;
    button.className = `pill ${active ? "active" : ""}`;
    button.type = "button";
    if (multiSelect) {
      button.setAttribute("aria-pressed", String(active));
      button.title = "Use Shift+clique para combinar status";
    }

    const label = document.createElement("span");
    label.textContent = status;
    button.appendChild(label);

    if (showCounts && (group === "budget" || group === "financial")) {
      const count = document.createElement("span");
      count.className = "pill-count";
      count.textContent = String(statusCounts[status] ?? 0);
      button.appendChild(count);
    }

    button.addEventListener("click", (event) => setStatusFilter(group, status, multiSelect && event.shiftKey));
    container.appendChild(button);
  });
}

function renderDashboard() {
  const clients = filteredClients("dashboard");

  document.querySelector("#totalClients").textContent = clients.length;
  document.querySelector("#totalNegotiating").textContent = clients.filter((client) => client.status === "Negociação").length;
  document.querySelector("#totalClosed").textContent = clients.filter((client) => normalizeLeadStatus(client.status) === WON_STATUS).length;
}

function renderBudgetDashboard() {
  if (!isAdmin()) return;
  const budgets = dashboardBudgets();
  const totals = budgets.reduce(
    (summary, { budget }) => {
      const total = budgetSummary(budget);
      summary.revenue += total.gross;
      summary.net += total.net;
      summary.cost += total.cost;
      summary.profit += total.profit;
      return summary;
    },
    { revenue: 0, net: 0, cost: 0, profit: 0 }
  );

  document.querySelector("#totalNet").textContent = BRL.format(totals.net);
  document.querySelector("#totalCost").textContent = BRL.format(totals.cost);
  document.querySelector("#totalProfit").textContent = BRL.format(totals.profit);
  renderChart(budgets);
}

function syncBudgetFilterInputs() {
  [elements.budgetStartDate, elements.financialStartDate].forEach((input) => {
    if (input && input.value !== state.budgetStartDate) input.value = state.budgetStartDate;
  });
  [elements.budgetEndDate, elements.financialEndDate].forEach((input) => {
    if (input && input.value !== state.budgetEndDate) input.value = state.budgetEndDate;
  });
}

function renderFinancialManagement() {
  if (!isAdmin() || state.view !== "financial") return;
  syncBudgetFilterInputs();
  renderBudgetDashboard();
}

function dashboardBudgets() {
  return filteredBudgets();
}

function renderChart(budgets) {
  const canvas = elements.chart;
  if (!canvas) return;
  const displayWidth = canvas.clientWidth || 1200;
  const displayHeight = state.view === "budget" ? 180 : 310;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(displayWidth * ratio);
  canvas.height = Math.round(displayHeight * ratio);
  const context = canvas.getContext("2d");
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  const width = displayWidth;
  const height = displayHeight;
  const padding = state.view === "budget" ? { top: 12, right: 18, bottom: 52, left: 64 } : { top: 22, right: 24, bottom: 70, left: 72 };
  const statuses = BUDGET_STATUS;
  const values = statuses.map((status) => {
    const statusBudgets = budgets.filter(({ budget }) => budget.status === status);
    return statusBudgets.reduce(
      (sum, { budget }) => {
        const total = budgetSummary(budget);
        sum.revenue += total.gross;
        sum.profit += total.profit;
        return sum;
      },
      { revenue: 0, profit: 0 }
    );
  });
  const maxValue = Math.max(1, ...values.flatMap((item) => [item.revenue, item.profit]));
  const chartHeight = height - padding.top - padding.bottom;
  const chartWidth = width - padding.left - padding.right;

  context.clearRect(0, 0, width, height);
  context.strokeStyle = "#d9c779";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(padding.left, padding.top);
  context.lineTo(padding.left, height - padding.bottom);
  context.lineTo(width - padding.right, height - padding.bottom);
  context.stroke();

  const step = maxValue / 4;
  [0, step, step * 2, step * 3, maxValue].forEach((tick) => {
    const y = height - padding.bottom - (tick / maxValue) * chartHeight;
    context.fillStyle = "#6e6135";
    context.font = "13px Arial";
    context.textAlign = "right";
    context.fillText(`R$${Math.round(tick / 1000)}k`, padding.left - 8, y + 4);
  });

  statuses.forEach((status, index) => {
    const groupWidth = chartWidth / statuses.length;
    const x = padding.left + groupWidth * index + groupWidth / 2;
    const revenueHeight = (values[index].revenue / maxValue) * chartHeight;
    const profitHeight = (values[index].profit / maxValue) * chartHeight;
    const baseY = height - padding.bottom;
    const revenueWidth = Math.min(118, Math.max(54, groupWidth * 0.24));
    const profitWidth = Math.min(64, Math.max(34, groupWidth * 0.13));
    const gap = Math.min(14, groupWidth * 0.04);

    context.fillStyle = "#aa8e34";
    context.fillRect(x - revenueWidth - gap / 2, baseY - revenueHeight, revenueWidth, revenueHeight);
    context.fillStyle = "#2e8b45";
    context.fillRect(x + gap / 2, baseY - profitHeight, profitWidth, profitHeight);
    context.fillStyle = "#6e6135";
    context.textAlign = "center";
    context.font = "11px Arial";
    status.split(" ").forEach((word, lineIndex) => {
      context.fillText(word, x - revenueWidth / 4, baseY + 18 + lineIndex * 12);
    });
  });
}

function renderClients() {
  const clients = filteredClients("clients");
  updateSortHeaders("clients");
  document.querySelector("#clientCount").textContent = state.clients.length;
  elements.clientRows.innerHTML = "";
  setupResizableTables();

  if (!clients.length) {
    elements.clientRows.innerHTML = '<tr><td colspan="12" class="empty-state">Nenhum cliente encontrado</td></tr>';
    return;
  }

  clients.forEach((client) => {
    const row = document.createElement("tr");
    const folderCell = document.createElement("td");
    const folderButton = document.createElement("button");
    folderCell.className = "folder-column";
    folderButton.className = "folder-button";
    folderButton.type = "button";
    folderButton.title = "Abrir cadastro";
    folderButton.textContent = "▰";
    folderButton.addEventListener("click", () => openClientRegistration(client.id, "clients"));
    folderCell.appendChild(folderButton);
    row.appendChild(folderCell);

    [
      { className: "client-name-cell", value: client.name },
      { className: "client-phone-cell", value: client.mobile || "-" },
    ].forEach(({ className, value }) => {
      const cell = document.createElement("td");
      cell.className = className;
      cell.textContent = value;
      row.appendChild(cell);
    });

    const statusCell = document.createElement("td");
    statusCell.className = "client-status-cell";
    const statusBadge = document.createElement("span");
    statusBadge.className = `status-badge ${statusClass(client.status)}`;
    statusBadge.textContent = normalizeLeadStatus(client.status);
    statusCell.appendChild(statusBadge);
    row.appendChild(statusCell);

    [
      { className: "client-lead-cell", value: client.leadHunter || "-" },
      { className: "client-address-cell", value: client.address?.street || "-" },
      { className: "client-number-cell", value: client.address?.number || "-" },
      { className: "client-address-cell", value: client.address?.complement || "-" },
      { className: "client-address-cell", value: client.address?.district || "-" },
      { className: "client-final-use-cell", value: client.finalUse || "-" },
      { className: "client-email-cell", value: client.email || "-" },
      { className: "client-date-cell", value: client.project?.created || "-" },
    ].forEach(({ className, value }) => {
      const cell = document.createElement("td");
      cell.className = className;
      cell.textContent = value;
      row.appendChild(cell);
    });

    row.addEventListener("dblclick", () => {
      state.selectedId = client.id;
      openProjectDialog(client, { inline: true });
    });

    elements.clientRows.appendChild(row);
  });
}

function renderProjects() {
  const rows = elements.projectListRows;
  if (!rows) return;

  const search = state.projectSearch.toLowerCase();
  const projects = state.clients.filter((client) => {
    const environmentNames = (client.project.environments || []).map((environment) => environment.name).join(" ");
    return (
      !search ||
      [client.id, client.name, client.status, responsibleSeller(client), client.project.deadline, environmentNames].some((value) =>
        String(value || "").toLowerCase().includes(search)
      )
    );
  });

  document.querySelector("#projectCount").textContent = projects.length;
  rows.innerHTML = "";

  if (!projects.length) {
    rows.innerHTML = '<tr><td colspan="6" class="empty-state">Nenhum projeto encontrado</td></tr>';
    return;
  }

  projects.forEach((client) => {
    const row = document.createElement("tr");
    const folderCell = document.createElement("td");
    const folderButton = document.createElement("button");
    const environments = client.project.environments || [];
    const environmentSummary = environments.length ? environments.map((environment) => environment.name).join(", ") : "-";

    folderCell.className = "folder-column";
    folderButton.className = "folder-button";
    folderButton.type = "button";
    folderButton.title = "Abrir projeto";
    folderButton.textContent = "▰";
    folderButton.addEventListener("click", () => {
      state.selectedId = client.id;
      openProjectDialog();
    });
    folderCell.appendChild(folderButton);
    row.appendChild(folderCell);

    [
      client.name,
      environmentSummary,
      responsibleSeller(client),
      client.project.deadline || "A definir",
    ].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });

    const statusCell = document.createElement("td");
    const statusBadge = document.createElement("span");
    statusBadge.className = `project-status-badge ${statusClass(client.status)}`;
    statusBadge.textContent = client.status;
    statusCell.appendChild(statusBadge);
    row.appendChild(statusCell);

    row.addEventListener("dblclick", () => {
      state.selectedId = client.id;
      openProjectDialog();
    });

    rows.appendChild(row);
  });
}

function renderUsers() {
  if (!elements.userRows) return;
  elements.userRows.innerHTML = "";
  if (elements.userLogRows) elements.userLogRows.innerHTML = "";

  if (!isAdmin()) {
    elements.userRows.innerHTML = '<tr><td colspan="5" class="empty-state">Acesso restrito a administradores</td></tr>';
    return;
  }

  if (!state.userProfiles.length) {
    elements.userRows.innerHTML = '<tr><td colspan="5" class="empty-state">Nenhum usuario encontrado</td></tr>';
  }

  state.userProfiles.forEach((profile) => {
    const row = document.createElement("tr");

    const emailCell = document.createElement("td");
    const emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.value = profile.email || "";
    emailInput.disabled = profile.id === currentUserId();
    emailCell.appendChild(emailInput);
    row.appendChild(emailCell);

    const roleCell = document.createElement("td");
    const roleSelect = document.createElement("select");
    roleSelect.className = "role-select";
    [
      ["user", "User"],
      ["admin", "Admin"],
    ].forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      roleSelect.appendChild(option);
    });
    roleSelect.value = profile.role === "admin" ? "admin" : "user";
    roleCell.appendChild(roleSelect);
    row.appendChild(roleCell);

    const statusCell = document.createElement("td");
    const blocked = Boolean(profile.blocked);
    statusCell.textContent = blocked ? "Bloqueado" : "Ativo";
    row.appendChild(statusCell);

    const updatedCell = document.createElement("td");
    updatedCell.textContent = profile.updated_at ? new Date(profile.updated_at).toLocaleString("pt-BR") : "-";
    row.appendChild(updatedCell);

    const actionsCell = document.createElement("td");
    actionsCell.className = "user-actions";

    const saveButton = document.createElement("button");
    saveButton.className = "button secondary compact";
    saveButton.type = "button";
    saveButton.textContent = "Salvar";
    saveButton.addEventListener("click", async () => {
      saveButton.disabled = true;
      try {
        await updateUserProfile(profile.id, roleSelect.value, blocked, emailInput.value.trim());
      } catch (error) {
        console.warn(error);
        alert(error.message || "Nao foi possivel atualizar o usuario.");
      } finally {
        saveButton.disabled = false;
      }
    });

    const blockButton = document.createElement("button");
    blockButton.className = "button secondary compact";
    blockButton.type = "button";
    blockButton.textContent = blocked ? "Desbloquear" : "Bloquear";
    blockButton.disabled = profile.id === currentUserId();
    blockButton.addEventListener("click", async () => {
      if (!confirm(`${blocked ? "Desbloquear" : "Bloquear"} este usuario?`)) return;
      blockButton.disabled = true;
      try {
        await updateUserProfile(profile.id, roleSelect.value, !blocked, emailInput.value.trim());
      } catch (error) {
        console.warn(error);
        alert(error.message || "Nao foi possivel atualizar o usuario.");
      }
    });

    const passwordButton = document.createElement("button");
    passwordButton.className = "button secondary compact";
    passwordButton.type = "button";
    passwordButton.textContent = "Senha";
    passwordButton.addEventListener("click", async () => {
      const password = prompt("Digite a nova senha (minimo 6 caracteres):");
      if (password === null) return;
      if (password.length < 6) {
        alert("A senha deve ter pelo menos 6 caracteres.");
        return;
      }
      passwordButton.disabled = true;
      try {
        await updateUserPassword(profile.id, password);
        alert("Senha atualizada.");
      } catch (error) {
        console.warn(error);
        alert(error.message || "Nao foi possivel alterar a senha.");
      } finally {
        passwordButton.disabled = false;
      }
    });

    actionsCell.append(saveButton, blockButton, passwordButton);
    row.appendChild(actionsCell);

    elements.userRows.appendChild(row);
  });

  if (!elements.userLogRows) return;
  if (!state.userLogs.length) {
    elements.userLogRows.innerHTML = '<tr><td colspan="5" class="empty-state">Nenhuma acao registrada</td></tr>';
    return;
  }
  state.userLogs.forEach((log) => {
    const row = document.createElement("tr");
    [
      log.created_at ? new Date(log.created_at).toLocaleString("pt-BR") : "-",
      log.actor_email || "-",
      log.action || "-",
      log.target_email || log.target_user_id || "-",
      log.details ? JSON.stringify(log.details) : "-",
    ].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });
    elements.userLogRows.appendChild(row);
  });
}

function renderEnvironmentManager() {
  if (!elements.environmentRows) return;
  elements.environmentRows.innerHTML = "";
  if (elements.environmentCount) {
    elements.environmentCount.textContent = String(state.environments.length);
  }

  if (!state.environments.length) {
    elements.environmentRows.innerHTML = '<tr><td colspan="2" class="empty-state">Nenhum ambiente cadastrado</td></tr>';
    return;
  }

  state.environments.forEach((environment) => {
    const row = document.createElement("tr");
    row.dataset.environmentName = environment;

    const nameCell = document.createElement("td");
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = environment;
    nameInput.dataset.environmentName = environment;
    nameInput.dataset.previousEnvironment = environment;

    const commitEnvironmentName = () => {
      const previous = nameInput.dataset.previousEnvironment || environment;
      const savedName = renameEnvironmentInCatalog(previous, nameInput.value);
      nameInput.value = savedName;
      nameInput.dataset.previousEnvironment = savedName;
    };

    nameInput.addEventListener("blur", commitEnvironmentName);
    nameInput.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      commitEnvironmentName();
      nameInput.blur();
    });
    nameCell.appendChild(nameInput);
    row.appendChild(nameCell);

    const actionsCell = document.createElement("td");
    const removeButton = document.createElement("button");
    removeButton.className = "link-button danger";
    removeButton.type = "button";
    removeButton.textContent = "Remover";
    removeButton.addEventListener("click", () => {
      removeEnvironmentFromCatalog(environment);
    });
    actionsCell.appendChild(removeButton);
    row.appendChild(actionsCell);

    elements.environmentRows.appendChild(row);
  });
}

function percentToRate(value) {
  return (Number(value) || 0) / 100;
}

function formatPercent(value) {
  return `${((Number(value) || 0) * 100).toFixed(1).replace(".", ",")}%`;
}

function budgetInputValue(id) {
  return document.querySelector(`#${id}`).value;
}

function formatDateTimeLocal(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return formatDateTimeLocal(new Date());
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
}

function readBudgetCreatedAt() {
  const value = budgetInputValue("budgetCreatedAt");
  if (!value) return new Date().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function readBudgetNobiliaId() {
  return document.querySelector("#budgetNobiliaId")?.value.trim() || "";
}

function readBudgetNobiliaDate() {
  return document.querySelector("#budgetNobiliaDate")?.value || "";
}

function readDateTimeInputAsIso(input) {
  const value = input?.value || "";
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function readBudgetSaleAt() {
  return readDateTimeInputAsIso(elements.budgetSaleAt);
}

function readOrderDeliveryForecastAt() {
  return readDateTimeInputAsIso(elements.orderDeliveryForecastAt);
}

function updateBudgetAssemblyDays() {
  const daysInput = document.querySelector("#budgetAssemblyDays");
  if (!daysInput) return;
  const startValue = budgetInputValue("budgetAssemblyStartDate");
  const endValue = budgetInputValue("budgetAssemblyEndDate");
  if (!startValue || !endValue) {
    daysInput.value = "";
    return;
  }
  const start = new Date(`${startValue}T00:00:00`);
  const end = new Date(`${endValue}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    daysInput.value = "";
    return;
  }
  const days = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  daysInput.value = days > 0 ? String(days) : "0";
}

function updateBudgetSaleAtFieldVisibility() {
  if (!elements.budgetSaleAtField) return;
  elements.budgetSaleAtField.hidden = state.view === "order" || budgetInputValue("budgetStatus") !== "Aprovado";
}

function handleBudgetStatusDateFields() {
  const status = budgetInputValue("budgetStatus");
  if (state.view !== "order" && status === "Aprovado" && state.budgetLastStatus !== "Aprovado" && elements.budgetSaleAt && !elements.budgetSaleAt.value) {
    elements.budgetSaleAt.value = formatDateTimeLocal(new Date());
  }
  state.budgetLastStatus = status;
  updateBudgetSaleAtFieldVisibility();
  updateBudgetFinancialButton();
}

function budgetFinancialStatusAllowed(status) {
  return !["novo", "recusado", "finalizado"].includes(normalizedMigrationText(status));
}

function updateBudgetFinancialButton() {
  const button = document.querySelector("#budgetLaunchFinancialBtn");
  if (button) button.hidden = !budgetFinancialStatusAllowed(budgetInputValue("budgetStatus"));
}

function currentBudgetDraft() {
  const status = configuredDocumentStatuses().includes(budgetInputValue("budgetStatus")) ? budgetInputValue("budgetStatus") : BUDGET_STATUS[0];
  return {
    id: state.budgetEditingId || `budget-${Date.now()}`,
    code: budgetInputValue("budgetCode") || nextBudgetCode(),
    status,
    createdAt: readBudgetCreatedAt(),
    saleAt: status === "Aprovado" ? readBudgetSaleAt() : "",
    nobiliaId: readBudgetNobiliaId(),
    nobiliaDate: readBudgetNobiliaDate(),
    settings: readBudgetSettings(),
    rows: readBudgetRows(),
    orderMaterials: readOrderMaterialRows(),
    deliveryForecastAt: readOrderDeliveryForecastAt(),
    cashPayments: readCashPaymentRows(),
    notes: document.querySelector("#budgetNotes")?.value.trim() || "",
  };
}

function selectedBudgetClient() {
  const id = elements.budgetClientSelect?.value || state.selectedId;
  const client = state.clients.find((item) => item.id === id) || null;
  return client && clientCanHaveBudget(client) ? client : null;
}

function sourceBudgetClient() {
  return state.clients.find((client) => client.id === state.budgetSourceId) || selectedBudgetClient();
}

function budgetIdentity(budget) {
  return budget?.id || budget?.code || budget?.createdAt || budget?.updatedAt || "";
}

function normalizedBudgetCode(code) {
  return String(code || "").trim().toUpperCase();
}

function allSavedBudgets() {
  return state.clients.flatMap((client) =>
    clientBudgetHistory(client).map((budget) => ({
      client,
      budget,
    }))
  );
}

function budgetCodeExists(code, ignoredIdentity = "") {
  const normalizedCode = normalizedBudgetCode(code);
  if (!normalizedCode) return false;
  return allSavedBudgets().some(({ budget }) => normalizedBudgetCode(budget.code) === normalizedCode && budgetIdentity(budget) !== ignoredIdentity);
}

function budgetPeriod(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return `${month}${year}`;
}

function nextBudgetCode(date = new Date()) {
  const period = budgetPeriod(date);
  const maxSequence = state.clients
    .flatMap((client) => [...(client.budgets || []), client.budget].filter(Boolean))
    .reduce((max, budget) => {
      const code = budget.code || "";
      const match = code.match(/^(\d+)-(\d{2})(\d{4})$/);
      if (!match || `${match[2]}${match[3]}` !== period) return max;
      return Math.max(max, Number(match[1]) || 0);
    }, 0);
  let sequence = maxSequence + 1;
  let code = `${String(sequence).padStart(3, "0")}-${period}`;
  while (budgetCodeExists(code)) {
    sequence += 1;
    code = `${String(sequence).padStart(3, "0")}-${period}`;
  }
  return code;
}

function fallbackBudgetCode(client) {
  const savedBudgets = state.clients.filter((item) => item.budget?.updatedAt);
  const orderedBudgets = savedBudgets.sort((first, second) => {
    const firstDate = new Date(first.budget.updatedAt || 0).getTime();
    const secondDate = new Date(second.budget.updatedAt || 0).getTime();
    return firstDate - secondDate;
  });
  const sequence = orderedBudgets.findIndex((item) => item.id === client?.id) + 1;
  const date = client?.budget?.updatedAt ? new Date(client.budget.updatedAt) : new Date();
  return `${String(Math.max(sequence, 1)).padStart(3, "0")}-${budgetPeriod(date)}`;
}

function defaultBudgetRows(client) {
  const environments = client?.project?.environments || [];
  if (!environments.length) return [{ name: "", gross: 0, factory: 0, hardware: 0 }];
  return environments.map((environment) => ({
    name: environment.name || "",
    gross: parseMoney(environment.budget),
    factory: parseMoney(environment.factory),
    hardware: parseMoney(environment.hardware),
  }));
}

function clientBudget(client) {
  const saved = client?.budget || {};
  const rows = Array.isArray(saved.rows) && saved.rows.length ? saved.rows : defaultBudgetRows(client);
  const status = normalizeBudgetStatusValue(saved.status, BUDGET_STATUS[0] || DEFAULT_STATUS);
  return {
    id: saved.id || saved.code || "",
    code: saved.code || (saved.updatedAt ? fallbackBudgetCode(client) : ""),
    status,
    createdAt: saved.createdAt || saved.updatedAt || new Date().toISOString(),
    saleAt: saved.saleAt || "",
    nobiliaId: saved.nobiliaId || "",
    nobiliaDate: saved.nobiliaDate || "",
    settings: normalizeBudgetSettings(saved.settings, rows),
    rows,
    orderMaterials: Array.isArray(saved.orderMaterials) ? saved.orderMaterials : [],
    deliveryForecastAt: saved.deliveryForecastAt || "",
    cashPayments: Array.isArray(saved.cashPayments) ? saved.cashPayments : defaultCashPaymentRows(),
    financialLaunchedAt: saved.financialLaunchedAt || "",
    notes: saved.notes || "",
  };
}

function blankBudget() {
  return {
    id: `budget-${Date.now()}`,
    code: nextBudgetCode(),
    status: BUDGET_STATUS[0],
    createdAt: new Date().toISOString(),
    saleAt: "",
    nobiliaId: "",
    nobiliaDate: "",
    settings: { ...DEFAULT_BUDGET_SETTINGS },
    rows: [{ name: "", gross: 0, factory: 0, hardware: 0 }],
    orderMaterials: [],
    deliveryForecastAt: "",
    cashPayments: defaultCashPaymentRows(),
    financialLaunchedAt: "",
    notes: "",
  };
}

function defaultCashPaymentRows() {
  return [1, 2, 3].map((parcel) => ({
    parcel: String(parcel),
    value: "",
    dueDate: "",
    method: "",
  }));
}

function renderCashPaymentRows(payments = defaultCashPaymentRows()) {
  const rows = document.querySelector("#cashPaymentRows");
  if (!rows) return;
  const normalizedPayments = [...payments, ...defaultCashPaymentRows()].slice(0, 3);
  rows.innerHTML = "";
  normalizedPayments.forEach((payment) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td data-label="Parcela"><input data-cash-payment-field="parcel" /></td>
      <td data-label="Valor"><input class="money-input" data-cash-payment-field="value" inputmode="decimal" /></td>
      <td data-label="Vencimento"><input data-cash-payment-field="dueDate" type="date" /></td>
      <td data-label="Forma"><input data-cash-payment-field="method" /></td>
    `;
    row.querySelector('[data-cash-payment-field="parcel"]').value = payment.parcel || "";
    row.querySelector('[data-cash-payment-field="value"]').value = payment.value ? formatMoneyInput(payment.value) : "";
    row.querySelector('[data-cash-payment-field="dueDate"]').value = payment.dueDate || "";
    row.querySelector('[data-cash-payment-field="method"]').value = payment.method || "";
    row.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", markBudgetDirty);
      input.addEventListener("change", markBudgetDirty);
    });
    row.querySelector('[data-cash-payment-field="value"]').addEventListener("blur", (event) => {
      event.target.value = event.target.value ? formatMoneyInput(event.target.value) : "";
    });
    rows.appendChild(row);
  });
}

function readCashPaymentRows() {
  return Array.from(document.querySelectorAll("#cashPaymentRows tr")).map((row) => ({
    parcel: row.querySelector('[data-cash-payment-field="parcel"]')?.value.trim() || "",
    value: row.querySelector('[data-cash-payment-field="value"]')?.value.trim() || "",
    dueDate: row.querySelector('[data-cash-payment-field="dueDate"]')?.value || "",
    method: row.querySelector('[data-cash-payment-field="method"]')?.value.trim() || "",
  }));
}

function clientBudgetHistory(client) {
  const budgets = [];
  const addBudget = (budget) => {
    if (!budget?.updatedAt) return;
    const normalized = {
      ...budget,
      id: budgetIdentity(budget) || `budget-${budgets.length + 1}`,
      createdAt: budget.createdAt || budget.updatedAt,
      status: normalizeBudgetStatusValue(budget.status, BUDGET_STATUS[0] || DEFAULT_STATUS),
      settings: normalizeBudgetSettings(budget.settings, budget.rows || []),
    };
    const identity = budgetIdentity(normalized);
    const existingIndex = budgets.findIndex((item) => budgetIdentity(item) === identity);
    if (existingIndex >= 0) budgets[existingIndex] = normalized;
    else budgets.push(normalized);
  };

  (client?.budgets || []).forEach(addBudget);
  addBudget(client?.budget);
  return budgets.sort((first, second) => new Date(second.updatedAt || second.createdAt || 0) - new Date(first.updatedAt || first.createdAt || 0));
}

function budgetForEditing(client) {
  if (!state.budgetEditingId) return clientBudget(client);
  return clientBudgetHistory(client).find((budget) => budgetIdentity(budget) === state.budgetEditingId) || clientBudget(client);
}

function renderBudgetSeller(client) {
  const seller = document.querySelector("#budgetSeller");
  if (seller) seller.value = client ? responsibleSeller(client) || "-" : "-";
}

function readBudgetSettings() {
  const freightInput = budgetInputValue("budgetFreightValue");
  return {
    discountRate: Number(budgetInputValue("budgetDiscountRate")) || 0,
    freightMode: budgetInputValue("budgetFreightMode") === "percent" || freightInput.includes("%") ? "percent" : "value",
    freightValue: parseMoney(freightInput.replace(/%/g, "")),
    releaseRate: Number(budgetInputValue("budgetReleaseRate")) || 0,
    assemblyRate: Number(budgetInputValue("budgetAssemblyRate")) || 0,
    lelaRate: Number(budgetInputValue("budgetLelaRate")) || 0,
    irisRate: Number(budgetInputValue("budgetIrisRate")) || 0,
    taxRate: Number(budgetInputValue("budgetTaxRate")) || 0,
    entry: parseMoney(budgetInputValue("budgetEntry")),
    entryTerm: Number(budgetInputValue("budgetEntryTerm")) === 60 ? 60 : 30,
    installments: Number(budgetInputValue("budgetInstallments")) || 0,
    dailyQuantity: Number(budgetInputValue("budgetDailyQuantity")) || 0,
    dailyValue: parseMoney(budgetInputValue("budgetDailyValue")),
    assemblerName: budgetInputValue("budgetAssemblerName").trim(),
    assemblyStartDate: budgetInputValue("budgetAssemblyStartDate"),
    assemblyEndDate: budgetInputValue("budgetAssemblyEndDate"),
  };
}

function readBudgetRows() {
  return Array.from(elements.budgetRows.querySelectorAll("tr"))
    .map((row) => {
      const select = row.querySelector('[data-budget-field="name"]');
      const customInput = row.querySelector(".environment-custom-input");
      const rawName = select?.value === "__new__" ? customInput?.value : select?.value;
      const name = registerEnvironmentName(rawName || "");
      if (name && select) {
        addEnvironmentOptionToSelect(select, name);
        select.value = name;
      }
      if (customInput) customInput.hidden = true;
      return {
        name,
        gross: parseMoney(row.querySelector('[data-budget-field="gross"]')?.value),
        factory: parseMoney(row.querySelector('[data-budget-field="factory"]')?.value),
        hardware: parseMoney(row.querySelector('[data-budget-field="hardware"]')?.value),
      };
    })
    .filter((row) => row.name || row.gross || row.factory || row.hardware);
}

function orderMaterialKey(item, index) {
  return `${index + 1}|${String(item?.name || "").trim().toLowerCase()}`;
}

function readOrderMaterialRows() {
  if (!elements.orderMaterialRows) return [];
  return Array.from(elements.orderMaterialRows.querySelectorAll("tr")).map((row) => ({
    item: Number(row.dataset.itemIndex) || 0,
    name: row.querySelector('[data-order-material-field="name"]')?.textContent.trim() || "",
    body: row.querySelector('[data-order-material-field="body"]')?.value.trim() || "",
    door: row.querySelector('[data-order-material-field="door"]')?.value.trim() || "",
    handle: row.querySelector('[data-order-material-field="handle"]')?.value.trim() || "",
    model: row.querySelector('[data-order-material-field="model"]')?.value.trim() || "",
    complement: row.querySelector('[data-order-material-field="complement"]')?.value.trim() || "",
    observation: row.querySelector('[data-order-material-field="observation"]')?.value.trim() || "",
  }));
}

function renderOrderMaterialRows(materials = [], budgetRows = readBudgetRows()) {
  if (!elements.orderMaterialRows) return;
  const materialByKey = new Map(materials.map((material, index) => [orderMaterialKey(material, index), material]));
  elements.orderMaterialRows.innerHTML = "";
  budgetRows.forEach((budgetRow, index) => {
    const material = materialByKey.get(orderMaterialKey(budgetRow, index)) || materials[index] || {};
    const row = document.createElement("tr");
    row.dataset.itemIndex = String(index + 1);
    row.innerHTML = `
      <td class="center">${index + 1}</td>
      <td data-order-material-field="name">${escapeHtml(budgetRow.name || material.name || "")}</td>
      <td><input data-order-material-field="body" /></td>
      <td><input data-order-material-field="door" /></td>
      <td><input data-order-material-field="handle" /></td>
      <td><input data-order-material-field="model" /></td>
      <td><input data-order-material-field="complement" /></td>
      <td><input data-order-material-field="observation" /></td>
    `;
    row.querySelector('[data-order-material-field="body"]').value = material.body || "";
    row.querySelector('[data-order-material-field="door"]').value = material.door || "";
    row.querySelector('[data-order-material-field="handle"]').value = material.handle || "";
    row.querySelector('[data-order-material-field="model"]').value = material.model || "";
    row.querySelector('[data-order-material-field="complement"]').value = material.complement || "";
    row.querySelector('[data-order-material-field="observation"]').value = material.observation || "";
    row.querySelectorAll("input").forEach((input) => input.addEventListener("input", markBudgetDirty));
    elements.orderMaterialRows.appendChild(row);
  });
}

function calculateBudgetRows(rows, settings) {
  const rates = {
    discount: percentToRate(settings.discountRate),
    release: percentToRate(settings.releaseRate),
    assembly: percentToRate(settings.assemblyRate),
    lela: percentToRate(settings.lelaRate),
    iris: percentToRate(settings.irisRate),
    tax: percentToRate(settings.taxRate),
  };

  const totalFactory = rows.reduce((sum, row) => sum + Math.max(0, parseMoney(row.factory)), 0);
  const freightInput = Math.max(0, parseMoney(settings.freightValue));
  const totalFreight = settings.freightMode === "percent" ? totalFactory * percentToRate(freightInput) : freightInput;
  const distributableRows = rows.filter((row) => row.name || row.gross || row.factory || row.hardware).length || rows.length;

  return rows.map((row) => {
    const gross = parseMoney(row.gross);
    const factory = parseMoney(row.factory);
    const hardware = parseMoney(row.hardware);
    const net = gross - gross * rates.discount;
    const hasValues = Boolean(row.name || gross || factory || hardware);
    const freight = totalFactory > 0
      ? totalFreight * Math.max(0, factory) / totalFactory
      : hasValues && distributableRows > 0 ? totalFreight / distributableRows : 0;
    const release = net * rates.release;
    const assembly = net * rates.assembly;
    const tax = net * rates.tax;
    const profitBeforeProfitRates = net - factory - hardware - freight - release - assembly - tax;
    const profitRateTotal = rates.lela + rates.iris;
    const profit = profitBeforeProfitRates > 0 ? profitBeforeProfitRates / (1 + profitRateTotal) : profitBeforeProfitRates;
    const lela = profit > 0 ? profit * rates.lela : 0;
    const iris = profit > 0 ? profit * rates.iris : 0;
    const totalCost = factory + hardware + freight + release + assembly + lela + iris + tax;
    return {
      ...row,
      gross,
      factory,
      hardware,
      factoryFreight: factory + freight,
      freight,
      release,
      assembly,
      lela,
      iris,
      tax,
      totalCost,
      net,
      profit,
    };
  });
}

function normalizeBudgetSettings(savedSettings = {}, rows = []) {
  const settings = { ...DEFAULT_BUDGET_SETTINGS, ...savedSettings };
  if (!Object.prototype.hasOwnProperty.call(savedSettings, "freightValue")) {
    const freightRate = percentToRate(savedSettings.freightRate);
    const totalFactory = rows.reduce((sum, row) => sum + parseMoney(row.factory), 0);
    settings.freightValue = totalFactory * freightRate;
    settings.freightMode = "value";
  }
  if (settings.freightMode !== "percent") settings.freightMode = "value";
  delete settings.freightRate;
  return settings;
}

function migrateDailyIntoAssemblyRate(budget) {
  const settings = budget?.settings;
  if (!settings) return;
  const dailyTotal = (Number(settings.dailyQuantity) || 0) * parseMoney(settings.dailyValue);
  if (!dailyTotal) return;
  const calculatedRows = calculateBudgetRows(budget.rows || [], settings);
  const totalNet = calculatedRows.reduce((sum, row) => sum + row.net, 0);
  const totalAssembly = calculatedRows.reduce((sum, row) => sum + row.assembly, 0);
  if (totalNet > 0) {
    settings.assemblyRate = Number((((totalAssembly + dailyTotal) / totalNet) * 100).toFixed(2));
  }
  settings.dailyQuantity = 0;
  settings.dailyValue = 0;
}

function budgetTotals(calculatedRows, settings) {
  const rowTotals = calculatedRows.reduce(
    (summary, row) => ({
      gross: summary.gross + row.gross,
      net: summary.net + row.net,
      factoryFreight: summary.factoryFreight + row.factoryFreight,
      cost: summary.cost + row.totalCost,
      profit: summary.profit + row.profit,
    }),
    { gross: 0, net: 0, factoryFreight: 0, cost: 0, profit: 0 }
  );
  const dailyTotal = (Number(settings.dailyQuantity) || 0) * parseMoney(settings.dailyValue);
  const totals = {
    ...rowTotals,
    dailyTotal,
  };
  const financedBase = Math.max(0, totals.gross - totals.gross * percentToRate(settings.discountRate) - settings.entry);
  const term = Number(settings.entryTerm) === 60 ? 60 : 30;
  const financingRate = FINANCING_RATES[term]?.[settings.installments] || { coefficient: 0, retention: 0 };
  const installmentValue = financedBase * financingRate.coefficient;
  const retentionValue = financedBase * financingRate.retention;
  const financingTotal = installmentValue * settings.installments + settings.entry;

  return {
    ...totals,
    margin: totals.net ? totals.profit / totals.net : 0,
    financedBase,
    installmentValue,
    retentionRate: financingRate.retention,
    retentionValue,
    financingTotal,
  };
}

function updateBudgetTableTotals(calculatedRows, totals) {
  const rowTotals = calculatedRows.reduce(
    (summary, row) => ({
      factory: summary.factory + row.factory,
      factoryFreight: summary.factoryFreight + row.factoryFreight,
      hardware: summary.hardware + row.hardware,
      freight: summary.freight + row.freight,
      release: summary.release + row.release,
      assembly: summary.assembly + row.assembly,
      lela: summary.lela + row.lela,
      iris: summary.iris + row.iris,
      tax: summary.tax + row.tax,
    }),
    { factory: 0, factoryFreight: 0, hardware: 0, freight: 0, release: 0, assembly: 0, lela: 0, iris: 0, tax: 0 }
  );

  document.querySelector("#budgetRowsTotalGross").textContent = BRL.format(totals.gross);
  document.querySelector("#budgetRowsTotalFactory").textContent = BRL.format(rowTotals.factory);
  document.querySelector("#budgetRowsTotalFactoryFreight").textContent = BRL.format(rowTotals.factoryFreight);
  document.querySelector("#budgetRowsTotalHardware").textContent = BRL.format(rowTotals.hardware);
  document.querySelector("#budgetRowsTotalRelease").textContent = BRL.format(rowTotals.release);
  document.querySelector("#budgetRowsTotalAssembly").textContent = BRL.format(rowTotals.assembly);
  document.querySelector("#budgetRowsTotalLela").textContent = BRL.format(rowTotals.lela);
  document.querySelector("#budgetRowsTotalIris").textContent = BRL.format(rowTotals.iris);
  document.querySelector("#budgetRowsTotalTax").textContent = BRL.format(rowTotals.tax);
  document.querySelector("#budgetRowsTotalCost").textContent = BRL.format(totals.cost);
  document.querySelector("#budgetRowsTotalNet").textContent = BRL.format(totals.net);
  document.querySelector("#budgetRowsTotalProfit").textContent = BRL.format(totals.profit);
}

function updateBudgetSummary() {
  if (!elements.budgetRows) return;
  const settings = readBudgetSettings();
  const calculatedRows = calculateBudgetRows(readBudgetRows(), settings);
  const totals = budgetTotals(calculatedRows, settings);
  if (state.view === "order") {
    renderOrderMaterialRows(readOrderMaterialRows(), calculatedRows);
  }

  document.querySelector("#budgetTotalGross").textContent = BRL.format(totals.gross);
  document.querySelector("#budgetTotalNet").textContent = BRL.format(totals.net);
  document.querySelector("#budgetTotalCost").textContent = BRL.format(totals.cost);
  document.querySelector("#budgetTotalProfit").textContent = BRL.format(totals.profit);
  document.querySelector("#budgetMargin").textContent = formatPercent(totals.margin);
  document.querySelector("#budgetInstallmentValue").textContent = BRL.format(totals.installmentValue);
  document.querySelector("#budgetFinancedBase").textContent = BRL.format(totals.financedBase);
  document.querySelector("#budgetRetentionValue").textContent = BRL.format(totals.retentionValue);
  document.querySelector("#budgetFinancingTotal").textContent = BRL.format(totals.financingTotal);
  document.querySelector("#budgetDailyTotal").value = BRL.format(totals.dailyTotal);
  updateBudgetTableTotals(calculatedRows, totals);

  Array.from(elements.budgetRows.querySelectorAll("tr")).forEach((row, index) => {
    const values = calculatedRows[index] || {};
    row.querySelector('[data-budget-result="factoryFreight"]').textContent = BRL.format(values.factoryFreight || 0);
    row.querySelector('[data-budget-result="release"]').textContent = BRL.format(values.release || 0);
    row.querySelector('[data-budget-result="assembly"]').textContent = BRL.format(values.assembly || 0);
    row.querySelector('[data-budget-result="lela"]').textContent = BRL.format(values.lela || 0);
    row.querySelector('[data-budget-result="iris"]').textContent = BRL.format(values.iris || 0);
    row.querySelector('[data-budget-result="tax"]').textContent = BRL.format(values.tax || 0);
    row.querySelector('[data-budget-result="totalCost"]').textContent = BRL.format(values.totalCost || 0);
    row.querySelector('[data-budget-result="net"]').textContent = BRL.format(values.net || 0);
    row.querySelector('[data-budget-result="profit"]').textContent = BRL.format(values.profit || 0);
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function budgetPrintContext() {
  const client = selectedBudgetClient();
  if (!client) {
    alert("Selecione um cliente para gerar o documento.");
    elements.budgetClientSelect?.focus();
    return null;
  }
  const draft = currentBudgetDraft();
  const settings = draft.settings;
  const rows = calculateBudgetRows(draft.rows, settings).filter((row) => row.name || row.gross || row.factory || row.hardware);
  const totals = budgetTotals(rows, settings);
  return { client, budget: draft, settings, rows, totals };
}

function clientAddressLine(client) {
  return [
    client.address?.street,
    client.address?.number,
    client.address?.complement,
    client.address?.district,
    client.city,
    client.state,
    client.address?.cep,
  ]
    .filter(Boolean)
    .join(", ");
}

function printField(label, value) {
  return `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || "-")}</strong></div>`;
}

const CONTRACT_CLAUSES = [
  "1. OBJETO E PRECO",
  "1 - O CONTRATANTE, atraves dos pagamentos descritos no pedido anexo, integrante deste contrato, recebera os produtos descritos e de fabricacao das empresas mencionadas no pedido supracitado, bem como a prestacao dos servicos pertinentes, de acordo com os projetos, os quais, vistados pelas partes, integram e constituem compromissos unicos deste contrato.",
  "2 - SERVICOS: Atendimento e interpretacao das necessidades do cliente, atraves da demonstracao de produtos, orientacao tecnica e comercial, desenvolvimento de projetos, conferencia das medidas do local de montagem, fornecimento de acessorios, transporte e montagem, desde a pre-venda ate a conclusao de instalacao conforme projetos integrantes deste contrato.",
  "3 - Todos os faturamentos de produtos, transportes e servicos serao faturados direta e exclusivamente pela CONTRATADA e a ela serao pagos pelo CONTRATANTE ou Agente Financeiro por ele contratado.",
  "4 - Nao integram o presente contrato elementos decorativos presentes nos projetos apenas a titulo de ilustracao, tais como eletrodomesticos, granitos, tapetes, cortinas, espelhos, vidros, etc., salvo nos casos de expressa opcao do CONTRATANTE pela compra de produtos de outros fornecedores.",
  "5 - Nao farao parte do objeto deste contrato e nem sera encargo da CONTRATADA a instalacao ou alteracao de pontos eletricos ou hidraulicos, ou qualquer outra atividade nao concretamente relacionada no pedido ou adendo deste instrumento.",
  "6 - Caso o projeto final venha a ser modificado durante sua execucao a pedido do CONTRATANTE, de forma que implique diferenca de precos do valor negociado, este autoriza a CONTRATADA a emitir titulo correspondente a diferenca de valores.",
  "2. CONDICOES DE FORNECIMENTO E GARANTIA",
  "7 - Apos a assinatura deste contrato pelo CONTRATANTE, as partes se obrigam ao cumprimento do presente contrato de forma irrevogavel e irretratavel, sendo vedado o cancelamento da venda por desistencia ou arrependimento de qualquer das partes.",
  "8 - Os produtos comprados serao entregues e os servicos de montagem executados pela CONTRATADA e/ou por meio de empresas especializadas, devendo os produtos serem entregues no prazo de 45 dias uteis da data da assinatura do projeto final. Os servicos de montagem serao iniciados em ate 05 dias uteis da confirmacao da entrega dos moveis no local.",
  "9 - E responsabilidade do CONTRATANTE deixar o local de entrega disponivel para receber os produtos e nas condicoes necessarias a realizacao da montagem, incluindo liberacao de acessos, energia eletrica e fornecimento das plantas hidraulicas e eletricas no inicio da montagem.",
  "10 - No caso de apartamentos, se alguma peca nao couber no elevador ou escadas, a mesma devera subir por empresa especializada em mudancas, ocorrendo por conta do CONTRATANTE o custo deste servico.",
  "11 - Em caso de reformas, as mesmas deverao estar devidamente concluidas e os ambientes completamente limpos. A desmontagem e transporte de moveis ja existentes e de responsabilidade do CONTRATANTE.",
  "12 - Na indisponibilidade de acesso ao local da entrega na data estabelecida, o CONTRATANTE devera providenciar deposito alternativo para entrega imediata, cabendo-lhe os onus respectivos.",
  "13 - E de responsabilidade do CONTRATANTE verificar altura dos armarios, abertura de portas, rebaixos, sancas, luminarias, cortinas e demais interferencias antes da execucao.",
  "14 - Fica aos cuidados do CONTRATANTE a retirada, antes da entrega dos moveis, de molduras de gesso, rodapes ou qualquer acabamento que interfira na instalacao dos produtos.",
  "15 - Ate a data de instalacao, o CONTRATANTE devera entregar no imovel os eletrodomesticos com as medidas previstas no projeto e plantas eletricas, hidraulicas, de gas, telefone e outras tubulacoes nao aparentes.",
  "16 - Por ocasiao da instalacao, eventuais incompatibilidades, ausencia de componentes, necessidades ou conveniencia de reformulacoes e ampliacoes de projetos envolverao nova contratacao analoga ao presente.",
  "17 - A perfeita execucao do projeto requer, durante a montagem, alguns ajustes de acabamento que poderao provocar residuos e po. Apos a conclusao, os tecnicos farao a limpeza dos residuos resultantes da montagem.",
  "18 - Constituem obrigacoes da CONTRATADA atender, dentro dos prazos convencionados, as solicitacoes da CONTRATANTE relativas a entrega, montagem, instalacao e assistencia tecnica decorrente de defeitos de fabricacao.",
  "19 - Na montagem, a CONTRATADA se exime de responsabilidade por sobras de obra, paredes frageis, desniveis, focos de umidade, exposicao excessiva ao sol ou luminosidade e demais condicoes do local que impecam a instalacao adequada.",
  "20 - Os produtos da CABANA MOVEIS possuem garantia contra defeitos aparentes e de facil constatacao pelo prazo de 90 dias a contar da efetiva entrega, alem das garantias de fabricante aplicaveis a cada componente.",
  "21 - Sao causas de exclusao da garantia: desgaste natural, descoloracao pelo tempo, diferencas de tonalidade, uso anormal, sobrecarga, fogo, umidade, contato prolongado com agua, maresia, ferrugem, fungos, cupins, brocas, montagem por terceiros e falta de manutencao periodica.",
  "22 - A CONTRATADA nao esta autorizada a manipular tubulacoes eletricas, hidraulicas, telefonicas, etc., sendo responsabilidade do CONTRATANTE a contratacao de profissionais especializados nessas areas.",
  "23 - A garantia contra defeitos de montagem sera prestada pela CONTRATADA por intermedio da empresa responsavel pela montagem pelo prazo de 90 dias a contar da efetiva assinatura do termo de conclusao do servico.",
  "3. PAGAMENTOS",
  "24 - Os pagamentos deverao ser feitos nas datas estipuladas no presente instrumento, independentemente do faturamento das mercadorias ou da finalizacao dos servicos, salvo adendo escrito em contrario.",
  "25 - Todos os pagamentos deverao observar rigorosamente as condicoes, formas e datas estabelecidas no pedido anexo, integrante deste contrato, pois constituem compromissos assumidos com a fabrica.",
  "26 - Eventuais greves ou falta de materias-primas nao constituirao descumprimento contratual, podendo haver atendimento com material similar disponivel ou dilatacao dos prazos de entrega e pagamento por periodo equivalente.",
  "27 - Os pagamentos obedecerao rigorosamente as parcelas, formas, valores e datas descritas no pedido anexo, integrante deste contrato.",
  "28 - O atraso no pagamento sujeita o inadimplente ao pagamento da parcela vencida acrescida de correcao monetaria, juros de 12% ao ano e multa contratual de 2% sobre o montante em aberto.",
  "29 - No caso dos debitos nao serem quitados no vencimento, o CONTRATANTE ficara constituido em mora, podendo haver vencimento antecipado do total da divida e adocao das medidas de cobranca cabiveis.",
  "30 - Fazendo o CONTRATANTE opcao por financiamento, os titulos referentes a esse contrato permanecerao sujeitos as regras do contrato firmado entre o CONTRATANTE e o Agente Financeiro.",
  "31 - Por se tratar de mercadoria sob encomenda, nao sera admitida a desistencia da compra apos o envio do pedido ao fabricante. Cancelamentos antes do envio poderao acarretar multa de 20% sobre o valor do contrato.",
  "4. DA CESSAO",
  "32 - A posse dos objetos descritos no pedido anexo fica sendo do CONTRATANTE a partir desta data, mas a falta de pagamento de qualquer prestacao obriga a restituicao dos objetos condicionalmente adquiridos, amigavelmente ou conforme a lei.",
  "5. ELEICAO DO FORO",
  "33 - Eventual tolerancia ou concessao das partes nao implicara alteracao ou novacao contratual e nem impedira o exercicio, a qualquer momento, dos direitos assegurados.",
  "34 - A CONTRATADA oferece assistencia tecnica permanente aos seus produtos. Os custos de reparos nao cobertos pela garantia de fabrica serao cobrados da CONTRATANTE.",
  "35 - As partes elegem o Foro da Comarca de Taboao da Serra, SP, para dirimir eventuais duvidas e acoes judiciais envolvendo o pactuado, firmando o presente em duas vias e na presenca de duas testemunhas.",
];

function printableDocumentStyles() {
  return `<style>
    @page { size: A4; margin: 14mm; }
    @page order-page { size: A4; margin: 3mm 4mm; }
    @page contract-page { size: A4; margin: 11mm 12mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { margin: 0; color: #16120a; font: 12px Arial, sans-serif; }
    .print-document { color: #16120a; font: 12px Arial, sans-serif; }
    .print-page { background: #fff; break-after: page; page-break-after: always; position: relative; }
    .print-page:last-child { break-after: auto; page-break-after: auto; }
    .print-page > :not(.cabana-watermark) { position: relative; z-index: 1; }
    .cabana-watermark { position: absolute; inset: 0; display: grid; place-items: center; z-index: 2; pointer-events: none; overflow: hidden; mix-blend-mode: multiply; }
    .cabana-watermark img { width: 72%; max-width: 460px; opacity: 0.09; filter: sepia(1) saturate(1.8) hue-rotate(4deg); transform: rotate(-18deg); }
    .order-page { page: order-page; font-size: 8.2px; width: 100%; max-width: 100%; overflow: hidden; padding: 0 6mm 0 3mm; }
    .contract-page { page: contract-page; font-size: 9px; line-height: 1.25; padding: 0 4mm 0 2mm; }
    .print-document header { display: flex; justify-content: space-between; gap: 20px; border-bottom: 2px solid #aa8e34; padding-bottom: 12px; margin-bottom: 16px; }
    .print-document h1 { margin: 0; font: 700 24px Georgia, "Times New Roman", serif; }
    .print-document h2 { margin: 18px 0 8px; font: 700 15px Georgia, "Times New Roman", serif; }
    .print-document p { margin: 4px 0; }
    .print-document .meta { text-align: right; color: #5f5128; }
    .print-document .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 14px; margin-bottom: 14px; }
    .print-document .info-grid div { border-bottom: 1px solid #e4d7a4; padding-bottom: 5px; }
    .print-document span { display: block; color: #6e6135; font-size: 10px; font-weight: 800; text-transform: uppercase; }
    .print-document strong { display: block; margin-top: 2px; }
    .print-document table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    .print-document th, .print-document td { border: 1px solid #d9c779; padding: 6px 7px; text-align: left; vertical-align: top; }
    .print-document th { background: #f5efd8; color: #5f5128; font-size: 10px; text-transform: uppercase; }
    .print-document td.money, .print-document th.money { text-align: right; white-space: nowrap; }
    .print-document tfoot td { font-weight: 800; background: #fffaf0; }
    .print-document .totals { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 12px; }
    .print-document .totals div { border: 1px solid #d9c779; padding: 8px; background: #fffaf0; }
    .print-document .notes { white-space: pre-wrap; border: 1px solid #d9c779; padding: 8px; min-height: 42px; }
    .excel-order { width: 100%; max-width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 7.9px; background: rgba(255, 255, 255, 0.74); }
    .excel-order td, .excel-order th { border: 1px solid #1f1a0c; padding: 3px 2px; height: 18px; line-height: 1.12; vertical-align: middle; overflow-wrap: anywhere; background: rgba(255, 255, 255, 0.68); }
    .excel-order .label, .excel-order th { background: rgba(242, 231, 196, 0.82); color: #4f421d; font-weight: 800; text-transform: uppercase; }
    .excel-order .section { background: rgba(215, 189, 98, 0.88); color: #16120a; font-weight: 900; text-align: center; }
    .excel-order .center { text-align: center; }
    .excel-order .right { text-align: right; }
    .excel-order .strong { font-weight: 900; }
    .excel-order .sign { height: 44px; vertical-align: bottom; }
    .excel-order .logo-cell { background: rgba(255, 250, 240, 0.88); text-align: center; }
    .order-logo { display: block; width: 100px; max-height: 42px; object-fit: contain; margin: 0 auto; }
    .order-small { font-size: 7px; line-height: 1.05; }
    .contract-title { text-align: center; font-weight: 900; font-size: 12px; margin: 0 0 7px; text-transform: uppercase; }
    .contract-number { text-align: center; font-weight: 900; margin: 0 0 6px; }
    .contract-clause { margin: 2px 0; text-align: justify; }
    .contract-clause.heading { margin-top: 7px; font-weight: 900; text-align: left; text-transform: uppercase; }
    .contract-signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 16px; }
    .signature-line { border-top: 1px solid #16120a; padding-top: 4px; min-height: 34px; }
    .testimony-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 10px; }
    @media print {
      body { width: 100%; }
      .print-document { width: 100%; max-width: 100%; }
      .print-page { width: 100%; max-width: 100%; overflow: hidden; }
      .order-page { font-size: 8.8px; }
      .order-page .excel-order { font-size: 8.4px; }
      .order-page .excel-order td, .order-page .excel-order th { padding: 4px 2px; height: 22px; }
      .order-page .excel-order .sign { height: 56px; }
      .order-page .order-logo { width: 112px; max-height: 48px; }
    }
    @media screen {
      .print-page { padding: 10px; margin: 0 auto 18px; box-shadow: 0 0 0 1px #ddd; }
      .order-page { width: 650px; min-height: 920px; font-size: 8.2px; }
      .contract-page { width: 650px; min-height: 920px; font-size: 8px; }
      .order-page .excel-order { font-size: 7.8px; }
      .order-page .excel-order td, .order-page .excel-order th { padding: 3px 2px; height: 18px; }
    }
  </style>`;
}

function printableDocumentShell(title, body) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <base href="${escapeHtml(document.baseURI)}" />
  <title>${escapeHtml(title)}</title>
  ${printableDocumentStyles()}
</head>
<body>
  <main class="print-document">${body}</main>
</body>
</html>`;
}

function printableClientSection(client) {
  return `<section>
    <h2>Dados do cliente</h2>
    <div class="info-grid">
      ${printField("Cliente", client.name)}
      ${printField("CPF/CNPJ", client.cpf)}
      ${printField("Telefone", client.mobile || client.phone)}
      ${printField("E-mail", client.email)}
      ${printField("Endereço", clientAddressLine(client))}
      ${printField("Vendedor", responsibleSeller(client))}
    </div>
  </section>`;
}

function printableHeader(title, context) {
  const createdAt = new Date(context.budget.createdAt || new Date()).toLocaleString("pt-BR");
  return `<header>
    <div>
      <h1>${escapeHtml(title)}</h1>
      <p>Cabana Moveis Sob Medida</p>
    </div>
    <div class="meta">
      <p><strong>${escapeHtml(context.budget.code || "-")}</strong></p>
      <p>${escapeHtml(createdAt)}</p>
      <p>${escapeHtml(context.budget.status || "-")}</p>
    </div>
  </header>`;
}

function formatPrintDate(value, options = {}) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-BR", options);
}

function formatPrintDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formattedClientAddressParts(client) {
  return {
    street: [client.address?.street, client.address?.number, client.address?.complement].filter(Boolean).join(", "),
    district: client.address?.district || "",
    city: client.city || "",
    state: client.state || "SP",
    cep: client.address?.cep || "",
  };
}

function orderPaymentRows(context) {
  const cashRows = (context.budget.cashPayments || [])
    .filter((payment) => payment.parcel || payment.value || payment.dueDate || payment.method)
    .map((payment) => ({
      parcel: payment.parcel || "",
      value: payment.value ? BRL.format(parseMoney(payment.value)) : "",
      dueDate: payment.dueDate ? formatPrintDate(payment.dueDate) : "",
      method: payment.method || "",
    }));
  if (cashRows.length) return cashRows;
  if (!context.settings.installments) {
    return [{ parcel: "1", value: BRL.format(context.totals.net), dueDate: "", method: "Pix" }];
  }
  return Array.from({ length: Math.min(context.settings.installments, 6) }, (_, index) => ({
    parcel: String(index + 1),
    value: BRL.format(context.totals.installmentValue || 0),
    dueDate: "",
    method: "Financiamento",
  }));
}

const ORDER_ITEMS_PER_PAGE = 8;
const ORDER_MATERIAL_ROWS_PER_PAGE = 7;

function orderPageChunks(rows) {
  const filledRows = rows.length ? rows : [{}];
  const chunks = [];
  for (let index = 0; index < filledRows.length; index += ORDER_ITEMS_PER_PAGE) {
    chunks.push(filledRows.slice(index, index + ORDER_ITEMS_PER_PAGE));
  }
  return chunks;
}

function buildOrderRows(rows, startIndex = 0) {
  while (rows.length < 8) rows.push({});
  return rows
    .map(
      (row, index) => `<tr>
        <td colspan="2" class="center">${row.name ? startIndex + index + 1 : ""}</td>
        <td colspan="2" class="center">${row.name ? "1" : ""}</td>
        <td colspan="8">${escapeHtml(row.name || "")}</td>
        <td colspan="2" class="center">${row.name ? "45" : ""}</td>
        <td colspan="3" class="right">${row.name ? BRL.format(row.net || 0) : ""}</td>
        <td colspan="9"></td>
      </tr>`
    )
    .join("");
}

function buildMaterialRows(rows, materials = [], startIndex = 0) {
  const materialRows = rows.slice(0, ORDER_MATERIAL_ROWS_PER_PAGE);
  while (materialRows.length < ORDER_MATERIAL_ROWS_PER_PAGE) materialRows.push({});
  return materialRows
    .map((row, index) => {
      const material = materials[startIndex + index] || {};
      return `<tr>
        <td colspan="2" class="center">${row.name ? startIndex + index + 1 : ""}</td>
        <td colspan="4">${escapeHtml(material.body || row.name || "")}</td>
        <td colspan="4">${escapeHtml(material.door || "")}</td>
        <td colspan="3">${escapeHtml(material.handle || "")}</td>
        <td colspan="3">${escapeHtml(material.model || "")}</td>
        <td colspan="4">${escapeHtml(material.complement || "")}</td>
        <td colspan="6">${escapeHtml(material.observation || "")}</td>
      </tr>`;
    })
    .join("");
}

function buildPaymentRows(context) {
  const rows = orderPaymentRows(context).slice(0, 6);
  while (rows.length < 6) rows.push({});
  return [0, 1, 2]
    .map((index) => {
      const first = rows[index] || {};
      const second = rows[index + 3] || {};
      return `<tr>
        <td colspan="3" class="center">${escapeHtml(first.parcel || "")}</td>
        <td colspan="3" class="right">${escapeHtml(first.value || "")}</td>
        <td colspan="4" class="center">${escapeHtml(first.dueDate || "")}</td>
        <td colspan="3">${escapeHtml(first.method || "")}</td>
        <td colspan="3" class="center">${escapeHtml(second.parcel || "")}</td>
        <td colspan="3" class="right">${escapeHtml(second.value || "")}</td>
        <td colspan="4" class="center">${escapeHtml(second.dueDate || "")}</td>
        <td colspan="3">${escapeHtml(second.method || "")}</td>
      </tr>`;
    })
    .join("");
}

function buildOrderPage(context, rows = context.rows, startIndex = 0) {
  const client = context.client;
  const address = formattedClientAddressParts(client);
  const contractCode = context.budget.code || "";
  const createdAt = formatPrintDate(context.budget.createdAt);
  const deliveryForecastAt = formatPrintDateTime(context.budget.deliveryForecastAt);
  const orderRows = buildOrderRows([...rows], startIndex);
  const materialRows = buildMaterialRows([...rows], context.budget.orderMaterials || [], startIndex);
  return `<section class="print-page order-page">
    <div class="cabana-watermark"><img src="assets/cabana-logo.png" alt="" /></div>
    <table class="excel-order" aria-label="Pedido">
      <colgroup>${Array.from({ length: 26 }, () => "<col />").join("")}</colgroup>
      <tbody>
        <tr><td colspan="4" rowspan="3" class="logo-cell"><img class="order-logo" src="assets/cabana-logo.png" alt="Cabana Moveis Sob Medida" /></td><td colspan="8" class="label">Cabana Moveis Sob Medida Ltda</td><td colspan="2" class="label">CNPJ</td><td colspan="6">47.946.284/0001-77</td><td colspan="6" class="section">Contrato No</td></tr>
        <tr><td colspan="9" class="order-small">Avenida Vida Nova, 28, Sala 806-B, Jardim Maria Rosa - Taboao da Serra, SP</td><td colspan="2" class="label">Tel.</td><td colspan="5">11 95909-3538</td><td colspan="6" class="center strong">${escapeHtml(contractCode)}</td></tr>
        <tr><td colspan="6">cabanamoveissobmedida@gmail.com</td><td class="label">Bco</td><td colspan="3">Itau - 347</td><td class="label">Ag</td><td>0568</td><td class="label">CC</td><td colspan="3">99307-5</td><td colspan="6"></td></tr>
        <tr><td colspan="19" class="label">Responsavel pela venda</td><td colspan="7" class="label">Data do contrato</td></tr>
        <tr><td colspan="19">${escapeHtml(responsibleSeller(client) || "Daniela Moreira")}</td><td colspan="7" class="center">${escapeHtml(createdAt)}</td></tr>
        <tr><td colspan="19" class="label">Cliente</td><td colspan="7" class="label">Banco / Agencia / Conta</td></tr>
        <tr><td colspan="19" class="strong">${escapeHtml(client.name || "")}</td><td colspan="7"></td></tr>
        <tr><td colspan="8" class="label">CPF/CNPJ</td><td colspan="10" class="label">R.G / Inscricao Estadual</td><td colspan="8" class="label">Data de nascimento</td></tr>
        <tr><td colspan="8">${escapeHtml(client.cpf || "")}</td><td colspan="10"></td><td colspan="8"></td></tr>
        <tr><td colspan="26" class="label">Endereco atual</td></tr>
        <tr><td colspan="26">${escapeHtml(address.street)}</td></tr>
        <tr><td colspan="8" class="label">Bairro</td><td colspan="10" class="label">Cidade</td><td colspan="2" class="label">UF</td><td colspan="6" class="label">CEP</td></tr>
        <tr><td colspan="8">${escapeHtml(address.district)}</td><td colspan="10">${escapeHtml(address.city)}</td><td colspan="2" class="center">${escapeHtml(address.state)}</td><td colspan="6">${escapeHtml(address.cep)}</td></tr>
        <tr><td colspan="18" class="label">Telefone</td><td colspan="8" class="label">E-mail</td></tr>
        <tr><td colspan="18">${escapeHtml(client.mobile || client.phone || "")}</td><td colspan="8">${escapeHtml(client.email || "")}</td></tr>
        <tr><td colspan="18" class="label">Endereco de entrega</td><td colspan="8" class="label order-small">Previsao de entrega</td></tr>
        <tr><td colspan="18">O mesmo</td><td colspan="8" class="center strong">${escapeHtml(deliveryForecastAt || "45 dias uteis")}</td></tr>
        <tr><th colspan="2">Item</th><th colspan="2">Qtd</th><th colspan="8">Descricao ambiente / produto</th><th colspan="2">Prazo</th><th colspan="3">Valor</th><th colspan="9">Observacao</th></tr>
        ${orderRows}
        <tr><td colspan="17"></td><td colspan="5" class="label right">Total do pedido:</td><td colspan="4" class="right strong">${BRL.format(context.totals.net)}</td></tr>
        <tr><th colspan="2">Item</th><th colspan="4">Corpo</th><th colspan="4">Porta</th><th colspan="3">Puxador</th><th colspan="3">Modelo</th><th colspan="4">Complemento</th><th colspan="6">Amb / Observacao</th></tr>
        ${materialRows}
        <tr><td colspan="26" class="label">Amb Observacao</td></tr>
        <tr><td colspan="26">${escapeHtml(context.budget.notes || "")}</td></tr>
        <tr><td colspan="5" class="label">Total a vista</td><td colspan="11" class="label">Total a prazo</td><td colspan="5" class="label">Forma de pagamento</td><td colspan="5" class="label">Condicao de pagamento</td></tr>
        <tr><td colspan="5" class="right strong">${BRL.format(context.totals.net)}</td><td colspan="11" class="right strong">${BRL.format(context.totals.financingTotal || context.totals.net)}</td><td colspan="5">Pix</td><td colspan="5">${context.settings.installments ? "A vista / Parcelado" : "A vista"}</td></tr>
        <tr><th colspan="3">Parcela</th><th colspan="3">Valor</th><th colspan="4">Vencimento</th><th colspan="3">Forma de pagamento</th><th colspan="3">Parcela</th><th colspan="3">Valor</th><th colspan="4">Vencimento</th><th colspan="3">Forma de pagamento</th></tr>
        ${buildPaymentRows(context)}
        <tr><td colspan="13" class="sign">Cabana Moveis Sob Medida</td><td colspan="13" class="sign">Contratante: ${escapeHtml(client.name || "")}</td></tr>
      </tbody>
    </table>
  </section>`;
}

function buildContractPage(context) {
  const clauses = CONTRACT_CLAUSES.map((text) => {
    const heading = /^\d+\./.test(text);
    return `<p class="contract-clause${heading ? " heading" : ""}">${escapeHtml(text)}</p>`;
  }).join("");
  return `<section class="print-page contract-page">
    <div class="cabana-watermark"><img src="assets/cabana-logo.png" alt="" /></div>
    <p class="contract-number">CONTRATO N.o ${escapeHtml(context.budget.code || "")}</p>
    <h1 class="contract-title">Contrato de Compra e Venda de Produtos e de Prestacao de Servicos</h1>
    ${clauses}
    <div class="testimony-grid">
      <div>
        <strong>Testemunha 1</strong>
        <p>Nome:</p>
        <p>CPF:</p>
        <p>RG:</p>
      </div>
      <div>
        <strong>Testemunha 2</strong>
        <p>Nome:</p>
        <p>CPF:</p>
        <p>RG:</p>
      </div>
    </div>
    <div class="contract-signatures">
      <div class="signature-line"><strong>CONTRATADA:</strong><br />Cabana Moveis Sob Medida Ltda</div>
      <div class="signature-line"><strong>CONTRATANTE:</strong><br />${escapeHtml(context.client.name || "")}</div>
    </div>
  </section>`;
}

function buildOrderDocument(context) {
  const orderPages = orderPageChunks(context.rows)
    .map((rows, index) => buildOrderPage(context, rows, index * ORDER_ITEMS_PER_PAGE))
    .join("");
  const body = `${orderPages}${buildContractPage(context)}`;
  const title = `Pedido e Contrato ${context.budget.code || ""}`;
  return { title, body, html: printableDocumentShell(title, body) };
}
function buildQuoteDocument(context) {
  const rows = context.rows
    .map(
      (row) => `<tr>
        <td>${escapeHtml(row.name || "-")}</td>
        <td class="money">${BRL.format(row.gross || 0)}</td>
        <td class="money">${BRL.format(row.factory || 0)}</td>
        <td class="money">${BRL.format(row.factoryFreight || 0)}</td>
        <td class="money">${BRL.format(row.hardware || 0)}</td>
        <td class="money">${BRL.format(row.release || 0)}</td>
        <td class="money">${BRL.format(row.assembly || 0)}</td>
        <td class="money">${BRL.format(row.lela || 0)}</td>
        <td class="money">${BRL.format(row.iris || 0)}</td>
        <td class="money">${BRL.format(row.tax || 0)}</td>
        <td class="money">${BRL.format(row.totalCost || 0)}</td>
        <td class="money">${BRL.format(row.net || 0)}</td>
        <td class="money">${BRL.format(row.profit || 0)}</td>
      </tr>`
    )
    .join("");
  const body = `${printableHeader("Orçamento", context)}
    ${printableClientSection(context.client)}
    <section>
      <h2>Ambientes e valores</h2>
      <table>
        <thead>
          <tr>
            <th>Ambiente</th><th class="money">VITTA</th><th class="money">Fábrica</th><th class="money">Fábrica+Frete</th><th class="money">Ferragens</th><th class="money">Liberação</th>
            <th class="money">Montagem</th><th class="money">LELA</th><th class="money">IRIS</th><th class="money">Impostos</th>
            <th class="money">Custo total</th><th class="money">Liquido</th><th class="money">Lucro</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="13">Nenhum ambiente informado</td></tr>'}</tbody>
      </table>
      <div class="totals">
        ${printField("Total ambientes", BRL.format(context.totals.gross))}
        ${printField("Total liquido", BRL.format(context.totals.net))}
        ${printField("Custo total", BRL.format(context.totals.cost))}
        ${printField("Lucro", BRL.format(context.totals.profit))}
        ${printField("Margem", formatPercent(context.totals.margin))}
        ${printField("Total diaria", BRL.format(context.totals.dailyTotal))}
        ${printField("Base financiada", BRL.format(context.totals.financedBase))}
        ${printField("Valor parcela", BRL.format(context.totals.installmentValue))}
        ${printField("Retencao", BRL.format(context.totals.retentionValue))}
        ${printField("Total financiamento", BRL.format(context.totals.financingTotal))}
      </div>
    </section>
    <section><h2>Observações</h2><div class="notes">${escapeHtml(context.budget.notes || "")}</div></section>`;
  const title = `Orcamento ${context.budget.code || ""}`;
  return { title, body, html: printableDocumentShell(title, body) };
}

function openPrintableHtml(html) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Permita pop-ups para gerar o documento.");
    return;
  }
  let closeTimer = null;
  const closePrintWindow = () => {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      try {
        printWindow.close();
      } catch (error) {
        console.warn(error);
      }
    }, 300);
  };
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.addEventListener("afterprint", closePrintWindow, { once: true });
  printWindow.addEventListener(
    "load",
    () => {
      printWindow.print();
      closeTimer = setTimeout(closePrintWindow, 1200);
    },
    { once: true }
  );
}

function previewPrintableBudgetDocument(type) {
  const context = budgetPrintContext();
  if (!context) return;
  const documentData = type === "order" ? buildOrderDocument(context) : buildQuoteDocument(context);
  closeBudgetPrintPreview();
  openPrintableHtml(documentData.html);
}
function printBudgetPreview() {
  const html = elements.budgetPrintPreview?.dataset.printHtml;
  if (!html) return;
  openPrintableHtml(html);
}

function closeBudgetPrintPreview() {
  if (!elements.budgetPrintPreview) return;
  elements.budgetPrintPreview.hidden = true;
  elements.budgetPrintPreviewContent.innerHTML = "";
  delete elements.budgetPrintPreview.dataset.printTitle;
  delete elements.budgetPrintPreview.dataset.printHtml;
}

function markBudgetDirty() {
  state.budgetDirty = true;
}

function focusBudgetRowField(row, fieldName, options = {}) {
  const field = row?.querySelector(`[data-budget-field="${fieldName}"]`);
  if (!(field instanceof HTMLElement)) return;
  window.setTimeout(() => {
    if (options.openPicker && field instanceof HTMLSelectElement) {
      focusAndOpenSelect(field);
      return;
    }
    field.focus();
    if (field instanceof HTMLInputElement) field.select();
  }, 0);
}

function focusNextBudgetEnvironmentRow(row) {
  let nextRow = row.nextElementSibling;
  if (!nextRow) {
    nextRow = createBudgetRow({ name: "", gross: 0, factory: 0, hardware: 0 });
    row.after(nextRow);
  }
  focusBudgetRowField(nextRow, "name", { openPicker: true });
}

function focusNextBudgetRowFieldOrEnvironment(row, fieldName) {
  const nextRow = row.nextElementSibling;
  if (nextRow) {
    focusBudgetRowField(nextRow, fieldName);
    return;
  }
  focusNextBudgetEnvironmentRow(row);
}

function setBudgetTableOrderMode(orderMode) {
  document.querySelectorAll(".budget-table tr").forEach((row) => {
    if (row.classList.contains("budget-rate-row")) return;
    const grossCell = row.querySelector('[data-budget-column="gross"]');
    const netCell = row.querySelector('[data-budget-column="net"]');
    if (!grossCell || !netCell) return;
    const grossIndex = Array.from(row.children).indexOf(grossCell);
    const netIndex = Array.from(row.children).indexOf(netCell);
    const shouldSwap = orderMode ? grossIndex < netIndex : grossIndex > netIndex;
    if (!shouldSwap) return;
    const marker = document.createTextNode("");
    row.insertBefore(marker, grossCell);
    row.insertBefore(grossCell, netCell);
    row.insertBefore(netCell, marker);
    marker.remove();
  });
}

function createBudgetRow(rowData = {}) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td data-budget-environment></td>
    <td data-budget-column="gross"><input class="money-input" data-budget-field="gross" inputmode="decimal" title="Tambem aceita contas, ex: 1.200,00+350,50" /></td>
    <td><input class="money-input" data-budget-field="factory" inputmode="decimal" title="Tambem aceita contas, ex: 1.200,00+350,50" /></td>
    <td data-budget-result="factoryFreight"></td>
    <td><input class="money-input" data-budget-field="hardware" inputmode="decimal" title="Tambem aceita contas, ex: 1.200,00+350,50" /></td>
    <td data-budget-result="release"></td>
    <td data-budget-result="assembly"></td>
    <td data-budget-result="lela"></td>
    <td data-budget-result="iris"></td>
    <td data-budget-result="tax"></td>
    <td data-budget-result="totalCost"></td>
    <td data-budget-column="net" data-budget-result="net"></td>
    <td data-budget-result="profit"></td>
    <td><button class="icon-button danger" type="button" data-budget-remove aria-label="Remover ambiente" title="Remover ambiente">🗑</button></td>
  `;
  const focusBudgetGross = () => {
    focusBudgetRowField(row, "gross");
  };
  const environmentPicker = createEnvironmentPicker(rowData.name || "", () => {
    markBudgetDirty();
    updateBudgetSummary();
    focusBudgetGross();
  });
  environmentPicker.select.dataset.budgetField = "name";
  environmentPicker.select.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    event.stopPropagation();
    focusBudgetGross();
  });
  row.querySelector("[data-budget-environment]").appendChild(environmentPicker.wrapper);
  row.querySelector('[data-budget-field="gross"]').value = formatMoneyInput(rowData.gross || 0);
  row.querySelector('[data-budget-field="factory"]').value = formatMoneyInput(rowData.factory || 0);
  row.querySelector('[data-budget-field="hardware"]').value = formatMoneyInput(rowData.hardware || 0);
  row.querySelectorAll('[data-budget-field="gross"], [data-budget-field="factory"], [data-budget-field="hardware"]').forEach((input) => {
    input.addEventListener("input", () => {
      markBudgetDirty();
      updateBudgetSummary();
    });
    if (input.classList.contains("money-input")) {
      input.addEventListener("blur", () => {
        input.value = formatMoneyInput(input.value);
        updateBudgetSummary();
      });
    }
  });
  row.querySelector('[data-budget-field="gross"]').addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.value = formatMoneyInput(event.currentTarget.value);
    focusBudgetRowField(row, "factory");
  });
  row.querySelector('[data-budget-field="factory"]').addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.value = formatMoneyInput(event.currentTarget.value);
    focusBudgetRowField(row, "hardware");
  });
  row.querySelector('[data-budget-field="hardware"]').addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.value = formatMoneyInput(event.currentTarget.value);
    markBudgetDirty();
    updateBudgetSummary();
    focusNextBudgetRowFieldOrEnvironment(row, "gross");
  });
  row.querySelector("[data-budget-remove]").addEventListener("click", () => {
    row.remove();
    markBudgetDirty();
    updateBudgetSummary();
  });
  return row;
}

function fillBudgetForm(client) {
  closeBudgetPrintPreview();
  const budget = state.budgetDraft || (state.budgetIsNew ? blankBudget() : budgetForEditing(client));
  migrateDailyIntoAssemblyRate(budget);
  state.budgetEditingId = budgetIdentity(budget) || state.budgetEditingId;
  const settings = budget.settings;
  const targetClient = selectedBudgetClient();
  const documentLabel = state.view === "order" ? "Pedido" : "Orçamento";
  document.querySelector("#budgetEditorTitle").textContent = documentLabel;
  renderBudgetSeller(targetClient);
  document.querySelector("#budgetEditClientBtn").disabled = false;
  document.querySelector("#budgetEditClientBtn").title = targetClient ? "Editar cliente" : "Cadastrar cliente";
  document.querySelector("#budgetEditClientBtn").setAttribute("aria-label", targetClient ? "Editar cliente" : "Cadastrar cliente");
  document.querySelector("#budgetCode").value = budget.code || nextBudgetCode();
  document.querySelector("#budgetCreatedAt").value = formatDateTimeLocal(budget.createdAt || new Date());
  document.querySelector("#budgetNobiliaId").value = budget.nobiliaId || "";
  document.querySelector("#budgetNobiliaDate").value = budget.nobiliaDate || "";
  document.querySelector("#budgetStatus").value = budget.status || BUDGET_STATUS[0];
  document.querySelector("#budgetEntry").value = formatMoneyInput(settings.entry);
  document.querySelector("#budgetEntryTerm").value = String(settings.entryTerm || 30);
  document.querySelector("#budgetInstallments").value = String(settings.installments || 0);
  document.querySelector("#budgetDiscountRate").value = settings.discountRate;
  document.querySelector("#budgetFreightMode").value = settings.freightMode === "percent" ? "percent" : "value";
  document.querySelector("#budgetFreightValue").value = settings.freightMode === "percent" ? String(parseMoney(settings.freightValue)).replace(".", ",") : formatMoneyInput(settings.freightValue);
  document.querySelector("#budgetReleaseRate").value = settings.releaseRate;
  document.querySelector("#budgetAssemblyRate").value = settings.assemblyRate;
  document.querySelector("#budgetLelaRate").value = settings.lelaRate;
  document.querySelector("#budgetIrisRate").value = settings.irisRate;
  document.querySelector("#budgetTaxRate").value = settings.taxRate;
  document.querySelector("#budgetDailyQuantity").value = settings.dailyQuantity || "";
  document.querySelector("#budgetDailyValue").value = formatMoneyInput(settings.dailyValue || 0);
  document.querySelector("#budgetAssemblerName").value = settings.assemblerName || "";
  document.querySelector("#budgetAssemblyStartDate").value = settings.assemblyStartDate || "";
  document.querySelector("#budgetAssemblyEndDate").value = settings.assemblyEndDate || "";
  updateBudgetAssemblyDays();
  if (elements.budgetSaleAt) {
    elements.budgetSaleAt.value = budget.saleAt ? formatDateTimeLocal(budget.saleAt) : "";
  }
  state.budgetLastStatus = document.querySelector("#budgetStatus").value;
  updateBudgetSaleAtFieldVisibility();
  if (elements.orderDeliveryForecastAt) {
    elements.orderDeliveryForecastAt.value = budget.deliveryForecastAt ? formatDateTimeLocal(budget.deliveryForecastAt) : "";
  }
  document.querySelector("#budgetNotes").value = budget.notes || "";
  renderCashPaymentRows(budget.cashPayments);

  elements.budgetRows.innerHTML = "";
  budget.rows.forEach((row) => elements.budgetRows.appendChild(createBudgetRow(row)));
  setBudgetTableOrderMode(state.view === "order");
  renderOrderMaterialRows(budget.orderMaterials || [], budget.rows);
  state.budgetDirty = false;
  updateBudgetSummary();
}

async function openBudgetEditor(clientId = state.selectedId, options = {}) {
  if (!isAdmin()) return;
  if (state.budgetEditing && !(await confirmDiscardBudgetChanges())) return;
  state.budgetIsNew = Boolean(options.blank);
  state.selectedId = state.budgetIsNew && !clientId ? null : clientId || state.selectedId;
  state.budgetSourceId = state.budgetIsNew ? null : state.selectedId;
  state.budgetEditingId = options.budgetId || null;
  state.budgetEditing = true;
  renderBudget();
}

function resetBudgetEditorState() {
  closeBudgetPrintPreview();
  state.budgetEditing = false;
  state.budgetDirty = false;
  state.budgetIsNew = false;
  state.budgetSourceId = null;
  state.budgetEditingId = null;
  state.budgetDraft = null;
}

async function closeBudgetEditor() {
  if (!(await confirmDiscardBudgetChanges())) return;
  resetBudgetEditorState();
  renderBudget();
}

function budgetSummaryForClient(client) {
  const budget = clientBudget(client);
  const calculatedRows = calculateBudgetRows(budget.rows, budget.settings);
  return budgetTotals(calculatedRows, budget.settings);
}

function budgetSummary(budget) {
  const calculatedRows = calculateBudgetRows(budget.rows || [], budget.settings || DEFAULT_BUDGET_SETTINGS);
  return budgetTotals(calculatedRows, budget.settings || DEFAULT_BUDGET_SETTINGS);
}

function formatBudgetCodeForList(code) {
  const originalCode = String(code || "").trim();
  const match = originalCode.match(/^(\d+)-(\d{2})(\d{4})$/);
  if (!match) return originalCode;
  const [, sequence, month, year] = match;
  return `${month}${year}-${sequence}`;
}

function budgetDateValue(budget) {
  if (state.view === "order") return budget.saleAt || budget.updatedAt || budget.createdAt || "";
  return budget.createdAt || budget.updatedAt || "";
}

function dateInRange(value, startDate, endDate) {
  if (!value) return !startDate && !endDate;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  if (startDate) {
    const start = new Date(`${startDate}T00:00:00`);
    if (date < start) return false;
  }
  if (endDate) {
    const end = new Date(`${endDate}T23:59:59`);
    if (date > end) return false;
  }
  return true;
}

function filteredBudgets() {
  const search = state.budgetSearch.toLowerCase();
  const orderMode = state.view === "order";
  const budgets = state.clients
    .flatMap((client) => clientBudgetHistory(client).map((budget) => ({ client, budget })))
    .filter(({ client, budget }) => {
      const searchableValues = orderMode ? [client.name] : [budget.code, budget.status, client.name, client.status, responsibleSeller(client), client.id];
      const matchesSearch = searchableValues.some((value) => String(value || "").toLowerCase().includes(search));
      const matchesStatus = state.view === "financial"
        ? state.financialStatuses.includes("Todos")
          ? budget.status !== "Recusado" && budget.status !== "Finalizado"
          : state.financialStatuses.includes(budget.status)
        : orderMode
        ? state.budgetStatus === "Todos"
          ? ORDER_STATUS.includes(budget.status)
          : budget.status === state.budgetStatus
        : state.budgetSelectedStatuses.includes("Todos")
        ? budget.status !== "Recusado" && budget.status !== "Finalizado"
        : state.budgetSelectedStatuses.includes(budget.status);
      const matchesDate = dateInRange(budgetDateValue(budget), state.budgetStartDate, state.budgetEndDate);
      return matchesSearch && matchesStatus && matchesDate;
    });
  return sortBudgets(budgets);
}

function renderBudgetClientOptions() {
  if (!elements.budgetClientSelect) return;
  const selectedId = state.budgetIsNew && !state.selectedId ? "" : state.selectedId || elements.budgetClientSelect.value || "";
  elements.budgetClientSelect.innerHTML = "";
  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = "Selecione um cliente";
  placeholderOption.selected = !selectedId;
  elements.budgetClientSelect.appendChild(placeholderOption);
  const availableClients = state.clients.filter(clientCanHaveBudget);
  availableClients.forEach((client) => {
    const option = document.createElement("option");
    option.value = client.id;
    option.textContent = client.name || client.id;
    elements.budgetClientSelect.appendChild(option);
  });
  elements.budgetClientSelect.value = availableClients.some((client) => client.id === selectedId) ? selectedId : "";
}

function renderBudgetList() {
  const rows = elements.budgetListRows;
  if (!rows) return;
  const budgets = filteredBudgets();
  const orderMode = state.view === "order";
  const grossHeader = document.querySelector('#budgetListCard th[data-sort="factoryFreight"], #budgetListCard th[data-sort="net"]');
  const netHeader = document.querySelector("#budgetListCard th[data-budget-net-column]");
  const costHeader = document.querySelector('#budgetListCard th[data-sort="cost"], #budgetListCard th[data-sort="deliveryForecastAt"]');
  if (grossHeader) {
    grossHeader.dataset.sort = orderMode ? "net" : "factoryFreight";
    grossHeader.textContent = orderMode ? "Faturado" : "Fábrica + frete";
    grossHeader.tabIndex = 0;
  }
  if (netHeader) netHeader.hidden = orderMode;
  if (costHeader) {
    costHeader.dataset.sort = orderMode ? "deliveryForecastAt" : "cost";
    costHeader.textContent = orderMode ? "Previsao de entrega" : "Custo total";
    costHeader.tabIndex = 0;
  }
  const documentLabel = state.view === "order" ? "pedido" : "orçamento";
  updateSortHeaders("budget");
  setupResizableTables();

  document.querySelector("#budgetCount").textContent = budgets.length;
  document.querySelector("#budgetHeader p").lastChild.textContent = ` ${documentLabel}s disponíveis`;
  rows.innerHTML = "";

  if (!budgets.length) {
    rows.innerHTML = `<tr><td colspan="9" class="empty-state">Nenhum ${documentLabel} encontrado</td></tr>`;
    return;
  }

  budgets.forEach(({ client, budget }) => {
    const totals = budgetSummary(budget);
    const row = document.createElement("tr");
    const folderCell = document.createElement("td");
    const folderButton = document.createElement("button");
    folderCell.className = "folder-column";
    folderButton.className = "folder-button";
    folderButton.type = "button";
    folderButton.title = `Abrir ${documentLabel}`;
    folderButton.textContent = "▰";
    folderButton.addEventListener("click", () => openBudgetEditor(client.id, { budgetId: budgetIdentity(budget) }));
    folderCell.appendChild(folderButton);
    row.appendChild(folderCell);

    const codeValue = formatBudgetCodeForList(budget.code) || "-";
    const nobiliaValue = budget.nobiliaId || "";
    const separator = state.appPreferences?.budgetCodeSeparator || " - ";
    const combinedCodeValue = state.appPreferences?.showNobiliaInList !== false && nobiliaValue ? `${codeValue}${separator}${nobiliaValue}` : codeValue;
    [
      combinedCodeValue,
      client.name,
      budget.status || "Negociação",
    ].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value || "-";
      row.appendChild(cell);
    });

    const amountValues = [
      { value: BRL.format(orderMode ? totals.net : totals.factoryFreight) },
      { value: orderMode ? formatPrintDateTime(budget.deliveryForecastAt) || "-" : BRL.format(totals.cost) },
      { value: BRL.format(totals.profit), hidden: orderMode },
      { value: BRL.format(totals.net), hidden: orderMode },
      { value: budget.updatedAt ? new Date(budget.updatedAt).toLocaleString("pt-BR") : "-" },
    ];
    amountValues.forEach(({ value, hidden = false }) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      cell.hidden = hidden;
      row.appendChild(cell);
    });
    row.addEventListener("dblclick", () => openBudgetEditor(client.id, { budgetId: budgetIdentity(budget) }));
    rows.appendChild(row);
  });
}

function renderBudget() {
  if (!elements.budgetClientSelect || !isAdmin()) return;
  const isBudgetArea = state.view === "budget" || state.view === "order";
  if (!isBudgetArea) return;
  renderBudgetClientOptions();
  renderBudgetList();

  const orderMode = state.view === "order";
  const editing = isBudgetArea && state.budgetEditing;
  document.body.dataset.budgetViewMode = orderMode ? "order" : "budget";
  if (elements.budgetSearch) {
    elements.budgetSearch.placeholder = orderMode ? "Buscar por nome do cliente..." : "Buscar por cliente, vendedor ou status...";
  }
  const dateFilterTitle = document.querySelector(".budget-dashboard-filters .date-filter .filter-title");
  if (dateFilterTitle) dateFilterTitle.textContent = orderMode ? "Data da venda" : "Data do orcamento";
  document.querySelector("#budgetHeader h1").textContent = orderMode ? "Pedido" : "Orçamento";
  document.body.dataset.budgetEditing = editing ? "true" : "false";
  document.querySelector("#budgetHeader").hidden = editing;
  document.querySelector("#budgetFiltersPanel").hidden = editing;
  elements.budgetListCard.hidden = editing;
  elements.budgetEditor.hidden = !editing;
  if (editing) {
    fillBudgetForm(sourceBudgetClient());
    updateBudgetFinancialButton();
    if (elements.budgetDeleteBtn) {
      elements.budgetDeleteBtn.hidden = state.budgetIsNew || !state.budgetEditingId;
    }
  }
}

const BUDGET_FINANCIAL_EXPENSES = [
  { key: "factoryFreight", description: "Fábrica + Frete", category: "Fabrica", days: 5 },
  { key: "hardware", description: "Ferragens", category: "Insumos", days: 40 },
  { key: "release", description: "Liberação", category: "Operação", days: 40 },
  { key: "assembly", sourceKey: "assembly", description: "Montagem - Início", category: "Montagem", days: 40, splitPart: 1, assemblyDateField: "assemblyStartDate", syncDueDate: true },
  { key: "assemblyFinal", sourceKey: "assembly", description: "Montagem - Final", category: "Montagem", days: 40, splitPart: 2, assemblyDateField: "assemblyEndDate", syncDueDate: true },
  { key: "lela", description: "Lela", category: "Comissão Lela", finalPaymentMonth: true, syncDueDate: true },
  { key: "iris", description: "Iris", category: "Comissão Iris", finalPaymentMonth: true, syncDueDate: true },
  { key: "tax", description: "Impostos", category: "Impostos", taxDue: true },
];

function budgetFinancialLocalDate(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("Data do orçamento inválida.");
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function budgetFinancialDueDate(postedDate, rule) {
  const [year, month, day] = postedDate.split("-").map(Number);
  const due = new Date(Date.UTC(year, month - 1, day + (rule.taxDue ? 45 : rule.days)));
  if (rule.taxDue) return new Date(Date.UTC(due.getUTCFullYear(), due.getUTCMonth() + 1, 21)).toISOString().slice(0, 10);
  return due.toISOString().slice(0, 10);
}

function budgetFinancialMonthEnd(date) {
  if (!date) return null;
  const [year, month] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
}

function budgetFinancialCents(value) { return Math.round((Number(value) || 0) * 100); }

function budgetFinancialPlan(budget, client, postedDate, account, categories) {
  const calculated = calculateBudgetRows(budget.rows || [], budget.settings || {});
  const netCents = budgetFinancialCents(budgetTotals(calculated, budget.settings || {}).net);
  const operation = categories.find((item) => item.active && normalizedMigrationText(item.name) === "operacao" && !item.parent_id);
  if (!operation) throw new Error("Cadastre a categoria principal Operação antes de lançar no financeiro.");
  const categoryFor = (name, type) => {
    const normalized = normalizedMigrationText(name);
    const category = categories.find((item) => item.active && item.parent_id === operation.id && normalizedMigrationText(item.name) === normalized && (item.category_type === type || item.category_type === "both"))
      || (normalized === "operacao" && (operation.category_type === type || operation.category_type === "both") ? operation : null);
    if (!category) throw new Error(`Cadastre a categoria ${name} dentro de Operação antes de lançar no financeiro.`);
    return category.id;
  };
  const tags = [
    normalizeFinancialTag(`${budget.code || ""} ${budget.nobiliaId || ""}`),
    normalizeFinancialTag(String(client.name || "").slice(0, 20)),
    normalizeFinancialTag(client.contact),
  ].filter(Boolean);
  const issueDate = budget.nobiliaDate || budgetFinancialLocalDate(budget.createdAt);
  const base = { status: "pending", account_id: account.id, client_id: client.id, source_type: "sale", issue_date: issueDate, competence_date: postedDate, paid_at: null };
  const payments = (budget.cashPayments || []).map((payment, index) => {
    const amount = budgetFinancialCents(parseMoney(payment.value)) / 100;
    return { key: `income-${index + 1}`, entry_type: "income", description: formatFinancialDescription(`Pagamento à Vista - Parcela ${payment.parcel || index + 1}`), amount,
      category_id: amount ? categoryFor("Receita Venda de Planejados", "income") : null, due_date: payment.dueDate || null, ...base };
  });
  const paymentCents = payments.reduce((sum, payment) => sum + budgetFinancialCents(payment.amount), 0);
  if (paymentCents !== netCents) throw new Error(`O pagamento à vista deve somar o líquido do orçamento: ${BRL.format(netCents / 100)}. Valor informado: ${BRL.format(paymentCents / 100)}.`);
  if (payments.some((payment) => payment.amount > 0 && !payment.due_date)) throw new Error("Informe o vencimento de cada parcela à vista com valor maior que zero.");
  const finalPaymentDate = payments.filter((payment) => payment.amount > 0).map((payment) => payment.due_date).sort().at(-1);
  const expenses = BUDGET_FINANCIAL_EXPENSES.map((rule) => {
    const sourceKey = rule.sourceKey || rule.key;
    const totalCents = budgetFinancialCents(calculated.reduce((sum, row) => sum + (Number(row[sourceKey]) || 0), 0));
    const amountCents = rule.splitPart === 1 ? Math.floor(totalCents / 2) : rule.splitPart === 2 ? totalCents - Math.floor(totalCents / 2) : totalCents;
    const amount = amountCents / 100;
    const dueDate = rule.assemblyDateField
      ? budget.settings?.[rule.assemblyDateField] || budgetFinancialDueDate(postedDate, rule)
      : rule.finalPaymentMonth ? budgetFinancialMonthEnd(finalPaymentDate) : budgetFinancialDueDate(postedDate, rule);
    return { key: rule.key, entry_type: "expense", description: formatFinancialDescription(rule.description), amount,
      category_id: amount ? categoryFor(rule.category, "expense") : null,
      due_date: dueDate, ...base };
  });
  return [...expenses, ...payments].map((item) => ({ ...item, notes: notesWithFinancialTags("", tags) }));
}

async function budgetFinancialEntryIds(budget) {
  return Promise.all([...BUDGET_FINANCIAL_EXPENSES.map((rule) => rule.key), "income-1", "income-2", "income-3"].map(async (key) => [key, await deterministicMigrationUuid(`crm-budget-financial:${budget.id}:${key}`)]));
}

async function fetchBudgetFinancialEntries(ids) {
  const response = await authorizedFetch(supabaseTableEndpoint("crm_financial_entries", `?id=in.(${ids.join(",")})&select=*`), () => ({ headers: supabaseHeaders() }));
  if (!response.ok) throw new Error("Não foi possível consultar os lançamentos vinculados ao orçamento.");
  return response.json();
}

async function syncBudgetFinancialEntries(budget, client, createIfMissing = false) {
  if (!remoteDatabaseEnabled() || !currentUserId()) throw new Error("O financeiro precisa estar conectado ao banco para lançar o orçamento.");
  const pairs = await budgetFinancialEntryIds(budget);
  const idByKey = new Map(pairs);
  const existing = await fetchBudgetFinancialEntries(pairs.map(([, id]) => id));
  if (!createIfMissing && !existing.length) return { created: 0, updated: 0, deleted: 0, paid: 0, linked: false };
  if (!budgetFinancialStatusAllowed(budget.status)) return { created: 0, updated: 0, deleted: 0, paid: 0, linked: true, excluded: true };
  await loadFinancialRegisters();
  const account = state.financialAccounts.find((item) => item.active && item.account_type === "bank" && normalizedMigrationText(`${item.name} ${item.institution || ""}`).includes("mercado pago"));
  if (!account) throw new Error("Cadastre e ative a conta bancária Mercado Pago antes de lançar no financeiro.");
  const postedDate = budgetFinancialLocalDate();
  const plan = budgetFinancialPlan(budget, client, postedDate, account, state.financialCategories);
  const current = new Map(existing.map((entry) => [entry.id, entry]));
  const originalAssembly = current.get(idByKey.get("assembly"));
  const plannedAssembly = plan.find((item) => item.key === "assembly");
  const legacyPaidAssembly = originalAssembly?.status === "paid"
    && !current.has(idByKey.get("assemblyFinal"))
    && budgetFinancialCents(originalAssembly.amount) !== budgetFinancialCents(plannedAssembly?.amount);
  const result = { created: 0, updated: 0, deleted: 0, paid: 0, linked: true };
  for (const item of plan) {
    if (item.key === "assemblyFinal" && legacyPaidAssembly) continue;
    const id = idByKey.get(item.key);
    const previous = current.get(id);
    if (previous?.status === "paid") { result.paid++; continue; }
    if (!item.amount) {
      if (previous) {
        const response = await authorizedFetch(supabaseTableEndpoint("crm_financial_entries", `?id=eq.${id}`), () => ({ method: "DELETE", headers: supabaseHeaders() }));
        if (!response.ok) throw new Error(`Não foi possível excluir ${item.description} do financeiro.`);
        result.deleted++;
      }
      continue;
    }
    const { key, ...payload } = item;
    if (!previous) { await postFinancialRows("crm_financial_entries", [{ id, ...payload }]); result.created++; continue; }
    const amountChanged = budgetFinancialCents(previous.amount) !== budgetFinancialCents(item.amount);
    const noteText = amountChanged ? `${financialEntryNotes(previous)}\nValor atualizado pelo orçamento ${budget.code}: ${BRL.format(Number(previous.amount))} → ${BRL.format(item.amount)} em ${postedDate}.`.trim() : financialEntryNotes(previous);
    const notes = notesWithFinancialTags(noteText, [...financialEntryTags(previous), ...financialEntryTags(item)]);
    const changes = { amount: item.amount, category_id: item.category_id, description: item.description, notes };
    if (BUDGET_FINANCIAL_EXPENSES.find((rule) => rule.key === item.key)?.syncDueDate) changes.due_date = item.due_date;
    if (!amountChanged && previous.category_id === changes.category_id && previous.description === changes.description && previous.notes === changes.notes && (!Object.hasOwn(changes, "due_date") || previous.due_date === changes.due_date)) continue;
    await saveFinancialRecord("crm_financial_entries", id, changes);
    result.updated++;
  }
  await loadFinancialRegisters();
  return result;
}

async function recoverBudgetSaveConflict(clientId, previousBudget, budgetPayload) {
  const response = await authorizedFetch(supabaseEndpoint(`?id=eq.${encodeURIComponent(clientId)}&select=user_id,data,updated_at&limit=1`), () => ({ headers: supabaseHeaders() }));
  if (!response.ok) throw new Error("Não foi possível buscar a versão mais recente do cadastro. O orçamento continua aberto com suas alterações.");
  const [row] = await response.json();
  if (!row?.data) throw new Error("O cadastro não existe mais no servidor. O orçamento continua aberto com suas alterações.");
  const remoteClient = normalizeClientBudgetStatus(normalizeClientStatus({ ...row.data, _recordUserId: row.user_id, _remoteUpdatedAt: row.updated_at }));
  const identity = budgetIdentity(budgetPayload);
  const remoteBudgets = clientBudgetHistory(remoteClient);
  const remoteBudget = remoteBudgets.find((budget) => budgetIdentity(budget) === identity);
  if (previousBudget && (!remoteBudget || remoteBudget.updatedAt !== previousBudget.updatedAt)) {
    throw new Error("Este mesmo orçamento foi alterado em outra aba, dispositivo ou por outro usuário. Suas alterações continuam abertas nesta tela; copie os dados necessários antes de decidir qual versão manter.");
  }
  if (remoteBudgets.some((budget) => budgetIdentity(budget) !== identity && normalizedBudgetCode(budget.code) === normalizedBudgetCode(budgetPayload.code))) {
    throw new Error(`A versão mais recente já possui outro orçamento com o número ${budgetPayload.code}. Suas alterações continuam abertas nesta tela.`);
  }
  const existingIndex = remoteBudgets.findIndex((budget) => budgetIdentity(budget) === identity);
  if (existingIndex >= 0) remoteBudgets[existingIndex] = budgetPayload;
  else remoteBudgets.unshift(budgetPayload);
  const mergedClient = { ...remoteClient, budget: budgetPayload, budgets: remoteBudgets };
  await saveRemoteClient(mergedClient);
  state.clients = state.clients.map((item) => item.id === clientId ? mergedClient : item);
  return true;
}

async function saveBudget(options = {}) {
  const client = selectedBudgetClient();
  if (!isAdmin()) return;
  if (!client) {
    alert("Selecione um cliente para salvar o orcamento.");
    elements.budgetClientSelect?.focus();
    return false;
  }
  const settings = readBudgetSettings();
  const rows = readBudgetRows();
  const sourceId = state.budgetSourceId;
  const budgetCode = budgetInputValue("budgetCode") || nextBudgetCode();
  const budgetStatus = configuredDocumentStatuses().includes(budgetInputValue("budgetStatus")) ? budgetInputValue("budgetStatus") : BUDGET_STATUS[0];
  const previousBudget = state.budgetEditingId ? budgetForEditing(sourceBudgetClient()) : null;
  const budgetPayload = {
    id: state.budgetEditingId || `budget-${Date.now()}`,
    code: budgetCode,
    status: budgetStatus,
    createdAt: readBudgetCreatedAt(),
    saleAt: budgetStatus === "Aprovado" ? readBudgetSaleAt() : "",
    nobiliaId: readBudgetNobiliaId(),
    nobiliaDate: readBudgetNobiliaDate(),
    settings,
    rows,
    orderMaterials: readOrderMaterialRows(),
    deliveryForecastAt: readOrderDeliveryForecastAt(),
    cashPayments: readCashPaymentRows(),
    financialLaunchedAt: options.launchFinancial ? previousBudget?.financialLaunchedAt || new Date().toISOString() : previousBudget?.financialLaunchedAt || "",
    notes: document.querySelector("#budgetNotes")?.value.trim() || "",
    updatedAt: new Date().toISOString(),
  };
  if (options.launchFinancial) {
    if (!budgetFinancialStatusAllowed(budgetStatus)) { alert("O financeiro não pode ser lançado para orçamento Novo, Recusado ou Finalizado."); return false; }
    if (!remoteDatabaseEnabled() || !currentUserId()) { alert("Conecte o CRM ao banco antes de lançar o financeiro."); return false; }
    try {
      await loadFinancialRegisters();
      const account = state.financialAccounts.find((item) => item.active && item.account_type === "bank" && normalizedMigrationText(`${item.name} ${item.institution || ""}`).includes("mercado pago"));
      if (!account) throw new Error("Cadastre e ative a conta bancária Mercado Pago antes de lançar no financeiro.");
      budgetFinancialPlan(budgetPayload, client, budgetFinancialLocalDate(), account, state.financialCategories);
    } catch (error) { alert(error.message); return false; }
  }
  if (budgetCodeExists(budgetPayload.code, budgetIdentity(budgetPayload))) {
    alert(`Ja existe um orcamento com o numero ${budgetPayload.code}. Altere o ID do orcamento antes de salvar.`);
    document.querySelector("#budgetCode")?.focus();
    return false;
  }
  state.clients = state.clients.map((item) =>
    item.id === client.id
      ? (() => {
          const budgets = clientBudgetHistory(item);
          const payloadIdentity = budgetIdentity(budgetPayload);
          const existingIndex = budgets.findIndex((budget) => budgetIdentity(budget) === payloadIdentity);
          if (existingIndex >= 0) budgets[existingIndex] = budgetPayload;
          else budgets.unshift(budgetPayload);
          return {
            ...item,
            budget: budgetPayload,
            budgets,
          };
        })()
      : sourceId && sourceId !== client.id && item.id === sourceId
      ? {
          ...item,
          budget: undefined,
          budgets: clientBudgetHistory(item).filter((budget) => budgetIdentity(budget) !== state.budgetEditingId),
        }
      : item
  );
  state.selectedId = client.id;
  const changedIds = sourceId && sourceId !== client.id ? [client.id, sourceId] : [client.id];
  const conflictRecovery = changedIds.length === 1
    ? { onConflict: () => recoverBudgetSaveConflict(client.id, previousBudget, budgetPayload) }
    : {};
  if (!(await saveClients(changedIds, conflictRecovery))) return false;
  let financialResult = null;
  let financialError = null;
  try { if (budgetPayload.financialLaunchedAt) financialResult = await syncBudgetFinancialEntries(budgetPayload, client, true); }
  catch (error) { financialError = error; }
  refreshEnvironmentCatalog(rows.map((row) => row.name));
  state.budgetEditing = false;
  state.budgetDirty = false;
  state.budgetIsNew = false;
  state.budgetSourceId = null;
  state.budgetEditingId = null;
  state.budgetDraft = null;
  render();
  if (financialError) alert(`Orçamento salvo, mas não foi possível atualizar o financeiro: ${financialError.message}. Tente salvar novamente.`);
  else if (financialResult?.paid) alert(`Orçamento salvo. ${financialResult.paid} transação(ões) paga(s)/recebida(s) não pode(m) ser alterada(s); os demais lançamentos foram atualizados.`);
  else if (financialResult?.excluded) alert("Orçamento salvo. Os lançamentos financeiros existentes foram mantidos porque este status não permite lançar no financeiro.");
  else if (options.launchFinancial) alert(`Financeiro lançado: ${financialResult.created} novo(s), ${financialResult.updated} atualizado(s) e ${financialResult.deleted} excluído(s).`);
  else if (!options.silent) alert("Orçamento salvo com sucesso.");
  return true;
}

async function deleteCurrentBudget() {
  if (!isAdmin() || !state.budgetEditingId || state.budgetIsNew) return;
  const client = sourceBudgetClient();
  if (!client) return;
  const budget = budgetForEditing(client);
  const label = budget.code || state.budgetEditingId;
  if (!confirm(`Excluir o orcamento ${label}? Esta acao nao pode ser desfeita.`)) return;

  const identity = state.budgetEditingId;
  state.clients = state.clients.map((item) => {
    if (item.id !== client.id) return item;
    const budgets = clientBudgetHistory(item).filter((savedBudget) => budgetIdentity(savedBudget) !== identity);
    return {
      ...item,
      budget: budgets[0],
      budgets,
    };
  });
  state.selectedId = client.id;
  if (!(await saveClients([client.id]))) return;
  resetBudgetEditorState();
  render();
}

function renderDetail() {
  const client = selectedClient();
  if (!client) return;
  const totals = clientTotals(client);

  document.querySelector("#detailName").textContent = client.name;
  document.querySelector("#detailStatus").textContent = client.status;
  document.querySelector("#detailStatus").className = `badge ${statusClass(client.status)}`;
  document.querySelector("#clientBudgetBtn").hidden = !isAdmin();
  document.querySelector("#detailCpf").textContent = client.cpf || "—";
  document.querySelector("#detailPhone").textContent = client.mobile || client.phone || "—";
  document.querySelector("#detailEmail").textContent = client.email || "—";
  document.querySelector("#detailFinalUse").textContent = client.finalUse || "—";
  document.querySelector("#detailCep").textContent = client.address.cep || "—";
  document.querySelector("#detailStreet").textContent = client.address.street || "—";
  document.querySelector("#detailNumber").textContent = client.address.number || "—";
  document.querySelector("#detailComplement").textContent = client.address.complement || "—";
  document.querySelector("#detailDistrict").textContent = client.address.district || "—";
  document.querySelector("#detailCityState").textContent = client.city ? `${client.city} - ${client.state}` : "—";
  document.querySelector("#detailOwner").textContent = `- ${registeredBy(client)}`;
  document.querySelector("#detailCreatedBy").textContent = registeredBy(client);
  document.querySelector("#detailSeller").textContent = responsibleSeller(client);
  document.querySelector("#detailLeadHunter").textContent = client.leadHunter || "—";
  document.querySelector("#detailDeadline").textContent = client.project.deadline || "A definir";
  document.querySelector("#detailCreated").textContent = client.project.created || "—";
  document.querySelector("#detailNotes").textContent = client.project.notes || "—";

  const tbody = document.querySelector("#detailEnvironments");
  tbody.innerHTML = "";
  client.project.environments.forEach((item) => {
    const row = document.createElement("tr");
    const finalValue = item.budget - item.factory - item.assembly;
    [item.name, BRL.format(item.budget), BRL.format(item.factory), BRL.format(item.assembly), BRL.format(finalValue)].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });
    tbody.appendChild(row);
  });

  const totalRow = document.createElement("tr");
  totalRow.className = "total-row";
  ["TOTAL", BRL.format(totals.revenue), BRL.format(totals.factory), BRL.format(totals.assembly), BRL.format(totals.profit)].forEach((value) => {
    const cell = document.createElement("td");
    cell.textContent = value;
    totalRow.appendChild(cell);
  });
  tbody.appendChild(totalRow);
}

function openClientDialog(client) {
  elements.form.reset();
  state.editingId = client ? client.id : null;
  document.querySelector("#dialogTitle").textContent = client ? "Editar Cliente" : "Novo Cliente";
  document.querySelector("#formName").value = client ? client.name : "";
  document.querySelector("#formEmail").value = client ? client.email : "";
  document.querySelector("#formPhone").value = client ? client.mobile || client.phone || "" : "";
  document.querySelector("#formCity").value = client ? client.city : "";
  document.querySelector("#formStatus").value = client ? normalizeLeadStatus(client.status) : DEFAULT_STATUS;
  document.querySelector("#formActive").value = client ? normalizeClientActive(client.active, client.status) : "SIM";
  document.querySelector("#formFinalUse").value = client ? client.finalUse || "" : "";
  document.querySelector("#formLeadHunter").value = client ? client.leadHunter || "" : "";
  document.querySelector("#formCreated").value = client ? client.project.created || "" : registrationDateTime();
  document.querySelector("#formCreatedBy").value = client ? registeredBy(client) : currentUserName();
  state.clientDialogDirty = false;
  elements.dialog.showModal();
}

function createEnvironmentRow(environment = { name: "", budget: 0, factory: 0, assembly: 0 }) {
  const row = document.createElement("tr");

  const environmentCell = document.createElement("td");
  const environmentSelect = createEnvironmentSelect(environment.name);
  const customEnvironmentInput = document.createElement("input");
  customEnvironmentInput.className = "environment-custom-input";
  customEnvironmentInput.placeholder = "Digite o novo ambiente";
  customEnvironmentInput.hidden = true;

  environmentSelect.addEventListener("change", () => {
    const creatingNewEnvironment = environmentSelect.value === "__new__";
    customEnvironmentInput.hidden = !creatingNewEnvironment;
    if (creatingNewEnvironment) {
      customEnvironmentInput.focus();
    }
  });

  environmentSelect.addEventListener("focus", () => {
    if (!environmentSelect.value) focusAndOpenSelect(environmentSelect);
  });

  customEnvironmentInput.addEventListener("blur", () => {
    const normalized = registerEnvironmentName(customEnvironmentInput.value);
    if (!normalized) return;
    addEnvironmentOptionToSelect(environmentSelect, normalized);
    environmentSelect.value = normalized;
    customEnvironmentInput.hidden = true;
  });

  customEnvironmentInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const normalized = registerEnvironmentName(customEnvironmentInput.value);
    if (!normalized) return;
    addEnvironmentOptionToSelect(environmentSelect, normalized);
    environmentSelect.value = normalized;
    customEnvironmentInput.hidden = true;
  });

  environmentCell.append(environmentSelect, customEnvironmentInput);
  row.appendChild(environmentCell);

  const inputs = {};

  [
    ["budget", environment.budget],
    ["factory", environment.factory ?? suggestedFactoryValue(environment.budget)],
    ["assembly", environment.assembly ?? suggestedAssemblyValue(environment.budget)],
  ].forEach(([key, value]) => {
    const cell = document.createElement("td");
    const input = document.createElement("input");
    input.dataset.field = key;
    input.className = "money-input";
    input.inputMode = "decimal";
    input.type = "text";
    input.value = formatMoneyInput(value);
    input.addEventListener("focus", () => {
      input.value = String(parseMoney(input.value)).replace(".", ",");
      input.select();
    });
    input.addEventListener("blur", () => {
      input.value = formatMoneyInput(input.value);
    });
    cell.appendChild(input);
    row.appendChild(cell);
    inputs[key] = input;
  });

  inputs.factory.dataset.autoValue = String(suggestedFactoryValue(inputs.budget.value));
  inputs.assembly.dataset.autoValue = String(suggestedAssemblyValue(inputs.budget.value));

  inputs.factory.addEventListener("input", () => {
    inputs.factory.dataset.manual = "true";
  });

  inputs.assembly.addEventListener("input", () => {
    inputs.assembly.dataset.manual = "true";
  });

  ["input", "change", "blur"].forEach((eventName) => {
    inputs.budget.addEventListener(eventName, () => updateSuggestedProjectCosts(inputs));
  });

  const actionCell = document.createElement("td");
  const removeButton = document.createElement("button");
  removeButton.className = "link-button danger";
  removeButton.type = "button";
  removeButton.textContent = "Remover";
  removeButton.addEventListener("click", () => {
    if (elements.projectRows.children.length > 1) {
      row.remove();
      markProjectDirty();
    }
  });
  actionCell.appendChild(removeButton);
  row.appendChild(actionCell);

  return row;
}

function blankClient(status = DEFAULT_STATUS) {
  return {
    id: createId(),
    _recordUserId: currentUserId(),
    name: "",
    email: "",
    phone: "",
    mobile: "",
    contact: "",
    personType: "Física",
    finalUse: "",
    leadHunter: "",
    city: "",
    state: "",
    status,
    active: "SIM",
    createdBy: currentUserName(),
    owner: currentUserName(),
    cpf: "",
    address: { cep: "", street: "", number: "", complement: "", district: "" },
    project: {
      deadline: "",
      created: registrationDateTime(),
      notes: "",
      environments: [],
    },
  };
}

function setClientInlineEditing(editing) {
  state.projectInlineEditing = editing;
  elements.clientsHeader.hidden = editing;
  elements.clientsDashboardFilters.hidden = editing;
  elements.clientsDashboardStats.hidden = editing;
  elements.clientsListCard.hidden = editing;
  elements.clientInlineEditor.hidden = !editing;
}

function closeProjectForm() {
  if (!confirmDiscardProjectChanges()) return false;
  state.projectDirty = false;
  if (state.projectInlineEditing) {
    setClientInlineEditing(false);
    state.projectAction = "stay";
    renderClients();
    return true;
  }
  elements.projectDialog.close();
  return true;
}

function mountProjectForm(inline = false) {
  if (inline) {
    elements.clientInlineEditor.appendChild(elements.projectForm);
    elements.projectForm.classList.add("inline-client-form");
    setClientInlineEditing(true);
    return;
  }

  elements.projectDialog.appendChild(elements.projectForm);
  elements.projectForm.classList.remove("inline-client-form");
  setClientInlineEditing(false);
}

function openProjectDialog(client = selectedClient(), options = {}) {
  const isNew = !client;
  const editingProject = state.view === "projects";
  const inline = Boolean(options.inline);
  state.selectedId = client ? client.id : null;
  state.projectAction = "stay";
  state.projectReturnView = ["projects", "budget", "order"].includes(state.view) ? state.view : "clients";
  const editableClient = client || blankClient(["budget", "order"].includes(state.projectReturnView) ? BUDGET_CLIENT_STATUS : DEFAULT_STATUS);
  mountProjectForm(inline);

  document.querySelector("#projectForm").reset();
  document.querySelector("#projectForm h2").textContent = isNew
    ? editingProject ? "Novo Projeto" : "Novo Cliente"
    : editingProject ? "Cadastro Projeto" : "Cadastro Cliente";
  document.querySelector("#deleteProjectBtn").hidden = isNew;
  document.querySelector("#editName").value = editableClient.name || "";
  document.querySelector("#editPersonType").value = editableClient.personType || "Física";
  document.querySelector("#editCpf").value = editableClient.cpf || "";
  document.querySelector("#editContact").value = editableClient.contact || "";
  document.querySelector("#editMobile").value = editableClient.mobile || "";
  document.querySelector("#editEmail").value = editableClient.email || "";
  document.querySelector("#editStatus").value = normalizeLeadStatus(editableClient.status || DEFAULT_STATUS);
  document.querySelector("#editActive").value = normalizeClientActive(editableClient.active, editableClient.status);
  document.querySelector("#editFinalUse").value = editableClient.finalUse || "";
  document.querySelector("#editLeadHunter").value = editableClient.leadHunter || "";
  document.querySelector("#editOwner").value = editableClient.owner || "";
  document.querySelector("#editCep").value = editableClient.address.cep || "";
  document.querySelector("#editState").value = editableClient.state || "";
  document.querySelector("#editStreet").value = editableClient.address.street || "";
  document.querySelector("#editNumber").value = editableClient.address.number || "";
  document.querySelector("#editComplement").value = editableClient.address.complement || "";
  document.querySelector("#editDistrict").value = editableClient.address.district || "";
  document.querySelector("#editCity").value = editableClient.city || "";
  document.querySelector("#projectDeadline").value = editableClient.project.deadline || "";
  document.querySelector("#projectCreatedBy").value = registeredBy(editableClient);
  document.querySelector("#projectCreated").value = editableClient.project.created || registrationDateTime();
  document.querySelector("#projectNotes").value = editableClient.project.notes || "";

  elements.projectRows.innerHTML = "";
  const environments = editableClient.project.environments.length
    ? editableClient.project.environments
    : [{ name: "", budget: 0, factory: 0, assembly: 0 }];
  environments.forEach((environment) => elements.projectRows.appendChild(createEnvironmentRow(environment)));

  state.projectDirty = false;
  if (!inline) elements.projectDialog.showModal();
}

function readProjectEnvironmentRows() {
  return Array.from(elements.projectRows.querySelectorAll("tr"))
    .map((row) => {
      const input = (name) => row.querySelector(`[data-field="${name}"]`);
      const field = (name) => input(name).value.trim();
      const select = row.querySelector('[data-field="name"]');
      const customInput = row.querySelector(".environment-custom-input");
      const rawName = select.value === "__new__" ? customInput.value : select.value;
      const name = registerEnvironmentName(rawName);
      const budget = parseMoney(field("budget"));
      const factoryInput = input("factory");
      const assemblyInput = input("assembly");
      const factory = shouldAutoCalculateCost(factoryInput) ? suggestedFactoryValue(budget) : parseMoney(factoryInput.value);
      const assembly = shouldAutoCalculateCost(assemblyInput) ? suggestedAssemblyValue(budget) : parseMoney(assemblyInput.value);
      if (name) {
        addEnvironmentOptionToSelect(select, name);
        select.value = name;
      }
      customInput.hidden = true;
      return {
        name,
        budget,
        factory,
        assembly,
      };
    })
    .filter((environment) => environment.name || environment.budget || environment.factory || environment.assembly);
}

async function saveProjectFromDialog(event) {
  event.preventDefault();
  const client = selectedClient();
  if (!client) return;

  const name = document.querySelector("#editName").value.trim();
  if (!name) return;

  const environments = readProjectEnvironmentRows();

  state.clients = state.clients.map((item) => {
    if (item.id !== client.id) return item;
    return {
      ...item,
      name,
      cpf: document.querySelector("#editCpf").value.trim(),
      phone: item.phone || "",
      email: document.querySelector("#editEmail").value.trim(),
      status: document.querySelector("#editStatus").value,
      finalUse: document.querySelector("#editFinalUse").value,
      leadHunter: document.querySelector("#editLeadHunter").value.trim(),
      owner: document.querySelector("#editOwner").value.trim() || currentUserName(),
      createdBy: item.createdBy || registeredBy(item),
      city: document.querySelector("#editCity").value.trim(),
      state: document.querySelector("#editState").value.trim(),
      address: {
        cep: document.querySelector("#editCep").value.trim(),
        street: document.querySelector("#editStreet").value.trim(),
        number: document.querySelector("#editNumber").value.trim(),
        complement: document.querySelector("#editComplement").value.trim(),
        district: document.querySelector("#editDistrict").value.trim(),
      },
      project: {
        ...item.project,
        deadline: document.querySelector("#projectDeadline").value.trim(),
        created: document.querySelector("#projectCreated").value.trim(),
        notes: document.querySelector("#projectNotes").value.trim(),
        environments,
      },
    };
  });

  if (!(await saveClients())) return;
  refreshEnvironmentCatalog(environments.map((environment) => environment.name));
  elements.projectDialog.close();
  render();
}

async function saveProjectFromDialog(event) {
  event.preventDefault();
  const client = state.selectedId ? state.clients.find((item) => item.id === state.selectedId) : null;
  const isNew = !client;
  const budgetClientRegistration = isNew && ["budget", "order"].includes(state.projectReturnView);
  const baseClient = client || blankClient(budgetClientRegistration ? BUDGET_CLIENT_STATUS : DEFAULT_STATUS);
  const name = document.querySelector("#editName").value.trim();
  if (!name) return;

  const environments = readProjectEnvironmentRows();
  const savedClient = {
    ...baseClient,
    name,
    personType: document.querySelector("#editPersonType").value,
    contact: document.querySelector("#editContact").value.trim(),
    cpf: document.querySelector("#editCpf").value.trim(),
    mobile: document.querySelector("#editMobile").value.trim(),
    email: document.querySelector("#editEmail").value.trim(),
    status: budgetClientRegistration ? BUDGET_CLIENT_STATUS : document.querySelector("#editStatus").value,
    active: normalizeClientActive(
      document.querySelector("#editActive").value,
      budgetClientRegistration ? BUDGET_CLIENT_STATUS : document.querySelector("#editStatus").value
    ),
    finalUse: document.querySelector("#editFinalUse").value,
    leadHunter: document.querySelector("#editLeadHunter").value.trim(),
    owner: document.querySelector("#editOwner").value.trim() || currentUserName(),
    createdBy: baseClient.createdBy || registeredBy(baseClient),
    city: document.querySelector("#editCity").value.trim(),
    state: document.querySelector("#editState").value.trim(),
    address: {
      cep: document.querySelector("#editCep").value.trim(),
      street: document.querySelector("#editStreet").value.trim(),
      number: document.querySelector("#editNumber").value.trim(),
      complement: document.querySelector("#editComplement").value.trim(),
      district: document.querySelector("#editDistrict").value.trim(),
    },
    project: {
      ...baseClient.project,
      deadline: document.querySelector("#projectDeadline").value.trim(),
      created: document.querySelector("#projectCreated").value.trim() || registrationDateTime(),
      notes: document.querySelector("#projectNotes").value.trim(),
      environments,
    },
  };

  if (isNew) {
    state.clients.unshift(savedClient);
  } else {
    state.clients = state.clients.map((item) => (item.id === savedClient.id ? savedClient : item));
  }

  state.selectedId = savedClient.id;
  if (!(await saveClients([savedClient.id]))) return;
  refreshEnvironmentCatalog(environments.map((environment) => environment.name));
  state.projectDirty = false;
  render();

  if (["budget", "order"].includes(state.projectReturnView) && state.budgetEditing && state.budgetDraft) {
    const budgetPayload = {
      ...state.budgetDraft,
      id: budgetIdentity(state.budgetDraft) || `budget-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    const payloadIdentity = budgetIdentity(budgetPayload);
    if (budgetCodeExists(budgetPayload.code, payloadIdentity)) {
      alert(`Ja existe um orcamento com o numero ${budgetPayload.code}. Altere o ID do orcamento antes de salvar.`);
      return;
    }
    state.clients = state.clients.map((item) => {
      if (item.id !== savedClient.id) return item;
      const budgets = clientBudgetHistory(item);
      const existingIndex = budgets.findIndex((budget) => budgetIdentity(budget) === payloadIdentity);
      if (existingIndex >= 0) budgets[existingIndex] = budgetPayload;
      else budgets.unshift(budgetPayload);
      return {
        ...item,
        budget: budgetPayload,
        budgets,
      };
    });
    if (!(await saveClients([savedClient.id]))) return;
    state.budgetEditingId = payloadIdentity;
    state.budgetSourceId = savedClient.id;
    state.budgetDirty = false;
    state.budgetIsNew = false;
    state.budgetDraft = null;
    closeProjectForm();
    state.view = state.projectReturnView || "budget";
    renderBudget();
    state.projectAction = "stay";
    return;
  }

  if (isNew) {
    document.querySelector("#projectForm h2").textContent = state.projectReturnView === "projects" ? "Cadastro Projeto" : "Cadastro Cliente";
    document.querySelector("#deleteProjectBtn").hidden = false;
  }

  if (state.projectAction === "new") {
    openProjectDialog(null, { inline: state.projectInlineEditing });
    return;
  }

  if (state.projectAction === "close") {
    closeProjectForm();
    if (!state.projectInlineEditing) showView(state.projectReturnView || "clients");
  }

  state.projectAction = "stay";
}

async function saveClientFromDialog(event) {
  event.preventDefault();
  const name = document.querySelector("#formName").value.trim();

  if (!name) return;

  if (state.editingId) {
    state.clients = state.clients.map((client) => {
      if (client.id !== state.editingId) return client;
      return {
        ...client,
        name,
        email: document.querySelector("#formEmail").value.trim(),
        phone: client.phone || "",
        mobile: document.querySelector("#formPhone").value.trim(),
        city: document.querySelector("#formCity").value.trim(),
        status: document.querySelector("#formStatus").value,
        active: normalizeClientActive(document.querySelector("#formActive").value, document.querySelector("#formStatus").value),
        finalUse: document.querySelector("#formFinalUse").value,
        leadHunter: document.querySelector("#formLeadHunter").value.trim(),
        createdBy: client.createdBy || document.querySelector("#formCreatedBy").value.trim() || currentUserName(),
        project: {
          ...client.project,
          created: client.project.created || document.querySelector("#formCreated").value.trim() || registrationDateTime(),
        },
      };
    });
    if (!(await saveClients([state.editingId]))) return;
    state.clientDialogDirty = false;
    elements.dialog.close();
    render();
    return;
  }

  const client = {
    id: createId(),
    _recordUserId: currentUserId(),
    name,
    email: document.querySelector("#formEmail").value.trim(),
    phone: "",
    mobile: document.querySelector("#formPhone").value.trim(),
    city: document.querySelector("#formCity").value.trim(),
    state: "",
    status: document.querySelector("#formStatus").value,
    active: normalizeClientActive(document.querySelector("#formActive").value, document.querySelector("#formStatus").value),
    finalUse: document.querySelector("#formFinalUse").value,
    leadHunter: document.querySelector("#formLeadHunter").value.trim(),
    createdBy: document.querySelector("#formCreatedBy").value.trim() || currentUserName(),
    owner: currentUserName(),
    cpf: "",
    address: { cep: "", street: "", number: "", complement: "", district: "" },
    project: {
      deadline: "",
      created: document.querySelector("#formCreated").value.trim() || registrationDateTime(),
      notes: "",
      environments: [],
    },
  };

  state.clients.unshift(client);
  state.selectedId = client.id;
  if (!(await saveClients([client.id]))) return;
  state.clientDialogDirty = false;
  elements.dialog.close();
  openClientRegistration(client.id, "clients");
}

function exportCsv() {
  const rows = [["Nome", "Email", "Telefone", "Cidade", "Status", "Ativo", "Faturamento", "Lucro"]];
  state.clients.forEach((client) => {
    const totals = clientTotals(client);
    rows.push([client.name, client.email, client.mobile || client.phone, client.city, client.status, normalizeClientActive(client.active, client.status), totals.revenue, totals.profit]);
  });

  const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(";")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "crm-cabana-clientes.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function backupFileName() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `crm-cabana-backup-${timestamp}.zip`;
}

function setBackupStatus(message = "") {
  if (elements.backupStatus) elements.backupStatus.textContent = message;
}

async function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function fetchSiteBackupFile(path, type = "text") {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  if (type === "dataUrl") {
    const blob = await response.blob();
    return {
      path,
      type,
      contentType: blob.type || "application/octet-stream",
      content: await blobToDataUrl(blob),
    };
  }

  return {
    path,
    type,
    contentType: response.headers.get("content-type") || "text/plain",
    content: await response.text(),
  };
}

async function collectSiteBackupFiles() {
  const files = [
    ["../index.html", "text"],
    ["../institucional.css", "text"],
    ["../CNAME", "text"],
    ["../assets/cabana-logo.png", "dataUrl"],
    ["../assets/assinatura-final-cabana.png", "dataUrl"],
    ["../assets/cozinha-planejada.svg", "text"],
    ["index.html", "text"],
    ["styles.css", "text"],
    ["app.js", "text"],
    ["config.js", "text"],
    ["assets/cabana-logo.png", "dataUrl"],
    ["assets/assinatura-final-cabana.png", "dataUrl"],
    ["assets/cozinha-planejada.svg", "text"],
    ["../supabase-schema.sql", "text"],
    ["../supabase-financeiro.sql", "text"],
  ];

  const results = [];
  for (const [path, type] of files) {
    setBackupStatus(`Copiando arquivo ${results.length + 1} de ${files.length}: ${path}`);
    try { results.push(await fetchSiteBackupFile(path, type)); }
    catch (error) { throw new Error(`Nao foi possivel copiar ${path}: ${error.message || "erro desconhecido"}`); }
  }
  return results;
}

const BACKUP_TABLES = [
  { name: CONFIG.clientsTable || "crm_clients", key: "id" },
  { name: CONFIG.profilesTable || "crm_profiles", key: "id" },
  { name: "crm_audit_logs", key: "id" },
  { name: "crm_budget_statuses", key: "name" },
  { name: "crm_financial_accounts", key: "id" },
  { name: "crm_financial_categories", key: "id" },
  { name: "crm_financial_cost_centers", key: "id" },
  { name: "crm_financial_entries", key: "id" },
  { name: "crm_financial_statement_imports", key: "id" },
  { name: "crm_financial_statement_items", key: "id" },
  { name: "crm_financial_reconciliations", key: "id" },
  { name: "crm_financial_budgets", key: "id" },
];

function backupResponseCount(response, table) {
  const count = response.headers.get("content-range")?.match(/\/(\d+)$/);
  if (!count) throw new Error(`Nao foi possivel confirmar a quantidade de registros de ${table}.`);
  return Number(count[1]);
}

async function fetchSupabaseTableBackup({ name: table, key }) {
  if (!remoteDatabaseEnabled() || !currentUserId()) throw new Error("Banco remoto nao configurado.");

  const rows = [];
  const pageSize = 1000;
  let cursor = null;
  let expectedCount = null;

  while (true) {
    const query = new URLSearchParams({ select: "*", order: `${key}.asc`, limit: String(pageSize) });
    if (cursor !== null) query.set(key, `gt.${cursor}`);
    const response = await authorizedFetch(supabaseTableEndpoint(table, `?${query}`), () => ({
      headers: supabaseHeaders(expectedCount === null ? "count=exact" : "return=minimal"),
    }));
    if (!response.ok) {
      const details = await response.json().catch(() => null);
      throw new Error(`Nao foi possivel ler ${table}: ${details?.message || `HTTP ${response.status}`}`);
    }
    if (expectedCount === null) expectedCount = backupResponseCount(response, table);
    const page = await response.json();
    if (!Array.isArray(page)) throw new Error(`Resposta invalida da tabela ${table}.`);
    if (page.some((row) => row[key] == null)) throw new Error(`Chave ${key} ausente em ${table}.`);
    rows.push(...page);
    if (page.length < pageSize) break;
    const nextCursor = String(page.at(-1)[key]);
    if (nextCursor === cursor) throw new Error(`Paginacao interrompida em ${table}.`);
    cursor = nextCursor;
    setBackupStatus(`Copiando ${table}: ${rows.length} de ${expectedCount} registros`);
  }

  const countQuery = new URLSearchParams({ select: key, limit: "1" });
  const countResponse = await authorizedFetch(supabaseTableEndpoint(table, `?${countQuery}`), () => ({ headers: supabaseHeaders("count=exact") }));
  if (!countResponse.ok) throw new Error(`Nao foi possivel validar a tabela ${table}.`);
  const finalCount = backupResponseCount(countResponse, table);
  if (rows.length !== expectedCount || rows.length !== finalCount) throw new Error(`A tabela ${table} mudou durante o backup (${rows.length}/${expectedCount}/${finalCount}). Tente novamente.`);
  return { table, count: rows.length, sha256: await sha256(JSON.stringify(rows)), rows };
}

async function collectDatabaseBackup() {
  const results = [];
  for (const table of BACKUP_TABLES) {
    setBackupStatus(`Copiando tabela ${results.length + 1} de ${BACKUP_TABLES.length}: ${table.name}`);
    results.push(await fetchSupabaseTableBackup(table));
  }
  return results;
}

function backupTableColumns(rows) {
  const columns = [];
  const seen = new Set();
  for (const row of rows) for (const column of Object.keys(row)) {
    if (!seen.has(column)) { seen.add(column); columns.push(column); }
  }
  return columns;
}

function backupXmlText(value) {
  const text = value == null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
  // Excel limita cada celula a 32.767 caracteres; o JSON no ZIP permanece integral.
  const visible = text.length > 32767 ? `${text.slice(0, 32720)}... [TRUNCADO; VER BACKUP-COMPLETO.JSON]` : text;
  return visible.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, " ").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function backupExcelColumn(index) {
  let number = index + 1;
  let name = "";
  while (number > 0) { number -= 1; name = String.fromCharCode(65 + number % 26) + name; number = Math.floor(number / 26); }
  return name;
}

function backupZipBytes(file) {
  if (file.type !== "dataUrl") return new TextEncoder().encode(file.content);
  const base64 = file.content.split(",", 2)[1];
  if (!base64) throw new Error(`Imagem invalida no backup: ${file.path}`);
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
}

const BACKUP_ZIP_CRC_TABLE = Uint32Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});

function backupZipCrc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = BACKUP_ZIP_CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function backupZipBlob(files, mimeType = "application/zip") {
  if (files.length > 65535) throw new Error("O backup possui arquivos demais para um ZIP comum.");
  const encoder = new TextEncoder();
  const parts = [];
  const directory = [];
  const now = new Date();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const dosDate = ((Math.max(1980, now.getFullYear()) - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  let offset = 0;
  for (const file of files) {
    const name = encoder.encode(file.name);
    const bytes = file.bytes instanceof Uint8Array ? file.bytes : encoder.encode(file.content);
    if (name.length > 65535 || bytes.length > 0xffffffff || offset > 0xffffffff) throw new Error("O backup excede o limite do formato ZIP comum.");
    const crc = backupZipCrc32(bytes);
    const local = new Uint8Array(30 + name.length);
    const localView = new DataView(local.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0x0800, true);
    localView.setUint16(10, dosTime, true);
    localView.setUint16(12, dosDate, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, bytes.length, true);
    localView.setUint32(22, bytes.length, true);
    localView.setUint16(26, name.length, true);
    local.set(name, 30);
    parts.push(local, bytes);

    const central = new Uint8Array(46 + name.length);
    const centralView = new DataView(central.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0x0800, true);
    centralView.setUint16(12, dosTime, true);
    centralView.setUint16(14, dosDate, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, bytes.length, true);
    centralView.setUint32(24, bytes.length, true);
    centralView.setUint16(28, name.length, true);
    centralView.setUint32(42, offset, true);
    central.set(name, 46);
    directory.push(central);
    offset += local.length + bytes.length;
  }
  const directorySize = directory.reduce((size, entry) => size + entry.length, 0);
  if (offset + directorySize > 0xffffffff) throw new Error("O backup excede o limite do formato ZIP comum.");
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, directorySize, true);
  endView.setUint32(16, offset, true);
  return new Blob([...parts, ...directory, end], { type: mimeType });
}

function backupTableWorkbook({ table, rows, columns: columnOrder = null, numericColumns = [] }) {
  const columns = columnOrder || backupTableColumns(rows);
  const numbers = new Set(numericColumns);
  if (rows.length >= 1048576) throw new Error(`A tabela ${table} excede o limite de linhas do Excel. O backup nao foi salvo.`);
  if (columns.length > 16384) throw new Error(`A tabela ${table} excede o limite de colunas do Excel. O backup nao foi salvo.`);
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  const mainNs = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
  const cell = (column, row, value, header = false) => {
    const reference = `${backupExcelColumn(column)}${row}`;
    if (!header && numbers.has(columns[column]) && typeof value === "number" && Number.isFinite(value)) return `<c r="${reference}" s="2"><v>${value}</v></c>`;
    return `<c r="${reference}" t="inlineStr"${header ? ' s="1"' : ""}><is><t xml:space="preserve">${backupXmlText(value)}</t></is></c>`;
  };
  const sheetRows = [];
  if (columns.length) sheetRows.push(`<row r="1">${columns.map((column, index) => cell(index, 1, column, true)).join("")}</row>`);
  rows.forEach((record, index) => sheetRows.push(`<row r="${index + 2}">${columns.map((column, columnIndex) => cell(columnIndex, index + 2, record[column])).join("")}</row>`));
  const sheet = `${xmlHeader}<worksheet xmlns="${mainNs}"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetData>${sheetRows.join("")}</sheetData>${columns.length ? `<autoFilter ref="A1:${backupExcelColumn(columns.length - 1)}${rows.length + 1}"/>` : ""}</worksheet>`;
  const workbook = `${xmlHeader}<workbook xmlns="${mainNs}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Dados" sheetId="1" r:id="rId1"/></sheets></workbook>`;
  const relationships = `${xmlHeader}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;
  const rootRelationships = `${xmlHeader}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
  const styles = `${xmlHeader}<styleSheet xmlns="${mainNs}"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="1"><fill><patternFill patternType="none"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="4" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs></styleSheet>`;
  const contentTypes = `${xmlHeader}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`;
  return backupZipBlob([
    { name: "[Content_Types].xml", content: contentTypes },
    { name: "_rels/.rels", content: rootRelationships },
    { name: "xl/workbook.xml", content: workbook },
    { name: "xl/_rels/workbook.xml.rels", content: relationships },
    { name: "xl/styles.xml", content: styles },
    { name: "xl/worksheets/sheet1.xml", content: sheet },
  ], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
}

const REPORT_COLUMNS = {
  clients: ["ID", "Cliente", "Pessoa", "CPF/CNPJ", "E-mail", "Telefone", "Celular", "Contato", "Status", "Ativo", "Responsável", "Origem", "Cidade", "UF", "CEP", "Rua", "Número", "Complemento", "Bairro", "Uso final", "Cadastro"],
  budgets: ["Código", "ID Nobilia", "Cliente", "ID cliente", "Status", "Responsável", "Criação", "Atualização", "Venda", "Previsão de entrega", "Valor bruto (R$)", "Fábrica + frete (R$)", "Custo (R$)", "Líquido (R$)", "Lucro (R$)", "Margem (%)", "Ambientes", "Observações"],
  transactions: ["Data", "Emissão", "Competência", "Vencimento", "Pagamento", "Situação", "Tipo", "Descrição", "Categoria", "Conta", "Conta destino", "Cliente", "Tags", "Valor (R$)", "Entrada (R$)", "Saída (R$)", "Movimento (R$)", "Acumulado filtrado (R$)", "Observações", "ID"],
};

const REPORT_NUMERIC_COLUMNS = {
  clients: [],
  budgets: ["Valor bruto (R$)", "Fábrica + frete (R$)", "Custo (R$)", "Líquido (R$)", "Lucro (R$)", "Margem (%)"],
  transactions: ["Valor (R$)", "Entrada (R$)", "Saída (R$)", "Movimento (R$)", "Acumulado filtrado (R$)"],
};

const REPORT_DATE_FIELDS = {
  clients: [["created", "Data do cadastro"]],
  budgets: [["created", "Data de criação"], ["updated", "Última atualização"], ["sale", "Data da venda"]],
  transactions: [["effective", "Data da transação"], ["issue", "Data de emissão"], ["competence", "Competência"], ["due", "Vencimento"], ["paid", "Data do pagamento"]],
};

function reportSelectOptions(select, options, fallbackLabel) {
  const selected = select.value;
  select.replaceChildren(new Option(fallbackLabel, ""), ...options.map(([value, label]) => new Option(label, value)));
  select.value = options.some(([value]) => value === selected) ? selected : "";
}

function renderReportsView() {
  const kind = document.querySelector("#reportsKind")?.value || "clients";
  const dateField = document.querySelector("#reportsDateField");
  if (!dateField) return;
  const previousDate = dateField.value;
  dateField.replaceChildren(...REPORT_DATE_FIELDS[kind].map(([value, label]) => new Option(label, value)));
  dateField.value = REPORT_DATE_FIELDS[kind].some(([value]) => value === previousDate) ? previousDate : REPORT_DATE_FIELDS[kind][0][0];
  reportSelectOptions(document.querySelector("#reportsClient"), [...state.clients].sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "pt-BR")).map((client) => [client.id, client.name || client.id]), "Todos os clientes");
  const statuses = kind === "clients" ? STATUS.filter((status) => status !== "Todos") : kind === "budgets" ? BUDGET_STATUS : ["pending", "paid", "overdue", "cancelled"];
  reportSelectOptions(document.querySelector("#reportsStatus"), [...new Set(statuses.filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR")).map((value) => [value, kind === "transactions" ? ({ pending: "Pendente", paid: "Pago", overdue: "Vencido", cancelled: "Cancelado" }[value] || value) : value]), "Todos os status");
  reportSelectOptions(document.querySelector("#reportsAccount"), state.financialAccounts.map((account) => [account.id, account.name]), "Todas as contas");
  document.querySelector("#reportsAccountField").hidden = kind !== "transactions";
  document.querySelector("#reportsTypeField").hidden = kind !== "transactions";
  document.querySelector("#reportsHint").textContent = kind === "transactions" ? "Entradas, saídas e acumulado consideram somente os registros filtrados; transferências entre contas têm efeito líquido zero sem filtro de conta." : "Sem datas, o relatório inclui todo o histórico disponível.";
}

function reportDateKey(value) {
  if (!value) return "";
  const text = String(value).trim();
  const iso = text.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];
  const br = text.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;
  const timestamp = parseSortableDate(text);
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function reportDateMatches(value, filters) {
  const date = reportDateKey(value);
  return (!filters.startDate || Boolean(date && date >= filters.startDate)) && (!filters.endDate || Boolean(date && date <= filters.endDate));
}

function reportTextMatches(values, search) {
  return !search || values.some((value) => String(value || "").toLocaleLowerCase("pt-BR").includes(search));
}

function reportFilters() {
  return {
    kind: document.querySelector("#reportsKind").value,
    dateField: document.querySelector("#reportsDateField").value,
    startDate: document.querySelector("#reportsStartDate").value,
    endDate: document.querySelector("#reportsEndDate").value,
    clientId: document.querySelector("#reportsClient").value,
    status: document.querySelector("#reportsStatus").value,
    accountId: document.querySelector("#reportsAccount").value,
    type: document.querySelector("#reportsType").value,
    search: document.querySelector("#reportsSearch").value.trim().toLocaleLowerCase("pt-BR"),
  };
}

async function reportClientsFromDatabase() {
  if (!remoteDatabaseEnabled() || !currentUserId()) return state.clients;
  const records = await fetchSupabaseTableBackup({ name: CONFIG.clientsTable || "crm_clients", key: "id" });
  const clients = normalizeClients(records.rows.filter((row) => row.data && row.data.project && row.data.address).map((row) => ({ ...row.data, _recordUserId: row.user_id, _remoteUpdatedAt: row.updated_at })));
  const byId = new Map(clients.map((client) => [client.id, client]));
  const pending = new Set(loadPendingSyncIds());
  for (const client of state.clients) if (pending.has(client.id)) byId.set(client.id, client);
  return [...byId.values()];
}

function reportClientRows(clients, filters) {
  return clients.filter((client) => {
    const created = client.createdAt || client.project?.created || client.updatedAt;
    return (!filters.clientId || client.id === filters.clientId) && (!filters.status || normalizeLeadStatus(client.status) === filters.status) && reportDateMatches(created, filters) && reportTextMatches([client.id, client.name, client.email, client.phone, client.mobile, client.cpf, client.city], filters.search);
  }).sort((a, b) => reportDateKey(a.createdAt || a.project?.created || a.updatedAt).localeCompare(reportDateKey(b.createdAt || b.project?.created || b.updatedAt))).map((client) => ({
    "ID": client.id, "Cliente": client.name, "Pessoa": client.personType, "CPF/CNPJ": client.cpf, "E-mail": client.email, "Telefone": client.phone, "Celular": client.mobile, "Contato": client.contact,
    "Status": normalizeLeadStatus(client.status), "Ativo": normalizeClientActive(client.active, client.status), "Responsável": responsibleSeller(client), "Origem": client.leadHunter,
    "Cidade": client.city, "UF": client.state, "CEP": client.address?.cep, "Rua": client.address?.street, "Número": client.address?.number, "Complemento": client.address?.complement, "Bairro": client.address?.district,
    "Uso final": client.finalUse, "Cadastro": reportDateKey(client.createdAt || client.project?.created || client.updatedAt),
  }));
}

function reportBudgetRows(clients, filters) {
  return clients.flatMap((client) => clientBudgetHistory(client).map((budget) => ({ client, budget }))).filter(({ client, budget }) => {
    const date = filters.dateField === "sale" ? budget.saleAt : filters.dateField === "updated" ? budget.updatedAt : budget.createdAt;
    return (!filters.clientId || client.id === filters.clientId) && (!filters.status || budget.status === filters.status) && reportDateMatches(date, filters) && reportTextMatches([client.name, client.id, budget.code, budget.nobiliaId, budget.status, responsibleSeller(client)], filters.search);
  }).sort((a, b) => reportDateKey(a.budget.createdAt).localeCompare(reportDateKey(b.budget.createdAt))).map(({ client, budget }) => {
    const totals = budgetSummary(budget);
    return { "Código": formatBudgetCodeForList(budget.code), "ID Nobilia": budget.nobiliaId, "Cliente": client.name, "ID cliente": client.id, "Status": budget.status, "Responsável": responsibleSeller(client),
      "Criação": reportDateKey(budget.createdAt), "Atualização": reportDateKey(budget.updatedAt), "Venda": reportDateKey(budget.saleAt), "Previsão de entrega": reportDateKey(budget.deliveryForecastAt),
      "Valor bruto (R$)": Number(totals.gross) || 0, "Fábrica + frete (R$)": Number(totals.factoryFreight) || 0, "Custo (R$)": Number(totals.cost) || 0, "Líquido (R$)": Number(totals.net) || 0, "Lucro (R$)": Number(totals.profit) || 0,
      "Margem (%)": (Number(totals.margin) || 0) * 100, "Ambientes": (budget.rows || []).map((row) => row.name).filter(Boolean).join(", "), "Observações": budget.notes || "" };
  });
}

function reportTransactionRows(entries, accounts, categories, clients, filters) {
  const accountNames = new Map(accounts.map((account) => [account.id, account.name]));
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
  const clientNames = new Map(clients.map((client) => [client.id, client.name]));
  const dateOf = (entry) => filters.dateField === "effective" ? financialEntryDate(entry) : ({ issue: entry.issue_date, competence: entry.competence_date, due: entry.due_date, paid: entry.paid_at }[filters.dateField] || "");
  let accumulated = 0;
  return entries.filter((entry) => {
    const tags = financialEntryTags(entry);
    return (!filters.clientId || entry.client_id === filters.clientId) && (!filters.status || entry.status === filters.status) && (!filters.type || entry.entry_type === filters.type) &&
      (!filters.accountId || entry.account_id === filters.accountId || (entry.entry_type === "transfer" && entry.transfer_account_id === filters.accountId)) &&
      reportDateMatches(dateOf(entry), filters) && reportTextMatches([entry.description, accountNames.get(entry.account_id), accountNames.get(entry.transfer_account_id), categoryNames.get(entry.category_id), clientNames.get(entry.client_id), ...tags], filters.search);
  }).sort((a, b) => reportDateKey(dateOf(a)).localeCompare(reportDateKey(dateOf(b)) ) || String(a.id).localeCompare(String(b.id))).map((entry) => {
    const amount = Number(entry.amount) || 0;
    const transfer = entry.entry_type === "transfer";
    const inboundTransfer = transfer && filters.accountId && entry.transfer_account_id === filters.accountId;
    const outboundTransfer = transfer && filters.accountId && entry.account_id === filters.accountId;
    const incoming = entry.status === "cancelled" ? 0 : entry.entry_type === "income" || inboundTransfer ? amount : transfer && !filters.accountId ? amount : 0;
    const outgoing = entry.status === "cancelled" ? 0 : entry.entry_type === "expense" || outboundTransfer ? amount : transfer && !filters.accountId ? amount : 0;
    const movement = incoming - outgoing;
    accumulated += movement;
    return { "Data": reportDateKey(dateOf(entry)), "Emissão": reportDateKey(entry.issue_date), "Competência": reportDateKey(entry.competence_date), "Vencimento": reportDateKey(entry.due_date), "Pagamento": reportDateKey(entry.paid_at),
      "Situação": ({ pending: "Pendente", paid: "Pago", overdue: "Vencido", cancelled: "Cancelado" }[entry.status] || entry.status), "Tipo": ({ income: "Receita", expense: "Despesa", transfer: "Transferência" }[entry.entry_type] || entry.entry_type),
      "Descrição": entry.description, "Categoria": categoryNames.get(entry.category_id) || "", "Conta": accountNames.get(entry.account_id) || "", "Conta destino": accountNames.get(entry.transfer_account_id) || "", "Cliente": clientNames.get(entry.client_id) || "",
      "Tags": financialEntryTags(entry).join(", "), "Valor (R$)": amount, "Entrada (R$)": incoming, "Saída (R$)": outgoing, "Movimento (R$)": movement, "Acumulado filtrado (R$)": accumulated,
      "Observações": financialEntryNotes(entry), "ID": entry.id };
  });
}

async function exportReport(event) {
  event.preventDefault();
  if (!isAdmin()) return alert("Acesso restrito a administradores.");
  const filters = reportFilters();
  if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) return alert("A data inicial deve ser anterior ou igual à data final.");
  const fileName = `crm-${filters.kind}-${new Date().toISOString().replace(/[:.]/g, "-")}.xlsx`;
  const button = document.querySelector("#reportsExportBtn");
  const message = document.querySelector("#reportsStatusMessage");
  button.disabled = true;
  message.textContent = "Preparando relatório...";
  try {
    const handle = window.showSaveFilePicker ? await window.showSaveFilePicker({ suggestedName: fileName, types: [{ description: "Planilha Excel", accept: { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"] } }] }) : null;
    let rows;
    if (filters.kind === "transactions") {
      message.textContent = "Consultando transações...";
      const [entries, accounts, categories, clients] = await Promise.all([
        fetchSupabaseTableBackup({ name: "crm_financial_entries", key: "id" }), fetchSupabaseTableBackup({ name: "crm_financial_accounts", key: "id" }),
        fetchSupabaseTableBackup({ name: "crm_financial_categories", key: "id" }), reportClientsFromDatabase(),
      ]);
      rows = reportTransactionRows(entries.rows, accounts.rows, categories.rows, clients, filters);
    } else {
      message.textContent = "Consultando clientes e orçamentos...";
      const clients = await reportClientsFromDatabase();
      rows = filters.kind === "budgets" ? reportBudgetRows(clients, filters) : reportClientRows(clients, filters);
    }
    message.textContent = "Montando planilha...";
    await saveBackupFile(fileName, backupTableWorkbook({ table: filters.kind, rows, columns: REPORT_COLUMNS[filters.kind], numericColumns: REPORT_NUMERIC_COLUMNS[filters.kind] }), handle);
    message.textContent = `${rows.length} registro(s) exportado(s) em ${fileName}.`;
  } catch (error) {
    if (error.name === "AbortError") message.textContent = "Exportação cancelada.";
    else { console.warn(error); message.textContent = "Não foi possível gerar o relatório."; alert(error.message || "Não foi possível gerar o relatório."); }
  } finally { button.disabled = false; }
}

async function createBackupArchive(backup) {
  const files = [{ name: "backup-completo.json", content: JSON.stringify(backup, null, 2) }];
  for (const file of backup.site.files) {
    files.push({ name: `site/${file.path.startsWith("../") ? file.path.slice(3) : `crmcabana/${file.path}`}`, bytes: backupZipBytes(file) });
  }
  for (const table of backup.database.tables) {
    setBackupStatus(`Montando planilha ${files.length - backup.site.files.length} de ${backup.database.tables.length}: ${table.table}`);
    const workbook = backupTableWorkbook(table);
    files.push({ name: `tabelas/${table.table}.xlsx`, bytes: new Uint8Array(await workbook.arrayBuffer()) });
  }
  files.push({ name: "LEIA-ME.txt", content: "Backup do CRM Cabana.\r\nA pasta tabelas contem um arquivo XLSX por tabela. Todas as celulas sao texto para preservar identificadores e evitar formulas.\r\nCelulas com mais de 32.767 caracteres sao truncadas na planilha; backup-completo.json preserva os dados integrais.\r\nNao inclui usuarios do Supabase Auth, configuracoes internas nem objetos do Storage.\r\nGuarde este arquivo em local seguro.\r\n" });
  return backupZipBlob(files);
}

async function saveBackupFile(fileName, blob, handle = null) {

  if (handle) {
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

async function createFullBackup() {
  if (!isAdmin()) {
    alert("Acesso restrito a administradores.");
    return;
  }

  const button = elements.backupSiteDataBtn;
  if (button) button.disabled = true;
  setBackupStatus("Preparando backup...");

  try {
    const fileName = backupFileName();
    // O seletor precisa abrir durante o clique, antes de qualquer leitura assincrona.
    const saveHandle = window.showSaveFilePicker ? await window.showSaveFilePicker({
      suggestedName: fileName,
      types: [{ description: "Backup ZIP", accept: { "application/zip": [".zip"] } }],
    }) : null;
    const backup = {
      version: 3,
      app: "CRM Cabana",
      generatedAt: new Date().toISOString(),
      generatedBy: {
        id: currentUserId(),
        email: state.session?.user?.email || "",
        role: state.userRole,
      },
      location: window.location.href,
      site: {
        files: await collectSiteBackupFiles(),
      },
      database: {
        supabaseUrl: CONFIG.supabaseUrl || "",
        tables: await collectDatabaseBackup(),
        limitations: "Exportacao das tabelas publicas acessiveis ao administrador. Nao inclui auth.users, configuracoes internas do Supabase nem objetos do Storage.",
      },
      localStorage: {
        clientsKey: userStorageKey(),
        clients: state.clients,
        environmentsKey: environmentStorageKey(),
        environments: state.environments,
      },
    };

    setBackupStatus("Montando arquivo ZIP...");
    await saveBackupFile(fileName, await createBackupArchive(backup), saveHandle);
    setBackupStatus(`Backup salvo: ${fileName}`);
  } catch (error) {
    console.warn(error);
    if (error.name === "AbortError") {
      setBackupStatus("Backup cancelado.");
      return;
    }
    setBackupStatus("");
    alert(error.message || "Nao foi possivel gerar o backup.");
  } finally {
    if (button) button.disabled = false;
  }
}

function parseCsv(text, delimiter = ";") {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"') {
      if (quoted && nextChar === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (char === delimiter && !quoted) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && nextChar === "\n") index += 1;
      row.push(value);
      if (row.some((item) => item.trim())) rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  row.push(value);
  if (row.some((item) => item.trim())) rows.push(row);
  return rows;
}

function normalizeImportHeader(header) {
  return String(header || "")
    .trim()
    .replace(/^\uFEFF/, "")
    .toLowerCase();
}

function slugImportValue(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function leadImportId(record, index) {
  const key = [
    record.cpf_cnpj,
    record.celular,
    record.telefone,
    record.email,
    record.nome_razao_social,
    record.data_cadastro,
  ]
    .map(slugImportValue)
    .filter(Boolean)
    .join("-");
  return `lead-import-${key || index + 1}`;
}

async function readImportFileText(file) {
  const buffer = await file.arrayBuffer();
  const utf8Text = new TextDecoder("utf-8").decode(buffer);
  if (!utf8Text.includes("\uFFFD")) return utf8Text;
  return new TextDecoder("windows-1252").decode(buffer);
}

function importedLeadToClient(record, index) {
  const name = (record.nome_razao_social || record.nome_fantasia || "").trim();
  if (!name) return null;

  return normalizeClientStatus({
    id: leadImportId(record, index),
    _recordUserId: currentUserId(),
    name,
    email: (record.email || "").trim(),
    phone: (record.telefone || "").trim(),
    mobile: (record.celular || "").trim(),
    contact: "",
    personType: (record.tipo_pessoa || "Fisica").trim(),
    finalUse: normalizeFinalUse(record.uso_final),
    leadHunter: (record.lead_hunter || "").trim(),
    city: (record.cidade || "").trim(),
    state: (record.estado || "").trim(),
    status: normalizeLeadStatus((record.status || "").trim()),
    active: normalizeClientActive(record.ativo, (record.status || "").trim()),
    createdBy: "Importacao LEADS",
    owner: (record.vendedor_responsavel || "").trim() || currentUserName(),
    cpf: (record.cpf_cnpj || "").trim(),
    address: {
      cep: (record.cep || "").trim(),
      street: (record.endereco || "").trim(),
      number: (record.numero || "").trim(),
      complement: (record.complemento || "").trim(),
      district: (record.bairro || "").trim(),
    },
    project: {
      deadline: "",
      created: (record.data_cadastro || "").trim() || registrationDateTime(),
      notes: (record.observacoes || "").trim(),
      environments: [],
    },
  });
}

async function importLeadsFile(file) {
  const text = await readImportFileText(file);
  const rows = parseCsv(text);
  if (rows.length < 2) throw new Error("O arquivo CSV nao possui registros para importar.");

  const headers = rows[0].map(normalizeImportHeader);
  const importedClients = rows
    .slice(1)
    .map((row, index) => {
      const record = headers.reduce((data, header, headerIndex) => {
        data[header] = row[headerIndex] || "";
        return data;
      }, {});
      return importedLeadToClient(record, index);
    })
    .filter(Boolean);

  if (!importedClients.length) throw new Error("Nenhum lead valido foi encontrado no arquivo.");

  const clientsById = new Map(state.clients.map((client) => [client.id, client]));
  importedClients.forEach((client) => clientsById.set(client.id, client));
  state.clients = Array.from(clientsById.values());
  state.selectedId = importedClients[0].id;

  if (!(await saveClients(importedClients.map((client) => client.id)))) return;
  render();
  alert(`${importedClients.length} lead(s) importado(s) com sucesso.`);
}

function openLeadImportFilePicker() {
  elements.leadImportFile.value = "";
  elements.leadImportFile.click();
}

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function promobEnvironmentsFromDoc(doc) {
  return Array.from(doc.querySelectorAll("AMBIENTS > AMBIENT"))
    .map((ambient) => {
      const totals = ambient.querySelector(":scope > TOTALPRICES > MARGINS");
      return {
        name: (ambient.getAttribute("DESCRIPTION") || "").replace(/^Projeto\s*-\s*/i, "").trim(),
        gross: Number(totals?.querySelector(":scope > BUDGET")?.getAttribute("VALUE")) || 0,
        factory: Number(totals?.querySelector(":scope > ORDER")?.getAttribute("VALUE")) || 0,
      };
    })
    .filter((environment) => environment.name || environment.gross || environment.factory);
}

function promobCustomerFromDoc(doc) {
  const data = {};
  doc.querySelectorAll("CUSTOMERSDATA > DATA").forEach((node) => {
    data[node.getAttribute("ID")] = node.getAttribute("VALUE") || "";
  });
  return {
    name: (data.nomecliente || "").trim(),
    email: (data.email || data.email_Private_0 || "").trim(),
    mobile: onlyDigits(data.celular || (data.phone_Mobile_0 || "").split("|").pop()),
    cpf: onlyDigits(data.cpfcnpj),
    personType: data.customerType === "Legal" ? "Juridica" : "Fisica",
    city: (data.cidade || "").trim(),
    state: (data.uf || "").trim(),
    address: {
      cep: onlyDigits(data.cep),
      street: (data.endereco || "").trim(),
      district: (data.bairro || "").trim(),
    },
  };
}

function findClientByPromobCustomer(customer) {
  const normalizedName = customer.name ? customer.name.trim().toLowerCase() : "";
  const byContact = state.clients.find((client) => {
    const clientMobile = onlyDigits(client.mobile);
    const clientCpf = onlyDigits(client.cpf);
    return (customer.mobile && clientMobile && clientMobile === customer.mobile) || (customer.cpf && clientCpf && clientCpf === customer.cpf);
  });
  if (byContact) return byContact;
  if (!normalizedName) return undefined;
  return state.clients.find((client) => (client.name || "").trim().toLowerCase() === normalizedName);
}

function resolveBudgetClientFromPromob(customer) {
  if (!customer.mobile && !customer.cpf && !customer.name) return null;
  const existingClient = findClientByPromobCustomer(customer);
  let client = existingClient;
  let isNewClient = false;
  if (!client) {
    client = {
      ...blankClient(BUDGET_CLIENT_STATUS),
      name: customer.name || "Cliente Promob",
      email: customer.email,
      mobile: customer.mobile,
      cpf: customer.cpf,
      personType: customer.personType,
      city: customer.city,
      state: customer.state,
      address: { ...blankClient().address, ...customer.address },
    };
    state.clients = [...state.clients, client];
    isNewClient = true;
  } else if (!clientCanHaveBudget(client)) {
    client = { ...client, status: BUDGET_CLIENT_STATUS };
    state.clients = state.clients.map((item) => (item.id === client.id ? client : item));
  }
  renderBudgetClientOptions();
  elements.budgetClientSelect.value = client.id;
  elements.budgetClientSelect.dispatchEvent(new Event("change"));
  return { client, isNewClient };
}

function findBudgetRowByEnvironmentName(name) {
  const normalized = normalizeEnvironmentName(name);
  return Array.from(elements.budgetRows.querySelectorAll("tr")).find((row) => {
    const select = row.querySelector('[data-budget-field="name"]');
    return select && normalizeEnvironmentName(select.value || "") === normalized;
  });
}

function applyPromobEnvironmentToBudgetForm(environment) {
  const existingRow = environment.name && findBudgetRowByEnvironmentName(environment.name);
  if (existingRow) {
    existingRow.querySelector('[data-budget-field="gross"]').value = formatMoneyInput(environment.gross);
    existingRow.querySelector('[data-budget-field="factory"]').value = formatMoneyInput(environment.factory);
    return "corrected";
  }
  const row = createBudgetRow({ name: environment.name, gross: environment.gross, factory: environment.factory, hardware: 0 });
  elements.budgetRows.appendChild(row);
  return "added";
}

async function importPromobXmlFiles(fileList) {
  const files = Array.from(fileList || []);
  if (!files.length) return;

  let added = 0;
  let corrected = 0;
  const failedFiles = [];
  let clientResolution = null;

  for (const file of files) {
    try {
      const text = await readImportFileText(file);
      const doc = new DOMParser().parseFromString(text, "text/xml");
      if (doc.querySelector("parsererror")) throw new Error("Arquivo XML do Promob invalido.");

      if (!clientResolution && !elements.budgetClientSelect.value) {
        clientResolution = resolveBudgetClientFromPromob(promobCustomerFromDoc(doc));
      }

      const environments = promobEnvironmentsFromDoc(doc);
      if (!environments.length) throw new Error("Nenhum ambiente com valores foi encontrado no XML.");
      environments.forEach((environment) => {
        if (applyPromobEnvironmentToBudgetForm(environment) === "added") added += 1;
        else corrected += 1;
      });
    } catch (error) {
      console.warn(error);
      failedFiles.push(file.name);
    }
  }

  setBudgetTableOrderMode(state.view === "order");
  markBudgetDirty();
  updateBudgetSummary();

  const summary = [];
  if (clientResolution?.isNewClient) summary.push(`cliente ${clientResolution.client.name} cadastrado`);
  summary.push(`${added} ambiente(s) adicionado(s)`, `${corrected} corrigido(s)`);
  if (failedFiles.length) summary.push(`falha em: ${failedFiles.join(", ")}`);
  alert(summary.join(", ") + ".");
}

function openPromobImportFilePicker() {
  elements.promobImportFile.value = "";
  elements.promobImportFile.click();
}

function editableEnterShouldMoveFocus(event) {
  if (event.key !== "Enter" || event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) return false;
  const field = event.target;
  if (!(field instanceof HTMLElement)) return false;
  if (field.matches("textarea, button, [type='button'], [type='submit'], [type='reset'], a")) return false;
  if (!field.matches("input, select, [contenteditable='true']")) return false;
  if (field.readOnly || field.disabled) return false;
  return true;
}

function focusNextEditableField(currentField) {
  const fields = Array.from(document.querySelectorAll("input, select, textarea, button, [contenteditable='true']"))
    .filter((field) => {
      if (!(field instanceof HTMLElement)) return false;
      if (field.hidden || field.disabled) return false;
      if (field.matches("[type='hidden'], button, [type='button'], [type='submit'], [type='reset']")) return false;
      if (field.offsetParent === null && field.getClientRects().length === 0) return false;
      return field.matches("input:not([readonly]), select, textarea:not([readonly]), [contenteditable='true']");
    });
  const currentIndex = fields.indexOf(currentField);
  const nextField = fields[currentIndex + 1] || fields[0];
  if (!nextField || nextField === currentField) return;
  nextField.focus();
  if (nextField instanceof HTMLInputElement) nextField.select();
}

document.addEventListener("keydown", (event) => {
  if (!editableEnterShouldMoveFocus(event)) return;
  event.preventDefault();
  focusNextEditableField(event.target);
});

window.addEventListener("beforeunload", (event) => {
  if (!state.projectDirty && !state.budgetDirty && !state.clientDialogDirty) return;
  event.preventDefault();
  event.returnValue = "";
});

window.addEventListener("online", () => {
  if (!hasPendingSync() || !state.clients) return;
  trySyncPendingClients(state.clients);
});

function updateSyncIndicator() {
  if (elements.syncPendingChip) elements.syncPendingChip.hidden = !hasPendingSync();
}

function render() {
  renderStatusFilters(elements.dashboardFilters, state.dashboardStatus, "dashboard");
  renderStatusFilters(elements.clientFilters, state.clientStatus, "clients");
  renderStatusFilters(elements.budgetFilters, state.view === "budget" ? state.budgetSelectedStatuses[0] : state.budgetStatus, "budget");
  renderStatusFilters(elements.financialFilters, state.financialStatuses[0], "financial");
  syncBudgetFilterInputs();
  renderDashboard();
  renderClients();
  renderProjects();
  renderBudget();
  renderFinancialManagement();
  renderEnvironmentManager();
  renderUsers();
  renderBudgetStatusManager();
  renderDetail();
  updateSyncIndicator();
}

function budgetStatusIsInUse(name) {
  return state.clients.some((client) => client.budget?.status === name || (client.budgets || []).some((budget) => budget.status === name));
}

function renderBudgetStatusManager() {
  if (!elements.budgetStatusAdminRows) return;
  elements.budgetStatusAdminRows.replaceChildren();
  state.budgetStatuses.forEach((status, index) => {
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    const nameInput = document.createElement("input");
    nameInput.type = "text"; nameInput.maxLength = 60; nameInput.value = status.name; nameCell.appendChild(nameInput); row.appendChild(nameCell);
    const budgetCell = document.createElement("td");
    const budgetInput = document.createElement("input");
    budgetInput.type = "checkbox"; budgetInput.checked = status.budget; budgetCell.appendChild(budgetInput); row.appendChild(budgetCell);
    const orderCell = document.createElement("td");
    const orderInput = document.createElement("input");
    orderInput.type = "checkbox"; orderInput.checked = status.order; orderCell.appendChild(orderInput); row.appendChild(orderCell);
    const actions = document.createElement("td"); actions.className = "user-actions";
    const saveButton = document.createElement("button"); saveButton.type = "button"; saveButton.className = "button compact secondary"; saveButton.textContent = "Salvar";
    saveButton.addEventListener("click", async () => {
      const name = nameInput.value.trim();
      if (!name || (!budgetInput.checked && !orderInput.checked)) return alert("Informe o nome e associe o status a Orçamento e/ou Pedido.");
      if (state.budgetStatuses.some((item, itemIndex) => itemIndex !== index && item.name.toLocaleLowerCase("pt-BR") === name.toLocaleLowerCase("pt-BR"))) return alert("Já existe um status com esse nome.");
      if (status.name !== name && budgetStatusIsInUse(status.name)) return alert("Este status já está em uso e não pode ser renomeado.");
      const nextStatuses = state.budgetStatuses.map((item, itemIndex) => itemIndex === index ? { name, budget: budgetInput.checked, order: orderInput.checked } : item);
      try { await saveBudgetStatuses(nextStatuses); } catch (error) { alert(error.message); renderBudgetStatusManager(); }
    });
    const deleteButton = document.createElement("button"); deleteButton.type = "button"; deleteButton.className = "button compact secondary danger"; deleteButton.textContent = "Excluir";
    deleteButton.addEventListener("click", async () => {
      if (budgetStatusIsInUse(status.name)) return alert("Este status está associado a orçamentos/pedidos existentes e não pode ser excluído.");
      if (!confirm(`Excluir o status ${status.name}?`)) return;
      const nextStatuses = state.budgetStatuses.filter((_, itemIndex) => itemIndex !== index);
      try { await saveBudgetStatuses(nextStatuses); } catch (error) { alert(error.message); renderBudgetStatusManager(); }
    });
    actions.append(saveButton, deleteButton); row.appendChild(actions); elements.budgetStatusAdminRows.appendChild(row);
  });
}

function applySidebarCollapsed(collapsed) {
  document.body.dataset.sidebarCollapsed = collapsed ? "true" : "false";
  if (!elements.sidebarToggle) return;

  elements.sidebarToggle.textContent = collapsed ? ">" : "<";
  elements.sidebarToggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
  elements.sidebarToggle.setAttribute("aria-label", collapsed ? "Expandir menu lateral" : "Retrair menu lateral");
  elements.sidebarToggle.title = collapsed ? "Expandir menu" : "Retrair menu";
}

function loadSidebarPreference() {
  return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
}

let layoutRefreshFrame = 0;

function scheduleCurrentViewLayoutRefresh() {
  window.cancelAnimationFrame(layoutRefreshFrame);
  layoutRefreshFrame = window.requestAnimationFrame(() => {
    // Aguarda o navegador aplicar a nova coluna do menu antes de medir canvas e tabelas.
    layoutRefreshFrame = window.requestAnimationFrame(() => {
      setupResizableTables();
      if (state.view === "financial") {
        renderBudgetDashboard();
      }
    });
  });
}

function toggleSidebar() {
  const collapsed = document.body.dataset.sidebarCollapsed !== "true";
  localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
  applySidebarCollapsed(collapsed);
  scheduleCurrentViewLayoutRefresh();
}

const mobileMenuMedia = window.matchMedia("(max-width: 700px)");

function setMobileMenuOpen(open) {
  const expanded = mobileMenuMedia.matches && Boolean(open);
  document.body.dataset.mobileMenuOpen = String(expanded);
  const toggle = document.querySelector("#mobileMenuToggle");
  const sidebar = document.querySelector("#mainSidebar");
  const backdrop = document.querySelector("#mobileMenuBackdrop");
  if (toggle) {
    toggle.setAttribute("aria-expanded", String(expanded));
    toggle.setAttribute("aria-label", expanded ? "Fechar menu" : "Abrir menu");
  }
  if (sidebar) sidebar.inert = mobileMenuMedia.matches && !expanded;
  if (backdrop) backdrop.hidden = !expanded;
}

document.querySelector("#mobileMenuToggle")?.addEventListener("click", () => setMobileMenuOpen(document.body.dataset.mobileMenuOpen !== "true"));
document.querySelector("#mobileMenuBackdrop")?.addEventListener("click", () => setMobileMenuOpen(false));
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && document.body.dataset.mobileMenuOpen === "true") setMobileMenuOpen(false); });
mobileMenuMedia.addEventListener("change", () => setMobileMenuOpen(false));
setMobileMenuOpen(false);

document.querySelector("#togglePassword").addEventListener("click", () => {
  const showingPassword = elements.authPassword.type === "text";
  elements.authPassword.type = showingPassword ? "password" : "text";
  document.querySelector("#togglePassword").textContent = showingPassword ? "Mostrar" : "Ocultar";
  document.querySelector("#togglePassword").setAttribute("aria-label", showingPassword ? "Mostrar senha" : "Ocultar senha");
});

elements.authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = elements.authEmail.value.trim();
  const password = elements.authPassword.value;
  if (!email || !password) return;

  elements.authSubmit.disabled = true;
  showAuthMessage("Entrando...");

  try {
    await signIn(email, password);
    await startApp();
  } catch (error) {
    showAuthMessage(error.message);
  } finally {
    elements.authSubmit.disabled = false;
  }
});

elements.logoutBtn.addEventListener("click", async () => {
  if (!confirmDiscardProjectChanges() || !confirmDiscardClientDialogChanges() || !(await confirmDiscardBudgetChanges())) return;
  signOut();
});
elements.sidebarToggle?.addEventListener("click", toggleSidebar);
elements.financialNavToggle?.addEventListener("click", () => {
  const expanded = elements.financialNavToggle.getAttribute("aria-expanded") === "true";
  elements.financialNavToggle.setAttribute("aria-expanded", String(!expanded));
  elements.financialSubmenu.hidden = expanded;
});

elements.navItems.forEach((item) => {
  item.addEventListener("click", async () => {
    if (item.dataset.view === "financeTransactions") {
      state.financialEntryAccountFilter = "";
    }
    if (item.dataset.view === "users" && isAdmin()) {
      try {
        await loadUserProfiles();
      } catch (error) {
        console.warn(error);
        alert(error.message || "Nao foi possivel carregar os usuarios.");
      }
    }
    if (isFinanceModuleView(item.dataset.view) && isAdmin()) {
      try {
        await loadFinancialRegisters();
      } catch (error) {
        console.warn(error);
        alert(error.message);
      }
    }
    if (item.dataset.view === "reports" && isAdmin()) {
      try {
        state.clients = await loadClients();
        await loadFinancialRegisters();
      } catch (error) {
        console.warn(error);
        alert(error.message || "Não foi possível atualizar os filtros dos relatórios.");
      }
    }
    await showView(item.dataset.view);
  });
});

document.querySelector("#newFinancialAccountBtn")?.addEventListener("click", () => openFinancialAccountDialog());
document.querySelector("#newFinancialCategoryBtn")?.addEventListener("click", () => { state.financialCategoryTargetItemId = null; state.financialCategoryTargetEntry = false; openFinancialCategoryDialog(); });
document.querySelector("#financialAccountType")?.addEventListener("change", syncFinancialCreditCardFields);
document.querySelector("#financialEntryType")?.addEventListener("change", syncFinancialEntryTypeFields);
document.querySelector("#financialEntryInstallment")?.addEventListener("change", syncFinancialInstallmentFields);
document.querySelector("#addFinancialEntryTagBtn")?.addEventListener("click", addFinancialEntryTag);
document.querySelector("#financialEntryTagInput")?.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === ",") { event.preventDefault(); addFinancialEntryTag(); } });
document.querySelector("#financialEntryTagInput")?.addEventListener("input", syncFinancialEntryTagAction);
document.querySelector("#financialEntryTagInput")?.addEventListener("change", (event) => { if (availableFinancialTags().includes(normalizeFinancialTag(event.target.value))) addFinancialEntryTag(); });
document.querySelector("#financialEntryTagChips")?.addEventListener("click", (event) => { const chip = event.target.closest("[data-remove-financial-entry-tag]"); if (!chip) return; state.financialEntryDraftTags = state.financialEntryDraftTags.filter((tag) => tag !== chip.dataset.removeFinancialEntryTag); renderFinancialEntryTagEditor(); });
document.querySelector("#manageFinancialTagsBtn")?.addEventListener("click", openFinancialTagManager);
document.querySelectorAll("#closeFinancialTagManager, #doneFinancialTagManager").forEach((button) => button.addEventListener("click", () => document.querySelector("#financialTagManagerDialog").close()));
document.querySelector("#financialTagManagerDialog")?.addEventListener("cancel", (event) => { if (state.financialTagUpdating) event.preventDefault(); });
document.querySelector("#financialTagManagerList")?.addEventListener("click", (event) => {
  const edit = event.target.closest("[data-edit-financial-tag]");
  const remove = event.target.closest("[data-delete-financial-tag]");
  if (edit) { state.financialTagEditingName = edit.dataset.editFinancialTag; renderFinancialTagManager(); return; }
  if (event.target.closest("[data-cancel-financial-tag]")) { state.financialTagEditingName = null; renderFinancialTagManager(); return; }
  if (event.target.closest("[data-save-financial-tag]")) {
    const previousTag = state.financialTagEditingName;
    const replacementTag = normalizeFinancialTag(document.querySelector("#financialTagRenameInput")?.value);
    if (!replacementTag) { document.querySelector("#financialTagManagerMessage").textContent = "Informe o novo nome da tag."; return; }
    if (replacementTag === previousTag) { state.financialTagEditingName = null; renderFinancialTagManager(); return; }
    updateFinancialTag(previousTag, replacementTag).catch((error) => alert(error.message));
    return;
  }
  if (remove) updateFinancialTag(remove.dataset.deleteFinancialTag, "").catch((error) => alert(error.message));
});
document.querySelector("#financialTagManagerList")?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" || event.target.id !== "financialTagRenameInput") return;
  event.preventDefault();
  event.stopPropagation();
  document.querySelector("#financialTagManagerList [data-save-financial-tag]")?.click();
});
document.querySelector("#financialDashboardMonth")?.addEventListener("change", (event) => { if (event.target.value) { state.financialDashboardMonth = event.target.value; renderFinancialDashboard(); } });
document.querySelector("#financialAccountsMonth")?.addEventListener("change", (event) => { if (event.target.value) { state.financialDashboardMonth = event.target.value; renderFinancialAccounts(); } });
document.querySelector("#financialEntryMonth")?.addEventListener("change", (event) => { state.financialEntryMonthFilter = event.target.value; renderFinancialEntries(); });
document.querySelector("#financialEntryShowDailyBalance")?.addEventListener("change", (event) => { state.financialEntryShowDailyBalance = event.target.checked; renderFinancialDailyBalanceBreaks(elements.financialEntryRows?.closest("table")); });
document.querySelectorAll("[data-financial-month-step]").forEach((button) => button.addEventListener("click", () => stepFinancialEntryMonth(Number(button.dataset.financialMonthStep))));
document.querySelector("#financialEvolutionAccount")?.addEventListener("change", (event) => { state.financialEvolutionAccountId = event.target.value; renderFinancialEvolution(); });
document.querySelector("#financialEvolutionChartBtn")?.addEventListener("click", () => { state.financialEvolutionView = "chart"; renderFinancialEvolution(); });
document.querySelector("#financialEvolutionTableBtn")?.addEventListener("click", () => { state.financialEvolutionView = "table"; renderFinancialEvolution(); });
document.querySelector("#clearFinancialEntryFilter")?.addEventListener("click", () => {
  state.financialEntryAccountFilter = "";
  state.financialEntryMonthFilter = "";
  renderFinancialEntries("financeTransactions");
});
document.querySelector("#financialEntryFilters")?.addEventListener("input", (event) => {
  const keys = { financialEntryFilterSearch: "search", financialEntryFilterType: "type", financialEntryFilterAccount: "accountId", financialEntryFilterCategory: "categoryId", financialEntryFilterStatus: "status", financialEntryFilterStart: "startDate", financialEntryFilterEnd: "endDate" };
  const key = keys[event.target.id];
  if (!key || event.target.disabled) return;
  state.financialEntryFilters[key] = event.target.value;
  renderFinancialEntries();
});
document.querySelector("#clearFinancialEntryFilters")?.addEventListener("click", () => {
  state.financialEntryFilters = { search: "", type: "", accountId: FINANCIAL_BANK_ACCOUNTS_FILTER, categoryId: "", status: "", startDate: "", endDate: "" };
  state.financialEntryAccountFilter = "";
  state.financialEntryMonthFilter = currentFinancialMonth();
  renderFinancialEntries();
});
elements.financialAccountForm?.addEventListener("submit", submitFinancialAccount);
elements.financialCategoryForm?.addEventListener("submit", submitFinancialCategory);
elements.financialCategoryDialog?.addEventListener("cancel", () => { state.financialCategoryTargetItemId = null; state.financialCategoryTargetEntry = false; });
elements.financialEntryForm?.addEventListener("submit", submitFinancialEntry);
document.querySelector("#financialEntryAmount")?.addEventListener("input", (event) => event.target.setCustomValidity(""));
document.querySelector("#financialEntryAmount")?.addEventListener("blur", () => resolveFinancialEntryAmount());
document.querySelector("#newFinancialEntryBtn")?.addEventListener("click", () => openFinancialEntryDialog());
document.querySelectorAll("[data-close-financial-dialog]").forEach((button) => button.addEventListener("click", () => {
  if (button.dataset.closeFinancialDialog === "category") { state.financialCategoryTargetItemId = null; state.financialCategoryTargetEntry = false; }
  ({ account: elements.financialAccountDialog, category: elements.financialCategoryDialog, entry: elements.financialEntryDialog }[button.dataset.closeFinancialDialog]?.close());
}));
function closeFinancialAccountMenus() {
  elements.financialAccountRows?.querySelectorAll(".financial-account-actions-menu:not([hidden])").forEach((menu) => {
    menu.hidden = true;
    menu.previousElementSibling?.setAttribute("aria-expanded", "false");
  });
}

elements.financialAccountRows?.addEventListener("click", (event) => {
  const menuButton = event.target.closest("[data-financial-account-menu]");
  if (menuButton) {
    const menu = menuButton.nextElementSibling;
    const opening = menu.hidden;
    closeFinancialAccountMenus();
    menu.hidden = !opening;
    menuButton.setAttribute("aria-expanded", String(opening));
    if (opening) menu.querySelector("[role='menuitem']")?.focus();
    return;
  }
  if (event.target.closest("[data-new-financial-account]")) { openFinancialAccountDialog(); return; }
  const edit = event.target.closest("[data-edit-financial-account]");
  const toggle = event.target.closest("[data-toggle-financial-account]");
  const remove = event.target.closest("[data-delete-financial-account]");
  const transactions = event.target.closest("[data-financial-account-transactions]");
  const expense = event.target.closest("[data-financial-account-expense]");
  closeFinancialAccountMenus();
  if (edit) openFinancialAccountDialog(edit.dataset.editFinancialAccount);
  if (toggle) {
    const account = state.financialAccounts.find((item) => item.id === toggle.dataset.toggleFinancialAccount);
    if (account) toggleFinancialRecord("crm_financial_accounts", account.id, !account.active, renderFinancialAccounts);
  }
  if (remove) deleteFinancialRecord("crm_financial_accounts", remove.dataset.deleteFinancialAccount, "esta conta").then((deleted) => { if (deleted) renderFinancialAccounts(); }).catch((error) => alert(error.message));
  if (transactions) {
    state.financialEntryFilters = { search: "", type: "", accountId: FINANCIAL_BANK_ACCOUNTS_FILTER, categoryId: "", status: "", startDate: "", endDate: "" };
    state.financialEntryAccountFilter = transactions.dataset.financialAccountTransactions;
    state.financialEntryMonthFilter = state.financialDashboardMonth;
    showView("financeTransactions");
  }
  if (expense) {
    openFinancialEntryDialog();
    document.querySelector("#financialEntryType").value = "expense";
    document.querySelector("#financialEntryAccount").value = expense.dataset.financialAccountExpense;
    syncFinancialEntryTypeFields();
  }
});
document.addEventListener("click", (event) => { if (!event.target.closest(".financial-account-actions")) closeFinancialAccountMenus(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeFinancialAccountMenus(); });
elements.financialCategoryRows?.addEventListener("click", (event) => {
  const edit = event.target.closest("[data-edit-financial-category]");
  const toggle = event.target.closest("[data-toggle-financial-category]");
  const remove = event.target.closest("[data-delete-financial-category]");
  if (edit) openFinancialCategoryDialog(edit.dataset.editFinancialCategory);
  if (toggle) {
    const category = state.financialCategories.find((item) => item.id === toggle.dataset.toggleFinancialCategory);
    if (category) toggleFinancialRecord("crm_financial_categories", category.id, !category.active, renderFinancialCategories);
  }
  if (remove) deleteFinancialRecord("crm_financial_categories", remove.dataset.deleteFinancialCategory, "esta categoria").then((deleted) => { if (deleted) renderFinancialCategories(); }).catch((error) => alert(error.message));
});
function closeFinancialEntryMenus(except = null) {
  elements.financialEntryRows?.querySelectorAll(".financial-entry-actions-menu:not([hidden])").forEach((menu) => {
    if (menu === except) return;
    menu.hidden = true;
    menu.closest(".financial-entry-actions")?.querySelector("[data-financial-entry-menu]")?.setAttribute("aria-expanded", "false");
  });
}

elements.financialEntryRows?.addEventListener("click", (event) => {
  const menuButton = event.target.closest("[data-financial-entry-menu]");
  if (menuButton) {
    const menu = menuButton.nextElementSibling;
    const opening = menu.hidden;
    closeFinancialEntryMenus(menu);
    menu.hidden = !opening;
    menuButton.setAttribute("aria-expanded", String(opening));
    if (opening) {
      const buttonRect = menuButton.getBoundingClientRect();
      const menuWidth = menu.offsetWidth;
      const menuHeight = menu.offsetHeight;
      menu.style.left = `${Math.max(8, Math.min(window.innerWidth - menuWidth - 8, buttonRect.right - menuWidth))}px`;
      menu.style.top = `${buttonRect.bottom + menuHeight + 8 > window.innerHeight ? Math.max(8, buttonRect.top - menuHeight - 6) : buttonRect.bottom + 6}px`;
      menu.querySelector("[role='menuitem']")?.focus();
    }
    return;
  }
  const edit = event.target.closest("[data-edit-financial-entry]");
  const duplicate = event.target.closest("[data-duplicate-financial-entry]");
  const remove = event.target.closest("[data-delete-financial-entry]");
  if (edit) { closeFinancialEntryMenus(); openFinancialEntryDialog(edit.dataset.editFinancialEntry); }
  if (duplicate) { closeFinancialEntryMenus(); openFinancialEntryDialog(duplicate.dataset.duplicateFinancialEntry, true); }
  if (remove) { closeFinancialEntryMenus(); deleteFinancialRecord("crm_financial_entries", remove.dataset.deleteFinancialEntry, "este lançamento").then((deleted) => { if (deleted) renderFinancialEntries(); }).catch((error) => alert(error.message)); }
});
document.addEventListener("click", (event) => { if (!event.target.closest(".financial-entry-actions")) closeFinancialEntryMenus(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeFinancialEntryMenus(); });
document.addEventListener("scroll", () => closeFinancialEntryMenus(), true);
window.addEventListener("resize", () => closeFinancialEntryMenus());
elements.financialImportRows?.addEventListener("click", (event) => {
  const view = event.target.closest("[data-view-financial-import]");
  const remove = event.target.closest("[data-delete-financial-import]");
  if (view) openFinancialImport(view.dataset.viewFinancialImport).catch((error) => alert(error.message));
  if (remove) deleteFinancialRecord("crm_financial_statement_imports", remove.dataset.deleteFinancialImport, "esta importação e todos os seus itens").then((deleted) => { if (deleted) { if (state.financialSelectedImportId === remove.dataset.deleteFinancialImport) { state.financialSelectedImportId = null; state.financialStatementItems = []; } renderFinancialImports(); } }).catch((error) => alert(error.message));
});
document.querySelector("#selectAllStatementItems")?.addEventListener("change", (event) => elements.financialStatementItemRows.querySelectorAll("[data-statement-select]:not(:disabled)").forEach((checkbox) => { checkbox.checked = event.target.checked; }));
document.querySelector("#ignoreStatementItemsBtn")?.addEventListener("click", ignoreSelectedStatementItems);
document.querySelector("#confirmStatementItemsBtn")?.addEventListener("click", confirmSelectedStatementItems);
elements.financialStatementFile?.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const message = document.querySelector("#financialImportMessage");
  message.textContent = "Importando...";
  try { await importFinancialStatement(file); message.textContent = `${file.name} importado com sucesso.`; } catch (error) { message.textContent = error.message; alert(error.message); } finally { event.target.value = ""; }
});
elements.financialMigrationFile?.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const message = document.querySelector("#financialImportMessage");
  message.textContent = "Migrando dados do Mobills...";
  try {
    const result = await migrateMobillsWorkbook(file);
    if (result) {
      message.textContent = `Migração concluída: ${result.inserted} de ${result.total} transações inseridas.`;
      renderFinancialImports();
      alert(`${result.inserted} transações migradas. ${result.total - result.inserted} já existiam e não foram duplicadas.`);
    } else message.textContent = "Migração cancelada.";
  } catch (error) {
    console.warn(error); message.textContent = error.message; alert(error.message);
  } finally { event.target.value = ""; }
});
elements.financialStatementItemRows?.addEventListener("change", (event) => {
  const select = event.target.closest("[data-statement-category]");
  if (!select) return;
  syncStatementTransferField(select);
  if (select.value !== "__new__") return;
  const item = state.financialStatementItems.find((candidate) => candidate.id === select.dataset.statementCategory);
  select.value = "";
  state.financialCategoryTargetItemId = item?.id || null;
  openFinancialCategoryDialog();
  document.querySelector("#financialCategoryType").value = Number(item?.amount) >= 0 ? "income" : "expense";
  document.querySelector("#financialCategoryName").focus();
});
document.querySelector("#financialEntryCategory")?.addEventListener("change", (event) => {
  if (event.target.value !== "__new__") return;
  event.target.value = "";
  state.financialCategoryTargetItemId = null;
  state.financialCategoryTargetEntry = true;
  const entryType = document.querySelector("#financialEntryType").value;
  openFinancialCategoryDialog();
  document.querySelector("#financialCategoryType").value = entryType === "income" ? "income" : "expense";
  document.querySelector("#financialCategoryName").focus();
});

function syncStatementTransferField(select) {
  const transferSelect = elements.financialStatementItemRows.querySelector(`[data-statement-transfer-account="${select.dataset.statementCategory}"]`);
  if (transferSelect) {
    transferSelect.hidden = select.value !== "__transfer__";
    transferSelect.required = select.value === "__transfer__";
  }
}

initializeFinancialTableSorting();

document.querySelectorAll("#clientsView th[data-sort], #budgetListCard th[data-sort]").forEach((header) => {
  const type = header.closest("#budgetListCard") ? "budget" : "clients";
  const sort = () => setTableSort(type, header.dataset.sort);
  header.addEventListener("click", sort);
  header.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    sort();
  });
});

elements.environmentForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const typedName = elements.environmentNameInput?.value || "";
  const normalizedName = normalizeEnvironmentName(typedName);
  const alreadyExists = state.environments.includes(normalizedName);
  const added = addEnvironmentToCatalog(typedName);
  if (added && elements.environmentNameInput) {
    elements.environmentNameInput.value = "";
  }
  if (alreadyExists) {
    focusEnvironmentManagerRow(normalizedName);
    return;
  }
  if (added) {
    window.setTimeout(() => focusEnvironmentManagerRow(normalizedName), 0);
    return;
  }
  elements.environmentNameInput?.focus();
});

elements.budgetStatusAdminForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = elements.newBudgetStatusName.value.trim();
  const budget = elements.newBudgetStatusBudget.checked;
  const order = elements.newBudgetStatusOrder.checked;
  if (!budget && !order) return alert("Associe o status a Orçamento e/ou Pedido.");
  if (state.budgetStatuses.some((status) => status.name.toLocaleLowerCase("pt-BR") === name.toLocaleLowerCase("pt-BR"))) return alert("Já existe um status com esse nome.");
  try {
    await saveBudgetStatuses([...state.budgetStatuses, { name, budget, order }]); elements.budgetStatusAdminForm.reset(); elements.newBudgetStatusBudget.checked = true;
    elements.budgetStatusAdminMessage.textContent = "Status cadastrado com sucesso.";
  } catch (error) { alert(error.message); renderBudgetStatusManager(); }
});

elements.userAdminForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = elements.newUserEmail.value.trim();
  const password = elements.newUserPassword.value;
  const role = elements.newUserRole.value === "admin" ? "admin" : "user";
  if (!email || password.length < 6) return;
  const submitButton = elements.userAdminForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  try {
    await createManagedUser(email, password, role);
    elements.userAdminForm.reset();
  } catch (error) {
    console.warn(error);
    alert(error.message || "Nao foi possivel cadastrar o usuario.");
  } finally {
    submitButton.disabled = false;
  }
});

elements.clientSearch.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderClients();
});

elements.projectSearch?.addEventListener("input", (event) => {
  state.projectSearch = event.target.value;
  renderProjects();
});

elements.budgetSearch?.addEventListener("input", (event) => {
  state.budgetSearch = event.target.value;
  renderBudget();
});

elements.budgetStartDate?.addEventListener("change", (event) => {
  state.budgetStartDate = event.target.value;
  renderBudget();
});

elements.budgetEndDate?.addEventListener("change", (event) => {
  state.budgetEndDate = event.target.value;
  renderBudget();
});

elements.financialStartDate?.addEventListener("change", (event) => {
  state.budgetStartDate = event.target.value;
  render();
});

elements.financialEndDate?.addEventListener("change", (event) => {
  state.budgetEndDate = event.target.value;
  render();
});

document.querySelector("#newClientBtn").addEventListener("click", () => openProjectDialog(null));
document.querySelector("#projectClientBtn")?.addEventListener("click", () => openProjectDialog(null));
document.querySelector("#backToClients").addEventListener("click", () => showView(state.returnView || "clients"));
document.querySelector("#editClientBtn").addEventListener("click", () => {
  openProjectDialog();
});
document.querySelector("#clientBudgetBtn")?.addEventListener("click", async () => {
  const client = selectedClient();
  if (client) await showView("budget", client.id);
  await openBudgetEditor(client?.id);
});
document.querySelector("#budgetNewBtn")?.addEventListener("click", () => openBudgetEditor(null, { blank: true }));
document.querySelector("#budgetBackToList")?.addEventListener("click", closeBudgetEditor);
document.querySelector("#budgetEditClientBtn")?.addEventListener("click", async () => {
  state.budgetDraft = currentBudgetDraft();
  state.projectReturnView = state.view === "order" ? "order" : "budget";
  const client = selectedBudgetClient();
  if (client) {
    state.selectedId = client.id;
    openProjectDialog(client);
    return;
  }
  openProjectDialog(null);
});
elements.budgetClientSelect?.addEventListener("change", () => {
  state.selectedId = elements.budgetClientSelect.value || null;
  markBudgetDirty();
  const targetClient = selectedBudgetClient();
  renderBudgetSeller(targetClient);
  document.querySelector("#budgetEditClientBtn").title = targetClient ? "Editar cliente" : "Cadastrar cliente";
  document.querySelector("#budgetEditClientBtn").setAttribute("aria-label", targetClient ? "Editar cliente" : "Cadastrar cliente");
});
document.querySelector("#budgetAddEnvironment")?.addEventListener("click", () => {
  const row = createBudgetRow({ name: "", gross: 0, factory: 0, hardware: 0 });
  elements.budgetRows.appendChild(row);
  setBudgetTableOrderMode(state.view === "order");
  markBudgetDirty();
  updateBudgetSummary();
  focusEmptyEnvironmentSelect(row.querySelector('[data-budget-field="name"]'));
});
document.querySelector("#budgetPrintOrderBtn")?.addEventListener("click", () => previewPrintableBudgetDocument("order"));
document.querySelector("#budgetPrintQuoteBtn")?.addEventListener("click", () => previewPrintableBudgetDocument("quote"));
elements.budgetPreviewPrintBtn?.addEventListener("click", printBudgetPreview);
elements.budgetPreviewCloseBtn?.addEventListener("click", closeBudgetPrintPreview);
elements.budgetDeleteBtn?.addEventListener("click", deleteCurrentBudget);
document.querySelector("#budgetSaveBtn")?.addEventListener("click", async (event) => {
  const button = event.currentTarget;
  const originalLabel = button.textContent;
  button.disabled = true;
  button.textContent = "Salvando...";
  try {
    await saveBudget();
  } finally {
    button.disabled = false;
    button.textContent = originalLabel;
  }
});
document.querySelector("#budgetLaunchFinancialBtn")?.addEventListener("click", async (event) => {
  const button = event.currentTarget;
  button.disabled = true;
  const label = button.textContent;
  button.textContent = "Lançando...";
  try { await saveBudget({ launchFinancial: true, silent: true }); }
  finally { button.disabled = false; button.textContent = label; }
});
document.querySelector("#budgetStatus")?.addEventListener("change", handleBudgetStatusDateFields);
[
  "#budgetCreatedAt",
  "#budgetSaleAt",
  "#budgetEntry",
  "#budgetEntryTerm",
  "#budgetStatus",
  "#budgetInstallments",
  "#budgetDiscountRate",
  "#budgetFreightValue",
  "#budgetFreightMode",
  "#budgetReleaseRate",
  "#budgetAssemblyRate",
  "#budgetLelaRate",
  "#budgetIrisRate",
  "#budgetTaxRate",
  "#budgetDailyQuantity",
  "#budgetDailyValue",
  "#budgetAssemblerName",
  "#budgetAssemblyStartDate",
  "#budgetAssemblyEndDate",
  "#orderDeliveryForecastAt",
  "#budgetNotes",
].forEach((selector) => {
  const input = document.querySelector(selector);
  input?.addEventListener("input", () => {
    markBudgetDirty();
    updateBudgetSummary();
  });
  input?.addEventListener("change", () => {
    markBudgetDirty();
    updateBudgetSummary();
  });
});
document.querySelector("#budgetFreightValue")?.addEventListener("focus", (event) => {
  event.currentTarget.value = String(parseMoney(event.currentTarget.value.replace(/%/g, ""))).replace(".", ",");
  event.currentTarget.select();
});
document.querySelector("#budgetFreightValue")?.addEventListener("blur", (event) => {
  const input = event.currentTarget;
  const mode = document.querySelector("#budgetFreightMode");
  if (input.value.includes("%")) mode.value = "percent";
  const value = parseMoney(input.value.replace(/%/g, ""));
  input.value = mode.value === "percent" ? String(value).replace(".", ",") : formatMoneyInput(value);
  updateBudgetSummary();
});
document.querySelector("#budgetFreightMode")?.addEventListener("change", () => {
  const input = document.querySelector("#budgetFreightValue");
  const value = parseMoney(input.value.replace(/%/g, ""));
  input.value = document.querySelector("#budgetFreightMode").value === "percent" ? String(value).replace(".", ",") : formatMoneyInput(value);
  markBudgetDirty();
  updateBudgetSummary();
});
["#budgetAssemblyStartDate", "#budgetAssemblyEndDate"].forEach((selector) => {
  const input = document.querySelector(selector);
  input?.addEventListener("input", updateBudgetAssemblyDays);
  input?.addEventListener("change", updateBudgetAssemblyDays);
});
document.querySelector("#budgetEntry")?.addEventListener("blur", (event) => {
  event.target.value = formatMoneyInput(event.target.value);
  updateBudgetSummary();
});
document.querySelector("#budgetDailyValue")?.addEventListener("blur", (event) => {
  event.target.value = formatMoneyInput(event.target.value);
  updateBudgetSummary();
});
["input", "change"].forEach((eventName) => {
  elements.projectForm.addEventListener(eventName, markProjectDirty);
  elements.form.addEventListener(eventName, () => {
    state.clientDialogDirty = true;
  });
});
elements.projectDialog.addEventListener("cancel", (event) => {
  if (confirmDiscardProjectChanges()) {
    state.projectDirty = false;
    return;
  }
  event.preventDefault();
});
elements.dialog.addEventListener("cancel", (event) => {
  if (confirmDiscardClientDialogChanges()) {
    state.clientDialogDirty = false;
    state.editingId = null;
    return;
  }
  event.preventDefault();
});
document.querySelector("#addEnvironmentBtn").addEventListener("click", () => {
  const row = createEnvironmentRow({ name: "", budget: 0, factory: 0, assembly: 0 });
  elements.projectRows.appendChild(row);
  markProjectDirty();
  focusEmptyEnvironmentSelect(row.querySelector('select[data-field="name"]'));
});
document.querySelector("#closeDialog").addEventListener("click", () => {
  if (!confirmDiscardClientDialogChanges()) return;
  state.editingId = null;
  state.clientDialogDirty = false;
  elements.dialog.close();
});
document.querySelector("#cancelDialog").addEventListener("click", () => {
  if (!confirmDiscardClientDialogChanges()) return;
  state.editingId = null;
  state.clientDialogDirty = false;
  elements.dialog.close();
});
document.querySelector("#closeProjectDialog").addEventListener("click", closeProjectForm);
document.querySelector("#cancelProjectDialog").addEventListener("click", closeProjectForm);
document.querySelector("#topCloseProjectBtn").addEventListener("click", closeProjectForm);
document.querySelector("#saveProjectBtn").addEventListener("click", () => {
  state.projectAction = "stay";
});
document.querySelector("#saveCloseProjectBtn").addEventListener("click", () => {
  state.projectAction = "close";
  elements.projectForm.requestSubmit();
});
document.querySelector("#saveNewProjectBtn").addEventListener("click", () => {
  state.projectAction = "new";
  elements.projectForm.requestSubmit();
});
document.querySelector("#deleteProjectBtn").addEventListener("click", async () => {
  const client = selectedClient();
  if (!client) return;

  try {
    await deleteRemoteClient(client.id);
    state.clients = state.clients.filter((item) => item.id !== client.id);
    state.selectedId = state.clients[0]?.id || null;
    if (!(await saveClients())) return;
    state.projectDirty = false;
    closeProjectForm();
    showView(state.projectReturnView || "clients");
    render();
  } catch (error) {
    console.warn(error);
    alert(error.message || "Nao foi possivel excluir o cliente.");
  }
});
document.querySelectorAll("[data-export]").forEach((button) => button.addEventListener("click", exportCsv));
elements.backupSiteDataBtn?.addEventListener("click", createFullBackup);
document.querySelector("#reportsKind")?.addEventListener("change", () => {
  document.querySelector("#reportsStatus").value = "";
  document.querySelector("#reportsDateField").value = "";
  document.querySelector("#reportsStatusMessage").textContent = "";
  renderReportsView();
});
document.querySelector("#reportsClearBtn")?.addEventListener("click", () => {
  document.querySelector("#reportsForm").reset();
  document.querySelector("#reportsStatusMessage").textContent = "";
  renderReportsView();
});
document.querySelector("#reportsForm")?.addEventListener("submit", exportReport);
document.querySelectorAll("[data-import-leads]").forEach((button) => button.addEventListener("click", openLeadImportFilePicker));
elements.leadImportFile.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    await importLeadsFile(file);
  } catch (error) {
    console.warn(error);
    alert(error.message || "Nao foi possivel importar os leads.");
  }
});
document.querySelector("#budgetImportPromobBtn")?.addEventListener("click", openPromobImportFilePicker);
elements.promobImportFile.addEventListener("change", async (event) => {
  const files = event.target.files;
  if (!files.length) return;

  try {
    await importPromobXmlFiles(files);
  } catch (error) {
    console.warn(error);
    alert(error.message || "Nao foi possivel importar o XML do Promob.");
  }
});
document.querySelectorAll("[data-legacy-logout]").forEach((button) => {
  button.addEventListener("click", signOut);
});
elements.form.addEventListener("submit", saveClientFromDialog);
elements.projectForm.addEventListener("submit", saveProjectFromDialog);
window.addEventListener("resize", () => {
  if (state.view === "clients") {
    renderDashboard();
  }
  if (state.view === "financial") {
    renderBudgetDashboard();
  }
  if (state.view === "financeOverview") renderFinancialDashboard();
});

if (typeof ResizeObserver === "function") {
  const contentResizeObserver = new ResizeObserver(() => scheduleCurrentViewLayoutRefresh());
  const content = document.querySelector(".content");
  if (content) contentResizeObserver.observe(content);
}

async function startApp() {
  const accessAllowed = await ensureUserProfile();
  if (!accessAllowed) {
    showAuthScreen();
    return false;
  }
  showAuthenticatedApp();
  // Os orcamentos podem usar status personalizados. Carregue a configuracao antes
  // dos clientes para que a normalizacao nao substitua um status valido por "Novo".
  await loadBudgetStatuses();
  state.clients = await loadClients();
  if (isAdmin()) {
    try {
      await loadUserProfiles();
    } catch (error) {
      console.warn(error);
    }
    try {
      await loadFinancialRegisters();
    } catch (error) {
      console.warn(error);
    }
  }
  refreshEnvironmentCatalog();
  state.selectedId = state.clients[0]?.id || null;
  const initialView = isAdmin() ? "budget" : "clients";
  state.view = initialView;
  await showView(initialView);
  render();
  return true;
}

async function init() {
  applySidebarCollapsed(loadSidebarPreference());
  state.session = loadStoredSession();

  if (authEnabled() && !state.session) {
    showAuthScreen();
    return;
  }

  await startApp();
}

init();
