const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const STORAGE_KEY = "movelcrm-clients";
const SESSION_KEY = "movelcrm-session";
const ENVIRONMENT_STORAGE_KEY = "movelcrm-environments";
const STATUS = ["Todos", "Lead", "Em negociacao", "Fechado", "Cancelado"];
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
  authMode: "signin",
  view: "dashboard",
  dashboardStatus: "Todos",
  clientStatus: "Todos",
  search: "",
  selectedId: null,
  editingId: null,
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
  navItems: document.querySelectorAll(".nav-item"),
  views: document.querySelectorAll(".view"),
  dashboardFilters: document.querySelector('[data-filter-group="dashboard"]'),
  clientFilters: document.querySelector('[data-filter-group="clients"]'),
  clientRows: document.querySelector("#clientRows"),
  recentClients: document.querySelector("#recentClients"),
  projectCards: document.querySelector("#projectCards"),
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
  elements.userName.textContent = email.split("@")[0] || "Usuario";
  elements.userEmail.textContent = email;
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
      status: "Fechado",
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
      status: "Lead",
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
      status: "Lead",
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

function loadLocalClients() {
  const saved = localStorage.getItem(userStorageKey());

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.every((client) => client.project && client.address)) {
        return parsed;
      }
      localStorage.removeItem(userStorageKey());
    } catch {
      localStorage.removeItem(userStorageKey());
    }
  }

  return defaultClients();
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
  state.clients = [];
  state.selectedId = null;
  showAuthScreen();
}

async function loadRemoteClients() {
  const response = await fetch(supabaseEndpoint("?select=data&order=updated_at.desc"), {
    headers: supabaseHeaders(),
  });
  if (!response.ok) {
    const message = response.status === 401 ? "Sessao expirada. Entre novamente." : "Nao foi possivel carregar os clientes do banco.";
    throw new Error(message);
  }
  const rows = await response.json();
  return rows.map((row) => row.data).filter((client) => client && client.project && client.address);
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
  const rows = clients.map((client) => ({
    id: client.id,
    user_id: currentUserId(),
    data: client,
    updated_at: new Date().toISOString(),
  }));
  const response = await fetch(supabaseEndpoint("?on_conflict=id"), {
    method: "POST",
    headers: supabaseHeaders("resolution=merge-duplicates,return=minimal"),
    body: JSON.stringify(rows),
  });
  if (!response.ok) throw new Error("Nao foi possivel salvar os clientes no banco.");
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
  return `status-${status.toLowerCase().replace(" ", "-").replace("em-negociacao", "negociacao")}`;
}

