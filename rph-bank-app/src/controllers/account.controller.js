import { Account } from "../models/account.model.js";
import { generateBelgianIBAN } from "../utils/belgianIbanGenerator.js";

export async function getAllAccounts(req, res) {
  const accounts = await Account.getAll();
  res.status(200).json(accounts);
}

export async function getFromIban(req, res) {
  const iban = req.validated.params.iban;
  const account = await Account.getFromIban(iban);

  if (!account || account === "") {
    res.status(404).json({
      message: `Account with IBAN: ${iban} does not exist.`,
    });
  }

  res.json(account);
}

export async function createNewAccount(req, res) {
  const balance = req.validated?.body?.balance ?? 0;
  const iban = generateBelgianIBAN();
  await Account.createAccount(iban, balance);
  res.status(201).json({
    iban: iban,
    balance: balance,
    message: "Account successfully created.",
  });
}
