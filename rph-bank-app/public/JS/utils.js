export function formatCurrency(value) {
  return new Intl.NumberFormat("nl-BE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function formatDateTime(value) {
  if (!value) return "";

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
    return value;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function isValidBelgianIban(iban) {
  return /^BE\d{14}$/.test(iban);
}

export function createRandomBelgianIban() {
  const countryCode = "BE";
  const bban = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("");
  const converted = `${bban}${countryCode}00`
    .split("")
    .map((char) => (Number.isNaN(Number(char)) ? String(char.charCodeAt(0) - 55) : char))
    .join("");
  const checkDigits = String(98n - (BigInt(converted) % 97n)).padStart(2, "0");
  return `${countryCode}${checkDigits}${bban}`;
}

export function createSkeletonRows(rowCount, columnCount) {
  return Array.from({ length: rowCount }, () => `
      <tr class="skeleton-row">
         ${Array.from({ length: columnCount }, () => `<td><span></span></td>`).join("")}
      </tr>
   `).join("");
}

export function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export function getErrorMessage(error, fallback) {
  return error && error.message ? error.message : fallback;
}

export function setButtonLoading(button, isLoading) {
  button.classList.toggle("loading", isLoading);
  button.disabled = isLoading;
}

export function toggleSection(section, button, label) {
  const isHidden = section.style.display === "none";
  section.style.display = isHidden ? "" : "none";
  button.textContent = `${isHidden ? "Hide" : "Show"} ${label}`;
}

export function getOwnBankCode() {
  return "BMPBBEBB";
}

export function isLocalAccount(accounts, iban) {
  return accounts.some((account) => account.id === iban);
}
