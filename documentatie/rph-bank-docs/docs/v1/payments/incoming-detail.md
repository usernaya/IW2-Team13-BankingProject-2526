---
id: incoming-detail
title: Één inkomende betaling
---

# GET /payments/incoming/:po_id

:::note Authenticatie vereist
Stuur een geldig Bearer token mee in de `Authorization` header.
:::

Geeft de volledige details van één inkomende **Payment Order (PO)** waarbij RPH Bank optreedt als **Beneficiary Bank (BB)**.

Dit endpoint toont alle informatie inclusief de verwerking door jullie bank (`bb_code` en `bb_datetime`).

Dit is een **read-only operatie** op de `po_in` tabel en heeft geen directe impact op de payment flow.

---

## Request

### URL parameter

| Parameter | Type | Beschrijving |
|---|---|---|
| `po_id` | string | Uniek ID van de Payment Order |

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
  "message": "Inkomende Payment Order succesvol opgehaald",
  "data": {
    "po_id": "BBRUBEBB_x9y8z7w6v5",
    "po_amount": 75.50,
    "po_message": "Terugbetaling",
    "po_datetime": "2026-04-28 10:00:00",
    "ob_id": "BBRUBEBB",
    "oa_id": "BE11111111111111",
    "bb_id": "BMPBBEBB",
    "ba_id": "BE12345678901234",
    "cb_code": "CB_OK",
    "cb_datetime": "2026-04-28 10:00:05",
    "bb_code": "BB_OK",
    "bb_datetime": "2026-04-28 10:00:10",
    "status": "success"
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
  "message": "Payment Order niet gevonden",
  "data": null
}
```

---

## Statuscodes

| Code | Betekenis |
|---|---|
| `200` | Payment Order succesvol gevonden |
| `401` | Geen of ongeldig Bearer token |
| `404` | PO bestaat niet |

---

## Opmerkingen

- `bb_code` geeft aan hoe jullie bank de betaling verwerkt heeft
- `bb_datetime` toont wanneer de verwerking gebeurde
- `status` kan zijn: `pending`, `success` of `failed`
- Nuttig voor debugging en detailweergave in de GUI