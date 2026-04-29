import { Acknowledgment } from "../models/acknowledgment.model.js";
import { handleIncomingAcknowledgments } from "../services/cb/acknowledgmentSyncService.js";

export async function getOutgoingAcknowledgments(req, res) {
    const outgoing = await Acknowledgment.getOutgoing();
    res.status(200).json(outgoing);
}

export async function handleNewAcknowledgments() {
    await handleIncomingAcknowledgments();
    res.status(200).json({message: "All new incoming acknowledgments are handled."});
}
