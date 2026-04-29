import { fetchBanks } from "../services/cb/bankDirectoryService.js";

export function endpointTest(req, res) {
    res.status(200).json({
        "message":"Endpoint works"
    });
}

export async function getBanks(req, res) {
    const banks = await fetchBanks(req.validated.query.refresh);
    res.status(200).json(banks)
}