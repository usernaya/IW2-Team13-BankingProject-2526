import { createAccount } from "./api.js";

const form = document.querySelector("#create-account-form");
const balance = document.querySelector("#initial-balance");
const feedback = document.querySelector("#feedback");
const result = document.querySelector("#created-account");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const initialBalance = Number(balance.value);
  if (!Number.isFinite(initialBalance) || initialBalance < 0) {
    showFeedback("error", "Initial balance must be 0 or higher.");
    return;
  }

  try {
    showFeedback("loading", "Creating account...");
    const account = await createAccount(initialBalance);
    result.innerHTML = `
      <article class="account-card">
        <strong>${escapeHtml(account.iban)}</strong>
        <span>Balance: ${formatCurrency(account.balance)}</span>
        <span>Available: ${formatCurrency(account.availableBalance)}</span>
      </article>
    `;
    form.reset();
    showFeedback("success", "Account created.");
  } catch (error) {
    showFeedback("error", error.message);
  }
});

function showFeedback(type, message) {
  feedback.className = `feedback ${type}`;
  feedback.textContent = message;
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
