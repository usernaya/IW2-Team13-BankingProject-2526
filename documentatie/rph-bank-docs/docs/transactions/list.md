---
id: list
title: Alle transacties
---

# GET /transactions

:::note Authenticatie vereist
Stuur een geldig Bearer token mee in de `Authorization` header.
:::

Geeft een lijst van alle **verwerkte transacties**.

Een transactie wordt aangemaakt **na verwerking van een ACK** van de Clearing Bank (CB).
Transacties worden automatisch aangemaakt door de polling worker, nooit rechtstreeks via de GUI.

Dit endpoint is een **read-only operatie** op de `transactions` tabel.

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
  "message": "Transacties succesvol opgehaald",
  "data": [
    {
      "tx_id": "tx_001",
      "po_id": "BMPBBEBB_a1b2c3d4e5",
      "account_id": "BE12345678901234",
      "amount": -150.00,
      "is_valid": true,
      "is_complete": true,
      "datetime": "2026-04-28 09:15:10"
    }
  ]
}
```

---

## Velden

| Veld | Beschrijving |
|---|---|
| `tx_id` | Unieke ID van de transactie |
| `po_id` | Payment Order waaraan de transactie gekoppeld is |
| `account_id` | IBAN van de betrokken rekening |
| `amount` | Bedrag (negatief = OA, positief = BA) |
| `is_valid` | Geeft aan of de transactie geslaagd is |
| `is_complete` | Geeft aan of de flow volledig afgerond is |
| `datetime` | Datum en tijd van verwerking |

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
| `200` | Lijst van transacties succesvol teruggegeven |
| `401` | Geen of ongeldig Bearer token |

---

## Opmerkingen

- Transacties worden pas aangemaakt na ontvangst van een ACK
- Voor één PO kunnen er meerdere transacties bestaan (OA en BA)
- Negatieve bedragen — geld vertrekt van account (OA)
- Positieve bedragen — geld komt toe op account (BA)
- Dit endpoint geeft een volledig overzicht van alle geldbewegingen