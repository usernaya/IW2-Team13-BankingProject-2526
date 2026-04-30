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
                ON DUPLICATE KEY UPDATE
                  po_amount = VALUES(po_amount),
                  po_message = VALUES(po_message),
                  po_datetime = VALUES(po_datetime),
                  ob_id = VALUES(ob_id),
                  oa_id = VALUES(oa_id),
                  ob_code = VALUES(ob_code),
                  ob_datetime = VALUES(ob_datetime),
                  cb_code = VALUES(cb_code),
                  cb_datetime = VALUES(cb_datetime),
                  bb_id = VALUES(bb_id),
                  ba_id = VALUES(ba_id),
                  bb_code = VALUES(bb_code),
                  bb_datetime = VALUES(bb_datetime)
                `,
        flattened,
      );
    } else {
      await pool.query(
        `
                INSERT INTO ack_in (po_id, po_amount, po_message, po_datetime, ob_id, oa_id, ob_code, ob_datetime, cb_code, cb_datetime, bb_id, ba_id, bb_code, bb_datetime)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                  po_amount = VALUES(po_amount),
                  po_message = VALUES(po_message),
                  po_datetime = VALUES(po_datetime),
                  ob_id = VALUES(ob_id),
                  oa_id = VALUES(oa_id),
                  ob_code = VALUES(ob_code),
                  ob_datetime = VALUES(ob_datetime),
                  cb_code = VALUES(cb_code),
                  cb_datetime = VALUES(cb_datetime),
                  bb_id = VALUES(bb_id),
                  ba_id = VALUES(ba_id),
                  bb_code = VALUES(bb_code),
                  bb_datetime = VALUES(bb_datetime)
                `,
        rows,
      );
    }
  },

  async createOutgoing(rows) {
    const updateDuplicate = `
                ON DUPLICATE KEY UPDATE
                  po_amount = VALUES(po_amount),
                  po_message = VALUES(po_message),
                  po_datetime = VALUES(po_datetime),
                  ob_id = VALUES(ob_id),
                  oa_id = VALUES(oa_id),
                  ob_code = VALUES(ob_code),
                  ob_datetime = VALUES(ob_datetime),
                  cb_code = VALUES(cb_code),
                  cb_datetime = VALUES(cb_datetime),
                  bb_id = VALUES(bb_id),
                  ba_id = VALUES(ba_id),
                  bb_code = VALUES(bb_code),
                  bb_datetime = VALUES(bb_datetime)
                `;

    if (Array.isArray(rows[0])) {
      const placeholders = rows
        .map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .join(", ");
      const flattened = rows.flat();
      await pool.query(
        `
                INSERT INTO ack_out (po_id, po_amount, po_message, po_datetime, ob_id, oa_id, ob_code, ob_datetime, cb_code, cb_datetime, bb_id, ba_id, bb_code, bb_datetime)
                VALUES ${placeholders}
                ${updateDuplicate}
                `,
        flattened,
      );
    } else {
      await pool.query(
        `
                INSERT INTO ack_out (po_id, po_amount, po_message, po_datetime, ob_id, oa_id, ob_code, ob_datetime, cb_code, cb_datetime, bb_id, ba_id, bb_code, bb_datetime)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ${updateDuplicate}
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
