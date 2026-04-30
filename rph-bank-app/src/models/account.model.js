import { pool } from "../db/db.js";

export const Account = {
    async getAll() {
        const [data] = await pool.query(
            `SELECT 
                a.id,
                a.balance,
                (a.balance
                    - (SELECT COALESCE(SUM(po_amount), 0) FROM po_out WHERE oa_id = a.id)
                    - (SELECT COALESCE(SUM(po_amount), 0) FROM po_new WHERE oa_id = a.id)
                ) AS available_balance
            FROM accounts a`
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

    async createAccount(iban, balance = 0) {
        await pool.query(`
            INSERT INTO accounts (id, balance)
            VALUES 
            (?, ?)
            `, [iban, balance]);
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
    },

    async transferMoney(senderId, receiverId, amount) {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();
            await connection.query(
                `UPDATE accounts SET balance = balance - ? WHERE id = ?`,
                [amount, senderId]
            );
            await connection.query(
                `UPDATE accounts SET balance = balance + ? WHERE id = ?`,
                [amount, receiverId]
            );
            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    async deductMoney(iban, amount) {
        await pool.query(`
            UPDATE accounts SET balance = balance - ? WHERE id = ?
            `, [amount, iban]);
    },

    async addMoney(iban, amount) {
        await pool.query(`
            UPDATE accounts SET balance = balance + ? WHERE id = ?
            `, [amount, iban]);
    }
}
