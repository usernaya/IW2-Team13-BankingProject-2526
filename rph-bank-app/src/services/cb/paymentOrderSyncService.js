import IBAN from "iban";
import { request } from "../../integrations/clearingBankClient.js";
import { Account } from "../../models/account.model.js";
import { Acknowledgment } from "../../models/acknowledgment.model.js";
import { Log } from "../../models/log.model.js";
import { Payment } from "../../models/payment.model.js";
import { LogTypes } from "../../codes/logTypes.js";
import { ObCodes } from "../../codes/obCodes.js";
import { BbCodes } from "../../codes/bbCodes.js";
import { formatDateTime } from "../../utils/formatDate.js";

const FALLBACK_EXTERNAL_BIC = "UNKNBEBB";
const FALLBACK_ACCOUNT_ID = "UNKNOWN";

function hasValue(value) {
  return value !== null && value !== undefined && value !== "";
}

function normalizeAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : 0.01;
}

function normalizeRequired(value, fallback) {
  return hasValue(value) ? value : fallback;
}

function isValidBic(value) {
  return /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(
    String(value ?? "").trim().toUpperCase(),
  );
}

function normalizeBic(value, fallback) {
  const bic = String(value ?? "").trim().toUpperCase();
  return isValidBic(bic) ? bic : fallback;
}

function normalizeDatetime(value, fallback) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : formatDateTime(parsed);
}

function resolveObCode(po) {
  const amount = Number(po.po_amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    return ObCodes.OB_NEGATIVE_AMOUNT.code;
  }

  if (amount > 500) {
    return ObCodes.OB_AMOUNT_EXCEEDED.code;
  }

  if (!isValidBic(po.ob_id)) {
    return ObCodes.OB_INVALID_BIC.code;
  }

  if (!hasValue(po.oa_id)) {
    return ObCodes.OB_UNKNOWN_OA.code;
  }

  if (!IBAN.isValid(po.oa_id)) {
    return ObCodes.OB_INVALID_IBAN.code;
  }

  return hasValue(po.ob_code) ? po.ob_code : ObCodes.OB_OK.code;
}

