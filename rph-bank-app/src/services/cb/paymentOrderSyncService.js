import IBAN from "iban";
import { request } from "../../integrations/clearingBankClient.js";
import { Account } from "../../models/account.model.js";
import { Acknowledgment } from "../../models/acknowledgment.model.js";
import { Payment } from "../../models/payment.model.js";

export async function handleIncomingPaymentOrders() {
    const response = await request("/po_out");

    if (!response.ok) {
        throw new Error(`Failed: ${response.status}`);
    }

    const incoming = await response.json();

    if (!incoming.ok) {
        throw new Error(`[${incoming.status}] ${incoming.result}`,);
    }

    const paymentOrders = incoming.data ?? [];
    const acknowledgments = [];
    const date = new Date().toISOString();

    for (const po of paymentOrders) {
        po.bb_datetime = date;

        if (!IBAN.isValid(po.ba_id)) {
            po.bb_code = 2002;
        } else {
            const account = await Account.getFromIban(po.ba_id);
            po.bb_code = account ? 2000 : 2001;

            if (account) {
                await Account.addMoney(po.ba_id, po.po_amount);
                await Payment.createPoIn(po);
            }
        }

        acknowledgments.push(po);
    }

    await Acknowledgment.createOutgoing(acknowledgments);
}

export async function sendOutgoingPaymentOrders() {
    const newPaymentOrders = await Payment.getPending();

    const date = new Date().toISOString();
    const bic = process.env.BIC;

    const payload = newPaymentOrders.map((po) => ({
        ...po,
        ob_code: bic,
        ob_datetime: date
    }));

    const response = await request("/po_in", {
        method: "POST",
        body: payload
    });

    const result = await response.json();

    if (!result.ok) {
        throw new Error(`[${result.status}] ${result.result}`,);
    }

    const ids = newPaymentOrders.map((po) => po.po_id);
    
    await Payment.createPoOut(payload);
    await Payment.clearNewPaymentOrders(ids);

    return result;
}
