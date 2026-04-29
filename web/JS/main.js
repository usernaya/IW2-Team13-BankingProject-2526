const API_BASE_URL = "/api";

const ENDPOINTS = {
   accounts: "/accounts",
   paymentOrders: "/payment-orders",
   members: "/members",
   createPaymentOrder: "/payment-orders",

   // PingFin routes from the available Postman collection.
   pingfinToken: "/token",
   pingfinPoOut: "/po_out",
   pingfinPoIn: "/po_in",
   pingfinAckIn: "/ack_in"
};

const appState = {
   accounts: [],
   paymentOrders: [],
   members: []
};

const api = {
   async getAccounts() {
      const response = await request(ENDPOINTS.accounts);
      return normalizeAccounts(extractData(response));
   },

   async getPaymentOrders() {
      const response = await request(ENDPOINTS.paymentOrders);
      return normalizePaymentOrders(extractData(response));
   },

   async getMembers() {
      const response = await request(ENDPOINTS.members);
      return normalizeMembers(extractData(response));
   },

   async createPaymentOrder(paymentOrder) {
      const payload = {
         account_id: paymentOrder.account_id,
         amount: paymentOrder.amount,
         iban: paymentOrder.iban,
         msg: paymentOrder.msg,

         // Field names used by the banking database/API documentation.
         oa_id: paymentOrder.account_id,
         po_amount: paymentOrder.amount,
         po_message: paymentOrder.msg,
         ba_id: paymentOrder.iban
      };

      const response = await request(ENDPOINTS.createPaymentOrder, {
         method: "POST",
         body: JSON.stringify(payload)
      });

      return normalizePaymentOrder(extractData(response));
   },

   async getPingfinOutgoingOrders() {
      const response = await request(ENDPOINTS.pingfinPoOut);
      return extractData(response);
   },

   async sendPingfinIncomingOrders(data) {
      return request(ENDPOINTS.pingfinPoIn, {
         method: "POST",
         body: JSON.stringify({ data })
      });
   },

   async sendPingfinIncomingAcks(data) {
      return request(ENDPOINTS.pingfinAckIn, {
         method: "POST",
         body: JSON.stringify({ data })
      });
   }
};

const dom = {
   fromAccount: document.querySelector("#from-account"),
   amount: document.querySelector("#amount"),
   iban: document.querySelector("#iban"),
   feedbackBox: document.querySelector("#feedback-box"),
   feedbackText: document.querySelector("#feedback-box .feedback-text"),
   accountsGrid: document.querySelector("#accounts-grid"),
   accountsCount: document.querySelector("#accounts-count"),
   ordersBody: document.querySelector("#orders-body"),
   ordersCount: document.querySelector("#orders-count"),
   membersBody: document.querySelector("#members-body"),
   membersCount: document.querySelector("#members-count"),
   sendButton: document.querySelector("#btn-send"),
   randomButton: document.querySelector("#btn-random"),
   hideDataButton: document.querySelector("#btn-hide-data"),
   hideOrdersButton: document.querySelector("#btn-hide-orders"),
   hideMembersButton: document.querySelector("#btn-hide-members"),
   dataSection: document.querySelector("#section-data"),
   ordersSection: document.querySelector("#section-orders"),
   membersSection: document.querySelector("#section-members")
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
   bindEvents();
   renderLoadingState();

   try {
      const [accounts, orders, members] = await Promise.all([
         api.getAccounts(),
         api.getPaymentOrders(),
         api.getMembers()
      ]);

      appState.accounts = accounts;
      appState.paymentOrders = orders;
      appState.members = members;

      renderAccountSelect(accounts);
      renderAccounts(accounts);
      renderPaymentOrders(orders);
      renderMembers(members);
   } catch (error) {
      showFeedback("error", getErrorMessage(error, "Data could not be loaded. Please try again later."));
      console.error(error);
      clearLoadingState();
   }
}

