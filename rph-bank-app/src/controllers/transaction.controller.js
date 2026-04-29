import { Transaction } from "../models/transaction.model.js";
import { transactionIdSchema } from "../schemas/transaction.schemas.js";

export async function getAllTransactions(req, res) {
    const transactions = await Transaction.getAll();
    res.status(200).json({
        ok: true,
        status: 200,
        code: null,
        message: "Transacties succesvol opgehaald",
        data: transactions
    });
}

export async function getTransactionFromId(req, res) {
    const { error } = transactionIdSchema.validate(req.params);
    if (error) {
        return res.status(400).json({
            ok: false,
            status: 400,
            code: "INVALID_REQUEST",
            message: "Validation error",
            data: null
        });
    }

    const transaction = await Transaction.getFromId(req.params.id);

    if (!transaction) {
        return res.status(404).json({
            ok: false,
            status: 404,
            code: "NOT_FOUND",
            message: `Transaction with id: ${req.params.id} does not exist.`,
            data: null
        });
    }

    res.status(200).json({
        ok: true,
        status: 200,
        code: null,
        message: null,
        data: transaction
    });
}