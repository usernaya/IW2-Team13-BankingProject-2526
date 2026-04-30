import express from "express";
import IBAN from "iban";
import { Account } from "../models/account.model.js";
import { Acknowledgment } from "../models/acknowledgment.model.js";
import { Payment } from "../models/payment.model.js";

const router = express.Router();

function asArray(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return payload ? [payload] : [];
}

function withOk(data, message = null) {
    return {
        ok: true,
        status: 200,
        code: null,
        message,
        data
    };
}

function formatDateTime(date = new Date()) {
    const pad = (number) => String(number).padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function isAcceptedIban(value) {
    const iban = String(value || "").replace(/\s/g, "").toUpperCase();
    return IBAN.isValid(iban) || /^BE\d{14}$/.test(iban);
}

function toAcknowledgmentRow(ack, fallback = {}) {
    const now = formatDateTime();

    return [
        ack.po_id,
        Number(ack.po_amount ?? fallback.po_amount ?? 0.01),
        ack.po_message ?? fallback.po_message ?? "",
        ack.po_datetime ?? fallback.po_datetime ?? now,
        ack.ob_id ?? fallback.ob_id ?? "UNKNBEBB",
        ack.oa_id ?? fallback.oa_id ?? "UNKNOWN",
        ack.ob_code ?? fallback.ob_code ?? 1000,
        ack.ob_datetime ?? fallback.ob_datetime ?? now,
        ack.cb_code ?? fallback.cb_code ?? 1000,
        ack.cb_datetime ?? fallback.cb_datetime ?? now,
        ack.bb_id ?? fallback.bb_id ?? process.env.BIC ?? "BMPBBEBB",
        ack.ba_id ?? fallback.ba_id ?? "UNKNOWN",
        ack.bb_code ?? fallback.bb_code ?? null,
        ack.bb_datetime ?? fallback.bb_datetime ?? now,
    ];
}

function toPaymentInRow(po, bbCode, bbDatetime) {
    const now = formatDateTime();

    return [
        po.po_id,
        Number(po.po_amount ?? 0.01),
        po.po_message ?? "",
        po.po_datetime ?? now,
        po.ob_id ?? "UNKNBEBB",
        po.oa_id ?? "UNKNOWN",
        po.ob_code ?? 1000,
        po.ob_datetime ?? now,
        po.bb_id ?? process.env.BIC ?? "BMPBBEBB",
        po.ba_id ?? "UNKNOWN",
        po.cb_code ?? 1000,
        po.cb_datetime ?? bbDatetime,
    ];
}

router.get("/info", (req, res) => {
    res.json(withOk({
        team: "IW2-G13 RPH Bank",
        name: "RPH Bank",
        bic: process.env.BIC || "BMPBBEBB",
        members: []
    }));
});

router.get("/help", (req, res) => {
    res.json(withOk({
        role: "regular bank",
        public_endpoints: [
            {
                method: "GET",
                path: "/api/help/",
                description: "Overview of available API endpoints."
            },
            {
                method: "GET",
                path: "/api/info/",
                description: "Team and bank information."
            },
            {
                method: "GET",
                path: "/api/accounts/",
                description: "List of regular bank accounts."
            }
        ],
        internal_endpoints: [
            {
                method: "POST",
                path: "/api/po_in/",
                description: "Receive payment orders when acting as beneficiary bank."
            },
            {
                method: "GET",
                path: "/api/po_out/",
                description: "Expose outgoing payment orders for deployment compatibility."
            },
            {
                method: "POST",
                path: "/api/ack_in/",
                description: "Receive acknowledgments for outgoing payment orders."
            },
            {
                method: "GET",
                path: "/api/ack_out/",
                description: "Expose acknowledgments created when acting as beneficiary bank."
            }
        ],
        frontend_api: "/api/v1"
    }));
});

router.get("/accounts", async (req, res) => {
    const accounts = await Account.getAll();
    res.json(withOk(accounts));
});

router.post("/po_in", async (req, res) => {
    const paymentOrders = asArray(req.body);
    const acknowledgments = [];
    const acknowledgmentRows = [];
    const now = formatDateTime();

    for (const po of paymentOrders) {
        const acknowledgment = {
            ...po,
            bb_datetime: po.bb_datetime ?? now
        };

        if (!isAcceptedIban(po.ba_id)) {
            acknowledgment.bb_code = 2002;
        } else {
            const account = await Account.getFromIban(po.ba_id);
            acknowledgment.bb_code = account ? 2000 : 2001;

            if (account) {
                await Payment.createPoIn(toPaymentInRow(po, acknowledgment.bb_code, acknowledgment.bb_datetime));
                await Account.creditMoney(po.ba_id, Number(po.po_amount), po.po_id);
            }
        }

        acknowledgments.push(acknowledgment);
        acknowledgmentRows.push(toAcknowledgmentRow(acknowledgment));
    }

    if (acknowledgmentRows.length) {
        await Acknowledgment.createOutgoing(acknowledgmentRows);
    }

    res.status(201).json(withOk(acknowledgments, "Payment orders received."));
});

router.get("/po_out", async (req, res) => {
    const pending = await Payment.getPending();
    const now = formatDateTime();
    const bic = process.env.BIC || "BMPBBEBB";

    res.json(withOk(pending.map((po) => ({
        ...po,
        ob_code: po.ob_code ?? bic,
        ob_datetime: po.ob_datetime ?? now
    }))));
});

router.post("/ack_in", async (req, res) => {
    const acknowledgments = asArray(req.body);
    const now = formatDateTime();

    for (const ack of acknowledgments) {
        const po = await Payment.getPaymentOrder(ack.po_id);

        if (po && Number(ack.bb_code) === 2000) {
            await Account.deductMoney(po.oa_id, po.po_amount, po.po_id);
        }

        await Acknowledgment.createIngoing(toAcknowledgmentRow(ack, po));

        if (po) {
            await Payment.removePoOutRecord(ack.po_id);
            await Payment.removePoNewRecord(ack.po_id);
        }
    }

    res.status(201).json(withOk(acknowledgments, "Acknowledgments received."));
});

router.get("/ack_out", async (req, res) => {
    const acknowledgments = await Acknowledgment.getOutgoing();
    res.json(withOk(acknowledgments));
});

export default router;
