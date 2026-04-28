---
id: list
title: Alle rekeningen
---

# GET /accounts

:::
Authenticatie vereist
Stuur een geldig Bearer token mee in de `Authorization` header.
:::

Geeft een lijst van alle bankrekeningen met hun saldo-informatie.
Dit endpoint is een **read-only operatie** en heeft geen impact op de payment flow.

---

## Request

Geen request body vereist.

```
Authorization: Bearer <token>
```

---

## Response 200 — Succes

```json
{
  "ok": true,
  "status": 200,
  "code": null,
  "message": "Accounts succesvol opgehaald",
  "data": [
    {
      "iban": "BE12345678901234",
      "owner": "Jan Janssen",
      "balance": 5000.00,
      "reserved": 150.00,
      "available": 4850.00
    }
  ]
}
```

## Velden

| Veld | Beschrijving |
|---|---|
| `iban` | Uniek rekeningnummer |
| `owner` | Naam van de rekeninghouder |
| `balance` | Totaal saldo |
| `reserved` | Bedrag dat tijdelijk gereserveerd is (lopende PO's) |
| `available` | Beschikbaar saldo (`balance - reserved`) |

---

## Response 401 — Unauthorized

```json
{
  "ok": false,
  "status": 401,
  "code": "UNAUTHORIZED",
  "message": "Geen of ongeldig token",
  "data": null
}
```

---

## Statuscodes

| Code | Betekenis |
|---|---|
| `200` | Lijst van accounts succesvol teruggegeven |
| `401` | Geen of ongeldig Bearer token |

---

## Opmerkingen

- Dit endpoint wordt gebruikt door de GUI om rekeningen weer te geven
- Het veld `reserved` is belangrijk om te voorkomen dat het saldo onder 0 gaat
- Het beschikbare saldo (`available`) bepaalt of een nieuwe betaling mogelijk is