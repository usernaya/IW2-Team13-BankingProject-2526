import { pool } from "../db/db.js";

export const Paymenth = {
    async createPoOut(
        id,
        paymenthAmount,
        paymenthMessage,
        paymenthDatetime,
        originBankId,
        originAccountId,
        originBankCode,
        originBankDateTime,
        beneficiaryBankId,
        beneficiaryAccountId,
    ) {
        await pool.query(`INSERT INTO po_new (po_id, po_amount, po_message, po_datetime, ob_id, oa_id, ob_code, ob_datetime, bb_id, ba_id)
            VALUES (?,?,?,?,?,?,?,?,?,?)`,
            [
                id,
                paymenthAmount,
                paymenthMessage,
                paymenthDatetime,
                originBankId,
                originAccountId,
                originBankCode,
                originBankDateTime,
                beneficiaryBankId,
                beneficiaryAccountId,
            ]);
    },

    async createPoIn(
        id,
        paymenthAmount,
        paymenthMessage,
        paymenthDatetime,
        originBankId,
        originAccountId,
        originBankCode,
        originBankDateTime,
        beneficiaryBankId,
        beneficiaryAccountId,
        clearingBankCode,
        clearingBankDatetime
    ) {
        await pool.query(`INSERT INTO po_new (po_id, po_amount, po_message, po_datetime, ob_id, oa_id, ob_code, ob_datetime, bb_id, ba_id, cb_code, cb_datetime)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
                id,
                paymenthAmount,
                paymenthMessage,
                paymenthDatetime,
                originBankId,
                originAccountId,
                originBankCode,
                originBankDateTime,
                beneficiaryBankId,
                beneficiaryAccountId,
                clearingBankCode,
                clearingBankDatetime
            ]);
    },

    async createPoNew(
        id,
        paymenthAmount,
        paymenthMessage,
        paymenthDatetime,
        originBankId,
        originAccountId,
        beneficiaryBankId,
        beneficiaryAccountId,
    ) {
        await pool.query(`
            INSERT INTO po_new (po_id, po_amount, po_message, po_datetime, ob_id, oa_id, ba_id, bb_id)
            VALUES (?,?,?,?,?,?,?,?)`,
            [
                id,
                paymenthAmount,
                paymenthMessage,
                paymenthDatetime,
                originBankId,
                originAccountId,
                beneficiaryAccountId,
                beneficiaryBankId
            ]);
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
    }
}