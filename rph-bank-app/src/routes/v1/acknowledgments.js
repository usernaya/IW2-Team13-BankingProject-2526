import express from "express";
import { getOutgoingAcknowledgments, handleNewAcknowledgments } from "../../controllers/acknowledgment.controller.js";

const router = express.Router();

router.get("/outgoing", getOutgoingAcknowledgments);
router.post("/handle", handleNewAcknowledgments);
export default router;
