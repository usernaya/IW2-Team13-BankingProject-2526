import { Acknowledgment } from "../models/acknowledgment.model.js";
import {
  handleIncomingAcknowledgments,
  sendOutgoingAcknowledgments as sendOutgoingAcknowledgmentsService,
} from "../services/cb/acknowledgmentSyncService.js";
import { sendSuccess } from "../utils/response.js";

export async function getOutgoingAcknowledgments(req, res) {
  const outgoing = await Acknowledgment.getOutgoing();
  return sendSuccess(res, {
    status: 200,
    code: null,
    message: "Outgoing acknowledgments fetched successfully.",
    data: outgoing,
  });
}

export async function getIncomingAcknowledgments(req, res) {
  const incoming = await Acknowledgment.getIncoming();
  return sendSuccess(res, {
    status: 200,
    code: null,
    message: "Incoming acknowledgments fetched successfully.",
    data: incoming,
  });
}

export async function handleNewAcknowledgments(req, res) {
  const processed = await handleIncomingAcknowledgments();
  return sendSuccess(res, {
    status: 200,
    code: null,
    message: "Incoming acknowledgments processed successfully.",
    data: processed,
  });
}

export async function sendOutgoingAcknowledgments(req, res) {
  const result = await sendOutgoingAcknowledgmentsService();
  return sendSuccess(res, {
    status: 200,
    code: null,
    message: "Outgoing acknowledgments sent successfully.",
    data: result.data,
  });
}
