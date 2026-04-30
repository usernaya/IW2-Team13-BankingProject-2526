const API_BASE = "/api/v1";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(readError(body, response.status));
  }

  return body;
}

async function requestOptionalList(path) {
  try {
    return dataOf(await request(path));
  } catch (error) {
    if (error.message.includes("Cannot GET") || error.message.includes("status 404")) {
      return [];
    }

    throw error;
  }
}

function readError(body, status) {
  if (body && typeof body === "object") {
    if (Array.isArray(body.errors) && body.errors.length) {
      return body.errors.map((error) => error.message).filter(Boolean).join(" ");
    }

    return body.message || body.error || `Request failed with status ${status}`;
  }

  return body || `Request failed with status ${status}`;
}

function dataOf(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (response?.data && typeof response.data === "object") return [response.data];
  if (response && typeof response === "object") return [response];
  return [];
}

function asNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function formatDateTime(value) {
  if (!value) return "-";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
    return value;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  const pad = (part) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function normalizeAccount(account) {
  const id = account.id || account.iban || "";
  const balance = asNumber(account.balance ?? account.balans);
  const availableBalance = asNumber(account.available_balance ?? account.availableBalance ?? balance);

  return {
    id,
    iban: id,
    balance,
    availableBalance,
  };
}

export function normalizePaymentOrder(order, index = 0) {
  const poId = order.po_id || order.id || `row-${index + 1}`;

  return {
    id: order.id ?? index + 1,
    poId,
    amount: asNumber(order.po_amount ?? order.amount),
    message: order.po_message ?? order.message ?? order.msg ?? "",
    datetime: formatDateTime(order.po_datetime ?? order.datetime),
    originatorBank: order.ob_id || "-",
    originatorAccount: order.oa_id || order.account_id || "-",
    originatorCode: order.ob_code ?? "-",
    beneficiaryBank: order.bb_id || "-",
    beneficiaryAccount: order.ba_id || "-",
    beneficiaryCode: order.bb_code ?? "-",
    cbCode: order.cb_code ?? "-",
  };
}

export function normalizeBank(bank) {
  return {
    bic: bank.id || bank.bic || "",
    name: bank.name || bank.bank || bank.id || bank.bic || "",
    members: bank.members || "",
  };
}

export function normalizeAcknowledgment(ack, index = 0) {
  return {
    id: ack.id ?? index + 1,
    poId: ack.po_id || "-",
    amount: asNumber(ack.po_amount),
    message: ack.po_message ?? "",
    datetime: formatDateTime(ack.bb_datetime || ack.cb_datetime || ack.ob_datetime || ack.po_datetime),
    originatorCode: ack.ob_code ?? "-",
    beneficiaryCode: ack.bb_code ?? "-",
    cbCode: ack.cb_code ?? "-",
  };
}

export function normalizeLog(log, index = 0) {
  return {
    id: log.id ?? index + 1,
    datetime: formatDateTime(log.datetime),
    type: log.type || "-",
    code: log.code ?? "-",
    message: log.message || "-",
    poId: log.po_id || "-",
  };
}

export async function getAccounts() {
  return dataOf(await request("/accounts")).map(normalizeAccount);
}

export async function createAccount(balance) {
  return normalizeAccount(
    dataOf(
      await request("/accounts", {
        method: "POST",
        body: JSON.stringify({ balans: asNumber(balance) }),
      }),
    )[0],
  );
}

export async function getBanks(refresh = false) {
  return dataOf(await request(`/banks${refresh ? "?refresh=true" : ""}`)).map(normalizeBank);
}

export async function getPendingPayments() {
  return dataOf(await request("/payments/pending")).map(normalizePaymentOrder);
}

export async function getOutgoingPayments() {
  return dataOf(await request("/payments/outgoing")).map(normalizePaymentOrder);
}

export async function getIncomingPayments() {
  return dataOf(await request("/payments/incoming")).map(normalizePaymentOrder);
}

export async function createPaymentOrder({ fromAccount, amount, message, beneficiaryIban, beneficiaryBic }) {
  return normalizePaymentOrder(
    dataOf(
      await request("/payments", {
        method: "POST",
        body: JSON.stringify({
          oa_id: fromAccount,
          po_amount: asNumber(amount),
          po_message: message,
          ba_id: beneficiaryIban,
          bb_id: beneficiaryBic,
        }),
      }),
    )[0],
  );
}

export function sendPayments() {
  return request("/payments/send", { method: "POST" });
}

export function handlePayments() {
  return request("/payments/handle", { method: "POST" });
}

export async function getOutgoingAcknowledgments() {
  return (await requestOptionalList("/acknowledgments/outgoing")).map(normalizeAcknowledgment);
}

export async function getIncomingAcknowledgments() {
  return (await requestOptionalList("/acknowledgments/incoming")).map(normalizeAcknowledgment);
}

export function sendAcknowledgments() {
  return request("/acknowledgments/send", { method: "POST" });
}

export function handleAcknowledgments() {
  return request("/acknowledgments/handle", { method: "POST" }).then((response) => ({
    ...response,
    acknowledgments: dataOf(response).map(normalizeAcknowledgment),
  }));
}

export async function getLogs() {
  return dataOf(await request("/logs")).map(normalizeLog);
}
