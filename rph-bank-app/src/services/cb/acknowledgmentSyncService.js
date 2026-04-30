import { request } from "../../integrations/clearingBankClient.js";
import { Account } from "../../models/account.model.js";
import { Acknowledgment } from "../../models/acknowledgment.model.js";
import { Log } from "../../models/log.model.js";
import { Payment } from "../../models/payment.model.js";
import { ApiError } from "../../utils/apiError.js";
import { acknowledgmentBatchSchema } from "../../schemas/acknowledgment.schemas.js";
import { LogTypes } from "../../codes/logTypes.js";
import { ObCodes } from "../../codes/obCodes.js";
import { formatDateTime } from "../../utils/formatDate.js";
import IBAN from "iban";

const FALLBACK_EXTERNAL_BIC = "UNKNBEBB";
const FALLBACK_OWN_BIC = "BMPBBEBB";
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

function normalizeBic(value, fallback) {
  const bic = String(value ?? "").trim().toUpperCase();
  return /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(bic)
    ? bic
    : fallback;
}

function normalizeDatetimeOrFallback(value, fallback) {
  const normalized = normalizeDatetime(value);
  return normalized && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(normalized)
    ? normalized
    : fallback;
}

function resolveObCode(ack) {
  const amount = Number(ack.po_amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    return ObCodes.OB_NEGATIVE_AMOUNT.code;
  }

  if (amount > 500) {
    return ObCodes.OB_AMOUNT_EXCEEDED.code;
  }

  if (normalizeBic(ack.ob_id, "") === "") {
    return ObCodes.OB_INVALID_BIC.code;
  }

  if (!hasValue(ack.oa_id)) {
    return ObCodes.OB_UNKNOWN_OA.code;
  }

  if (!IBAN.isValid(ack.oa_id)) {
    return ObCodes.OB_INVALID_IBAN.code;
  }

  return ack.ob_code != null ? Number(ack.ob_code) : ObCodes.OB_OK.code;
}

const normalizeDatetime = (value) => {
  if (value == null || value === "") {
    return value;
  }

  if (value instanceof Date) {
    return formatDateTime(value);
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return formatDateTime(parsed);
  }

  return String(value);
};

