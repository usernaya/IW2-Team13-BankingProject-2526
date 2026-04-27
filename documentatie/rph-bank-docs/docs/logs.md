---
id: logs
title: Logs
sidebar_position: 8
---

# GET /logs

:::note Authenticatie vereist
Stuur een geldig Bearer token mee in de `Authorization` header.
:::

Geeft een overzicht van alle **events, fouten en acties** die gelogd worden door de applicatie.

Logs worden gebruikt voor **debugging, monitoring en traceability**.

---

## Flow impact

Elke stap in de payment flow wordt gelogd, waaronder:

- Verzenden en ontvangen van PO's
- Communicatie met de Clearing Bank (CB)
- Retry-mechanismen bij fouten
- Verwerking van ACK's
- Validatiefouten bij OB en BB
- Polling events

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
  "message": "Logs succesvol opgehaald",
  "data": [
    {
      "log_id": 1,
      "type": "CB_UNREACHABLE",
      "message": "Retry 1/3 voor po_id BMPBBEBB_a1b2c3",
      "datetime": "2026-04-28 09:10:00"
    },
    {
      "log_id": 2,
      "type": "ACK_RECEIVED",
      "message": "ACK ontvangen voor po_id BMPBBEBB_a1b2c3 — status: success",
      "datetime": "2026-04-28 09:15:10"
    }
  ]
}
```

---

## Log types

| Type | Beschrijving |
|---|---|
| `PO_SENT` | PO verstuurd naar CB |
| `PO_RECEIVED` | PO ontvangen van CB (als BB) |
| `ACK_SENT` | ACK verstuurd naar CB (als BB) |
| `ACK_RECEIVED` | ACK ontvangen van CB (als OB) |
| `CB_UNREACHABLE` | CB niet bereikbaar, retry gestart |
| `CB_RETRY_FAILED` | Alle retries mislukt |
| `OB_VALIDATION_FAIL` | Validatie gefaald bij OB |
| `BB_VALIDATION_FAIL` | Validatie gefaald bij BB |
| `TX_SUCCESS` | Transactie succesvol verwerkt |
| `TX_FAILED` | Transactie gefaald |

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
| `200` | Logs succesvol teruggegeven |
| `401` | Geen of ongeldig Bearer token |

---

## Opmerkingen

- Logs geven een volledig overzicht van de interne werking van het systeem
- Wordt gebruikt voor debugging en troubleshooting
- Helpt bij het analyseren van fouten in de payment flow
- Belangrijk voor monitoring en validatie van het systeem