export async function getApiHelp(req, res) {
  const help = {
    message: "API Overview",
    endpoints: {
      accounts: {
        "GET /v1/accounts": "Get all accounts",
        "POST /v1/accounts": "Create a new account (optional body: { balans: number })",
        "GET /v1/accounts/:iban": "Get account by IBAN"
      },
      payments: {
        "GET /v1/payments/outgoing": "Get outgoing payment orders",
        "GET /v1/payments/incoming": "Get incoming payment orders",
        "GET /v1/payments/pending": "Get pending payment orders",
        "POST /v1/payments": "Create new payment order",
        "POST /v1/payments/send": "Send outgoing payment orders",
        "POST /v1/payments/handle": "Handle incoming payment orders"
      },
      acknowledgments: {
        "GET /v1/acknowledgments/outgoing": "Get outgoing acknowledgments",
        "GET /v1/acknowledgments/incoming": "Get incoming acknowledgments",
        "POST /v1/acknowledgments/send": "Send outgoing acknowledgments",
        "POST /v1/acknowledgments/handle": "Handle new acknowledgments"
      },
      logs: {
        "GET /v1/logs": "Get all logs"
      },
      test: {
        "GET /v1/test": "Test endpoint"
      }
    },
    documentation: "For detailed documentation, see README.md or external docs link."
  };
  res.status(200).json(help);
}