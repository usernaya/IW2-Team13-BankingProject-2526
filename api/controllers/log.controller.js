import { Log } from "../models/log.model.js";

export async function getAllLogs(req, res) {
    const logs = await Log.getAll();
    res.status(200).json({
        ok: true,
        status: 200,
        code: null,
        message: "Logs succesvol opgehaald",
        data: logs
    });
}