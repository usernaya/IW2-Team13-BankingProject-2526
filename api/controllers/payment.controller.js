import { Paymenth } from "../models/payment.model.js";
import { newPaymentOrderSchema } from "../schemas/payment.schemas.js";
import { generatePaymentOrderId } from "../services/paymentOrderIdGenerator.js";

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