function normalizeExternalPaymentOrder(po, bic, date) {
  return {
    po_id: normalizeRequired(
      po.po_id,
      `INVALID:${bic}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
    ),
    po_amount: normalizeAmount(po.po_amount),
    po_message: po.po_message ?? "",
    po_datetime: normalizeDatetime(po.po_datetime, date),
    ob_id: normalizeBic(po.ob_id, FALLBACK_EXTERNAL_BIC),
    oa_id: normalizeRequired(po.oa_id, FALLBACK_ACCOUNT_ID),
    ob_code: resolveObCode(po),
    ob_datetime: normalizeDatetime(po.ob_datetime, date),
    cb_code: normalizeRequired(po.cb_code, ObCodes.OB_OK.code),
    cb_datetime: date,
    bb_id: normalizeBic(po.bb_id, bic),
    ba_id: normalizeRequired(po.ba_id, FALLBACK_ACCOUNT_ID),
  };
}

export async function handleIncomingPaymentOrders() {
  const response = await request("/po_out");
  const incoming = await response.json();

  if (!incoming.ok) {
    throw new Error(`[${incoming.status}] ${incoming.message}`);
  }

  if (!Array.isArray(incoming.data) || incoming.data.length === 0) {
    await Log.createEntry({
      datetime: formatDateTime(new Date()),
      message: LogTypes.DATA_POLL_EMPTY.message,
      type: "DATA_POLL_EMPTY",
    });
    return [];
  }

  const paymentRows = [];
  const acknowledgmentRows = [];

  const bic = process.env.BIC;
  const date = formatDateTime(new Date());

  for (const po of incoming.data) {
    const normalizedPo = normalizeExternalPaymentOrder(po, bic, date);
    const po_datetime = normalizedPo.po_datetime;
    const ob_datetime = normalizedPo.ob_datetime;
    const cb_datetime = date;
    const bb_datetime = date;
    const po_amount = normalizedPo.po_amount;
    const po_message = normalizedPo.po_message;

    const bb_code = IBAN.isValid(normalizedPo.ba_id)
      ? (await Account.getFromIban(normalizedPo.ba_id))
        ? BbCodes.BB_OK.code
        : BbCodes.BB_UNKNOWN_BA.code
      : BbCodes.BB_INVALID_IBAN.code;

    paymentRows.push([
      normalizedPo.po_id,
      po_amount,
      po_message,
      po_datetime,
      normalizedPo.ob_id,
      normalizedPo.oa_id,
      normalizedPo.ob_code,
      ob_datetime,
      normalizedPo.bb_id,
      normalizedPo.ba_id,
      normalizedPo.cb_code,
      cb_datetime,
    ]);

    acknowledgmentRows.push([
      normalizedPo.po_id,
      po_amount,
      po_message,
      po_datetime,
      normalizedPo.ob_id,
      normalizedPo.oa_id,
      normalizedPo.ob_code,
      ob_datetime,
      normalizedPo.cb_code,
      cb_datetime,
      normalizedPo.bb_id,
      normalizedPo.ba_id,
      bb_code,
      bb_datetime,
    ]);
  }

  if (paymentRows.length) {
    await Payment.createPoIn(paymentRows);

    for (const row of paymentRows) {
      await Log.createEntry({
        datetime: date,
        message: LogTypes.PO_RECEIVED.message,
        type: "PO_RECEIVED",
        code: LogTypes.PO_RECEIVED.code,
        po_id: row[0],
        po_amount: row[1],
        po_message: row[2],
        po_datetime: row[3],
        ob_id: row[4],
        oa_id: row[5],
        ob_code: row[6],
        ob_datetime: row[7],
        cb_code: row[10],
        cb_datetime: row[11],
        bb_id: row[8],
        ba_id: row[9],
      });
    }
  }

  if (acknowledgmentRows.length) {
    await Acknowledgment.createOutgoing(acknowledgmentRows);
  }

  if (paymentRows.length) {
    const processedIds = paymentRows.map((row) => row[0]);
    await Payment.clearPoInRecords(processedIds);
  }

  return incoming.data;
}

async function handlePaymentOutAPICall(po) {
  const response = await request("/po_in", {
    method: "POST",
    body: JSON.stringify({ data: [po] }),
  });
  console.log("Payment order sent to clearing bank:", po);
  const result = await response.json();
  console.log(result);
  if (!result.ok) {
    throw new Error(`[${result.status}] ${result.message}`);
  }
}

export async function sendOutgoingPaymentOrders() {
  const newPaymentOrders = await Payment.getPending();

  const date = formatDateTime(new Date());
  const bic = process.env.BIC;

  for (const po of newPaymentOrders) {
    po.ob_code = ObCodes.OB_OK.code;
    po.ob_datetime = date;

    try {
      await handlePaymentOutAPICall(po);
    } catch (err) {
      await Log.createEntry({
        datetime: date,
        message: LogTypes.CB_UNREACHABLE.message,
        type: "CB_UNREACHABLE",
        code: LogTypes.CB_UNREACHABLE.code,
        po_id: po.po_id,
        po_amount: po.po_amount,
        po_message: po.po_message,
        po_datetime: po.po_datetime,
        ob_id: po.ob_id,
        oa_id: po.oa_id,
        ob_code: po.ob_code,
        ob_datetime: po.ob_datetime,
        bb_id: po.bb_id,
        ba_id: po.ba_id,
      });
      throw err;
    }

    await Payment.processPoOut([
      po.po_id,
      po.po_amount,
      po.po_message,
      po.po_datetime,
      po.ob_id,
      po.oa_id,
      po.ob_code,
      po.ob_datetime,
      po.bb_id,
      po.ba_id,
    ]);

    await Log.createEntry({
      datetime: date,
      message: LogTypes.PO_SENT.message,
      type: "PO_SENT",
      code: LogTypes.PO_SENT.code,
      po_id: po.po_id,
      po_amount: po.po_amount,
      po_message: po.po_message,
      po_datetime: po.po_datetime,
      ob_id: po.ob_id,
      oa_id: po.oa_id,
      ob_code: po.ob_code,
      ob_datetime: po.ob_datetime,
      bb_id: po.bb_id,
      ba_id: po.ba_id,
    });
  }
}
