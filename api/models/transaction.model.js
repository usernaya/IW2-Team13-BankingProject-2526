import { pool } from "../db/db.js";

export const Transaction = {
    async getAll() {
        const [data] = await pool.query(
            `SELECT id, amount, datetime, po_id, account_id, isvalid, iscomplete
             FROM transactions
             ORDER BY datetime DESC`
        );
        return data;
    },

    async getFromId(id) {
        const [data] = await pool.query(
            `SELECT id, amount, datetime, po_id, account_id, isvalid, iscomplete
             FROM transactions WHERE id = ?`,
            [id]
        );
        return data[0];
    }
};