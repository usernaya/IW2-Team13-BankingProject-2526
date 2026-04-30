import express from "express";
import { getAllLogs, getLogsByType } from "../../controllers/log.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";

const router = express.Router();

router.get("/", asyncHandler(getAllLogs));
router.get("/type/:type", asyncHandler(getLogsByType));

export default router;
