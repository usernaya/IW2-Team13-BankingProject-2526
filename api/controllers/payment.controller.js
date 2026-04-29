import { Payment } from "../models/payment.model.js";
import { Account } from "../models/account.model.js";

import { newPaymentOrderSchema } from "../schemas/payment.schemas.js";
import { generatePaymentOrderId } from "../services/paymentOrderIdGenerator.js";
import { fetchBanks, isValidBank } from "../services/cb/bankDirectoryService.js";
import { handleIncomingPaymentOrders, sendOutgoingPaymentOrders } from "../services/cb/paymentOrderSyncService.js";

export async function getAllOutgoingPaymentOrders(req, res) {
  const outgoing = await Payment.getOutgoing();
  res.status(200).json(outgoing);
}

export async function getAllIncomingPaymentOrders(req, res) {
  const incoming = await Payment.getIncoming();
  res.status(200).json(incoming);
}

export async function getAllPendingPaymentOrders(req, res) {
  const pending = await Payment.getPending();
  res.status(200).json(pending);
}

export async function createNewPaymentOrder(req, res) {
  const { po_amount, po_message, oa_id, ba_id, bb_id } = req.validated.body;
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

  if (bb_id === bic) {
    await Account.transferMoney(oa_id, ba_id, po_amount);
    // ADD LOG INTERNAL TRANSFER
  } else {
    await Payment.createPoNew([
      {
        po_id: id,
        po_amount: po_amount,
        po_message: po_message,
        ob_datetime: date,
        ob_code: bic,
        oa_id: oa_id,
        bb_id: bb_id,
        ba_id: ba_id,
      }
    ]);
    // ADD LOG EXTERNAL TRANSFER
  }

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

export async function sendNewPayments(req, res) {
  const result = await sendOutgoingPaymentOrders();

  if (result.ok) {
    res.status(201).json({
      message:"Outgoing payments are send to the clearing bank."
    })
  } else {
    res.status(500).json({
      message:"Something went wrong while trying to send the payments to the clearing bank."
    })
  }
}

export async function handleNewPayments(req, res) {
  await handleIncomingPaymentOrders()
  res.status(200).json({
    message:"Successfully handled incoming payment orders."
  })
}