function showView(view, selectedId) {
  const previousView = state.view;
  state.view = view;
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
      [client.name, client.email, client.phone].some((value) => value.toLowerCase().includes(search));

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
  document.querySelector("#totalNegotiating").textContent = clients.filter((client) => client.status === "Em negociacao").length;
  document.querySelector("#totalClosed").textContent = clients.filter((client) => client.status === "Fechado").length;
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
  const padding = { top: 22, right: 24, bottom: 48, left: 72 };
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
  context.strokeStyle = "#b7aaa2";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(padding.left, padding.top);
  context.lineTo(padding.left, height - padding.bottom);
  context.lineTo(width - padding.right, height - padding.bottom);
  context.stroke();

  [0, 35000, 70000, 105000, 140000].forEach((tick) => {
    const y = height - padding.bottom - (tick / maxValue) * chartHeight;
    context.fillStyle = "#68564d";
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

    context.fillStyle = "#9a5b37";
    context.fillRect(x - revenueWidth - gap / 2, baseY - revenueHeight, revenueWidth, revenueHeight);
    context.fillStyle = "#2da35c";
    context.fillRect(x + gap / 2, baseY - profitHeight, profitWidth, profitHeight);
    context.fillStyle = "#68564d";
    context.textAlign = "center";
    context.fillText(status, x - revenueWidth / 4, baseY + 24);
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

function renderProjects() {
  elements.projectCards.innerHTML = "";

  state.clients.forEach((client) => {
    const totals = clientTotals(client);
    const card = document.createElement("article");
    const title = document.createElement("h3");
    const subtitle = document.createElement("p");
    const list = document.createElement("dl");
    const editButton = document.createElement("button");

    card.className = "project-card";
    title.textContent = client.project.style || "A definir";
    subtitle.textContent = client.name;

    [
      ["Status", client.status],
      ["Prazo", client.project.deadline || "A definir"],
      ["Valor", BRL.format(totals.revenue)],
      ["Lucro", BRL.format(totals.profit)],
    ].forEach(([label, value]) => {
      const group = document.createElement("div");
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      term.textContent = label;
      description.textContent = value;
      group.append(term, description);
      list.appendChild(group);
    });

    editButton.className = "link-button project-edit-button";
    editButton.type = "button";
    editButton.textContent = "Editar Projeto";
    editButton.addEventListener("click", () => {
      state.selectedId = client.id;
      openProjectDialog();
    });

    card.append(title, subtitle, list, editButton);
    elements.projectCards.appendChild(card);
  });
}

function renderDetail() {
  const client = selectedClient();
  if (!client) return;
  const totals = clientTotals(client);

  document.querySelector("#detailName").textContent = client.name;
  document.querySelector("#detailStatus").textContent = client.status;
  document.querySelector("#detailStatus").className = `badge ${statusClass(client.status)}`;
  document.querySelector("#detailOwner").textContent = `· ${client.owner}`;
  document.querySelector("#detailCpf").textContent = client.cpf || "—";
  document.querySelector("#detailPhone").textContent = client.phone || "—";
  document.querySelector("#detailEmail").textContent = client.email || "—";
  document.querySelector("#detailCep").textContent = client.address.cep || "—";
  document.querySelector("#detailStreet").textContent = client.address.street || "—";
  document.querySelector("#detailNumber").textContent = client.address.number || "—";
  document.querySelector("#detailComplement").textContent = client.address.complement || "—";
  document.querySelector("#detailDistrict").textContent = client.address.district || "—";
  document.querySelector("#detailCityState").textContent = client.city ? `${client.city} - ${client.state}` : "—";
  document.querySelector("#detailStyle").textContent = client.project.style || "A definir";
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
  document.querySelector("#formStatus").value = client ? client.status : "Lead";
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

  inputs.budget.addEventListener("input", () => {
    const budget = parseMoney(inputs.budget.value);
    const nextFactory = suggestedFactoryValue(budget);
    const nextAssembly = suggestedAssemblyValue(budget);

    if (inputs.factory.dataset.manual !== "true" || parseMoney(inputs.factory.value) === parseMoney(inputs.factory.dataset.autoValue)) {
      inputs.factory.value = formatMoneyInput(nextFactory);
      inputs.factory.dataset.manual = "false";
    }

    if (inputs.assembly.dataset.manual !== "true" || parseMoney(inputs.assembly.value) === parseMoney(inputs.assembly.dataset.autoValue)) {
      inputs.assembly.value = formatMoneyInput(nextAssembly);
      inputs.assembly.dataset.manual = "false";
    }

    inputs.factory.dataset.autoValue = String(nextFactory);
    inputs.assembly.dataset.autoValue = String(nextAssembly);
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
  document.querySelector("#editStatus").value = client.status || "Lead";
  document.querySelector("#editOwner").value = client.owner || "";
  document.querySelector("#editCep").value = client.address.cep || "";
  document.querySelector("#editState").value = client.state || "";
  document.querySelector("#editStreet").value = client.address.street || "";
  document.querySelector("#editNumber").value = client.address.number || "";
  document.querySelector("#editComplement").value = client.address.complement || "";
  document.querySelector("#editDistrict").value = client.address.district || "";
  document.querySelector("#editCity").value = client.city || "";
  document.querySelector("#projectStyle").value = client.project.style || "";
  document.querySelector("#projectDeadline").value = client.project.deadline || "";
  document.querySelector("#projectCreated").value = client.project.created || "";
  document.querySelector("#projectNotes").value = client.project.notes || "";

  elements.projectRows.innerHTML = "";
  const environments = client.project.environments.length
    ? client.project.environments
    : [{ name: "", budget: 0, factory: 0, assembly: 0 }];
  environments.forEach((environment) => elements.projectRows.appendChild(createEnvironmentRow(environment)));

  elements.projectDialog.showModal();
}

function readProjectEnvironmentRows() {
  return Array.from(elements.projectRows.querySelectorAll("tr"))
    .map((row) => {
      const field = (name) => row.querySelector(`[data-field="${name}"]`).value.trim();
      const select = row.querySelector('[data-field="name"]');
      const customInput = row.querySelector(".environment-custom-input");
      const rawName = select.value === "__new__" ? customInput.value : select.value;
      const name = registerEnvironmentName(rawName) || "AMBIENTE";
      addEnvironmentOptionToSelect(select, name);
      select.value = name;
      customInput.hidden = true;
      return {
        name,
        budget: parseMoney(field("budget")),
        factory: parseMoney(field("factory")),
        assembly: parseMoney(field("assembly")),
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
      owner: document.querySelector("#editOwner").value.trim() || "Usuario",
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
        style: document.querySelector("#projectStyle").value.trim(),
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
      };
    });
    await saveClients();
    elements.dialog.close();
    render();
    return;
  }

  const client = {
    id: createId(),
    name,
    email: document.querySelector("#formEmail").value.trim(),
    phone: document.querySelector("#formPhone").value.trim(),
    city: document.querySelector("#formCity").value.trim(),
    state: "",
    status: document.querySelector("#formStatus").value,
    owner: "Usuario",
    cpf: "",
    address: { cep: "", street: "", number: "", complement: "", district: "" },
    project: {
      style: "",
      deadline: "",
      created: new Date().toLocaleDateString("pt-BR"),
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
  renderDetail();
}

elements.authToggle.addEventListener("click", () => {
  state.authMode = state.authMode === "signin" ? "signup" : "signin";
  renderAuthMode();
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
  item.addEventListener("click", () => showView(item.dataset.view));
});

elements.clientSearch.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderClients();
});

document.querySelector("#newClientBtn").addEventListener("click", () => openClientDialog());
document.querySelector("#projectClientBtn").addEventListener("click", () => openClientDialog());
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
document.querySelectorAll("[data-export]").forEach((button) => button.addEventListener("click", exportCsv));
elements.form.addEventListener("submit", saveClientFromDialog);
elements.projectForm.addEventListener("submit", saveProjectFromDialog);
window.addEventListener("resize", () => {
  if (state.view === "dashboard") {
    renderDashboard();
  }
});

async function startApp() {
  showAuthenticatedApp();
  state.clients = await loadClients();
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
