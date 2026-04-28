---
id: create
title: Nieuwe rekening
---

# POST /accounts

:::note Authenticatie vereist
Stuur een geldig Bearer token mee in de `Authorization` header.
:::

Maakt een nieuwe bankrekening aan.
Het IBAN wordt automatisch gegenereerd door de applicatie.

Dit endpoint voegt een nieuw record toe aan de `accounts` tabel.
De rekening kan daarna gebruikt worden als **OA (Originator Account)** of **BA (Beneficiary Account)** in een betaling.

---

## Request body

| Veld | Type | Verplicht | Beschrijving |
|---|---|---|---|
| `owner` | string | ja | Naam van de rekeninghouder |
| `balance` | number | nee | Startbedrag (standaard = 5000) |

---

## Voorbeeld request

```json
{
  "owner": "Fatima El Amrani",
  "balance": 5000
}
```

---

## Response 201 — Aangemaakt

```json
{
  "ok": true,
  "status": 201,
  "code": null,
  "message": "Rekening succesvol aangemaakt",
  "data": {
    "iban": "BE98765432109876",
    "owner": "Fatima El Amrani",
    "balance": 5000.00,
    "reserved": 0.00,
    "available": 5000.00
  }
}
```

---

## Response 400 — Bad Request

```json
{
  "ok": false,
  "status": 400,
  "code": "INVALID_REQUEST",
  "message": "Ongeldige of ontbrekende velden",
  "data": null
}
```

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
| `201` | Rekening succesvol aangemaakt |
| `400` | Ongeldige of ontbrekende input |
| `401` | Geen of ongeldig Bearer token |

---

## Opmerkingen

- Indien `balance` niet wordt meegegeven, wordt standaard €5000 gebruikt
- `reserved` start altijd op 0
- `available = balance - reserved`
- IBAN wordt automatisch gegenereerd en is uniek