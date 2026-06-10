const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const STORAGE_KEY = "movelcrm-clients";
const SESSION_KEY = "movelcrm-session";
const ENVIRONMENT_STORAGE_KEY = "movelcrm-environments";
const STATUS = [
  "Todos",
  "Novo",
  "Contato Realizado",
  "Visita Agendada",
  "Projeto",
  "Orçamento",
  "Medição",
  "Entrega Fabrica",
  "Montagem",
  "Negociação",
  "Fechado Ganho",
  "Fechado Perdido",
];
const DEFAULT_STATUS = "Novo";
const FINAL_USE_OPTIONS = ["Alugar", "Residir", "Negociar"];
const STATUS_MIGRATION = {
  Lead: "Novo",
  "Em negociacao": "Negociação",
  "Em negociação": "Negociação",
  Fechado: "Fechado Ganho",
  Cancelado: "Fechado Perdido",
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
  authMode: "signin",
  view: "dashboard",
  dashboardStatus: "Todos",
  clientStatus: "Todos",
  search: "",
  projectSearch: "",
  selectedId: null,
  editingId: null,
  projectAction: "stay",
  projectReturnView: "clients",
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
  userName: document.querySelector("#userName"),
  userEmail: document.querySelector("#userEmail"),
  usersNavItem: document.querySelector("#usersNavItem"),
  userRows: document.querySelector("#userRows"),
  navItems: document.querySelectorAll(".nav-item"),
  views: document.querySelectorAll(".view"),
  dashboardFilters: document.querySelector('[data-filter-group="dashboard"]'),
  clientFilters: document.querySelector('[data-filter-group="clients"]'),
  clientRows: document.querySelector("#clientRows"),
  recentClients: document.querySelector("#recentClients"),
  projectCards: document.querySelector("#projectCards"),
  projectListRows: document.querySelector("#projectListRows"),
  projectSearch: document.querySelector("#projectSearch"),
  clientSearch: document.querySelector("#clientSearch"),
  chart: document.querySelector("#statusChart"),
  dialog: document.querySelector("#clientDialog"),
  form: document.querySelector("#clientForm"),
  projectDialog: document.querySelector("#projectDialog"),
  projectForm: document.querySelector("#projectForm"),
  projectRows: document.querySelector("#projectEnvironmentRows"),
  environmentOptions: document.querySelector("#environmentOptions"),
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

function normalizeClientStatus(client) {
  return {
    ...client,
    status: normalizeLeadStatus(client.status),
    finalUse: FINAL_USE_OPTIONS.includes(client.finalUse) ? client.finalUse : "",
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
      status: "Fechado Ganho",
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

function saveEnvironmentCatalog() {
  localStorage.setItem(environmentStorageKey(), JSON.stringify(state.environments));
}

function clientEnvironmentNames() {
  return state.clients.flatMap((client) =>
    (client.project?.environments || []).map((environment) => normalizeEnvironmentName(environment.name || ""))
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
  const names = [...DEFAULT_ENVIRONMENTS, ...loadStoredEnvironments(), ...clientEnvironmentNames(), ...extraEnvironments]
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
  showAuthScreen();
}

async function ensureUserProfile() {
  if (!remoteDatabaseEnabled() || !currentUserId()) {
    state.userRole = "user";
    return;
  }

  const email = state.session?.user?.email || "";
  try {
    const response = await fetch(supabaseProfilesEndpoint(`?id=eq.${encodeURIComponent(currentUserId())}&select=id,email,role,updated_at`), {
      headers: supabaseHeaders(),
    });
    if (!response.ok) throw new Error("profiles_unavailable");

    const rows = await response.json();
    if (rows[0]) {
      state.userRole = rows[0].role === "admin" ? "admin" : "user";
      return;
    }

    const createResponse = await fetch(supabaseProfilesEndpoint(), {
      method: "POST",
      headers: supabaseHeaders(),
      body: JSON.stringify({ id: currentUserId(), email, role: "user" }),
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
    return;
  }

  const response = await fetch(supabaseProfilesEndpoint("?select=id,email,role,updated_at&order=email.asc"), {
    headers: supabaseHeaders(),
  });
  if (!response.ok) throw new Error("Nao foi possivel carregar os usuarios.");
  state.userProfiles = await response.json();
}

async function updateUserRole(userId, role) {
  if (!isAdmin()) return;

  const response = await fetch(supabaseProfilesEndpoint(`?id=eq.${encodeURIComponent(userId)}`), {
    method: "PATCH",
    headers: supabaseHeaders(),
    body: JSON.stringify({ role, updated_at: new Date().toISOString() }),
  });
  if (!response.ok) throw new Error("Nao foi possivel atualizar o perfil do usuario.");

  if (userId === currentUserId()) {
    state.userRole = role;
    showAuthenticatedApp();
    if (!isAdmin()) showView("dashboard");
  }
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

function statusClass(status) {
  const normalized = normalizeLeadStatus(status)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `status-${normalized}`;
}

function showView(view, selectedId) {
  if (view === "users" && !isAdmin()) {
    view = "dashboard";
  }

  const previousView = state.view;
  state.view = view;
  document.body.dataset.view = view;
  state.selectedId = selectedId || state.selectedId;
  if (view === "detail" && previousView !== "detail") {
    state.returnView = previousView;
  }

  elements.views.forEach((viewElement) => viewElement.classList.remove("active"));
  document.querySelector(`#${view}View`).classList.add("active");

  elements.navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.view === view);
  });

  render();
}

function setStatusFilter(group, status) {
  if (group === "dashboard") state.dashboardStatus = status;
  if (group === "clients") state.clientStatus = status;
  render();
}

function filteredClients(group) {
  const status = group === "dashboard" ? state.dashboardStatus : state.clientStatus;
  const search = state.search.toLowerCase();

  return state.clients.filter((client) => {
    const matchesStatus = status === "Todos" || client.status === status;
    const matchesSearch =
      !search ||
      [client.name, client.email, client.phone, client.cpf, client.mobile].some((value) => String(value || "").toLowerCase().includes(search));

    return matchesStatus && (group === "clients" ? matchesSearch : true);
  });
}

function renderStatusFilters(container, activeStatus, group) {
  container.innerHTML = "";

  STATUS.forEach((status) => {
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
  const totals = clients.reduce(
    (summary, client) => {
      const total = clientTotals(client);
      summary.revenue += total.revenue;
      summary.cost += total.cost;
      summary.profit += total.profit;
      return summary;
    },
    { revenue: 0, cost: 0, profit: 0 }
  );

  document.querySelector("#totalClients").textContent = clients.length;
  document.querySelector("#totalNegotiating").textContent = clients.filter((client) => client.status === "Negociação").length;
  document.querySelector("#totalClosed").textContent = clients.filter((client) => client.status === "Fechado Ganho").length;
  document.querySelector("#totalRevenue").textContent = BRL.format(totals.revenue);
  document.querySelector("#totalCost").textContent = BRL.format(totals.cost);
  document.querySelector("#totalProfit").textContent = BRL.format(totals.profit);

  renderChart(clients);
  renderRecentClients(clients);
}

function renderRecentClients(clients) {
  elements.recentClients.innerHTML = "";

  clients.slice(0, 3).forEach((client) => {
    const row = document.createElement("div");
    const info = document.createElement("div");
    const name = document.createElement("span");
    const email = document.createElement("span");
    const badge = document.createElement("button");

    row.className = "recent-row";
    name.className = "recent-name";
    email.className = "recent-email";
    badge.className = `status-badge recent-status ${statusClass(client.status)}`;
    badge.type = "button";
    badge.setAttribute("aria-label", `Abrir cadastro e projeto de ${client.name}`);

    name.textContent = client.name;
    email.textContent = client.email || "-";
    badge.textContent = client.status;
    badge.addEventListener("click", () => showView("detail", client.id));

    info.append(name, email);
    row.append(info, badge);
    elements.recentClients.appendChild(row);
  });

  if (!clients.length) {
    elements.recentClients.innerHTML = '<div class="empty-state">Nenhum cliente encontrado</div>';
  }
}

function renderChart(clients) {
  const canvas = elements.chart;
  const displayWidth = canvas.clientWidth || 1200;
  const displayHeight = 310;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(displayWidth * ratio);
  canvas.height = Math.round(displayHeight * ratio);
  const context = canvas.getContext("2d");
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  const width = displayWidth;
  const height = displayHeight;
  const padding = { top: 22, right: 24, bottom: 70, left: 72 };
  const statuses = STATUS.slice(1);
  const values = statuses.map((status) => {
    const statusClients = clients.filter((client) => client.status === status);
    return statusClients.reduce(
      (sum, client) => {
        const total = clientTotals(client);
        sum.revenue += total.revenue;
        sum.profit += total.profit;
        return sum;
      },
      { revenue: 0, profit: 0 }
    );
  });
  const maxValue = Math.max(140000, ...values.flatMap((item) => [item.revenue, item.profit]));
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

  [0, 35000, 70000, 105000, 140000].forEach((tick) => {
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
    button.addEventListener("click", () => showView("detail", client.id));
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
    elements.clientRows.innerHTML = '<tr><td colspan="7" class="empty-state">Nenhum cliente encontrado</td></tr>';
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
    folderButton.addEventListener("click", () => showView("detail", client.id));
    folderCell.appendChild(folderButton);
    row.appendChild(folderCell);

    [client.id, client.name, client.cpf || "-", client.phone || "-", client.mobile || "-"].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });

    const activeCell = document.createElement("td");
    const activeBadge = document.createElement("span");
    activeBadge.className = "active-badge";
    activeBadge.textContent = client.status === "Fechado Perdido" ? "Não" : "Sim";
    activeCell.appendChild(activeBadge);
    row.appendChild(activeCell);

    row.addEventListener("dblclick", () => {
      state.selectedId = client.id;
      openProjectDialog();
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
    rows.innerHTML = '<tr><td colspan="9" class="empty-state">Nenhum projeto encontrado</td></tr>';
    return;
  }

  projects.forEach((client) => {
    const totals = clientTotals(client);
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
      client.id,
      client.name,
      environmentSummary,
      responsibleSeller(client),
      client.project.deadline || "A definir",
      BRL.format(totals.revenue),
      BRL.format(totals.profit),
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

  if (!isAdmin()) {
    elements.userRows.innerHTML = '<tr><td colspan="3" class="empty-state">Acesso restrito a administradores</td></tr>';
    return;
  }

  if (!state.userProfiles.length) {
    elements.userRows.innerHTML = '<tr><td colspan="3" class="empty-state">Nenhum usuario encontrado</td></tr>';
    return;
  }

  state.userProfiles.forEach((profile) => {
    const row = document.createElement("tr");

    const emailCell = document.createElement("td");
    emailCell.textContent = profile.email || profile.id;
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
    roleSelect.addEventListener("change", async () => {
      roleSelect.disabled = true;
      try {
        await updateUserRole(profile.id, roleSelect.value);
      } catch (error) {
        console.warn(error);
        alert(error.message || "Nao foi possivel atualizar o usuario.");
        roleSelect.value = profile.role === "admin" ? "admin" : "user";
      } finally {
        roleSelect.disabled = false;
      }
    });
    roleCell.appendChild(roleSelect);
    row.appendChild(roleCell);

    const updatedCell = document.createElement("td");
    updatedCell.textContent = profile.updated_at ? new Date(profile.updated_at).toLocaleString("pt-BR") : "-";
    row.appendChild(updatedCell);

    elements.userRows.appendChild(row);
  });
}

function renderDetail() {
  const client = selectedClient();
  if (!client) return;
  const totals = clientTotals(client);

  document.querySelector("#detailName").textContent = client.name;
  document.querySelector("#detailStatus").textContent = client.status;
  document.querySelector("#detailStatus").className = `badge ${statusClass(client.status)}`;
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
  document.querySelector("#formFinalUse").value = client ? client.finalUse || "" : "";
  document.querySelector("#formLeadHunter").value = client ? client.leadHunter || "" : "";
  document.querySelector("#formCreated").value = client ? client.project.created || "" : registrationDateTime();
  document.querySelector("#formCreatedBy").value = client ? registeredBy(client) : currentUserName();
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

function blankClient() {
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
    status: DEFAULT_STATUS,
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

function openProjectDialog(client = selectedClient()) {
  const isNew = !client;
  const editableClient = client || blankClient();
  const editingProject = state.view === "projects";
  state.selectedId = client ? client.id : null;
  state.projectAction = "stay";
  state.projectReturnView = state.view === "projects" ? "projects" : "clients";

  document.querySelector("#projectForm").reset();
  document.querySelector("#projectDialog h2").textContent = isNew
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

  elements.projectDialog.showModal();
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
  const client = selectedClient();
  const isNew = !client;
  const baseClient = client || blankClient();
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
    status: document.querySelector("#editStatus").value,
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
  render();

  if (isNew) {
    document.querySelector("#projectDialog h2").textContent = state.projectReturnView === "projects" ? "Cadastro Projeto" : "Cadastro Cliente";
    document.querySelector("#deleteProjectBtn").hidden = false;
  }

  if (state.projectAction === "new") {
    openProjectDialog(null);
    return;
  }

  if (state.projectAction === "close") {
    elements.projectDialog.close();
    showView(state.projectReturnView || "clients");
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
  elements.dialog.close();
  showView("detail", client.id);
}

function exportCsv() {
  const rows = [["Nome", "Email", "Telefone", "Cidade", "Status", "Faturamento", "Lucro"]];
  state.clients.forEach((client) => {
    const totals = clientTotals(client);
    rows.push([client.name, client.email, client.phone, client.city, client.status, totals.revenue, totals.profit]);
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

function render() {
  renderStatusFilters(elements.dashboardFilters, state.dashboardStatus, "dashboard");
  renderStatusFilters(elements.clientFilters, state.clientStatus, "clients");
  renderDashboard();
  renderClients();
  renderProjects();
  renderUsers();
  renderDetail();
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

elements.logoutBtn.addEventListener("click", signOut);

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
    showView(item.dataset.view);
  });
});

elements.clientSearch.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderClients();
});

elements.projectSearch.addEventListener("input", (event) => {
  state.projectSearch = event.target.value;
  renderProjects();
});

document.querySelector("#newClientBtn").addEventListener("click", () => openProjectDialog(null));
document.querySelector("#projectClientBtn").addEventListener("click", () => openProjectDialog(null));
document.querySelector("#backToClients").addEventListener("click", () => showView(state.returnView || "clients"));
document.querySelector("#seeAllClients").addEventListener("click", () => showView("clients"));
document.querySelector("#editClientBtn").addEventListener("click", () => {
  openProjectDialog();
});
document.querySelector("#addEnvironmentBtn").addEventListener("click", () => {
  elements.projectRows.appendChild(createEnvironmentRow({ name: "", budget: 0, factory: 0, assembly: 0 }));
});
document.querySelector("#closeDialog").addEventListener("click", () => {
  state.editingId = null;
  elements.dialog.close();
});
document.querySelector("#cancelDialog").addEventListener("click", () => {
  state.editingId = null;
  elements.dialog.close();
});
document.querySelector("#closeProjectDialog").addEventListener("click", () => elements.projectDialog.close());
document.querySelector("#cancelProjectDialog").addEventListener("click", () => elements.projectDialog.close());
document.querySelector("#topCloseProjectBtn").addEventListener("click", () => elements.projectDialog.close());
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
    elements.projectDialog.close();
    showView(state.projectReturnView || "clients");
    render();
  } catch (error) {
    console.warn(error);
    alert(error.message || "Nao foi possivel excluir o cliente.");
  }
});
document.querySelectorAll("[data-export]").forEach((button) => button.addEventListener("click", exportCsv));
document.querySelectorAll("[data-return-dashboard]").forEach((button) => {
  button.addEventListener("click", () => showView("dashboard"));
});
document.querySelectorAll("[data-legacy-logout]").forEach((button) => {
  button.addEventListener("click", signOut);
});
elements.form.addEventListener("submit", saveClientFromDialog);
elements.projectForm.addEventListener("submit", saveProjectFromDialog);
window.addEventListener("resize", () => {
  if (state.view === "dashboard") {
    renderDashboard();
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
  state.view = "dashboard";
  showView("dashboard");
  render();
}

async function init() {
  state.session = loadStoredSession();

  if (authEnabled() && !state.session) {
    showAuthScreen();
    return;
  }

  await startApp();
}

init();
