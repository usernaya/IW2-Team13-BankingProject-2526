import { Acknowledgment } from "../models/acknowledgment.model.js";
import { handleIncomingAcknowledgments } from "../services/cb/acknowledgmentSyncService.js";

export async function getOutgoingAcknowledgments(req, res) {
    const outgoing = await Acknowledgment.getOutgoing();
    res.status(200).json(outgoing);
}

export async function handleNewAcknowledgments(req, res) {
    try {
        const result = await handleIncomingAcknowledgments();
        res.status(200).json({
            ok: true,
            status: 200,
            code: null,
            message: "Incoming acknowledgments fetched and handled.",
            data: result
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            status: 500,
            code: "ACK_FETCH_FAILED",
            message: error.message,
            data: null
        });
    }
}
