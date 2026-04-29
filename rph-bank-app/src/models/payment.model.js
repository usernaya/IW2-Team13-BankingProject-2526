import { pool } from "../db/db.js";

function toPaymentRow(po) {
    return [
        po.po_id,
        po.po_amount,
        po.po_message ?? null,
        po.po_datetime,
        po.ob_id,
        po.oa_id,
        po.ob_code ?? null,
        po.ob_datetime ?? null,
        po.cb_code ?? null,
        po.cb_datetime ?? null,
        po.bb_id,
        po.ba_id,
        po.bb_code ?? null,
        po.bb_datetime ?? null
    ];
}

export const Payment = {
    async createPoOut(rows) {
        const paymentOrders = Array.isArray(rows) ? rows : [rows];
        if (!paymentOrders.length) return;

        await pool.query(`
            INSERT INTO po_out (po_id, po_amount, po_message, po_datetime, ob_id, oa_id, ob_code, ob_datetime, cb_code, cb_datetime, bb_id, ba_id, bb_code, bb_datetime)
            VALUES ?
            `, [paymentOrders.map(toPaymentRow)]);
    },

    async createPoIn(rows) {
        const paymentOrders = Array.isArray(rows) ? rows : [rows];
        if (!paymentOrders.length) return;

        await pool.query(`
            INSERT INTO po_in (po_id, po_amount, po_message, po_datetime, ob_id, oa_id, ob_code, ob_datetime, cb_code, cb_datetime, bb_id, ba_id, bb_code, bb_datetime)
            VALUES ?
            `, [paymentOrders.map(toPaymentRow)]);
    },

    async createPoNew(rows) {
    await pool.query(`
        INSERT INTO po_new (po_id, po_amount, po_message, po_datetime, ob_id, oa_id, ba_id, bb_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, rows);
},

    async getOutgoing() {
        const [data] = await pool.query(
            `SELECT po_id, po_amount, po_message,
                DATE_FORMAT(po_datetime, '%Y-%m-%d %H:%i:%s') AS po_datetime,
                ob_id, oa_id, ob_code,
                DATE_FORMAT(ob_datetime, '%Y-%m-%d %H:%i:%s') AS ob_datetime,
                cb_code,
                DATE_FORMAT(cb_datetime, '%Y-%m-%d %H:%i:%s') AS cb_datetime,
                bb_id, ba_id, bb_code,
                DATE_FORMAT(bb_datetime, '%Y-%m-%d %H:%i:%s') AS bb_datetime
            FROM po_out`
        );

        return data;
    },

    async getIncoming() {
        const [data] = await pool.query(`
        SELECT po_id, po_amount, po_message,
            DATE_FORMAT(po_datetime, '%Y-%m-%d %H:%i:%s') AS po_datetime,
            ob_id, oa_id, ob_code,
            DATE_FORMAT(ob_datetime, '%Y-%m-%d %H:%i:%s') AS ob_datetime,
            cb_code,
            DATE_FORMAT(cb_datetime, '%Y-%m-%d %H:%i:%s') AS cb_datetime,
            bb_id, ba_id, bb_code,
            DATE_FORMAT(bb_datetime, '%Y-%m-%d %H:%i:%s') AS bb_datetime
        FROM po_in
        `);

        return data;
    },

    async getPending() {
        const [data] = await pool.query(`
        SELECT po_id, po_amount, po_message,
            DATE_FORMAT(po_datetime, '%Y-%m-%d %H:%i:%s') AS po_datetime,
            ob_id, oa_id, ob_code,
            DATE_FORMAT(ob_datetime, '%Y-%m-%d %H:%i:%s') AS ob_datetime,
            cb_code,
            DATE_FORMAT(cb_datetime, '%Y-%m-%d %H:%i:%s') AS cb_datetime,
            bb_id, ba_id, bb_code,
            DATE_FORMAT(bb_datetime, '%Y-%m-%d %H:%i:%s') AS bb_datetime
        FROM po_new
        `);

        return data;
    },

    async deletePoNewRecord(id) {
        await pool.query(`
            DELETE FROM po_new
            WHERE po_id = ?`, [id]);
    },

    async removePoNewRecord(id) {
        await pool.query(`
            DELETE FROM po_new
            WHERE po_id = ?
            `, [id]);
    },

    async removePoInRecord(id) {
        await pool.query(`
            DELETE FROM po_in
            WHERE po_id = ?
            `, [id]);
    },

    async removePoOutRecord(id) {
        await pool.query(`
            DELETE FROM po_out
            WHERE po_id = ?
            `, [id]);
    }, 

    async getPaymentOrder(id) {
        const [data] = await pool.query(`
            SELECT * FROM po_out
            WHERE po_id = ?
            `, [id]);

        if (data[0]) return data[0];

        const [pending] = await pool.query(`
            SELECT * FROM po_new
            WHERE po_id = ?
            `, [id]);

        return pending[0];
    },

    async clearNewPaymentOrders(ids) {
        if (!ids.length) return;

        await pool.query(`
            DELETE FROM po_new
            WHERE po_id IN (?)
            `, [ids]);
    }
}