function bindEvents() {
   dom.sendButton.addEventListener("click", handleSendPayment);
   dom.randomButton.addEventListener("click", handleRandomOrders);
   dom.hideDataButton.addEventListener("click", () => toggleSection(dom.dataSection, dom.hideDataButton, "Data"));
   dom.hideOrdersButton.addEventListener("click", () => toggleSection(dom.ordersSection, dom.hideOrdersButton, "New Payment Orders"));
   dom.hideMembersButton.addEventListener("click", () => toggleSection(dom.membersSection, dom.hideMembersButton, "Members"));
}

function renderLoadingState() {
   dom.accountsGrid.innerHTML = `
      <div class="data-card skeleton">
         <div class="data-card__iban">Loading</div>
         <div class="data-card__balance">Loading</div>
      </div>
      <div class="data-card skeleton">
         <div class="data-card__iban">Loading</div>
         <div class="data-card__balance">Loading</div>
      </div>
   `;

   dom.ordersBody.innerHTML = createSkeletonRows(3, 6);
   dom.membersBody.innerHTML = createSkeletonRows(2, 3);
}

function clearLoadingState() {
   dom.fromAccount.classList.remove("loading");
   renderAccountSelect([]);
   renderAccounts([]);
   renderPaymentOrders([]);
   renderMembers([]);
}

function renderAccountSelect(accounts) {
   dom.fromAccount.classList.remove("loading");
   dom.fromAccount.innerHTML = "";

   if (!accounts.length) {
      dom.fromAccount.innerHTML = `<option value="">No account available</option>`;
      return;
   }

   accounts.forEach((account) => {
      const option = document.createElement("option");
      option.value = account.id;
      option.textContent = `${account.iban} - ${formatCurrency(account.balance)}`;
      dom.fromAccount.appendChild(option);
   });
}

function renderAccounts(accounts) {
   dom.accountsCount.textContent = accounts.length;

   if (!accounts.length) {
      dom.accountsGrid.innerHTML = `<div class="empty-state">No accounts found.</div>`;
      return;
   }

   dom.accountsGrid.innerHTML = accounts.map((account) => `
      <div class="data-card">
         <div class="data-card__iban">${escapeHtml(account.iban)}</div>
         <div class="data-card__balance">${formatCurrency(account.balance)}</div>
         <div class="data-card__label">Available balance</div>
      </div>
   `).join("");
}

function renderPaymentOrders(orders) {
   dom.ordersCount.textContent = orders.length;

   if (!orders.length) {
      dom.ordersBody.innerHTML = `<tr><td colspan="6" class="empty-state">No payment orders found.</td></tr>`;
      return;
   }

   dom.ordersBody.innerHTML = orders.map((order) => `
      <tr>
         <td class="td-primary">${escapeHtml(order.id)}</td>
         <td class="td-amount">${formatCurrency(order.amount)}</td>
         <td>${escapeHtml(order.msg || "-")}</td>
         <td>${escapeHtml(order.datetime)}</td>
         <td>${escapeHtml(order.po_id)}</td>
         <td>${escapeHtml(order.account_id)}</td>
      </tr>
   `).join("");
}

function renderMembers(members) {
   dom.membersCount.textContent = members.length;

   if (!members.length) {
      dom.membersBody.innerHTML = `<tr><td colspan="3" class="empty-state">No members found.</td></tr>`;
      return;
   }

   dom.membersBody.innerHTML = members.map((member) => `
      <tr>
         <td class="td-primary">${escapeHtml(member.name)}</td>
         <td>${escapeHtml(member.bic)}</td>
         <td>${escapeHtml(member.bank)}</td>
      </tr>
   `).join("");
}

async function handleSendPayment() {
   const paymentOrder = getPaymentFormData();
   const validationError = validatePaymentOrder(paymentOrder);

   if (validationError) {
      showFeedback("error", validationError);
      return;
   }

   setButtonLoading(dom.sendButton, true);

   try {
      await api.createPaymentOrder(paymentOrder);
      appState.paymentOrders = await api.getPaymentOrders();
      renderPaymentOrders(appState.paymentOrders);
      showFeedback("success", "Payment order created successfully.");
      clearPaymentForm();
   } catch (error) {
      showFeedback("error", getErrorMessage(error, "Payment order could not be created."));
      console.error(error);
   } finally {
      setButtonLoading(dom.sendButton, false);
   }
}

