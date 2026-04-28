---
id: acks-in
title: Ontvangen ACK's
---

# GET /acks/in

:::note Authenticatie vereist
Stuur een geldig Bearer token mee in de `Authorization` header.
:::

Geeft een lijst van alle **ACK's (Acknowledgements)** die RPH Bank als **Originator Bank (OB)** ontvangen heeft van de Clearing Bank (CB).

Deze ACK's worden opgehaald van de CB via `GET /ack_out` en automatisch opgeslagen in de `ack_in` tabel door de polling worker.

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
  "message": "ACK's succesvol opgehaald",
  "data": [
    {
      "po_id": "BMPBBEBB_a1b2c3d4e5",
      "ob_code": "OB_OK",
      "cb_code": "CB_OK",
      "bb_code": "BB_OK",
      "cb_datetime": "2026-04-28 09:15:05",
      "bb_datetime": "2026-04-28 09:15:10",
      "status": "success"
    }
  ]
}
```

---

## Verwerking (achtergrond)

De polling worker verwerkt elke ACK onmiddellijk:

- `bb_code = success` — bedrag wordt definitief afgeschreven van OA, transactie opgeslagen met status `success`
- `bb_code = error` — reservering wordt opgeheven, transactie opgeslagen met status `failed`

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
| `200` | Lijst van ACK's succesvol teruggegeven |
| `401` | Geen of ongeldig Bearer token |

---

## Opmerkingen

- Dit endpoint is cruciaal voor het afronden van betalingen
- De ACK bepaalt of een betaling `success` of `failed` is
- Zonder ACK blijft een betaling in status `reserved`
- Wordt gebruikt door de GUI om finale resultaten te tonen