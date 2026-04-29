---
id: detail
title: Één transactie
---

# GET /transactions/:tx_id

:::note Authenticatie vereist
Stuur een geldig Bearer token mee in de `Authorization` header.
:::

Geeft de details van één specifieke **transactie** op basis van `tx_id`.

Dit endpoint is een **read-only operatie** op de `transactions` tabel en heeft geen directe impact op de payment flow.

---

## Request

### URL parameter

| Parameter | Type | Beschrijving |
|---|---|---|
| `tx_id` | string | Uniek ID van de transactie |

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
  "message": "Transactie succesvol opgehaald",
  "data": {
    "tx_id": "tx_001",
    "po_id": "BMPBBEBB_a1b2c3d4e5",
    "account_id": "BE12345678901234",
    "amount": -150.00,
    "is_valid": true,
    "is_complete": true,
    "datetime": "2026-04-28 09:15:10"
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
  "message": "Transactie niet gevonden",
  "data": null
}
```

---

## Statuscodes

| Code | Betekenis |
|---|---|
| `200` | Transactie succesvol gevonden |
| `401` | Geen of ongeldig Bearer token |
| `404` | Transactie bestaat niet |

---

## Opmerkingen

- Een transactie wordt aangemaakt na verwerking van een ACK
- `amount` negatief — geld vertrekt van account (OA)
- `amount` positief — geld komt toe op account (BA)
- `is_valid` geeft aan of de transactie geslaagd is
- `is_complete` geeft aan of de volledige flow afgerond is
- Wordt gebruikt voor detailweergave en debugging