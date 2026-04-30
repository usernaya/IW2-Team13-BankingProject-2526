import { Transaction } from "../models/transaction.model.js";
import { sendSuccess } from "../utils/response.js";

export async function getAllTransactions(req, res) {
  const transactions = await Transaction.getAll();
  return sendSuccess(res, {
    status: 200,
    message: "All transactions fetched successfully.",
    data: transactions,
  });
}

export async function getFailedTransactions(req, res) {
  const failed = await Transaction.getFailed();
  return sendSuccess(res, {
    status: 200,
    message: "Failed transactions fetched successfully.",
    data: failed,
  });
}

export async function getOutstandingPayments(req, res) {
  const outstanding = await Transaction.getOutstandingPayments();
  return sendSuccess(res, {
    status: 200,
    message: "Outstanding payment orders fetched successfully.",
    data: outstanding,
  });
}
