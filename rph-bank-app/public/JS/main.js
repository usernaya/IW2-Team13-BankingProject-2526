const API_BASE_URL = "/api/v1";
const OWN_BANK_BIC = "BMPBBEBB";

const ENDPOINTS = {
   accounts: "/accounts",
   banks: "/banks",
   paymentOrders: "/payments/pending",
   createPaymentOrder: "/payments",
   fetchAcknowledgments: "/acknowledgments/handle",

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

   async getBanks(refresh = false) {
      const query = refresh ? "?refresh=true" : "";
      const response = await request(`${ENDPOINTS.banks}${query}`);
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
         ba_id: paymentOrder.iban,
         bb_id: paymentOrder.bb_id
      };

      const response = await request(ENDPOINTS.createPaymentOrder, {
         method: "POST",
         body: JSON.stringify(payload)
      });

      return normalizePaymentOrder(extractData(response));
   },

   async fetchAcknowledgments() {
      return request(ENDPOINTS.fetchAcknowledgments, {
         method: "POST"
      });
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
   fetchAcksButton: document.querySelector("#btn-fetch-acks"),
   randomButton: document.querySelector("#btn-random"),
   hideDataButton: document.querySelector("#btn-hide-data"),
   hideOrdersButton: document.querySelector("#btn-hide-orders"),
   hideMembersButton: document.querySelector("#btn-hide-members"),
   dataSection: document.querySelector("#section-data"),
   ordersSection: document.querySelector("#section-orders"),
   membersSection: document.querySelector("#section-members"),
   beneficiaryBank: document.querySelector("#beneficiary-bank"),
   refreshBanksButton: document.querySelector("#btn-refresh-banks")
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
   bindEvents();
   renderLoadingState();

   try {
      const [accounts, orders] = await Promise.all([
   api.getAccounts(),
   api.getPaymentOrders()
]);

      const members = await api.getBanks();

      appState.accounts = accounts;
appState.paymentOrders = orders;
appState.members = members;

      renderAccountSelect(accounts);
renderAccounts(accounts);
renderPaymentOrders(orders);
renderMembers(members);
renderBeneficiaryBanks(members);
   } catch (error) {
      showFeedback("error", getErrorMessage(error, "Data could not be loaded. Please try again later."));
      console.error(error);
      clearLoadingState();
   }
}

function bindEvents() {
   dom.sendButton.addEventListener("click", handleSendPayment);
   dom.fetchAcksButton.addEventListener("click", handleFetchAcknowledgments);
   dom.randomButton.addEventListener("click", handleRandomOrders);
   dom.hideDataButton.addEventListener("click", () => toggleSection(dom.dataSection, dom.hideDataButton, "Data"));
   dom.hideOrdersButton.addEventListener("click", () => toggleSection(dom.ordersSection, dom.hideOrdersButton, "New Payment Orders"));
   dom.hideMembersButton.addEventListener("click", () => toggleSection(dom.membersSection, dom.hideMembersButton, "Banks"));
   dom.refreshBanksButton.addEventListener("click", handleRefreshBanks);
   dom.amount.addEventListener("blur", formatAmountInput);
   dom.amount.addEventListener("change", formatAmountInput);
}

async function reloadAccountsAndOrders() {
   const [accounts, orders] = await Promise.all([
      api.getAccounts(),
      api.getPaymentOrders()
   ]);

   appState.accounts = accounts;
   appState.paymentOrders = orders;
   renderAccountSelect(accounts);
   renderAccounts(accounts);
   renderPaymentOrders(orders);
}

async function handleRefreshBanks() {
   setButtonLoading(dom.refreshBanksButton, true);

   try {
      const members = await api.getBanks(true);

      appState.members = members;
      renderMembers(members);
      renderBeneficiaryBanks(members);

      showFeedback("success", "Banks refreshed successfully.");
   } catch (error) {
      showFeedback("error", getErrorMessage(error, "Banks could not be refreshed."));
      console.error(error);
   } finally {
      setButtonLoading(dom.refreshBanksButton, false);
   }
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
   dom.membersBody.innerHTML = createSkeletonRows(2, 2);
}

function clearLoadingState() {
   dom.fromAccount.classList.remove("loading");
   renderAccountSelect([]);
   renderAccounts([]);
   renderPaymentOrders([]);
   renderMembers([]);
   renderBeneficiaryBanks([]);
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
         <div class="data-card__balance">${formatCurrency(account.currentBalance)}</div>
         <div class="data-card__label">Balance</div>
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
      dom.membersBody.innerHTML = `<tr><td colspan="2" class="empty-state">No banks found.</td></tr>`;
      return;
   }

   dom.membersBody.innerHTML = members.map((member) => `
      <tr>
         <td>${escapeHtml(member.bic)}</td>
         <td>${escapeHtml(member.bank)}</td>
      </tr>
   `).join("");
}

