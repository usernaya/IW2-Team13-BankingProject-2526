export const ObCodes = Object.freeze({
  OB_OK: { code: 1000, message: "Validation successful" },
  OB_UNKNOWN_OA: { code: 1001, message: "Unknown originator account" },
  OB_INSUFFICIENT_FUNDS: { code: 1002, message: "Insufficient funds" },
  OB_AMOUNT_EXCEEDED: { code: 1003, message: "Amount exceeds €500" },
  OB_INVALID_IBAN: { code: 1004, message: "Invalid IBAN" },
  OB_INVALID_BIC: { code: 1005, message: "Invalid BIC" },
  OB_NEGATIVE_AMOUNT: { code: 1006, message: "Amount is negative or zero" },
  OB_CB_UNREACHABLE: { code: 1007, message: "Central Bank unreachable" },
});
