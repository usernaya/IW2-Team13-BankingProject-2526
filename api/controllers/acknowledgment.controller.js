import { Acknowledgment } from "../models/acknowledgment.model.js";

export async function getOutgoingAcknowledgments(req, res) {
    const outgoing = await Acknowledgment.getOutgoing();
    res.status(200).json(outgoing);
}