import { pool } from "../db/db.js";

export const Acknowledgment = {
    async getOutgoing() {
        const [data] = await pool.query(`
            SELECT * FROM ack_out
            `);

        return data;
    },
}