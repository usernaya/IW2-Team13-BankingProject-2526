import { Paymenth } from "../models/paymenth.js";

export async function getAllOutgoingPaymenthOrders(req, res) {
    const outgoing = await Paymenth.getOutgoing();
    res.status(200).json(outgoing);
}

export async function getAllIncomingPaymenthOrders(req, res) {
    const incoming = await Paymenth.getIncoming();
    res.status(200).json(incoming);
}

export async function getAllPendingPaymenthOrders(req, res) {
    const pending = await Paymenth.getPending();
    res.status(200).json(pending);
}

export async function createNewPaymenthOrder(req, res) {

}
