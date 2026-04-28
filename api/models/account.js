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
    }
}