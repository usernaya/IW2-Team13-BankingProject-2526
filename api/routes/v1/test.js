import express from "express";
import { endpointTest } from "../../controllers/testController.js";
const router = express.Router();

router.get('/', endpointTest);

export default router;