import { pool } from "../db/db.js";

export const Log = {
    async getAll() {
        const [data] = await pool.query(
            `SELECT id, 
             DATE_FORMAT(datetime, '%Y-%m-%d %H:%i:%s') AS datetime,
             message, type, po_id, po_amount, po_message,
             DATE_FORMAT(po_datetime, '%Y-%m-%d %H:%i:%s') AS po_datetime,
             ob_id, oa_id, ob_code,
             DATE_FORMAT(ob_datetime, '%Y-%m-%d %H:%i:%s') AS ob_datetime,
             cb_code,
             DATE_FORMAT(cb_datetime, '%Y-%m-%d %H:%i:%s') AS cb_datetime,
             bb_id, ba_id, bb_code,
             DATE_FORMAT(bb_datetime, '%Y-%m-%d %H:%i:%s') AS bb_datetime
             FROM log
             ORDER BY datetime DESC`
        );
        return data;
    },

    async create(type, message, po = {}) {
        await pool.query(
            `INSERT INTO log (datetime, type, message, po_id, po_amount, po_message,
             po_datetime, ob_id, oa_id, ob_code, ob_datetime, cb_code, cb_datetime,
             bb_id, ba_id, bb_code, bb_datetime)
             VALUES (NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                type,
                message,
                po.po_id ?? null,
                po.po_amount ?? null,
                po.po_message ?? null,
                po.po_datetime ?? null,
                po.ob_id ?? null,
                po.oa_id ?? null,
                po.ob_code ?? null,
                po.ob_datetime ?? null,
                po.cb_code ?? null,
                po.cb_datetime ?? null,
                po.bb_id ?? null,
                po.ba_id ?? null,
                po.bb_code ?? null,
                po.bb_datetime ?? null
            ]
        );
    }
};