import { dom, renderAccountSelect, renderAccounts, renderPaymentOrders, renderMembers, renderBeneficiaryBanks, renderLoadingState, clearLoadingState } from "./dom.js";
import { getAccounts, getPaymentOrders, getBanks, createPaymentOrder, fetchAcknowledgments } from "./api.js";
import { formatAmountInput, isValidBelgianIban, createRandomBelgianIban, randomItem, getErrorMessage, setButtonLoading, toggleSection, getOwnBankCode, isLocalAccount } from "./utils.js";

const appState = {
  accounts: [],
  paymentOrders: [],
  members: [],
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  bindEvents();
  renderLoadingState();

  try {
    const [accounts, orders] = await Promise.all([getAccounts(), getPaymentOrders()]);
    const members = await getBanks();

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
  const [accounts, orders] = await Promise.all([getAccounts(), getPaymentOrders()]);

  appState.accounts = accounts;
  appState.paymentOrders = orders;
  renderAccountSelect(accounts);
  renderAccounts(accounts);
  renderPaymentOrders(orders);
}

async function handleRefreshBanks() {
  setButtonLoading(dom.refreshBanksButton, true);

  try {
    const members = await getBanks(true);

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

async function handleSendPayment() {
  const paymentOrder = getPaymentFormData();
  const validationError = validatePaymentOrder(paymentOrder);

  if (validationError) {
    showFeedback("error", validationError);
    return;
  }

  setButtonLoading(dom.sendButton, true);

  try {
    await createPaymentOrder(paymentOrder);
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
    const result = await fetchAcknowledgments();
    await reloadAccountsAndOrders();

    const summary = result.data
      ? `${result.data.length} acknowledgment(s) handled.`
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

      await createPaymentOrder({
        account_id: account.id,
        amount: Number((Math.random() * 499 + 1).toFixed(2)),
        iban: createRandomBelgianIban(),
        msg: "Random order",
        bb_id: randomItem(appState.members).bic,
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
    bb_id: isLocalAccount(appState.accounts, beneficiaryIban) ? getOwnBankCode() : dom.beneficiaryBank.value,
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

function clearPaymentForm() {
  dom.amount.value = "";
  dom.iban.value = "";
}

function showFeedback(type, message) {
  dom.feedbackBox.className = `feedback-box visible ${type}`;
  dom.feedbackText.textContent = message;
}
