export function validateBic(value, helpers) {
  const bic = String(value).trim().toUpperCase();
  const bicRegex = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
  if (!bicRegex.test(bic)) {
    return helpers.error("any.invalid");
  }
  return bic;
}
