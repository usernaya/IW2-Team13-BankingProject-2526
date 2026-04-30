import {
  createPaymentOrder,
  getAccounts,
  getBanks,
  getLogs,
  getOutgoingAcknowledgments,
  getOutgoingPayments,
  getPendingPayments,
  handleAcknowledgments,
  handlePayments,
  sendAcknowledgments,
  sendPayments,
} from "./api.js";

const OWN_BIC = "BMPBBEBB";

const state = {
  accounts: [],
  banks: [],
  pendingPayments: [],
};

const tabButtons = Array.from(document.querySelectorAll(".tab-button"));
const tabJumpButtons = Array.from(document.querySelectorAll("[data-tab-jump]"));
const tabPanels = Array.from(document.querySelectorAll("[data-tab-panel]"));

const el = {
  feedback: document.querySelector("#feedback"),
  fromAccount: document.querySelector("#from-account"),
  beneficiaryBic: document.querySelector("#beneficiary-bic"),
  beneficiaryIban: document.querySelector("#beneficiary-iban"),
  amount: document.querySelector("#amount"),
  message: document.querySelector("#message"),
  accountsCount: document.querySelector("#accounts-count"),
  accountsGrid: document.querySelector("#accounts-grid"),
  banksCount: document.querySelector("#banks-count"),
  banksBody: document.querySelector("#banks-body"),
  pendingCount: document.querySelector("#pending-count"),
  pendingBody: document.querySelector("#pending-body"),
  outgoingCount: document.querySelector("#outgoing-count"),
  outgoingBody: document.querySelector("#outgoing-body"),
  ackOutCount: document.querySelector("#ack-out-count"),
  ackOutBody: document.querySelector("#ack-out-body"),
  logsCount: document.querySelector("#logs-count"),
  logsBody: document.querySelector("#logs-body"),
  accountsCountHero: document.querySelector("#accounts-count-hero"),
  banksCountHero: document.querySelector("#banks-count-hero"),
  pendingCountHero: document.querySelector("#pending-count-hero"),
  logsCountHero: document.querySelector("#logs-count-hero"),
};

document.addEventListener("DOMContentLoaded", () => {
  bindTabs();
  bindEvents();
  loadDashboard();
});

function bindTabs() {
  const initialTab = normalizeTab(location.hash.replace(/^#/, "") || "overview");
  setActiveTab(initialTab, false);

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => setActiveTab(button.dataset.tab || "overview"));
  });

  tabJumpButtons.forEach((button) => {
    button.addEventListener("click", () => setActiveTab(button.dataset.tabJump || "overview"));
  });
}

function setActiveTab(tab, updateHash = true) {
  const activeTab = normalizeTab(tab);

  tabPanels.forEach((panel) => {
    panel.hidden = panel.dataset.tabPanel !== activeTab;
  });

  tabButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tab === activeTab);
  });

  if (updateHash) {
    history.replaceState(null, "", `#${activeTab}`);
  }
}

function normalizeTab(tab) {
  const availableTabs = new Set(tabPanels.map((panel) => panel.dataset.tabPanel));
  return availableTabs.has(tab) ? tab : "overview";
}

function bindEvents() {
  document.querySelector("#payment-form")?.addEventListener("submit", onCreatePayment);
  document.querySelector("#refresh-all")?.addEventListener("click", loadDashboard);
  document.querySelector("#refresh-banks")?.addEventListener("click", () => loadBanks(true));
  document.querySelector("#send-payments")?.addEventListener("click", () => runAction(sendPayments, "Outgoing payments sent."));
  document.querySelector("#handle-payments")?.addEventListener("click", () => runAction(handlePayments, "Incoming payments handled."));
  document.querySelector("#send-acks")?.addEventListener("click", () => runAction(sendAcknowledgments, "Outgoing ACKs sent."));
  document.querySelector("#handle-acks")?.addEventListener("click", onHandleAcknowledgments);
}

async function loadDashboard() {
  showFeedback("loading", "Loading dashboard data...");

  await Promise.all([
    loadAccounts(),
    loadBanks(false),
    loadPendingPayments(),
    loadOutgoingPayments(),
    loadAcknowledgments(),
    loadLogs(),
  ]);

  syncOverviewStats();
  showFeedback("success", "Dashboard loaded.");
}

async function loadAccounts() {
  try {
    state.accounts = await getAccounts();
    renderAccountSelect();
    renderAccounts();
    syncOverviewStats();
  } catch (error) {
    renderError(el.accountsGrid, "Accounts could not be loaded.", 1);
    showFeedback("error", error.message);
  }
}

