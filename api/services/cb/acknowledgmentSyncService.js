import { Account } from "../../models/account.model.js";
import { Acknowledgment } from "../../models/acknowledgment.model.js";
import { Payment } from "../../models/payment.model.js";

export async function handleIncomingAcknowledgments() {
    const response = await request("/ack_out");
    const acknowledgments = response.json();

    if (!response.ok) {
        throw new Error(`[${acknowledgments.status}] ${acknowledgments.message}`)
    }

    for (const ack of acknowledgments) {
        const po = await Payment.getPaymentOrder(ack.po_id);

        // If the payment order does not exist in the database then we skip it...
        if (!po) {
            continue;
        }

        await Account.deductMoney(po.oa, po.po_amount);
    }
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