function renderBeneficiaryBanks(members) {
   dom.beneficiaryBank.classList.remove("loading");
   dom.beneficiaryBank.innerHTML = "";

   if (!members.length) {
      dom.beneficiaryBank.innerHTML = `<option value="">No banks available</option>`;
      return;
   }

   members.forEach((member) => {
      const option = document.createElement("option");
      option.value = member.bic;
      option.textContent = `${member.bank} (${member.bic})`;
      dom.beneficiaryBank.appendChild(option);
   });
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
      await reloadAccountsAndOrders();
      showFeedback("success", "Payment order created successfully.");
      clearPaymentForm();
   } catch (error) {
      showFeedback("error", getErrorMessage(error, "Payment order could not be created."));
      console.error(error);
   } finally {
      setButtonLoading(dom.sendButton, false);
   }
}

async function handleFetchAcknowledgments() {
   setButtonLoading(dom.fetchAcksButton, true);

   try {
      const result = await api.fetchAcknowledgments();
      await reloadAccountsAndOrders();

      const summary = result.data
         ? `${result.data.handled} handled, ${result.data.skipped} skipped.`
         : "Acknowledgments fetched.";

      showFeedback("success", summary);
   } catch (error) {
      showFeedback("error", getErrorMessage(error, "Acknowledgments could not be fetched."));
      console.error(error);
   } finally {
      setButtonLoading(dom.fetchAcksButton, false);
   }
}

async function handleRandomOrders() {
   if (!appState.accounts.length) {
      showFeedback("error", "No account available to create random orders.");
      return;
   }

   if (!appState.members.length) {
      showFeedback("error", "No beneficiary bank available to create random orders.");
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
            msg: "Random order",
            bb_id: randomItem(appState.members).bic
         });
      }

      await reloadAccountsAndOrders();
      showFeedback("success", "10 random payment orders created.");
   } catch (error) {
      showFeedback("error", getErrorMessage(error, "Random payment orders could not be created."));
      console.error(error);
   } finally {
      setButtonLoading(dom.randomButton, false);
   }
}

function getPaymentFormData() {
   const beneficiaryIban = dom.iban.value.trim().toUpperCase();

   return {
      account_id: dom.fromAccount.value,
      amount: Number(dom.amount.value),
      iban: beneficiaryIban,
      msg: "SEPA payment",
      bb_id: isLocalAccount(beneficiaryIban) ? OWN_BANK_BIC : dom.beneficiaryBank.value
   };
}

function validatePaymentOrder(paymentOrder) {
   if (!paymentOrder.account_id) {
      return "Please choose an account.";
   }

   if (!paymentOrder.amount || paymentOrder.amount < 0.1 || paymentOrder.amount > 500) {
      return "Amount must be between 0.10 EUR and 500 EUR.";
   }

   if (!paymentOrder.bb_id) {
      return "Please choose a beneficiary bank.";
   }

   if (paymentOrder.bb_id === getOwnBankCode() && paymentOrder.account_id === paymentOrder.iban) {
      return "Originator account and beneficiary account cannot be the same.";
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
      iban: account.id, 
      balance: Number(account.balance ?? 0),
      currentBalance: Number(account.balance ?? 0),
      availableBalance: Number(account.available_balance ?? account.balance ?? 0)
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
      id: order.id || index + 1,
      amount: Number(order.amount ?? order.po_amount ?? 0),
      msg: order.msg || order.po_message || "-",
      datetime: formatDateTime(order.datetime || order.po_datetime || ""),
      po_id: order.po_id || order.id || "-",
      account_id: order.account_id || order.oa_id || "-"
   };
}

function normalizeMembers(members) {
   return members.map(member => ({
      bic: member.bic || member.id,
      bank: member.name || member.bank || member.bic || member.id
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

function formatAmountInput() {
   const amount = Number(dom.amount.value);

   if (Number.isFinite(amount) && amount > 0) {
      dom.amount.value = amount.toFixed(2);
   }
}

function formatDateTime(value) {
   if (!value) return "";

   if (typeof value === "string" && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
      return value;
   }

   const date = new Date(value);

   if (Number.isNaN(date.getTime())) {
      return value;
   }

   const pad = (number) => String(number).padStart(2, "0");

   return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function isValidBelgianIban(iban) {
   return /^BE\d{14}$/.test(iban);
}

function createRandomBelgianIban() {
   const countryCode = "BE";
   const bban = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("");
   const converted = `${bban}${countryCode}00`
      .split("")
      .map((char) => Number.isNaN(Number(char)) ? String(char.charCodeAt(0) - 55) : char)
      .join("");
   const checkDigits = String(98n - (BigInt(converted) % 97n)).padStart(2, "0");

   return `${countryCode}${checkDigits}${bban}`;
}

function randomItem(items) {
   return items[Math.floor(Math.random() * items.length)];
}

function getOwnBankCode() {
   return OWN_BANK_BIC;
}

function isLocalAccount(iban) {
   return appState.accounts.some((account) => account.id === iban);
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