async function loadBanks(refresh) {
  try {
    state.banks = await getBanks(refresh);
    renderBankSelect();
    renderBanks();
    syncOverviewStats();
  } catch (error) {
    renderError(el.banksBody, "Banks could not be loaded.", 3);
    showFeedback("error", error.message);
  }
}

async function loadPendingPayments() {
  try {
    state.pendingPayments = await getPendingPayments();
    renderPayments(el.pendingBody, el.pendingCount, state.pendingPayments);
    syncOverviewStats();
  } catch (error) {
    renderError(el.pendingBody, "Pending payments could not be loaded.", 8);
    showFeedback("error", error.message);
  }
}

async function loadOutgoingPayments() {
  try {
    renderPayments(el.outgoingBody, el.outgoingCount, await getOutgoingPayments());
    syncOverviewStats();
  } catch (error) {
    renderError(el.outgoingBody, "Outgoing payments could not be loaded.", 8);
    showFeedback("error", error.message);
  }
}

async function loadAcknowledgments() {
  const outgoing = await Promise.resolve(getOutgoingAcknowledgments()).then(
    (value) => ({ status: "fulfilled", value }),
    (reason) => ({ status: "rejected", reason }),
  );

  if (outgoing.status === "fulfilled") {
    renderAcks(el.ackOutBody, el.ackOutCount, outgoing.value);
    syncOverviewStats();
  } else {
    renderError(el.ackOutBody, "Outgoing ACKs could not be loaded.", 7);
    showFeedback("error", outgoing.reason.message);
  }
}

async function loadLogs() {
  try {
    renderLogs(await getLogs());
    syncOverviewStats();
  } catch (error) {
    renderError(el.logsBody, "Logs could not be loaded.", 5);
    showFeedback("error", error.message);
  }
}

async function onCreatePayment(event) {
  event.preventDefault();

  const payment = {
    fromAccount: el.fromAccount.value,
    amount: Number(el.amount.value),
    message: el.message.value.trim() || "SEPA payment",
    beneficiaryIban: normalizeIban(el.beneficiaryIban.value),
    beneficiaryBic: resolveBeneficiaryBic(),
  };

  const error = validatePayment(payment);
  if (error) {
    showFeedback("error", error);
    return;
  }

  await runAction(async () => {
    await createPaymentOrder(payment);

    if (payment.beneficiaryBic !== OWN_BIC) {
      return sendPayments();
    }

    return { message: "Internal payment completed." };
  }, payment.beneficiaryBic === OWN_BIC ? "Internal payment completed." : "Payment order created and sent.");
  event.target.reset();
}

async function runAction(action, successMessage) {
  try {
    showFeedback("loading", "Processing...");
    const result = await action();
    await loadDashboard();
    showFeedback("success", result?.message || successMessage);
  } catch (error) {
    showFeedback("error", error.message);
  }
}

async function onHandleAcknowledgments() {
  try {
    showFeedback("loading", "Handling incoming ACKs...");
    const result = await handleAcknowledgments();
    await loadDashboard();

    showFeedback(
      "success",
      result.acknowledgments?.length
        ? `${result.acknowledgments.length} incoming ACK(s) handled.`
        : result.message || "No incoming ACKs found.",
    );
  } catch (error) {
    showFeedback("error", error.message);
  }
}

function resolveBeneficiaryBic() {
  const iban = normalizeIban(el.beneficiaryIban.value);
  return state.accounts.some((account) => account.iban === iban) ? OWN_BIC : el.beneficiaryBic.value;
}

function validatePayment(payment) {
  if (!payment.fromAccount) return "Choose an originator account.";
  if (!payment.beneficiaryBic) return "Choose a beneficiary bank.";
  if (!isValidIban(payment.beneficiaryIban)) return "Use a Belgian test IBAN like BE19384756283910 or a real IBAN with checksum.";
  if (!Number.isFinite(payment.amount) || payment.amount < 0.01 || payment.amount > 500) return "Amount must be between 0.01 and 500 EUR.";
  if (payment.message.length < 5 || !/[A-Za-z]/.test(payment.message)) return "Message must contain at least 5 characters and one letter.";
  if (payment.fromAccount === payment.beneficiaryIban) return "Originator and beneficiary account cannot be the same.";
  return "";
}

function normalizeIban(value) {
  return String(value || "").replace(/\s/g, "").toUpperCase();
}

function isValidIban(value) {
  const iban = normalizeIban(value);
  if (/^BE\d{14}$/.test(iban)) return true;
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return false;

  const rearranged = `${iban.slice(4)}${iban.slice(0, 4)}`;
  const numeric = rearranged.replace(/[A-Z]/g, (char) => String(char.charCodeAt(0) - 55));

  let remainder = 0;
  for (const digit of numeric) {
    remainder = (remainder * 10 + Number(digit)) % 97;
  }

  return remainder === 1;
}

