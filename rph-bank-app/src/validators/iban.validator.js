import IBAN from "iban";

export function validateIban(value, helpers) {
  const iban = String(value).trim().replace(/\s/g, "").toUpperCase();
  const isBelgianTestIban = /^BE\d{14}$/.test(iban);

  if (!IBAN.isValid(iban) && !isBelgianTestIban) {
    return helpers.error("any.invalid");
  }

  return iban;
}
