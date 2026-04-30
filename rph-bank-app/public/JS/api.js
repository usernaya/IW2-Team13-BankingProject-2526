import { formatDateTime } from "./utils.js";

const API_BASE_URL = "/api/v1";
const ENDPOINTS = {
  accounts: "/accounts",
  banks: "/banks",
  paymentOrders: "/payments/pending",
  createPaymentOrder: "/payments",
  fetchAcknowledgments: "/acknowledgments/handle",
};

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const contentType = response.headers.get("Content-Type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof data === "object" && data !== null ? data.error || data.message : data;
    throw new Error(message || `Request failed: ${response.status}`);
  }

  return data;
}

function extractData(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (response && Array.isArray(response.data)) {
    return response.data;
  }

  return response ? [response] : [];
}

function normalizeAccounts(accounts) {
  return accounts.map((account) => ({
    id: account.id || account.iban,
    iban: account.id || account.iban,
    balance: Number(account.balance ?? 0),
    currentBalance: Number(account.balance ?? 0),
    availableBalance: Number(account.available_balance ?? account.balance ?? 0),
  }));
}

function normalizePaymentOrders(orders) {
  return orders.map((order, index) => normalizePaymentOrder(order, index));
}

function normalizePaymentOrder(order, index = 0) {
  if (Array.isArray(order)) {
    return order.length ? normalizePaymentOrder(order[0], index) : null;
  }

  return {
    id: order.id || order.po_id || index + 1,
    amount: Number(order.amount ?? order.po_amount ?? 0),
    msg: order.msg || order.po_message || "-",
    datetime: formatDateTime(order.datetime || order.po_datetime || ""),
    po_id: order.po_id || order.id || "-",
    account_id: order.account_id || order.oa_id || "-",
  };
}

function normalizeMembers(members) {
  return members.map((member) => ({
    bic: member.bic || member.id,
    bank: member.name || member.bank || member.bic || member.id,
  }));
}

export async function getAccounts() {
  const response = await request(ENDPOINTS.accounts);
  return normalizeAccounts(extractData(response));
}

export async function getPaymentOrders() {
  const response = await request(ENDPOINTS.paymentOrders);
  return normalizePaymentOrders(extractData(response));
}

export async function getBanks(refresh = false) {
  const query = refresh ? "?refresh=true" : "";
  const response = await request(`${ENDPOINTS.banks}${query}`);
  return normalizeMembers(extractData(response));
}

export async function createPaymentOrder(paymentOrder) {
  const payload = {
    oa_id: paymentOrder.account_id,
    po_amount: paymentOrder.amount,
    po_message: paymentOrder.msg,
    ba_id: paymentOrder.iban,
    bb_id: paymentOrder.bb_id,
  };

  const response = await request(ENDPOINTS.createPaymentOrder, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return normalizePaymentOrder(extractData(response)[0]);
}

export async function fetchAcknowledgments() {
  return request(ENDPOINTS.fetchAcknowledgments, {
    method: "POST",
  });
}
