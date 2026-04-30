import { Log } from "../models/log.model.js";
import { sendSuccess } from "../utils/response.js";

export async function getAllLogs(req, res) {
  const logs = await Log.getAll();
  return sendSuccess(res, {
    status: 200,
    message: "Event logs fetched successfully.",
    data: logs,
  });
}

export async function getLogsByType(req, res) {
  const { type } = req.params;
  const logs = await Log.getByType(type);
  return sendSuccess(res, {
    status: 200,
    message: `Logs of type ${type} fetched successfully.`,
    data: logs,
  });
}
