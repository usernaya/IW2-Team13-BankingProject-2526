import crypto from "crypto";
import { pool } from "../db/db.js";
import { formatDateTime } from "../utils/formatDate.js";

export const Transaction = {
  async createEntry({
    id,
    amount,
    datetime,
    po_id = null,
    account_id = null,
    isvalid = true,
    iscomplete = false,
  }) {
    if (account_id == null || account_id === "") {
      return null;
    }

    const entryId = id || crypto.randomUUID();
    const timestamp = datetime || formatDateTime(new Date());

    await pool.query(
      `INSERT INTO transactions (id, amount, datetime, po_id, account_id, isvalid, iscomplete)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        entryId,
        amount,
        timestamp,
        po_id,
        account_id,
        isvalid ? 1 : 0,
        iscomplete ? 1 : 0,
      ],
    );

    return { id: entryId };
  },

  async getAll() {
    const [data] = await pool.query(
      `SELECT * FROM transactions ORDER BY datetime DESC`,
    );
    return data;
  },

  async getFailed() {
    const [data] = await pool.query(
      `SELECT * FROM transactions WHERE isvalid = 0 ORDER BY datetime DESC`,
    );
    return data;
  },

  async getOutstandingPayments() {
    const [data] = await pool.query(
      `SELECT po_out.*, 
             TIMESTAMPDIFF(MINUTE, po_datetime, NOW()) AS age_minutes,
             TIMESTAMPDIFF(MINUTE, po_datetime, NOW()) > 60 AS overdue
       FROM po_out
       ORDER BY po_datetime DESC`,
    );
    return data;
  },
};
