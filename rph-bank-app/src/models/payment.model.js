import { pool } from "../db/db.js";
import { handleIncomingPaymentOrders } from "../services/cb/paymentOrderSyncService.js";

export const Payment = {
  async createPoOut(rows) {
    await pool.query(
      `INSERT INTO po_out (po_id, po_amount, po_message, po_datetime, ob_id, oa_id, ob_code, ob_datetime, bb_id, ba_id)
       VALUES (?)`,
      [rows],
    );
  },

  async createPoIn(rows) {
    if (Array.isArray(rows[0])) {
      const placeholders = rows
        .map(() => "(?,?,?,?,?,?,?,?,?,?,?,?)")
        .join(", ");
      const flattened = rows.flat();
      await pool.query(
        `INSERT INTO po_in (po_id, po_amount, po_message, po_datetime, ob_id, oa_id, ob_code, ob_datetime, bb_id, ba_id, cb_code, cb_datetime)
            VALUES ${placeholders}`,
        flattened,
      );
    } else {
      await pool.query(
        `INSERT INTO po_in (po_id, po_amount, po_message, po_datetime, ob_id, oa_id, ob_code, ob_datetime, bb_id, ba_id, cb_code, cb_datetime)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        rows,
      );
    }
  },

  async processPoOut(row) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      await connection.query(
        `
        INSERT INTO po_out (po_id, po_amount, po_message, po_datetime, ob_id, oa_id, ob_code, ob_datetime, bb_id, ba_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
        [...row],
      );

      await connection.query(
        `
        DELETE FROM po_new
        WHERE po_id = ?
        `,
        [row[0]],
      );

      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },

  async createPoNew(rows) {
    await pool.query(
      `
            INSERT INTO po_new (po_id, po_amount, po_message, po_datetime, ob_id, oa_id, bb_id, ba_id)
            VALUES (?)`,
      rows,
    );
  },

  async getOutgoing() {
    const [data] = await pool.query(
      `SELECT *
            FROM po_out`,
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
    await pool.query(
      `
            DELETE FROM po_new
            WHERE po_id = ?`,
      [id],
    );
  },

  async removePoNewRecord(id) {
    await pool.query(
      `
            DELETE FROM po_new
            WHERE po_id = ?
            `,
      [id],
    );
  },

  async getPaymentOrder(id) {
    const [rows] = await pool.query(
      `
            SELECT * FROM po_out
            WHERE po_id = ?
            `,
      [id],
    );

    return rows[0];
  },

  async clearPoInRecords(ids) {
    if (Array.isArray(ids) && ids.length) {
      await pool.query(
        `
            DELETE FROM po_in
            WHERE po_id IN (?);
            `,
        [ids],
      );
    } else {
      await pool.query(
        `
            DELETE FROM po_in
            WHERE po_id = ?
            `,
        [ids],
      );
    }
  },

  async removePoOutRecord(id) {
    await pool.query(
      `
            DELETE FROM po_out
            WHERE po_id = ?
            `,
      [id],
    );
  },

  async clearNewPaymentOrders(ids) {
    await pool.query(
      `
            DELETE FROM po_new
            WHERE id=?
            `,
      ids,
    );
  },
};
