import { pool } from "../db/db.js";
import { handleIncomingPaymentOrders } from "../services/cb/paymentOrderSyncService.js";

export const Payment = {
    async createPoOut(rows) {
        await pool.query(`INSERT INTO po_new (po_id, po_amount, po_message, po_datetime, ob_id, oa_id, ob_code, ob_datetime, bb_id, ba_id)
            VALUES (?,?,?,?,?,?,?,?,?,?)`,
            [rows]);
    },

    async createPoIn(rows) {
        await pool.query(`INSERT INTO po_new (po_id, po_amount, po_message, po_datetime, ob_id, oa_id, ob_code, ob_datetime, bb_id, ba_id, cb_code, cb_datetime)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`, rows);
    },

    async createPoNew(rows) {
        await pool.query(`
            INSERT INTO po_new (po_id, po_amount, po_message, po_datetime, ob_id, oa_id, ba_id, bb_id)
            VALUES (?,?,?,?,?,?,?,?)`, rows);
    },

    async getOutgoing() {
        const [data] = await pool.query(
            `SELECT *
            FROM po_out`
        );

        return data;
    },

    async getIncoming() {
        const [data] = await pool.query(`
        SELECT * FROM po_in
        `);

        return data;
    },

    async getPending() {
        const [data] = await pool.query(`
        SELECT * FROM po_new
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
            DELETE FROM po_new
            WHERE po_id = ?
            `, [id]);
    },

    async removePoOutRecord(id) {
        await pool.query(`
            DELETE FROM po_new
            WHERE po_id = ?
            `, [id]);
    }, 

    async getPaymentOrder(id) {
        const data = await pool.query(`
            SELECT * FROM po_out
            WHERE po_id = ?
            `, [id]);

        return data[0];
    },

    async clearNewPaymentOrders(ids) {
        await pool.query(`
            DELETE FROM po_new
            WHERE id=?
            `, ids);
    }
}