import { Paymenth } from "../models/payment.model.js";
import { Account } from "../models/account.model.js";

import { newPaymentOrderSchema } from "../schemas/payment.schemas.js";
import { generatePaymentOrderId } from "../services/paymentOrderIdGenerator.js";
import { fetchBanks, isValidBank } from "../services/cb/bankDirectoryService.js";

export async function getAllOutgoingPaymentOrders(req, res) {
  const outgoing = await Paymenth.getOutgoing();
  res.status(200).json(outgoing);
}

export async function getAllIncomingPaymentOrders(req, res) {
  const incoming = await Paymenth.getIncoming();
  res.status(200).json(incoming);
}

export async function getAllPendingPaymentOrders(req, res) {
  const pending = await Paymenth.getPending();
  res.status(200).json(pending);
}

export async function createNewPaymentOrder(req, res) {
  const { po_amount, po_message, oa_id, ba_id, bb_id } = req.body;
  const bic = process.env.BIC;

  const id = generatePaymentOrderId();
  const date = new Date();

  // Check if its a valid bank
  const valid = await isValidBank(bb_id);
  if (!valid) {
    return res.status(400).json({
      message: `Bank with code: "${bb_id}" does not exist.`
    });
  }

  const response = await Account.calculateAvailableBalance(oa_id);

  if (!response) {
    return res.status(404).json({
      "message": `Account with iban: "${oa_id}" is not found.`
    })
  } else if (po_amount > response.available_balance) {
    return res.status(409).json({
      "message": `Not enough available balance for account with iban: "${oa_id}"`,
      "available_balance": Number(response.available_balance),
      "requested_amount": po_amount
    })
  }

  await Paymenth.createPoNew(
    id,
    po_amount,
    po_message,
    date,
    bic,
    oa_id,
    bb_id,
    ba_id,
  );

  res.status(201).json({
    po_id: id,
    amount: po_amount,
    message: po_message,
    datetime: date,
    ob_id: bic,
    oa_id: oa_id,
    bb_id: bb_id,
    ba_id: ba_id,
  });
}
