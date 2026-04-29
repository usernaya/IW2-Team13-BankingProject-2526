---
id: new
title: Nieuwe betaling
---

# POST /payments/new

:::note Authenticatie vereist
Stuur een geldig Bearer token mee in de `Authorization` header.
:::

Maakt een nieuwe **Payment Order (PO)** aan vanuit de GUI en stuurt deze door naar de Clearing Bank (CB).

---

## Flow impact

Dit endpoint start de volledige payment flow:

```
PO_NEW → OB validatie → PO_OUT → POST /po_in (CB)
```

Tijdens deze stap gebeurt:

- OA-rekening wordt gevalideerd (bestaat + voldoende saldo)
- Bedrag wordt **gereserveerd** op de rekening
- PO wordt opgeslagen in `po_out` met status `reserved`
- PO wordt doorgestuurd naar de CB via `POST /po_in`

---

## Request body

| Veld | Type | Verplicht | Beschrijving |
|---|---|---|---|
| `oa_id` | string | ja | IBAN van de betaler |
| `ba_id` | string | ja | IBAN van de ontvanger |
| `bb_id` | string | ja | BIC van de bestemmingsbank |
| `po_amount` | number | ja | Bedrag in euro (max €500) |
| `po_message` | string | nee | Mededeling bij de betaling |

---

## Voorbeeld request

```json
{
  "oa_id": "BE12345678901234",
  "ba_id": "BE98765432109876",
  "bb_id": "BBRUBEBB",
  "po_amount": 150.00,
  "po_message": "Huur april 2026"
}
```

---

## Response 201 — Aangemaakt

```json
{
  "ok": true,
  "status": 201,
  "code": null,
  "message": "Payment Order succesvol aangemaakt en doorgestuurd naar CB",
  "data": {
    "po_id": "BMPBBEBB_a1b2c3d4e5",
    "status": "reserved"
  }
}
```

---

## Response 400 — Bad Request

```json
{
  "ok": false,
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "Ongeldige input (rekening niet gevonden, onvoldoende saldo of bedrag > 500)",
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

## Response 503 — Service Unavailable

```json
{
  "ok": false,
  "status": 503,
  "code": "CB_UNAVAILABLE",
  "message": "Clearing Bank niet bereikbaar, retry mechanisme gestart",
  "data": null
}
```

---

## Statuscodes

| Code | Betekenis |
|---|---|
| `201` | PO aangemaakt en verstuurd naar CB |
| `400` | Validatiefout (rekening, saldo, bedrag) |
| `401` | Geen of ongeldig Bearer token |
| `503` | CB niet bereikbaar, retry gestart |

---

## Opmerkingen

- Het bedrag wordt niet onmiddellijk afgeboekt, maar eerst gereserveerd
- De effectieve afschrijving gebeurt pas na een succesvolle ACK
- Indien de betaling faalt of timeout optreedt, wordt de reservering opgeheven
- `po_id` is uniek en bevat de BIC prefix (`BMPBBEBB_...`)
- Dit endpoint is de start van alle interbank communicatie