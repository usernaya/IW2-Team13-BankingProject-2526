import {
  createPaymentOrder,
  getAccounts,
  getBanks,
  getIncomingAcknowledgments,
  getIncomingPayments,
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
  incomingCount: document.querySelector("#incoming-count"),
  incomingBody: document.querySelector("#incoming-body"),
  ackOutCount: document.querySelector("#ack-out-count"),
  ackOutBody: document.querySelector("#ack-out-body"),
  ackInCount: document.querySelector("#ack-in-count"),
  ackInBody: document.querySelector("#ack-in-body"),
  logsCount: document.querySelector("#logs-count"),
  logsBody: document.querySelector("#logs-body"),
};

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  loadDashboard();
});

function bindEvents() {
  document.querySelector("#payment-form")?.addEventListener("submit", onCreatePayment);
  document.querySelector("#refresh-all")?.addEventListener("click", loadDashboard);
  document.querySelector("#refresh-banks")?.addEventListener("click", () => loadBanks(true));
  document.querySelector("#send-payments")?.addEventListener("click", () => runAction(sendPayments, "Outgoing payments sent."));
  document.querySelector("#handle-payments")?.addEventListener("click", () => runAction(handlePayments, "Incoming payments handled."));
  document.querySelector("#send-acks")?.addEventListener("click", () => runAction(sendAcknowledgments, "Outgoing ACKs sent."));
  document.querySelector("#handle-acks")?.addEventListener("click", () => runAction(handleAcknowledgments, "Incoming ACKs handled."));
}

async function loadDashboard() {
  showFeedback("loading", "Loading dashboard data...");

  await Promise.all([
    loadAccounts(),
    loadBanks(false),
    loadPendingPayments(),
    loadOutgoingPayments(),
    loadIncomingPayments(),
    loadAcknowledgments(),
    loadLogs(),
  ]);

  showFeedback("success", "Dashboard loaded.");
}

async function loadAccounts() {
  try {
    state.accounts = await getAccounts();
    renderAccountSelect();
    renderAccounts();
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
  } catch (error) {
    renderError(el.banksBody, "Banks could not be loaded.", 3);
    showFeedback("error", error.message);
  }
}

async function loadPendingPayments() {
  try {
    state.pendingPayments = await getPendingPayments();
    renderPayments(el.pendingBody, el.pendingCount, state.pendingPayments);
  } catch (error) {
    renderError(el.pendingBody, "Pending payments could not be loaded.", 8);
    showFeedback("error", error.message);
  }
}

async function loadOutgoingPayments() {
  try {
    renderPayments(el.outgoingBody, el.outgoingCount, await getOutgoingPayments());
  } catch (error) {
    renderError(el.outgoingBody, "Outgoing payments could not be loaded.", 8);
    showFeedback("error", error.message);
  }
}

async function loadIncomingPayments() {
  try {
    renderPayments(el.incomingBody, el.incomingCount, await getIncomingPayments());
  } catch (error) {
    renderError(el.incomingBody, "Incoming payments could not be loaded.", 8);
    showFeedback("error", error.message);
  }
}

async function loadAcknowledgments() {
  const [outgoing, incoming] = await Promise.allSettled([
    getOutgoingAcknowledgments(),
    getIncomingAcknowledgments(),
  ]);

  if (outgoing.status === "fulfilled") {
    renderAcks(el.ackOutBody, el.ackOutCount, outgoing.value);
  } else {
    renderError(el.ackOutBody, "Outgoing ACKs could not be loaded.", 7);
    showFeedback("error", outgoing.reason.message);
  }

  if (incoming.status === "fulfilled") {
    renderAcks(el.ackInBody, el.ackInCount, incoming.value);
  } else {
    renderError(el.ackInBody, "Incoming ACKs could not be loaded.", 7);
    showFeedback("error", incoming.reason.message);
  }
}

async function loadLogs() {
  try {
    renderLogs(await getLogs());
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
    beneficiaryIban: el.beneficiaryIban.value.trim().toUpperCase(),
    beneficiaryBic: resolveBeneficiaryBic(),
  };

  const error = validatePayment(payment);
  if (error) {
    showFeedback("error", error);
    return;
  }

  await runAction(() => createPaymentOrder(payment), "Payment order created.");
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

function resolveBeneficiaryBic() {
  const iban = el.beneficiaryIban.value.trim().toUpperCase();
  return state.accounts.some((account) => account.iban === iban) ? OWN_BIC : el.beneficiaryBic.value;
}

function validatePayment(payment) {
  if (!payment.fromAccount) return "Choose an originator account.";
  if (!payment.beneficiaryBic) return "Choose a beneficiary bank.";
  if (!/^BE\d{14}$/.test(payment.beneficiaryIban)) return "Use a valid Belgian IBAN, for example BE68639007547034.";
  if (!Number.isFinite(payment.amount) || payment.amount < 0.01 || payment.amount > 500) return "Amount must be between 0.01 and 500 EUR.";
  if (payment.message.length < 5 || !/[A-Za-z]/.test(payment.message)) return "Message must contain at least 5 characters and one letter.";
  if (payment.fromAccount === payment.beneficiaryIban) return "Originator and beneficiary account cannot be the same.";
  return "";
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
