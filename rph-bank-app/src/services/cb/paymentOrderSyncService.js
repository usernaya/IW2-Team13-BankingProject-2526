import IBAN from "iban";
import { request } from "../../integrations/clearingBankClient.js";
import { Account } from "../../models/account.model.js";
import { Acknowledgment } from "../../models/acknowledgment.model.js";
import { Log } from "../../models/log.model.js";
import { Payment } from "../../models/payment.model.js";
import { LogTypes } from "../../codes/logTypes.js";
import { ObCodes } from "../../codes/obCodes.js";
import { formatDateTime } from "../../utils/formatDate.js";

export async function handleIncomingPaymentOrders() {
  const response = await request("/po_out");
  const incoming = await response.json();

  if (!incoming.ok) {
    throw new Error(`[${incoming.status}] ${incoming.message}`);
  }

  if (!Array.isArray(incoming.data) || incoming.data.length === 0) {
    return [];
  }

  const paymentRows = [];
  const acknowledgmentRows = [];

  const bic = process.env.BIC;
  const date = formatDateTime(new Date());

  for (const po of incoming.data) {
    const po_datetime = po.po_datetime ?? date;
    const ob_datetime = po.ob_datetime ?? date;
    const cb_datetime = date;
    const bb_datetime = date;
    const po_amount = Number(po.po_amount);
    const po_message = po.po_message ?? "";

    const bb_code = IBAN.isValid(po.ba_id)
      ? (await Account.getFromIban(po.ba_id))
        ? 2000
        : 2001
      : 2002;

    paymentRows.push([
      po.po_id,
      po_amount,
      po_message,
      po_datetime,
      po.ob_id,
      po.oa_id,
      po.ob_code,
      ob_datetime,
      po.bb_id,
      po.ba_id,
      po.cb_code ?? 1000,
      cb_datetime,
    ]);

    acknowledgmentRows.push([
      po.po_id,
      po_amount,
      po_message,
      po_datetime,
      po.ob_id,
      po.oa_id,
      po.ob_code,
      ob_datetime,
      po.cb_code ?? 1000,
      cb_datetime,
      po.bb_id,
      po.ba_id,
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
