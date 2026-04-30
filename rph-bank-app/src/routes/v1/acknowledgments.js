import express from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import {
  getOutgoingAcknowledgments,
  getIncomingAcknowledgments,
  sendOutgoingAcknowledgments,
  handleNewAcknowledgments,
} from "../../controllers/acknowledgment.controller.js";

const router = express.Router();

router.get("/outgoing", asyncHandler(getOutgoingAcknowledgments));
router.get("/incoming", asyncHandler(getIncomingAcknowledgments));
router.post("/send", asyncHandler(sendOutgoingAcknowledgments));
router.post("/handle", asyncHandler(handleNewAcknowledgments));

export default router;