export async function handleIncomingAcknowledgments() {
  const response = await request("/ack_out");
  const result = await response.json();

  if (!result.ok) {
    throw new ApiError("Failed to fetch acknowledgments from clearing bank.", {
      status: 502,
      code: "CB_ACK_FETCH_FAILED",
      data: result,
    });
  }

  if (!Array.isArray(result.data) || result.data.length === 0) {
    await Log.createEntry({
      datetime: formatDateTime(new Date()),
      message: LogTypes.DATA_POLL_EMPTY.message,
      type: "DATA_POLL_EMPTY",
    });
    return [];
  }

  const now = formatDateTime(new Date());

  const normalizedAcks = (result.data || []).map((ack) => ({
    ...ack,
    po_id: normalizeRequired(
      ack.po_id,
      `INVALID:${process.env.BIC}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
    ),
    po_amount: normalizeAmount(ack.po_amount),
    ob_id: normalizeBic(ack.ob_id, FALLBACK_EXTERNAL_BIC),
    oa_id: normalizeRequired(ack.oa_id, FALLBACK_ACCOUNT_ID),
    ob_code: resolveObCode(ack),
    cb_code: ack.cb_code != null ? Number(ack.cb_code) : ObCodes.OB_OK.code,
    bb_id: normalizeBic(ack.bb_id, process.env.BIC || FALLBACK_OWN_BIC),
    ba_id: normalizeRequired(ack.ba_id, FALLBACK_ACCOUNT_ID),
    bb_code: ack.bb_code != null ? Number(ack.bb_code) : ack.bb_code,
    po_datetime:
      ack.po_datetime == null || ack.po_datetime === ""
        ? now
        : normalizeDatetimeOrFallback(ack.po_datetime, now),
    ob_datetime:
      ack.ob_datetime == null || ack.ob_datetime === ""
        ? now
        : normalizeDatetimeOrFallback(ack.ob_datetime, now),
    cb_datetime:
      ack.cb_datetime == null || ack.cb_datetime === ""
        ? now
        : normalizeDatetimeOrFallback(ack.cb_datetime, now),
    bb_datetime:
      ack.bb_datetime == null || ack.bb_datetime === ""
        ? now
        : normalizeDatetimeOrFallback(ack.bb_datetime, now),
    po_message: ack.po_message ?? "",
  }));

  const { error, value } = acknowledgmentBatchSchema.validate(
    { data: normalizedAcks },
    { abortEarly: false, stripUnknown: true, convert: true },
  );

  if (error) {
    throw new ApiError("Incoming acknowledgment validation failed.", {
      status: 502,
      code: "ACK_PAYLOAD_VALIDATION_FAILED",
      data: error.details.map((d) => ({
        field: d.path.join("."),
        message: d.message,
      })),
    });
  }

  const processed = [];

  for (const ack of value.data) {
    const po = await Payment.getPaymentOrder(ack.po_id);

    await Acknowledgment.createIngoing([
      ack.po_id,
      ack.po_amount,
      ack.po_message,
      ack.po_datetime,
      ack.ob_id,
      ack.oa_id,
      ack.ob_code,
      ack.ob_datetime,
      ack.cb_code,
      ack.cb_datetime,
      ack.bb_id,
      ack.ba_id,
      ack.bb_code,
      ack.bb_datetime,
    ]);

    await Log.createEntry({
      datetime: now,
      message: LogTypes.ACK_RECEIVED.message,
      type: "ACK_RECEIVED",
      code: LogTypes.ACK_RECEIVED.code,
      po_id: ack.po_id,
      po_amount: ack.po_amount,
      po_message: ack.po_message,
      po_datetime: ack.po_datetime,
      ob_id: ack.ob_id,
      oa_id: ack.oa_id,
      ob_code: ack.ob_code,
      ob_datetime: ack.ob_datetime,
      cb_code: ack.cb_code,
      cb_datetime: ack.cb_datetime,
      bb_id: ack.bb_id,
      ba_id: ack.ba_id,
      bb_code: ack.bb_code,
      bb_datetime: ack.bb_datetime,
    });

    if (po) {
      if (ack.bb_code === 2000) {
        await Account.deductMoney(po.oa_id, po.po_amount, po.po_id);
      }
      await Payment.removePoOutRecord(ack.po_id);
    }

    processed.push(ack);
  }

  return processed;
}

export async function sendOutgoingAcknowledgments() {
  const acknowledgments = await Acknowledgment.getOutgoing();
  const now = formatDateTime(new Date());

  const normalizedAcks = (acknowledgments || []).map((ack) => ({
    ...ack,
    po_amount: ack.po_amount != null ? Number(ack.po_amount) : ack.po_amount,
    ob_code: ack.ob_code != null ? Number(ack.ob_code) : ack.ob_code,
    cb_code: ack.cb_code != null ? Number(ack.cb_code) : ack.cb_code,
    bb_code: ack.bb_code != null ? Number(ack.bb_code) : ack.bb_code,
    po_datetime: normalizeDatetime(ack.po_datetime),
    ob_datetime: normalizeDatetime(ack.ob_datetime),
    cb_datetime: normalizeDatetime(ack.cb_datetime),
    bb_datetime: normalizeDatetime(ack.bb_datetime),
    po_message: ack.po_message ?? "",
  }));

  const { error, value } = acknowledgmentBatchSchema.validate(
    { data: normalizedAcks },
    { abortEarly: false, stripUnknown: true, convert: true },
  );

  if (error) {
    throw new ApiError("Outgoing acknowledgment validation failed.", {
      status: 400,
      code: "ACK_PAYLOAD_VALIDATION_FAILED",
      data: error.details.map((d) => ({
        field: d.path.join("."),
        message: d.message,
      })),
    });
  }

  for (const ack of value.data) {
    if (ack.bb_code === 2000) {
      await Account.creditMoney(ack.ba_id, ack.po_amount, ack.po_id);
    }
  }

  const response = await request("/ack_in", {
    method: "POST",
    body: JSON.stringify({ data: value.data }),
  });

  const result = await response.json();

  if (!result.ok) {
    await Log.createEntry({
      datetime: now,
      message: LogTypes.ACK_SENT.message,
      type: "ACK_SENT",
      code: LogTypes.ACK_SENT.code,
      po_id: value.data[0]?.po_id ?? null,
      po_amount: value.data[0]?.po_amount ?? null,
      po_message: value.data[0]?.po_message ?? null,
      po_datetime: value.data[0]?.po_datetime ?? null,
      ob_id: value.data[0]?.ob_id ?? null,
      oa_id: value.data[0]?.oa_id ?? null,
      ob_code: value.data[0]?.ob_code ?? null,
      ob_datetime: value.data[0]?.ob_datetime ?? null,
      cb_code: value.data[0]?.cb_code ?? null,
      cb_datetime: value.data[0]?.cb_datetime ?? null,
      bb_id: value.data[0]?.bb_id ?? null,
      ba_id: value.data[0]?.ba_id ?? null,
      bb_code: value.data[0]?.bb_code ?? null,
      bb_datetime: value.data[0]?.bb_datetime ?? null,
    });

    throw new ApiError("Failed to send acknowledgments to clearing bank.", {
      status: 502,
      code: "CB_ACK_SEND_FAILED",
      data: result,
    });
  }

  for (const ack of value.data) {
    await Log.createEntry({
      datetime: now,
      message: LogTypes.ACK_SENT.message,
      type: "ACK_SENT",
      code: LogTypes.ACK_SENT.code,
      po_id: ack.po_id,
      po_amount: ack.po_amount,
      po_message: ack.po_message,
      po_datetime: ack.po_datetime,
      ob_id: ack.ob_id,
      oa_id: ack.oa_id,
      ob_code: ack.ob_code,
      ob_datetime: ack.ob_datetime,
      cb_code: ack.cb_code,
      cb_datetime: ack.cb_datetime,
      bb_id: ack.bb_id,
      ba_id: ack.ba_id,
      bb_code: ack.bb_code,
      bb_datetime: ack.bb_datetime,
    });
  }

  const sentIds = value.data.map((ack) => ack.po_id);
  if (sentIds.length) {
    await Acknowledgment.clearOutgoing(sentIds);
  }

  return {
    sent: value.data.length,
    data: value.data,
  };
}
