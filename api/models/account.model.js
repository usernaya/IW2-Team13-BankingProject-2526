import { pool } from "../db/db.js";

export const Account = {
    async getAll() {
        const [data] = await pool.query(
            `SELECT id, balance
            FROM accounts`
        );

        return data;
    },

    async getFromIban(iban) {
        const [data] = await pool.query(
            `SELECT id, balance
            FROM accounts
            WHERE id=?`,
            [iban]
        );

        return data[0];
    },

    async createAccount(iban) {
        await pool.query(`
            INSERT INTO accounts (id)
            VALUES 
            (?)
            `, [iban]);
    },

    async calculateAvailableBalance(iban) {
        const [data] = await pool.query(`
SELECT 
    a.id, 
    a.balance, 
    (a.balance 
      - (SELECT COALESCE(SUM(po_amount), 0) FROM po_out WHERE oa_id = a.id)
      - (SELECT COALESCE(SUM(po_amount), 0) FROM po_new WHERE oa_id = a.id)
    ) AS available_balance
FROM accounts a
WHERE a.id = ?;
        `, [iban]);

        return data[0];
    }
}