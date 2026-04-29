import { Account } from "../models/account.model.js";
import Joi from "joi";
import IBAN from "iban";
import { generateBelgianIBAN } from "../utils/belgianIbanGenerator.js";
import { getFromIbanSchema } from "../schemas/account.schemas.js";

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
  const iban = generateBelgianIBAN();
  await Account.createAccount(iban);
  res.status(201).json({
    iban: iban,
    message: "Account successfully created.",
  });
}
