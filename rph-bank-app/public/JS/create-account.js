const API_BASE_URL = "/api/v1";
const CREATE_ACCOUNT_ENDPOINT = "/accounts";

const form = document.querySelector("#create-account-form");
const balanceInput = document.querySelector("#initial-balance");
const createButton = document.querySelector("#btn-create-account");
const feedbackBox = document.querySelector("#account-feedback");
const feedbackText = document.querySelector("#account-feedback .feedback-text");
const createdAccount = document.querySelector("#created-account");

form.addEventListener("submit", handleCreateAccount);
balanceInput.addEventListener("blur", formatBalanceInput);
balanceInput.addEventListener("change", formatBalanceInput);

async function handleCreateAccount(event) {
   event.preventDefault();

   const balance = Number(balanceInput.value);
   const validationError = validateBalance(balance);

   if (validationError) {
      showFeedback("error", validationError);
      return;
   }

   setButtonLoading(true);

   try {
      const account = await createAccount(balance);
      showFeedback("success", "Account created successfully.");
      renderCreatedAccount(account);
      form.reset();
   } catch (error) {
      showFeedback("error", getErrorMessage(error, "Account could not be created."));
      console.error(error);
   } finally {
      setButtonLoading(false);
   }
}

async function createAccount(balance) {
   const response = await fetch(`${API_BASE_URL}${CREATE_ACCOUNT_ENDPOINT}`, {
      method: "POST",
      headers: {
         "Content-Type": "application/json"
      },
      body: JSON.stringify({ balance })
   });

   const data = await response.json();

   if (!response.ok) {
      throw new Error(data.message || data.error || `Request failed: ${response.status}`);
   }

   return data;
}

function renderCreatedAccount(account) {
   createdAccount.innerHTML = `
      <div class="data-card">
         <div class="data-card__iban">${escapeHtml(account.iban)}</div>
         <div class="data-card__balance">${formatCurrency(Number(account.balance ?? 0))}</div>
         <div class="data-card__label">Initial balance</div>
      </div>
   `;
}

function validateBalance(balance) {
   if (!Number.isFinite(balance)) {
      return "Please enter an initial balance.";
   }

   if (balance < 0) {
      return "Initial balance cannot be negative.";
   }

   if (balance > 9999999999999.99) {
      return "Initial balance is too high.";
   }

   return "";
}

function formatBalanceInput() {
   const balance = Number(balanceInput.value);

   if (Number.isFinite(balance) && balance >= 0) {
      balanceInput.value = balance.toFixed(2);
   }
}

function showFeedback(type, message) {
   feedbackBox.className = `feedback-box visible ${type}`;
   feedbackText.textContent = message;
}

function setButtonLoading(isLoading) {
   createButton.classList.toggle("loading", isLoading);
   createButton.disabled = isLoading;
}

function formatCurrency(value) {
   return new Intl.NumberFormat("nl-BE", {
      style: "currency",
      currency: "EUR"
   }).format(value);
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