async function handleRandomOrders() {
   if (!appState.accounts.length) {
      showFeedback("error", "No account available to create random orders.");
      return;
   }

   setButtonLoading(dom.randomButton, true);

   try {
      for (let i = 0; i < 10; i++) {
         const account = randomItem(appState.accounts);

         await api.createPaymentOrder({
            account_id: account.id,
            amount: Number((Math.random() * 499 + 1).toFixed(2)),
            iban: createRandomBelgianIban(),
            msg: "Random order"
         });
      }

      appState.paymentOrders = await api.getPaymentOrders();
      renderPaymentOrders(appState.paymentOrders);
      showFeedback("success", "10 random payment orders created.");
   } catch (error) {
      showFeedback("error", getErrorMessage(error, "Random payment orders could not be created."));
      console.error(error);
   } finally {
      setButtonLoading(dom.randomButton, false);
   }
}

function getPaymentFormData() {
   return {
      account_id: dom.fromAccount.value,
      amount: Number(dom.amount.value),
      iban: dom.iban.value.trim().toUpperCase(),
      msg: "SEPA payment"
   };
}

function validatePaymentOrder(paymentOrder) {
   if (!paymentOrder.account_id) {
      return "Please choose an account.";
   }

   if (!paymentOrder.amount || paymentOrder.amount < 0.1 || paymentOrder.amount > 500) {
      return "Amount must be between 0.10 EUR and 500 EUR.";
   }

   if (!isValidBelgianIban(paymentOrder.iban)) {
      return "Please enter a valid Belgian IBAN, for example BE68639007547034.";
   }

   return "";
}

function toggleSection(section, button, label) {
   const isHidden = section.style.display === "none";
   section.style.display = isHidden ? "" : "none";
   button.textContent = `${isHidden ? "Hide" : "Show"} ${label}`;
}

function showFeedback(type, message) {
   dom.feedbackBox.className = `feedback-box visible ${type}`;
   dom.feedbackText.textContent = message;
}

function clearPaymentForm() {
   dom.amount.value = "";
   dom.iban.value = "";
}

function setButtonLoading(button, isLoading) {
   button.classList.toggle("loading", isLoading);
   button.disabled = isLoading;
}

async function request(path, options = {}) {
   const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
         "Content-Type": "application/json",
         ...options.headers
      },
      ...options
   });

   const contentType = response.headers.get("Content-Type") || "";
   const data = contentType.includes("application/json") ? await response.json() : await response.text();

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
      iban: account.iban || account.id,
      balance: Number(account.balance || 0)
   }));
}

function normalizePaymentOrders(orders) {
   return orders.map((order, index) => normalizePaymentOrder(order, index));
}

function normalizePaymentOrder(order, index = 0) {
   return {
      id: order.id || index + 1,
      amount: Number(order.amount ?? order.po_amount ?? 0),
      msg: order.msg || order.po_message || "-",
      datetime: order.datetime || order.po_datetime || "",
      po_id: order.po_id || order.id || "-",
      account_id: order.account_id || order.oa_id || "-"
   };
}

function normalizeMembers(members) {
   return members.map((member) => ({
      name: member.name || member.bank || member.bic,
      bic: member.bic || member.id || "-",
      bank: member.bank || member.name || "-"
   }));
}

function createSkeletonRows(rowCount, columnCount) {
   return Array.from({ length: rowCount }, () => `
      <tr class="skeleton-row">
         ${Array.from({ length: columnCount }, () => `<td><span></span></td>`).join("")}
      </tr>
   `).join("");
}

function formatCurrency(value) {
   return new Intl.NumberFormat("nl-BE", {
      style: "currency",
      currency: "EUR"
   }).format(value);
}

function isValidBelgianIban(iban) {
   return /^BE\d{14}$/.test(iban);
}

function createRandomBelgianIban() {
   const digits = Array.from({ length: 14 }, () => Math.floor(Math.random() * 10)).join("");
   return `BE${digits}`;
}

function randomItem(items) {
   return items[Math.floor(Math.random() * items.length)];
}

function getErrorMessage(error, fallback) {
   return error && error.message ? error.message : fallback;
}

function escapeHtml(value) {
   return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
}
