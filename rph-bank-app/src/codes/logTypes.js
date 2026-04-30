export const LogTypes = Object.freeze({
  PO_SENT: { code: 4000, message: "Payment Order sent" },
  PO_RECEIVED: { code: 4001, message: "Payment Order received" },
  ACK_SENT: { code: 4002, message: "Acknowledgement sent" },
  ACK_RECEIVED: { code: 4003, message: "Acknowledgement received" },
  CB_UNREACHABLE: { code: 4004, message: "Central Bank unreachable" },
  CB_RETRY_FAILED: { code: 4005, message: "Retry failed" },
  OB_VALIDATION_FAIL: {
    code: 4006,
    message: "Originator Bank validation error",
  },
  BB_VALIDATION_FAIL: {
    code: 4007,
    message: "Beneficiary Bank validation error",
  },
  TX_SUCCESS: { code: 4008, message: "Transaction successful" },
  TX_FAILED: { code: 4009, message: "Transaction failed" },
  DATA_POLL_EMPTY: {
    code: 4010,
    message: "No incoming data received from clearing bank",
  },
});
