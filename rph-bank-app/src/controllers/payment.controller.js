import { Payment } from "../models/payment.model.js";
import { Account } from "../models/account.model.js";
import { Log } from "../models/log.model.js";
import { sendSuccess, sendFailure } from "../utils/response.js";
import { formatDateTime } from "../utils/formatDate.js";
import { generatePaymentOrderId } from "../services/paymentOrderIdGenerator.js";
import { isValidBank } from "../services/cb/bankDirectoryService.js";
import {
  handleIncomingPaymentOrders,
  sendOutgoingPaymentOrders,
} from "../services/cb/paymentOrderSyncService.js";
import { LogTypes } from "../codes/logTypes.js";
import { ObCodes } from "../codes/obCodes.js";

export async function getAllOutgoingPaymentOrders(req, res) {
  const outgoing = await Payment.getOutgoing();
  return sendSuccess(res, {
    status: 200,
    code: null,
    message: "Outgoing payment orders fetched successfully.",
    data: outgoing,
  });
}

export async function getAllIncomingPaymentOrders(req, res) {
  const incoming = await Payment.getIncoming();
  return sendSuccess(res, {
    status: 200,
    code: null,
    message: "Incoming payment orders fetched successfully.",
    data: incoming,
  });
}

export async function getAllPendingPaymentOrders(req, res) {
  const pending = await Payment.getPending();
  return sendSuccess(res, {
    status: 200,
    code: null,
    message: "Pending payment orders fetched successfully.",
    data: pending,
  });
}

export async function createNewPaymentOrder(req, res) {
  const { po_amount, po_message, oa_id, ba_id, bb_id } = req.validated.body;
  const bic = process.env.BIC;

  const id = generatePaymentOrderId();
  const date = formatDateTime(new Date());

  // Check if its a valid bank
  const valid = await isValidBank(bb_id);
  if (!valid) {
    const logDate = formatDateTime(new Date());
    await Log.createEntry({
      datetime: logDate,
      message: LogTypes.OB_VALIDATION_FAIL.message,
      type: "OB_VALIDATION_FAIL",
      code: LogTypes.OB_VALIDATION_FAIL.code,
      po_id: id,
      po_amount,
      po_message,
      po_datetime: date,
      ob_id: bic,
      oa_id,
      bb_id,
      ba_id,
    }).catch(() => {});

    return sendFailure(res, {
      status: 400,
      code: ObCodes.OB_INVALID_BIC.code,
      message: ObCodes.OB_INVALID_BIC.message,
      data: null,
    });
  }

  const response = await Account.calculateAvailableBalance(oa_id);

  if (!response) {
    return sendFailure(res, {
      status: 404,
      code: ObCodes.OB_UNKNOWN_OA.code,
      message: ObCodes.OB_UNKNOWN_OA.message,
      data: null,
    });
  } else if (po_amount > response.available_balance) {
    return sendFailure(res, {
      status: 409,
      code: ObCodes.OB_INSUFFICIENT_FUNDS.code,
      message: ObCodes.OB_INSUFFICIENT_FUNDS.message,
      data: null,
    });
  }

  if (bb_id === bic) {
    await Account.transferMoney(oa_id, ba_id, po_amount, id);
    await Log.createEntry({
      datetime: date,
      message: LogTypes.TX_SUCCESS.message,
      type: "TX_SUCCESS",
      code: LogTypes.TX_SUCCESS.code,
      po_id: id,
      po_amount,
      po_message,
      po_datetime: date,
      ob_id: bic,
      oa_id,
      ob_code: LogTypes.TX_SUCCESS.code,
      ob_datetime: date,
      bb_id,
      ba_id,
      bb_code: LogTypes.TX_SUCCESS.code,
      bb_datetime: date,
    });
  } else {
    await Payment.createPoNew([
      [id, po_amount, po_message, date, bic, oa_id, bb_id, ba_id],
    ]);
    await Log.createEntry({
      datetime: date,
      message: LogTypes.PO_SENT.message,
      type: "PO_SENT",
      code: LogTypes.PO_SENT.code,
      po_id: id,
      po_amount,
      po_message,
      po_datetime: date,
      ob_id: bic,
      oa_id,
      ob_code: ObCodes.OB_OK?.code ?? null,
      ob_datetime: date,
      bb_id,
      ba_id,
      bb_code: null,
      bb_datetime: null,
    });
  }

  return sendSuccess(res, {
    status: 201,
    code: null,
    message: "Payment order created successfully.",
    data: {
      po_id: id,
      amount: po_amount,
      message: po_message,
      datetime: date,
      ob_id: bic,
      oa_id,
      bb_id,
      ba_id,
    },
  });
}

export async function sendNewPayments(req, res) {
  await sendOutgoingPaymentOrders();
  return sendSuccess(res, {
    status: 201,
    code: null,
    message: "Outgoing payments sent to the clearing bank.",
    data: null,
  });
}

export async function handleNewPayments(req, res) {
  await handleIncomingPaymentOrders();
  return sendSuccess(res, {
    status: 200,
    code: null,
    message: "Incoming payment orders processed successfully.",
    data: null,
  });
}
