import IBAN from "iban";

export function validateIban(value, helpers) {
  if (!IBAN.isValid(value.trim())) {
    console.log(value);
    return helpers.error("any.invalid");
  }
  return value;
}
