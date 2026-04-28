---
id: incoming
title: Inkomende betalingen
---

# GET /payments/incoming

:::note Authenticatie vereist
Stuur een geldig Bearer token mee in de `Authorization` header.
:::

Geeft een lijst van alle **inkomende Payment Orders (PO's)** waarbij RPH Bank optreedt als **Beneficiary Bank (BB)**.

Deze PO's worden opgehaald van de Clearing Bank (CB) via `GET /po_out` en automatisch opgeslagen in de `po_in` tabel door de polling worker.

Dit endpoint is een **read-only operatie** en heeft geen directe impact op de payment flow.

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
  "message": "Inkomende betalingen succesvol opgehaald",
  "data": [
    {
      "po_id": "BBRUBEBB_x9y8z7w6v5",
      "oa_id": "BE11111111111111",
      "ba_id": "BE12345678901234",
      "ob_id": "BBRUBEBB",
      "bb_id": "BMPBBEBB",
      "po_amount": 75.50,
      "po_message": "Terugbetaling",
      "cb_code": "CB_OK",
      "bb_code": "BB_OK",
      "status": "success",
      "po_datetime": "2026-04-28 10:00:00"
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
| `ba_id` | IBAN van de ontvanger (bij jullie bank) |
| `ob_id` | BIC van de originator bank |
| `bb_id` | BIC van jullie bank (RPH Bank) |
| `po_amount` | Bedrag van de betaling |
| `po_message` | Mededeling |
| `cb_code` | Statuscode van de Clearing Bank |
| `bb_code` | Statuscode van jullie bank |
| `status` | Huidige status (`pending`, `success`, `failed`) |
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
| `200` | Lijst van inkomende betalingen succesvol teruggegeven |
| `401` | Geen of ongeldig Bearer token |

---

## Opmerkingen

- Dit endpoint toont alle betalingen die naar jullie bank gestuurd zijn
- De verwerking gebeurt automatisch via de polling worker
- `success` — bedrag wordt toegevoegd aan BA
- `failed` — betaling geweigerd
- Wordt gebruikt door de GUI om inkomende betalingen weer te geven