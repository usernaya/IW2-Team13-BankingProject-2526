import { pool } from "../db/db.js";
import { ApiError } from "../utils/apiError.js";
import { Log } from "./log.model.js";
import { Transaction } from "./transaction.model.js";
import { formatDateTime } from "../utils/formatDate.js";

export const Account = {
  async getAll() {
    const [data] = await pool.query(
      `SELECT id, balance
            FROM accounts`,
    );

    return data;
  },

  async getFromIban(iban) {
    const [data] = await pool.query(
      `SELECT id, balance
            FROM accounts
            WHERE id=?`,
      [iban],
    );

    return data[0];
  },

  async createAccount(iban, balans = 0) {
    await pool.query(
      `
            INSERT INTO accounts (id, balance)
            VALUES 
            (?, ?)
            `,
      [iban, balans],
    );
  },

  async calculateAvailableBalance(iban) {
    const [data] = await pool.query(
      `
SELECT 
    a.id, 
    a.balance, 
    (a.balance 
      - (SELECT COALESCE(SUM(po_amount), 0) FROM po_out WHERE oa_id = a.id)
      - (SELECT COALESCE(SUM(po_amount), 0) FROM po_new WHERE oa_id = a.id)
    ) AS available_balance
FROM accounts a
WHERE a.id = ?;
        `,
      [iban],
    );

    return data[0];
  },

  async transferMoney(senderId, receiverId, amount, po_id = null) {
    const connection = await pool.getConnection();
    const timestamp = formatDateTime(new Date());

    try {
      await connection.beginTransaction();

      const [senderRows] = await connection.query(
        `SELECT id, balance FROM accounts WHERE id = ?`,
        [senderId],
      );
      const sender = senderRows[0];
      if (!sender) {
        await Log.createEntry({
          datetime: timestamp,
          message: `Sender account not found: ${senderId}`,
          type: "TX_FAILED",
          po_id,
          oa_id: senderId,
        }).catch(() => {});
        throw new ApiError(`Sender account not found: ${senderId}`, {
          status: 404,
          code: "ACCOUNT_NOT_FOUND",
        });
      }

      if (sender.balance < amount) {
        await Transaction.createEntry({
          amount: -amount,
          datetime: timestamp,
          po_id,
          account_id: senderId,
          isvalid: false,
          iscomplete: false,
        });
        throw new ApiError(`Insufficient funds for account: ${senderId}`, {
          status: 409,
          code: "INSUFFICIENT_FUNDS",
        });
      }

      const [receiverRows] = await connection.query(
        `SELECT id FROM accounts WHERE id = ?`,
        [receiverId],
      );
      const receiver = receiverRows[0];
      if (!receiver) {
        await Log.createEntry({
          datetime: timestamp,
          message: `Receiver account not found: ${receiverId}`,
          type: "TX_FAILED",
          po_id,
          oa_id: senderId,
          ba_id: receiverId,
        }).catch(() => {});
        throw new ApiError(`Receiver account not found: ${receiverId}`, {
          status: 404,
          code: "ACCOUNT_NOT_FOUND",
        });
      }

      await connection.query(
        `UPDATE accounts SET balance = balance - ? WHERE id = ?`,
        [amount, senderId],
      );
      await connection.query(
        `UPDATE accounts SET balance = balance + ? WHERE id = ?`,
        [amount, receiverId],
      );

      await connection.commit();

      await Transaction.createEntry({
        amount: -amount,
        datetime: timestamp,
        po_id,
        account_id: senderId,
        isvalid: true,
        iscomplete: true,
      });
      await Transaction.createEntry({
        amount: amount,
        datetime: timestamp,
        po_id,
        account_id: receiverId,
        isvalid: true,
        iscomplete: true,
      });

      await Log.createEntry({
        datetime: timestamp,
        message: "Transaction successful",
        type: "TX_SUCCESS",
        po_id,
        po_amount: amount,
        po_datetime: timestamp,
        ob_id: process.env.BIC || null,
        oa_id: senderId,
        ob_code: 4008,
        ob_datetime: timestamp,
        bb_id: process.env.BIC || null,
        ba_id: receiverId,
        bb_code: 4008,
        bb_datetime: timestamp,
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },

  async deductMoney(iban, amount, po_id = null) {
    const timestamp = formatDateTime(new Date());
    const [rows] = await pool.query(
      `SELECT id, balance FROM accounts WHERE id = ?`,
      [iban],
    );
    const account = rows[0];

    if (!account) {
      await Log.createEntry({
        datetime: timestamp,
        message: `Account not found for deduction: ${iban}`,
        type: "TX_FAILED",
        po_id,
        oa_id: iban,
      }).catch(() => {});
      throw new ApiError(`Account not found for deduction: ${iban}`, {
        status: 404,
        code: "ACCOUNT_NOT_FOUND",
      });
    }

    // Skip balance check for PO settlements (funds already reserved)
    if (po_id == null && account.balance < amount) {
      await Transaction.createEntry({
        amount: -amount,
        datetime: timestamp,
        po_id,
        account_id: iban,
        isvalid: false,
        iscomplete: false,
      });
      throw new ApiError(`Insufficient funds for account: ${iban}`, {
        status: 409,
        code: "INSUFFICIENT_FUNDS",
      });
    }

    const [result] = await pool.query(
      `UPDATE accounts SET balance = balance - ? WHERE id = ?`,
      [amount, iban],
    );

    if (result.affectedRows !== 1) {
      await Transaction.createEntry({
        amount: -amount,
        datetime: timestamp,
        po_id,
        account_id: iban,
        isvalid: false,
        iscomplete: false,
      });
      throw new ApiError(`Account not found for deduction: ${iban}`, {
        status: 404,
        code: "ACCOUNT_NOT_FOUND",
      });
    }

    await Transaction.createEntry({
      amount: -amount,
      datetime: timestamp,
      po_id,
      account_id: iban,
      isvalid: true,
      iscomplete: true,
    });
  },

  async creditMoney(iban, amount, po_id = null) {
    const [result] = await pool.query(
      `UPDATE accounts SET balance = balance + ? WHERE id = ?`,
      [amount, iban],
    );

    if (result.affectedRows !== 1) {
      throw new ApiError(`Account not found for credit: ${iban}`, {
        status: 404,
        code: "ACCOUNT_NOT_FOUND",
      });
    }

    const timestamp = formatDateTime(new Date());
    await Transaction.createEntry({
      amount,
      datetime: timestamp,
      po_id,
      account_id: iban,
      isvalid: true,
      iscomplete: true,
    });
  },
};
