import { pool } from "../db/db.js";

export const Acknowledgment = {
    async getOutgoing() {
        const [data] = await pool.query(`
            SELECT * FROM ack_out
            `);

        return data;
    },

    async createIngoing(rows) {
        await pool.query(`
            INSERT INTO ack_in (po_id, po_amount, po_message, po_datetime, ob_id, oa_id, ob_code, ob_datetime, cb_code, cb_datetime, bb_id, ba_id, bb_code, bb_datetime)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, rows);      
    },

    async createOutgoing(rows) {
        await pool.query(`
            INSERT INTO ack_out (po_id, po_amount, po_message, po_datetime, ob_id, oa_id, ob_code, ob_datetime, cb_code, cb_datetime, bb_id, ba_id, bb_code, bb_datetime)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, rows);
    },

    async clearOutgoing(ids) {
        await pool.query(`
            DELETE FROM ack_out WHERE po_id=?
            `, ids);
    }
}