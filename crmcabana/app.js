const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const STORAGE_KEY = "movelcrm-clients";
const SESSION_KEY = "movelcrm-session";
const ENVIRONMENT_STORAGE_KEY = "movelcrm-environments";
const SIDEBAR_COLLAPSED_KEY = "movelcrm-sidebar-collapsed";
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
  discountRate: 47,
  releaseRate: 2,
  assemblyRate: 12,
  lelaRate: 2.5,
  irisRate: 2.5,
  taxRate: 4.9,
  entry: 0,
  entryTerm: 30,
  installments: 0,
  dailyQuantity: 0,
  dailyValue: 0,
};
const BUDGET_STATUS = ["Novo Orçamento", "Negociação", "Aprovado", "Recusado"];
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

const state = {
  session: null,
  userRole: "user",
  userProfiles: [],
  userLogs: [],
  authMode: "signin",
  view: "clients",
  dashboardStatus: "Todos",
  clientStatus: "Todos",
  budgetStatus: "Todos",
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
  authToggle: document.querySelector("#authToggle"),
  logoutBtn: document.querySelector("#logoutBtn"),
  sidebarToggle: document.querySelector("#sidebarToggle"),
  userName: document.querySelector("#userName"),
  userEmail: document.querySelector("#userEmail"),
  usersNavItem: document.querySelector("#usersNavItem"),
  budgetNavItem: document.querySelector("#budgetNavItem"),
  orderNavItem: document.querySelector("#orderNavItem"),
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
  budgetStartDate: document.querySelector("#budgetStartDate"),
  budgetEndDate: document.querySelector("#budgetEndDate"),
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
  leadImportFile: document.querySelector("#leadImportFile"),
  budgetClientSelect: document.querySelector("#budgetClientSelect"),
  budgetRows: document.querySelector("#budgetRows"),
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

function loadStoredSession() {
  try {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function saveSession(session) {
  state.session = session;
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return;
  }
  localStorage.removeItem(SESSION_KEY);
}

function userStorageKey() {
  return `${STORAGE_KEY}-${currentUserId() || "local"}`;
}

function environmentStorageKey() {
  return `${ENVIRONMENT_STORAGE_KEY}-${currentUserId() || "local"}`;
}

function showAuthMessage(message = "") {
  elements.authMessage.textContent = message;
}

function renderAuthMode() {
  const signingUp = state.authMode === "signup";
  elements.authTitle.textContent = signingUp ? "Criar conta" : "Entrar";
  elements.authSubtitle.textContent = signingUp
    ? "Crie seu acesso para separar seus clientes com seguranca."
    : "Acesse sua area para ver apenas seus clientes.";
  elements.authSubmit.textContent = signingUp ? "Criar conta" : "Entrar";
  elements.authToggle.textContent = signingUp ? "Ja tenho conta" : "Criar nova conta";
  elements.authPassword.autocomplete = signingUp ? "new-password" : "current-password";
  showAuthMessage();
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
  if (elements.budgetNavItem) {
    elements.budgetNavItem.hidden = !isAdmin();
  }
  if (elements.orderNavItem) {
    elements.orderNavItem.hidden = !isAdmin();
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

function normalizeClients(clients) {
  return clients.map(normalizeClientStatus);
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

function formatMoneyInput(value) {
  return BRL.format(parseMoney(value));
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
  const { _recordUserId, ...data } = client;
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

async function signUp(email, password) {
  const response = await fetch(supabaseAuthEndpoint("/signup"), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ email, password }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error_description || payload.msg || "Nao foi possivel criar a conta.");
  if (!payload.access_token) {
    throw new Error("Conta criada. Confirme seu e-mail antes de entrar.");
  }
  saveSession(payload);
}

async function signOut() {
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
  state.userRole = "user";
  state.userProfiles = [];
  state.clients = [];
  state.selectedId = null;
  if (elements.budgetNavItem) elements.budgetNavItem.hidden = true;
  if (elements.orderNavItem) elements.orderNavItem.hidden = true;
  showAuthScreen();
}

async function ensureUserProfile() {
  if (!remoteDatabaseEnabled() || !currentUserId()) {
    state.userRole = "user";
    return;
  }

  const email = state.session?.user?.email || "";
  try {
    let response = await fetch(supabaseProfilesEndpoint(`?id=eq.${encodeURIComponent(currentUserId())}&select=id,email,role,blocked,updated_at`), {
      headers: supabaseHeaders(),
    });
    if (!response.ok) {
      response = await fetch(supabaseProfilesEndpoint(`?id=eq.${encodeURIComponent(currentUserId())}&select=id,email,role,updated_at`), {
        headers: supabaseHeaders(),
      });
    }
    if (!response.ok) throw new Error("profiles_unavailable");

    const rows = await response.json();
    if (rows[0]) {
      if (rows[0].blocked) {
        alert("Usuario bloqueado. Fale com um administrador.");
        await signOut();
        return;
      }
      state.userRole = rows[0].role === "admin" ? "admin" : "user";
      return;
    }

    const createResponse = await fetch(supabaseProfilesEndpoint(), {
      method: "POST",
      headers: supabaseHeaders(),
      body: JSON.stringify({ id: currentUserId(), email, role: "user", blocked: false }),
    });
    if (!createResponse.ok) throw new Error("profile_create_failed");
    state.userRole = "user";
  } catch (error) {
    console.warn(error);
    state.userRole = "user";
  }
}

async function loadUserProfiles() {
  if (!remoteDatabaseEnabled() || !currentUserId() || !isAdmin()) {
    state.userProfiles = [];
    state.userLogs = [];
    return;
  }

  let response = await fetch(supabaseProfilesEndpoint("?select=id,email,role,blocked,updated_at&order=email.asc"), {
    headers: supabaseHeaders(),
  });
  if (!response.ok) {
    response = await fetch(supabaseProfilesEndpoint("?select=id,email,role,updated_at&order=email.asc"), {
      headers: supabaseHeaders(),
    });
  }
  if (!response.ok) throw new Error("Nao foi possivel carregar os usuarios.");
  state.userProfiles = await response.json();

  const logsResponse = await fetch(supabaseTableEndpoint("crm_audit_logs", "?select=created_at,action,target_user_id,target_email,details,actor_email&order=created_at.desc&limit=50"), {
    headers: supabaseHeaders(),
  });
  state.userLogs = logsResponse.ok ? await logsResponse.json() : [];
}

async function callAdminRpc(functionName, payload) {
  const response = await fetch(supabaseRpcEndpoint(functionName), {
    method: "POST",
    headers: supabaseHeaders("return=representation"),
    body: JSON.stringify(payload),
  });
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
  const response = await fetch(supabaseEndpoint("?select=user_id,data&order=updated_at.desc"), {
    headers: supabaseHeaders(),
  });
  if (!response.ok) {
    const message = response.status === 401 ? "Sessao expirada. Entre novamente." : "Nao foi possivel carregar os clientes do banco.";
    throw new Error(message);
  }
  const rows = await response.json();
  return normalizeClients(
    rows
      .map((row) => (row.data ? { ...row.data, _recordUserId: row.user_id } : null))
      .filter((client) => client && client.project && client.address)
  );
}

async function loadClients() {
  if (!remoteDatabaseEnabled() || !currentUserId()) {
    return loadLocalClients();
  }

  try {
    const clients = await loadRemoteClients();
    if (clients.length) return clients;

    const seeded = loadLocalClients();
    await saveRemoteClients(seeded);
    return seeded;
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

  const rows = clients.map((client) => ({
    id: client.id,
    user_id: client._recordUserId || currentUserId(),
    data: serializeClientData(client),
    updated_at: new Date().toISOString(),
  }));
  const response = await fetch(supabaseEndpoint("?on_conflict=id"), {
    method: "POST",
    headers: supabaseHeaders("resolution=merge-duplicates,return=minimal"),
    body: JSON.stringify(rows),
  });
  if (!response.ok) throw new Error("Nao foi possivel salvar os clientes no banco.");
}

async function deleteRemoteClient(clientId) {
  if (!remoteDatabaseEnabled() || !currentUserId()) return;

  const response = await fetch(supabaseEndpoint(`?id=eq.${encodeURIComponent(clientId)}`), {
    method: "DELETE",
    headers: supabaseHeaders(),
  });
  if (!response.ok) throw new Error("Nao foi possivel excluir o cliente no banco.");
}

async function saveClients() {
  localStorage.setItem(userStorageKey(), JSON.stringify(state.clients));
  if (!remoteDatabaseEnabled() || !currentUserId()) return;

  try {
    await saveRemoteClients(state.clients);
  } catch (error) {
    console.warn(error);
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
  if ((view === "users" || view === "budget" || view === "order") && !isAdmin()) {
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

  state.view = view;
  document.body.dataset.view = view;
  state.selectedId = selectedId || state.selectedId;
  if (view === "detail" && previousView !== "detail") {
    state.returnView = previousView;
  }

  elements.views.forEach((viewElement) => viewElement.classList.remove("active"));
  const viewElementId = view === "order" ? "budgetView" : `${view}View`;
  document.querySelector(`#${viewElementId}`).classList.add("active");

  elements.navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.view === view);
  });

  render();
}

function setStatusFilter(group, status) {
  if (group === "dashboard") {
    state.dashboardStatus = status;
    state.clientStatus = status;
  }
  if (group === "clients") state.clientStatus = status;
  if (group === "budget") state.budgetStatus = status;
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

function clientSortValue(client, key) {
  const values = {
    name: client.name || "",
    mobile: client.mobile || "",
    phone: client.phone || "",
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
    code: budgetCodeSequence(item.budget.code),
    client: item.client.name || "",
    seller: responsibleSeller(item.client),
    status: item.budget.status || "",
    gross: totals.gross,
    cost: totals.cost,
    profit: totals.profit,
    margin: totals.margin,
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

function renderStatusFilters(container, activeStatus, group) {
  if (!container) return;
  container.innerHTML = "";

  const statuses = group === "budget" ? ["Todos", ...BUDGET_STATUS] : STATUS;
  statuses.forEach((status) => {
    const button = document.createElement("button");
    button.className = `pill ${status === activeStatus ? "active" : ""}`;
    button.type = "button";
    button.textContent = status;
    button.addEventListener("click", () => setStatusFilter(group, status));
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
  const budgets = filteredBudgets();
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

  if (!clients.length) {
    elements.clientRows.innerHTML = '<tr><td colspan="6" class="empty-state">Nenhum cliente encontrado</td></tr>';
    return;
  }

  clients.forEach((client) => {
    const row = document.createElement("tr");
    [client.name, client.email || "—", client.phone || "—", client.city || "—"].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });

    const statusCell = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = `status-badge ${statusClass(client.status)}`;
    badge.textContent = client.status;
    statusCell.appendChild(badge);
    row.appendChild(statusCell);

    const actionCell = document.createElement("td");
    const button = document.createElement("button");
    button.className = "link-button";
    button.type = "button";
    button.textContent = "Ver";
    button.addEventListener("click", () => openClientRegistration(client.id, "clients"));
    actionCell.appendChild(button);
    row.appendChild(actionCell);

    elements.clientRows.appendChild(row);
  });
}

function renderClients() {
  const clients = filteredClients("clients");
  document.querySelector("#clientCount").textContent = state.clients.length;
  elements.clientRows.innerHTML = "";

  if (!clients.length) {
    elements.clientRows.innerHTML = '<tr><td colspan="13" class="empty-state">Nenhum cliente encontrado</td></tr>';
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
      { className: "client-phone-cell", value: client.phone || "-" },
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

function currentBudgetDraft() {
  return {
    id: state.budgetEditingId || `budget-${Date.now()}`,
    code: budgetInputValue("budgetCode") || nextBudgetCode(),
    status: BUDGET_STATUS.includes(budgetInputValue("budgetStatus")) ? budgetInputValue("budgetStatus") : BUDGET_STATUS[0],
    createdAt: readBudgetCreatedAt(),
    settings: readBudgetSettings(),
    rows: readBudgetRows(),
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
  return `${String(maxSequence + 1).padStart(3, "0")}-${period}`;
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
  return {
    id: saved.id || saved.code || "",
    code: saved.code || (saved.updatedAt ? fallbackBudgetCode(client) : ""),
    status: BUDGET_STATUS.includes(saved.status) ? saved.status : BUDGET_STATUS[0],
    createdAt: saved.createdAt || saved.updatedAt || new Date().toISOString(),
    settings: { ...DEFAULT_BUDGET_SETTINGS, ...(saved.settings || {}) },
    rows: Array.isArray(saved.rows) && saved.rows.length ? saved.rows : defaultBudgetRows(client),
    cashPayments: Array.isArray(saved.cashPayments) ? saved.cashPayments : defaultCashPaymentRows(),
    notes: saved.notes || "",
  };
}

function blankBudget() {
  return {
    id: `budget-${Date.now()}`,
    code: nextBudgetCode(),
    status: BUDGET_STATUS[0],
    createdAt: new Date().toISOString(),
    settings: { ...DEFAULT_BUDGET_SETTINGS },
    rows: [{ name: "", gross: 0, factory: 0, hardware: 0 }],
    cashPayments: defaultCashPaymentRows(),
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

function renderBudgetEditorSubtitle(client) {
  const subtitle = document.querySelector("#budgetEditorSubtitle");
  subtitle.innerHTML = "";
  if (!client) return;

  [
    ["Cliente", client.name || "-"],
    ["Vendedor", responsibleSeller(client) || "-"],
  ].forEach(([label, value]) => {
    const item = document.createElement("span");
    const labelElement = document.createElement("strong");
    const valueElement = document.createElement("span");
    labelElement.textContent = `${label}:`;
    valueElement.textContent = value;
    item.append(labelElement, valueElement);
    subtitle.appendChild(item);
  });
}

function readBudgetSettings() {
  return {
    discountRate: Number(budgetInputValue("budgetDiscountRate")) || 0,
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

function calculateBudgetRows(rows, settings) {
  const rates = {
    discount: percentToRate(settings.discountRate),
    release: percentToRate(settings.releaseRate),
    assembly: percentToRate(settings.assemblyRate),
    lela: percentToRate(settings.lelaRate),
    iris: percentToRate(settings.irisRate),
    tax: percentToRate(settings.taxRate),
  };

  return rows.map((row) => {
    const gross = parseMoney(row.gross);
    const factory = parseMoney(row.factory);
    const hardware = parseMoney(row.hardware);
    const net = gross - gross * rates.discount;
    const release = net * rates.release;
    const assembly = net * rates.assembly;
    const tax = net * rates.tax;
    const profitBeforeProfitRates = net - factory - hardware - release - assembly - tax;
    const profitRateTotal = rates.lela + rates.iris;
    const profit = profitBeforeProfitRates > 0 ? profitBeforeProfitRates / (1 + profitRateTotal) : profitBeforeProfitRates;
    const lela = profit > 0 ? profit * rates.lela : 0;
    const iris = profit > 0 ? profit * rates.iris : 0;
    const totalCost = factory + hardware + release + assembly + lela + iris + tax;
    return {
      ...row,
      gross,
      factory,
      hardware,
      release,
      assembly,
      lela,
      iris,
      tax,
      totalCost,
      net,
      profit,
      margin: net ? profit / net : 0,
    };
  });
}

function budgetTotals(calculatedRows, settings) {
  const rowTotals = calculatedRows.reduce(
    (summary, row) => ({
      gross: summary.gross + row.gross,
      net: summary.net + row.net,
      cost: summary.cost + row.totalCost,
      profit: summary.profit + row.profit,
    }),
    { gross: 0, net: 0, cost: 0, profit: 0 }
  );
  const dailyTotal = (Number(settings.dailyQuantity) || 0) * parseMoney(settings.dailyValue);
  const totals = {
    ...rowTotals,
    cost: rowTotals.cost + dailyTotal,
    profit: rowTotals.profit - dailyTotal,
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
      hardware: summary.hardware + row.hardware,
      release: summary.release + row.release,
      assembly: summary.assembly + row.assembly,
      lela: summary.lela + row.lela,
      iris: summary.iris + row.iris,
      tax: summary.tax + row.tax,
    }),
    { factory: 0, hardware: 0, release: 0, assembly: 0, lela: 0, iris: 0, tax: 0 }
  );

  document.querySelector("#budgetRowsTotalGross").textContent = BRL.format(totals.gross);
  document.querySelector("#budgetRowsTotalFactory").textContent = BRL.format(rowTotals.factory);
  document.querySelector("#budgetRowsTotalHardware").textContent = BRL.format(rowTotals.hardware);
  document.querySelector("#budgetRowsTotalRelease").textContent = BRL.format(rowTotals.release);
  document.querySelector("#budgetRowsTotalAssembly").textContent = BRL.format(rowTotals.assembly);
  document.querySelector("#budgetRowsTotalLela").textContent = BRL.format(rowTotals.lela);
  document.querySelector("#budgetRowsTotalIris").textContent = BRL.format(rowTotals.iris);
  document.querySelector("#budgetRowsTotalTax").textContent = BRL.format(rowTotals.tax);
  document.querySelector("#budgetRowsTotalCost").textContent = BRL.format(totals.cost);
  document.querySelector("#budgetRowsTotalNet").textContent = BRL.format(totals.net);
  document.querySelector("#budgetRowsTotalProfit").textContent = BRL.format(totals.profit);
  document.querySelector("#budgetRowsTotalMargin").textContent = formatPercent(totals.margin);
}

function updateBudgetSummary() {
  if (!elements.budgetRows) return;
  const settings = readBudgetSettings();
  const calculatedRows = calculateBudgetRows(readBudgetRows(), settings);
  const totals = budgetTotals(calculatedRows, settings);

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
    row.querySelector('[data-budget-result="release"]').textContent = BRL.format(values.release || 0);
    row.querySelector('[data-budget-result="assembly"]').textContent = BRL.format(values.assembly || 0);
    row.querySelector('[data-budget-result="lela"]').textContent = BRL.format(values.lela || 0);
    row.querySelector('[data-budget-result="iris"]').textContent = BRL.format(values.iris || 0);
    row.querySelector('[data-budget-result="tax"]').textContent = BRL.format(values.tax || 0);
    row.querySelector('[data-budget-result="totalCost"]').textContent = BRL.format(values.totalCost || 0);
    row.querySelector('[data-budget-result="net"]').textContent = BRL.format(values.net || 0);
    row.querySelector('[data-budget-result="profit"]').textContent = BRL.format(values.profit || 0);
    row.querySelector('[data-budget-result="margin"]').textContent = formatPercent(values.margin || 0);
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
      ${printField("Telefone", client.phone || client.mobile)}
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

function buildMaterialRows(rows, startIndex = 0) {
  const materialRows = rows.slice(0, ORDER_MATERIAL_ROWS_PER_PAGE);
  while (materialRows.length < ORDER_MATERIAL_ROWS_PER_PAGE) materialRows.push({});
  return materialRows
    .map(
      (row, index) => `<tr>
        <td colspan="2" class="center">${row.name ? startIndex + index + 1 : ""}</td>
        <td colspan="4">${escapeHtml(row.name || "")}</td>
        <td colspan="4"></td>
        <td colspan="3"></td>
        <td colspan="3"></td>
        <td colspan="4"></td>
        <td colspan="6"></td>
      </tr>`
    )
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
  const orderRows = buildOrderRows([...rows], startIndex);
  const materialRows = buildMaterialRows([...rows], startIndex);
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
        <tr><td colspan="8" class="label">Telefone</td><td colspan="10" class="label">Celular</td><td colspan="8" class="label">E-mail</td></tr>
        <tr><td colspan="8">${escapeHtml(client.phone || "")}</td><td colspan="10">${escapeHtml(client.mobile || "")}</td><td colspan="8">${escapeHtml(client.email || "")}</td></tr>
        <tr><td colspan="18" class="label">Endereco de entrega</td><td colspan="8" class="label order-small">Prazo entrega em dias uteis, apos assinatura do projeto executivo</td></tr>
        <tr><td colspan="18">O mesmo</td><td colspan="8" class="center strong">45</td></tr>
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
        <td class="money">${BRL.format(row.hardware || 0)}</td>
        <td class="money">${BRL.format(row.release || 0)}</td>
        <td class="money">${BRL.format(row.assembly || 0)}</td>
        <td class="money">${BRL.format(row.lela || 0)}</td>
        <td class="money">${BRL.format(row.iris || 0)}</td>
        <td class="money">${BRL.format(row.tax || 0)}</td>
        <td class="money">${BRL.format(row.totalCost || 0)}</td>
        <td class="money">${BRL.format(row.net || 0)}</td>
        <td class="money">${BRL.format(row.profit || 0)}</td>
        <td class="money">${formatPercent(row.margin || 0)}</td>
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
            <th>Ambiente</th><th class="money">VITTA</th><th class="money">Fábrica</th><th class="money">Ferragens</th><th class="money">Liberação</th>
            <th class="money">Montagem</th><th class="money">LELA</th><th class="money">IRIS</th><th class="money">Impostos</th>
            <th class="money">Custo total</th><th class="money">Liquido</th><th class="money">Lucro</th><th class="money">Margem</th>
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

function createBudgetRow(rowData = {}) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td data-budget-environment></td>
    <td><input class="money-input" data-budget-field="gross" inputmode="decimal" /></td>
    <td><input class="money-input" data-budget-field="factory" inputmode="decimal" /></td>
    <td><input class="money-input" data-budget-field="hardware" inputmode="decimal" /></td>
    <td data-budget-result="release"></td>
    <td data-budget-result="assembly"></td>
    <td data-budget-result="lela"></td>
    <td data-budget-result="iris"></td>
    <td data-budget-result="tax"></td>
    <td data-budget-result="totalCost"></td>
    <td data-budget-result="net"></td>
    <td data-budget-result="profit"></td>
    <td data-budget-result="margin"></td>
    <td><button class="icon-button danger" type="button" data-budget-remove aria-label="Remover ambiente" title="Remover ambiente">🗑</button></td>
  `;
  const focusBudgetGross = () => {
    window.setTimeout(() => row.querySelector('[data-budget-field="gross"]')?.focus(), 0);
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
  row.querySelector('[data-budget-field="hardware"]').addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.value = formatMoneyInput(event.currentTarget.value);
    let nextRow = row.nextElementSibling;
    if (!nextRow) {
      nextRow = createBudgetRow({ name: "", gross: 0, factory: 0, hardware: 0 });
      row.after(nextRow);
    }
    markBudgetDirty();
    updateBudgetSummary();
    focusAfterEnterRelease(() => nextRow.querySelector('[data-budget-field="name"]') || nextRow.querySelector('[data-budget-field="gross"]'));
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
  state.budgetEditingId = budgetIdentity(budget) || state.budgetEditingId;
  const settings = budget.settings;
  const targetClient = selectedBudgetClient();
  const documentLabel = state.view === "order" ? "Pedido" : "Orçamento";
  document.querySelector("#budgetEditorTitle").textContent = state.budgetIsNew ? `Novo ${documentLabel}` : `Cadastro ${documentLabel}`;
  renderBudgetEditorSubtitle(targetClient);
  document.querySelector("#budgetEditClientBtn").disabled = false;
  document.querySelector("#budgetEditClientBtn").title = targetClient ? "Editar cliente" : "Cadastrar cliente";
  document.querySelector("#budgetEditClientBtn").setAttribute("aria-label", targetClient ? "Editar cliente" : "Cadastrar cliente");
  document.querySelector("#budgetCode").value = budget.code || nextBudgetCode();
  document.querySelector("#budgetCreatedAt").value = formatDateTimeLocal(budget.createdAt || new Date());
  document.querySelector("#budgetStatus").value = budget.status || BUDGET_STATUS[0];
  document.querySelector("#budgetEntry").value = formatMoneyInput(settings.entry);
  document.querySelector("#budgetEntryTerm").value = String(settings.entryTerm || 30);
  document.querySelector("#budgetInstallments").value = String(settings.installments || 0);
  document.querySelector("#budgetDiscountRate").value = settings.discountRate;
  document.querySelector("#budgetReleaseRate").value = settings.releaseRate;
  document.querySelector("#budgetAssemblyRate").value = settings.assemblyRate;
  document.querySelector("#budgetLelaRate").value = settings.lelaRate;
  document.querySelector("#budgetIrisRate").value = settings.irisRate;
  document.querySelector("#budgetTaxRate").value = settings.taxRate;
  document.querySelector("#budgetDailyQuantity").value = settings.dailyQuantity || "";
  document.querySelector("#budgetDailyValue").value = formatMoneyInput(settings.dailyValue || 0);
  document.querySelector("#budgetNotes").value = budget.notes || "";
  renderCashPaymentRows(budget.cashPayments);

  elements.budgetRows.innerHTML = "";
  budget.rows.forEach((row) => elements.budgetRows.appendChild(createBudgetRow(row)));
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

function budgetCodeSequence(code) {
  const match = String(code || "").match(/^(\d+)/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

function budgetDateValue(budget) {
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
  const budgets = state.clients
    .flatMap((client) => clientBudgetHistory(client).map((budget) => ({ client, budget })))
    .filter(({ client, budget }) => {
      const matchesSearch = [budget.code, budget.status, client.name, client.status, responsibleSeller(client), client.id].some((value) =>
        String(value || "").toLowerCase().includes(search)
      );
      const matchesStatus = state.budgetStatus === "Todos" || budget.status === state.budgetStatus;
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
  const documentLabel = state.view === "order" ? "pedido" : "orçamento";
  updateSortHeaders("budget");

  document.querySelector("#budgetCount").textContent = budgets.length;
  document.querySelector("#budgetHeader p").lastChild.textContent = ` ${documentLabel}s disponíveis`;
  rows.innerHTML = "";

  if (!budgets.length) {
    rows.innerHTML = `<tr><td colspan="10" class="empty-state">Nenhum ${documentLabel} encontrado</td></tr>`;
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

    [
      budget.code || "-",
      client.name,
      responsibleSeller(client),
      budget.status || "Negociação",
    ].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value || "-";
      row.appendChild(cell);
    });

    [
      BRL.format(totals.gross),
      BRL.format(totals.cost),
      BRL.format(totals.profit),
      formatPercent(totals.margin),
      budget.updatedAt ? new Date(budget.updatedAt).toLocaleString("pt-BR") : "-",
    ].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });

    row.addEventListener("dblclick", () => openBudgetEditor(client.id, { budgetId: budgetIdentity(budget) }));
    rows.appendChild(row);
  });
}

function renderBudget() {
  if (!elements.budgetClientSelect || !isAdmin()) return;
  renderBudgetClientOptions();
  renderBudgetList();
  renderBudgetDashboard();

  const isBudgetArea = state.view === "budget" || state.view === "order";
  const orderMode = state.view === "order";
  const editing = isBudgetArea && state.budgetEditing;
  document.body.dataset.budgetViewMode = orderMode ? "order" : "budget";
  document.querySelector("#budgetHeader h1").textContent = orderMode ? "Pedido" : "Orçamento";
  document.body.dataset.budgetEditing = editing ? "true" : "false";
  document.querySelector("#budgetHeader").hidden = editing;
  document.querySelector("#budgetDashboard").hidden = editing;
  elements.budgetListCard.hidden = editing;
  elements.budgetEditor.hidden = !editing;
  if (editing) fillBudgetForm(sourceBudgetClient());
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
  const budgetPayload = {
    id: state.budgetEditingId || `budget-${Date.now()}`,
    code: budgetInputValue("budgetCode") || nextBudgetCode(),
    status: BUDGET_STATUS.includes(budgetInputValue("budgetStatus")) ? budgetInputValue("budgetStatus") : BUDGET_STATUS[0],
    createdAt: readBudgetCreatedAt(),
    settings,
    rows,
    cashPayments: readCashPaymentRows(),
    notes: document.querySelector("#budgetNotes")?.value.trim() || "",
    updatedAt: new Date().toISOString(),
  };
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
  await saveClients();
  refreshEnvironmentCatalog(rows.map((row) => row.name));
  state.budgetEditing = false;
  state.budgetDirty = false;
  state.budgetIsNew = false;
  state.budgetSourceId = null;
  state.budgetEditingId = null;
  state.budgetDraft = null;
  render();
  alert("Orçamento salvo com sucesso.");
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
  document.querySelector("#detailPhone").textContent = client.phone || "—";
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
  document.querySelector("#formPhone").value = client ? client.phone : "";
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

function openProjectDialog() {
  const client = selectedClient();
  if (!client) return;

  document.querySelector("#editName").value = client.name || "";
  document.querySelector("#editCpf").value = client.cpf || "";
  document.querySelector("#editPhone").value = client.phone || "";
  document.querySelector("#editEmail").value = client.email || "";
  document.querySelector("#editStatus").value = normalizeLeadStatus(client.status || DEFAULT_STATUS);
  document.querySelector("#editOwner").value = client.owner || "";
  document.querySelector("#editCep").value = client.address.cep || "";
  document.querySelector("#editState").value = client.state || "";
  document.querySelector("#editStreet").value = client.address.street || "";
  document.querySelector("#editNumber").value = client.address.number || "";
  document.querySelector("#editComplement").value = client.address.complement || "";
  document.querySelector("#editDistrict").value = client.address.district || "";
  document.querySelector("#editCity").value = client.city || "";
  document.querySelector("#projectDeadline").value = client.project.deadline || "";
  document.querySelector("#projectCreatedBy").value = registeredBy(client);
  document.querySelector("#projectCreated").value = client.project.created || "";
  document.querySelector("#projectNotes").value = client.project.notes || "";

  elements.projectRows.innerHTML = "";
  const environments = client.project.environments.length
    ? client.project.environments
    : [{ name: "", budget: 0, factory: 0, assembly: 0 }];
  environments.forEach((environment) => elements.projectRows.appendChild(createEnvironmentRow(environment)));

  elements.projectDialog.showModal();
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
  document.querySelector("#editPhone").value = editableClient.phone || "";
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
      phone: document.querySelector("#editPhone").value.trim(),
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

  await saveClients();
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
    phone: document.querySelector("#editPhone").value.trim(),
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
  await saveClients();
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
    await saveClients();
    state.budgetEditingId = payloadIdentity;
    state.budgetDirty = false;
    state.budgetIsNew = false;
    state.budgetDraft = null;
    closeProjectForm();
    showView("budget", savedClient.id);
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
        phone: document.querySelector("#formPhone").value.trim(),
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
    await saveClients();
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
    phone: document.querySelector("#formPhone").value.trim(),
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
  await saveClients();
  state.clientDialogDirty = false;
  elements.dialog.close();
  openClientRegistration(client.id, "clients");
}

function exportCsv() {
  const rows = [["Nome", "Email", "Telefone", "Cidade", "Status", "Ativo", "Faturamento", "Lucro"]];
  state.clients.forEach((client) => {
    const totals = clientTotals(client);
    rows.push([client.name, client.email, client.phone, client.city, client.status, normalizeClientActive(client.active, client.status), totals.revenue, totals.profit]);
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

  await saveClients();
  render();
  alert(`${importedClients.length} lead(s) importado(s) com sucesso.`);
}

function openLeadImportFilePicker() {
  elements.leadImportFile.value = "";
  elements.leadImportFile.click();
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

function focusAfterEnterRelease(resolveField) {
  let handled = false;
  const focusTarget = () => {
    if (handled) return;
    handled = true;
    document.removeEventListener("keyup", onKeyUp);
    const target = resolveField();
    if (!(target instanceof HTMLElement)) return;
    target.focus();
    if (target instanceof HTMLInputElement) target.select();
  };
  const fallback = window.setTimeout(() => {
    document.removeEventListener("keyup", onKeyUp);
    focusTarget();
  }, 120);
  function onKeyUp(event) {
    if (event.key !== "Enter") return;
    window.clearTimeout(fallback);
    focusTarget();
  }
  document.addEventListener("keyup", onKeyUp);
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

function render() {
  renderStatusFilters(elements.dashboardFilters, state.dashboardStatus, "dashboard");
  renderStatusFilters(elements.clientFilters, state.dashboardStatus, "clients");
  renderStatusFilters(elements.budgetFilters, state.budgetStatus, "budget");
  renderDashboard();
  renderClients();
  renderProjects();
  renderBudget();
  renderEnvironmentManager();
  renderUsers();
  renderDetail();
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

function toggleSidebar() {
  const collapsed = document.body.dataset.sidebarCollapsed !== "true";
  localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
  applySidebarCollapsed(collapsed);
}

elements.authToggle.addEventListener("click", () => {
  state.authMode = state.authMode === "signin" ? "signup" : "signin";
  renderAuthMode();
});

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
  showAuthMessage(state.authMode === "signup" ? "Criando conta..." : "Entrando...");

  try {
    if (state.authMode === "signup") {
      await signUp(email, password);
    } else {
      await signIn(email, password);
    }
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

elements.navItems.forEach((item) => {
  item.addEventListener("click", async () => {
    if (item.dataset.view === "users" && isAdmin()) {
      try {
        await loadUserProfiles();
      } catch (error) {
        console.warn(error);
        alert(error.message || "Nao foi possivel carregar os usuarios.");
      }
    }
    await showView(item.dataset.view);
  });
});

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
  if (!(await confirmDiscardBudgetChanges())) return;
  const client = selectedBudgetClient();
  if (client) {
    state.selectedId = client.id;
    openProjectDialog(client);
    return;
  }
  state.budgetDraft = currentBudgetDraft();
  state.projectReturnView = state.view === "order" ? "order" : "budget";
  openProjectDialog(null);
});
elements.budgetClientSelect?.addEventListener("change", () => {
  state.selectedId = elements.budgetClientSelect.value || null;
  markBudgetDirty();
  const targetClient = selectedBudgetClient();
  renderBudgetEditorSubtitle(targetClient);
  document.querySelector("#budgetEditClientBtn").title = targetClient ? "Editar cliente" : "Cadastrar cliente";
  document.querySelector("#budgetEditClientBtn").setAttribute("aria-label", targetClient ? "Editar cliente" : "Cadastrar cliente");
});
document.querySelector("#budgetAddEnvironment")?.addEventListener("click", () => {
  const row = createBudgetRow({ name: "", gross: 0, factory: 0, hardware: 0 });
  elements.budgetRows.appendChild(row);
  markBudgetDirty();
  updateBudgetSummary();
  focusEmptyEnvironmentSelect(row.querySelector('[data-budget-field="name"]'));
});
document.querySelector("#budgetPrintOrderBtn")?.addEventListener("click", () => previewPrintableBudgetDocument("order"));
document.querySelector("#budgetPrintQuoteBtn")?.addEventListener("click", () => previewPrintableBudgetDocument("quote"));
elements.budgetPreviewPrintBtn?.addEventListener("click", printBudgetPreview);
elements.budgetPreviewCloseBtn?.addEventListener("click", closeBudgetPrintPreview);
document.querySelector("#budgetSaveBtn")?.addEventListener("click", saveBudget);
[
  "#budgetCreatedAt",
  "#budgetEntry",
  "#budgetEntryTerm",
  "#budgetStatus",
  "#budgetInstallments",
  "#budgetDiscountRate",
  "#budgetReleaseRate",
  "#budgetAssemblyRate",
  "#budgetLelaRate",
  "#budgetIrisRate",
  "#budgetTaxRate",
  "#budgetDailyQuantity",
  "#budgetDailyValue",
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
    await saveClients();
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
document.querySelectorAll("[data-legacy-logout]").forEach((button) => {
  button.addEventListener("click", signOut);
});
elements.form.addEventListener("submit", saveClientFromDialog);
elements.projectForm.addEventListener("submit", saveProjectFromDialog);
window.addEventListener("resize", () => {
  if (state.view === "clients") {
    renderDashboard();
  }
  if (state.view === "budget" || state.view === "order") {
    renderBudgetDashboard();
  }
});

async function startApp() {
  await ensureUserProfile();
  showAuthenticatedApp();
  state.clients = await loadClients();
  if (isAdmin()) {
    try {
      await loadUserProfiles();
    } catch (error) {
      console.warn(error);
    }
  }
  refreshEnvironmentCatalog();
  state.selectedId = state.clients[0]?.id || null;
  state.view = "clients";
  showView("clients");
  render();
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
