import { escapeHtml, formatCurrency, createSkeletonRows } from "./utils.js";

export const dom = {
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
  refreshBanksButton: document.querySelector("#btn-refresh-banks"),
};

export function renderAccountSelect(accounts) {
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

export function renderAccounts(accounts) {
  dom.accountsCount.textContent = accounts.length;

  if (!accounts.length) {
    dom.accountsGrid.innerHTML = `<div class="empty-state">No accounts found.</div>`;
    return;
  }

  dom.accountsGrid.innerHTML = accounts
    .map(
      (account) => `
      <div class="data-card">
         <div class="data-card__iban">${escapeHtml(account.iban)}</div>
         <div class="data-card__balance">${formatCurrency(account.currentBalance)}</div>
         <div class="data-card__label">Balance</div>
      </div>
   `,
    )
    .join("");
}

export function renderPaymentOrders(orders) {
  dom.ordersCount.textContent = orders.length;

  if (!orders.length) {
    dom.ordersBody.innerHTML = `<tr><td colspan="6" class="empty-state">No payment orders found.</td></tr>`;
    return;
  }

  dom.ordersBody.innerHTML = orders
    .map(
      (order) => `
      <tr>
         <td class="td-primary">${escapeHtml(order.id)}</td>
         <td class="td-amount">${formatCurrency(order.amount)}</td>
         <td>${escapeHtml(order.msg || "-")}</td>
         <td>${escapeHtml(order.datetime)}</td>
         <td>${escapeHtml(order.po_id)}</td>
         <td>${escapeHtml(order.account_id)}</td>
      </tr>
   `,
    )
    .join("");
}

export function renderMembers(members) {
  dom.membersCount.textContent = members.length;

  if (!members.length) {
    dom.membersBody.innerHTML = `<tr><td colspan="2" class="empty-state">No banks found.</td></tr>`;
    return;
  }

  dom.membersBody.innerHTML = members
    .map(
      (member) => `
      <tr>
         <td>${escapeHtml(member.bic)}</td>
         <td>${escapeHtml(member.bank)}</td>
      </tr>
   `,
    )
    .join("");
}

export function renderBeneficiaryBanks(members) {
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

export function renderLoadingState() {
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

export function clearLoadingState() {
  dom.fromAccount.classList.remove("loading");
  renderAccountSelect([]);
  renderAccounts([]);
  renderPaymentOrders([]);
  renderMembers([]);
  renderBeneficiaryBanks([]);
}
