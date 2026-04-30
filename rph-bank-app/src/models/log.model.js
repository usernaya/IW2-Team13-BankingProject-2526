import { pool } from "../db/db.js";

export const Log = {
  async createEntry({
    datetime,
    message,
    type,
    po_id = null,
    po_amount = null,
    po_message = null,
    po_datetime = null,
    ob_id = null,
    oa_id = null,
    ob_code = null,
    ob_datetime = null,
    cb_code = null,
    cb_datetime = null,
    bb_id = null,
    ba_id = null,
    bb_code = null,
    bb_datetime = null,
  }) {
    await pool.query(
      `INSERT INTO log (
        datetime,
        message,
        type,
        po_id,
        po_amount,
        po_message,
        po_datetime,
        ob_id,
        oa_id,
        ob_code,
        ob_datetime,
        cb_code,
        cb_datetime,
        bb_id,
        ba_id,
        bb_code,
        bb_datetime
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        datetime,
        message,
        type,
        po_id,
        po_amount,
        po_message,
        po_datetime,
        ob_id,
        oa_id,
        ob_code,
        ob_datetime,
        cb_code,
        cb_datetime,
        bb_id,
        ba_id,
        bb_code,
        bb_datetime,
      ],
    );
  },

  async getAll() {
    const [data] = await pool.query(`SELECT * FROM log ORDER BY datetime DESC`);
    return data;
  },

  async getByType(type) {
    const [data] = await pool.query(
      `SELECT * FROM log WHERE type = ? ORDER BY datetime DESC`,
      [type],
    );
    return data;
  },
};
