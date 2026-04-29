import express from "express";
import { endpointTest } from "../../controllers/test.controller.js";

const router = express.Router();

router.get("/", endpointTest);

export default router;
