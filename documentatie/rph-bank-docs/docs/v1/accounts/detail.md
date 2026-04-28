---
id: detail
title: Eén rekening
---

# GET /accounts/:iban

:::note Authenticatie vereist
Stuur een geldig Bearer token mee in de `Authorization` header.
:::

Geeft de details van één specifieke rekening op basis van het IBAN.
Dit endpoint is een **read-only operatie** en heeft geen impact op de payment flow.

---

## Request

### URL parameter

| Parameter | Type | Beschrijving |
|---|---|---|
| `iban` | string | IBAN van de rekening (zonder spaties) |

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
  "message": "Rekening succesvol opgehaald",
  "data": {
    "iban": "BE12345678901234",
    "owner": "Jan Janssen",
    "balance": 5000.00,
    "reserved": 150.00,
    "available": 4850.00
  }
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

## Response 404 — Niet gevonden

```json
{
  "ok": false,
  "status": 404,
  "code": "NOT_FOUND",
  "message": "Rekening niet gevonden",
  "data": null
}
```

---

## Statuscodes

| Code | Betekenis |
|---|---|
| `200` | Rekening succesvol gevonden |
| `401` | Geen of ongeldig Bearer token |
| `404` | IBAN bestaat niet |

---

## Opmerkingen

- IBAN moet zonder spaties worden meegegeven
- `reserved` toont lopende reserveringen (bv. bij openstaande PO's)
- `available` bepaalt of een nieuwe betaling mogelijk is
- Wordt vooral gebruikt door de GUI voor detailweergave