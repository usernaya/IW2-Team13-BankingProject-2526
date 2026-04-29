import { Account } from "../../models/account.model.js";
import { Acknowledgment } from "../../models/acknowledgment.model.js";
import { Payment } from "../../models/payment.model.js";
import { request } from "../../integrations/clearingBankClient.js";

export async function handleIncomingAcknowledgments() {
    const response = await request("/ack_out");

    if (!response.ok) {
        throw new Error(`Failed to fetch ACKs: ${response.status}`);
    }

    const result = await response.json();

    if (!result.ok) {
        throw new Error(`[${result.status}] ${result.message || result.result}`)
    }

    const acknowledgments = result.data ?? [];
    const handled = [];
    const skipped = [];

    for (const ack of acknowledgments) {
        const po = await Payment.getPaymentOrder(ack.po_id);

        // If the payment order does not exist in the database then we skip it...
        if (!po) {
            skipped.push(ack.po_id);
            continue;
        }

        if (Number(ack.bb_code) === 2000) {
            await Account.deductMoney(po.oa_id, po.po_amount);
        }

        await Acknowledgment.createIngoing(ack);
        await Payment.removePoOutRecord(ack.po_id);
        handled.push(ack.po_id);
    }

    return {
        received: acknowledgments.length,
        handled: handled.length,
        skipped: skipped.length,
        handled_ids: handled,
        skipped_ids: skipped
    };
}

export async function sendOutgoingAcknowledgments() {
    const acknowledgments = await Acknowledgment.getOutgoing();

    const response = await request("/ack_in", {
        method: "POST",
        body: acknowledgments
    });

    const result = await response.json();
    return result;
}
