import { Account } from "../models/account.js";
import Joi from "joi";
import IBAN from "iban";
import { generateBelgianIBAN } from "../utils/belgianIbanGenerator.js";

export async function getAllAccounts(req, res) {
    const accounts = await Account.getAll();
    res.status(200).json({
        "ok":true,
        "status":200,
        "message":"Accounts succesvol opgehaald",
        "data":accounts
    });
}

const requestFromIbanSchema = Joi.object({
    iban: Joi.string().custom((value, helpers) => {
        if (!IBAN.isValid(value.trim())) {
            console.log(value)
            return helpers.error('any.invalid');
        }
        return value;
    }, 'IBAN validation')
    .required()
});

export async function getFromIban(req, res) {
    const { error } = requestFromIbanSchema.validate(req.params);

    if (error) {
        res.status(400).json({
            message: "Validation error", 
            details: error.details.map(d => d.message)
        });
    };

    const iban = req.params.iban;
    const account = await Account.getFromIban(iban);

    if (!account || account === "") {
        res.status(404).json({
            "message": `Account with IBAN: ${iban} does not exist.`
        });
    }

    res.json(account);
}

export async function createNewAccount(req, res) {
    const iban = generateBelgianIBAN();
    await Account.createAccount(iban);
    res.status(201).json({
        "iban":iban,
        "message":"Account successfully created."
    })
}