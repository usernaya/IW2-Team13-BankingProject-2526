import { pool } from "../db/db.js";

export const Acknowledgment = {
  async getOutgoing() {
    const [data] = await pool.query(`
            SELECT * FROM ack_out
            `);

    return data;
  },

  async createIngoing(rows) {
    if (Array.isArray(rows[0])) {
      const placeholders = rows
        .map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .join(", ");
      const flattened = rows.flat();
      await pool.query(
        `
                INSERT INTO ack_in (po_id, po_amount, po_message, po_datetime, ob_id, oa_id, ob_code, ob_datetime, cb_code, cb_datetime, bb_id, ba_id, bb_code, bb_datetime)
                VALUES ${placeholders}
                `,
        flattened,
      );
    } else {
      await pool.query(
        `
                INSERT INTO ack_in (po_id, po_amount, po_message, po_datetime, ob_id, oa_id, ob_code, ob_datetime, cb_code, cb_datetime, bb_id, ba_id, bb_code, bb_datetime)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
        rows,
      );
    }
  },

  async createOutgoing(rows) {
    if (Array.isArray(rows[0])) {
      const placeholders = rows
        .map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .join(", ");
      const flattened = rows.flat();
      await pool.query(
        `
                INSERT INTO ack_out (po_id, po_amount, po_message, po_datetime, ob_id, oa_id, ob_code, ob_datetime, cb_code, cb_datetime, bb_id, ba_id, bb_code, bb_datetime)
                VALUES ${placeholders}
                `,
        flattened,
      );
    } else {
      await pool.query(
        `
                INSERT INTO ack_out (po_id, po_amount, po_message, po_datetime, ob_id, oa_id, ob_code, ob_datetime, cb_code, cb_datetime, bb_id, ba_id, bb_code, bb_datetime)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
        rows,
      );
    }
  },

  async getIncoming() {
    const [data] = await pool.query(`
            SELECT * FROM ack_in
            `);

    return data;
  },

  async clearIngoing(ids) {
    if (Array.isArray(ids)) {
      await pool.query(
        `
                DELETE FROM ack_in
                WHERE po_id IN (?);
            `,
        [ids],
      );
    } else {
      await pool.query(
        `
                DELETE FROM ack_in
                WHERE po_id = ?;
            `,
        [ids],
      );
    }
  },

  async clearOutgoing(ids) {
    if (Array.isArray(ids)) {
      await pool.query(
        `
                DELETE FROM ack_out
                WHERE po_id IN (?);
            `,
        [ids],
      );
    } else {
      await pool.query(
        `
                DELETE FROM ack_out
                WHERE po_id = ?;
            `,
        [ids],
      );
    }
  },
};
