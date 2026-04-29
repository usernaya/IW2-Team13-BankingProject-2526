export function generatePaymentOrderId() {
  const bic = process.env.BIC;
  return `${bic}_${crypto.randomUUID()}`;
}