function renderAccountSelect() {
  el.fromAccount.innerHTML = state.accounts.length
    ? state.accounts.map((account) => `<option value="${escapeHtml(account.iban)}">${escapeHtml(account.iban)} - ${formatCurrency(account.balance)}</option>`).join("")
    : `<option value="">No accounts available</option>`;
}

function renderBankSelect() {
  el.beneficiaryBic.innerHTML = state.banks.length
    ? state.banks.map((bank) => `<option value="${escapeHtml(bank.bic)}">${escapeHtml(bank.name)} (${escapeHtml(bank.bic)})</option>`).join("")
    : `<option value="">No banks available</option>`;
}

function renderAccounts() {
  el.accountsCount.textContent = state.accounts.length;
  el.accountsGrid.innerHTML = state.accounts.length
    ? state.accounts.map((account) => `
        <article class="account-card">
          <strong>${escapeHtml(account.iban)}</strong>
          <span>Balance: ${formatCurrency(account.balance)}</span>
          <span>Available: ${formatCurrency(account.availableBalance)}</span>
        </article>
      `).join("")
    : `<p class="empty">No accounts found.</p>`;
}

function renderBanks() {
  el.banksCount.textContent = state.banks.length;
  el.banksBody.innerHTML = state.banks.length
    ? state.banks.map((bank) => `
        <tr>
          <td>${escapeHtml(bank.bic)}</td>
          <td>${escapeHtml(bank.name)}</td>
          <td>${escapeHtml(bank.members || "-")}</td>
        </tr>
      `).join("")
    : emptyRow("No banks found.", 3);
}

function renderPayments(body, count, payments) {
  count.textContent = payments.length;
  body.innerHTML = payments.length
    ? payments.map((payment) => `
        <tr>
          <td>${escapeHtml(payment.poId)}</td>
          <td>${formatCurrency(payment.amount)}</td>
          <td>${escapeHtml(payment.message || "-")}</td>
          <td>${escapeHtml(payment.datetime)}</td>
          <td>${escapeHtml(payment.originatorAccount)}</td>
          <td>${escapeHtml(payment.beneficiaryAccount)}</td>
          <td>${escapeHtml(payment.originatorCode)}</td>
          <td>${escapeHtml(payment.beneficiaryCode)}</td>
        </tr>
      `).join("")
    : emptyRow("No payment orders found.", 8);
}

function renderAcks(body, count, acknowledgments) {
  count.textContent = acknowledgments.length;
  body.innerHTML = acknowledgments.length
    ? acknowledgments.map((ack) => `
        <tr>
          <td>${escapeHtml(ack.poId)}</td>
          <td>${formatCurrency(ack.amount)}</td>
          <td>${escapeHtml(ack.message || "-")}</td>
          <td>${escapeHtml(ack.datetime)}</td>
          <td>${escapeHtml(ack.originatorCode)}</td>
          <td>${escapeHtml(ack.cbCode)}</td>
          <td>${escapeHtml(ack.beneficiaryCode)}</td>
        </tr>
      `).join("")
    : emptyRow("No acknowledgments found.", 7);
}

function renderLogs(logs) {
  el.logsCount.textContent = logs.length;
  el.logsBody.innerHTML = logs.length
    ? logs.slice(0, 100).map((log) => `
        <tr>
          <td>${escapeHtml(log.datetime)}</td>
          <td>${escapeHtml(log.type)}</td>
          <td>${escapeHtml(log.code)}</td>
          <td>${escapeHtml(log.message)}</td>
          <td>${escapeHtml(log.poId)}</td>
        </tr>
      `).join("")
    : emptyRow("No logs found.", 5);
}

function renderError(target, message, colspan) {
  if (target.tagName === "TBODY") {
    target.innerHTML = emptyRow(message, colspan);
  } else {
    target.innerHTML = `<p class="empty error-text">${escapeHtml(message)}</p>`;
  }
}

function emptyRow(message, colspan) {
  return `<tr><td colspan="${colspan}" class="empty">${escapeHtml(message)}</td></tr>`;
}

function showFeedback(type, message) {
  el.feedback.className = `feedback ${type}`;
  el.feedback.textContent = message;
}

function syncOverviewStats() {
  if (el.accountsCountHero) {
    el.accountsCountHero.textContent = state.accounts.length;
  }

  if (el.banksCountHero) {
    el.banksCountHero.textContent = state.banks.length;
  }

  if (el.pendingCountHero) {
    el.pendingCountHero.textContent = state.pendingPayments.length;
  }

  if (el.logsCountHero) {
    el.logsCountHero.textContent = el.logsCount?.textContent || "0";
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat("nl-BE", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value) || 0);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
