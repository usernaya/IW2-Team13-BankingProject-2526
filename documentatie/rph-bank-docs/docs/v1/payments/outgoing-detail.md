---
id: outgoing-detail
title: Één uitgaande betaling
---

# GET /payments/outgoing/:po_id

:::note Authenticatie vereist
Stuur een geldig Bearer token mee in de `Authorization` header.
:::

Geeft de volledige details van één uitgaande **Payment Order (PO)** inclusief alle codes en timestamps van OB, CB en BB.
Dit endpoint is een **read-only operatie** op de `po_out` tabel en heeft geen directe impact op de payment flow.

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
  "message": "Payment Order succesvol opgehaald",
  "data": {
    "po_id": "BMPBBEBB_a1b2c3d4e5",
    "po_amount": 150.00,
    "po_message": "Huur april 2026",
    "po_datetime": "2026-04-28 09:15:00",
    "ob_id": "BMPBBEBB",
    "oa_id": "BE12345678901234",
    "ob_code": "OB_OK",
    "ob_datetime": "2026-04-28 09:15:00",
    "bb_id": "BBRUBEBB",
    "ba_id": "BE98765432109876",
    "cb_code": "CB_OK",
    "cb_datetime": "2026-04-28 09:15:05",
    "bb_code": "BB_OK",
    "bb_datetime": "2026-04-28 09:15:10",
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

- Dit endpoint toont de volledige lifecycle van een betaling
- `ob_code`, `cb_code` en `bb_code` geven de status per bank weer
- De `*_datetime` velden tonen wanneer elke stap verwerkt werd
- `status` kan zijn: `reserved`, `success` of `failed`
- Ideaal voor debugging en demo's — de volledige flow is zichtbaar