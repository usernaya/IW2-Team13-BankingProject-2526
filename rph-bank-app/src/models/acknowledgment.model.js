import { pool } from "../db/db.js";

function toAcknowledgmentRow(ack) {
    return [
        ack.po_id,
        ack.po_amount,
        ack.po_message ?? null,
        ack.po_datetime,
        ack.ob_id,
        ack.oa_id,
        ack.ob_code,
        ack.ob_datetime,
        ack.cb_code,
        ack.cb_datetime,
        ack.bb_id,
        ack.ba_id,
        ack.bb_code,
        ack.bb_datetime
    ];
}

export const Acknowledgment = {
    async getOutgoing() {
        const [data] = await pool.query(`
            SELECT * FROM ack_out
            `);

        return data;
    },

    async createIngoing(rows) {
        const acknowledgments = Array.isArray(rows) ? rows : [rows];
        if (!acknowledgments.length) return;

        await pool.query(`
            INSERT INTO ack_in (po_id, po_amount, po_message, po_datetime, ob_id, oa_id, ob_code, ob_datetime, cb_code, cb_datetime, bb_id, ba_id, bb_code, bb_datetime)
            VALUES ?
            `, [acknowledgments.map(toAcknowledgmentRow)]);      
    },

    async createOutgoing(rows) {
        const acknowledgments = Array.isArray(rows) ? rows : [rows];
        if (!acknowledgments.length) return;

        await pool.query(`
            INSERT INTO ack_out (po_id, po_amount, po_message, po_datetime, ob_id, oa_id, ob_code, ob_datetime, cb_code, cb_datetime, bb_id, ba_id, bb_code, bb_datetime)
            VALUES ?
            `, [acknowledgments.map(toAcknowledgmentRow)]);
    },

    async clearOutgoing(ids) {
        if (!ids.length) return;

        await pool.query(`
            DELETE FROM ack_out WHERE po_id IN (?)
            `, [ids]);
    }
}
