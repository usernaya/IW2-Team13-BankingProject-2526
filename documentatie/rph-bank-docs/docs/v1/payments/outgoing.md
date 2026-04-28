---
id: outgoing
title: Uitgaande betalingen
---

# GET /payments/outgoing

:::note Authenticatie vereist
Stuur een geldig Bearer token mee in de `Authorization` header.
:::

Geeft een lijst van alle **uitgaande Payment Orders (PO's)** met hun huidige status.
Dit endpoint is een **read-only operatie** op de `po_out` tabel en heeft geen directe impact op de payment flow.

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
  "message": "Uitgaande betalingen succesvol opgehaald",
  "data": [
    {
      "po_id": "BMPBBEBB_a1b2c3d4e5",
      "oa_id": "BE12345678901234",
      "ba_id": "BE98765432109876",
      "bb_id": "BBRUBEBB",
      "po_amount": 150.00,
      "po_message": "Huur april 2026",
      "ob_code": "OB_OK",
      "status": "reserved",
      "po_datetime": "2026-04-28 09:15:00"
    }
  ]
}
```

---

## Velden

| Veld | Beschrijving |
|---|---|
| `po_id` | Unieke ID van de Payment Order |
| `oa_id` | IBAN van de betaler |
| `ba_id` | IBAN van de ontvanger |
| `bb_id` | BIC van de bestemmingsbank |
| `po_amount` | Bedrag van de betaling |
| `po_message` | Mededeling |
| `ob_code` | Statuscode van de Originator Bank |
| `status` | Huidige status (`reserved`, `success`, `failed`) |
| `po_datetime` | Datum en tijd van creatie |

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
| `200` | Lijst van uitgaande betalingen succesvol teruggegeven |
| `401` | Geen of ongeldig Bearer token |

---

## Opmerkingen

- `status = reserved` — betaling is verstuurd maar nog niet bevestigd
- `status = success` — betaling volledig afgerond (ACK ontvangen)
- `status = failed` — betaling geweigerd of mislukt
- Dit endpoint wordt gebruikt door de GUI om de status van betalingen te tonen