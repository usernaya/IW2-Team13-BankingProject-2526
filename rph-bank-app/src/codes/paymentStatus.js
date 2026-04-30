export const PaymentStatus = Object.freeze({
  RESERVED: { code: 3000, message: "Amount reserved" },
  SUCCESS: { code: 3001, message: "Payment successful" },
  FAILED: { code: 3002, message: "Payment failed" },
  PENDING_RETRY: { code: 3003, message: "Waiting for retry" },
});
