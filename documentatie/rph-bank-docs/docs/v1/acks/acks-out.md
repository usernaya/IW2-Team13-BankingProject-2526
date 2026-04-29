---
id: acks-out
title: Verstuurde ACK's
---

# GET /acks/out

:::note Authenticatie vereist
Stuur een geldig Bearer token mee in de `Authorization` header.
:::

Geeft een lijst van alle **ACK's (Acknowledgements)** die RPH Bank als **Beneficiary Bank (BB)** heeft teruggestuurd naar de Clearing Bank (CB).

Deze ACK's worden verstuurd naar de CB via `POST /ack_in` en opgeslagen in de `ack_out` tabel.

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
  "message": "Verstuurde ACK's succesvol opgehaald",
  "data": [
    {
      "po_id": "BBRUBEBB_x9y8z7w6v5",
      "bb_code": "BB_OK",
      "bb_datetime": "2026-04-28 10:00:05"
    }
  ]
}
```

---

## Verwerking (achtergrond)

Na het verwerken van een inkomende PO:

- Bij succes — `bb_code = BB_OK`, bedrag toegevoegd aan BA, ACK verstuurd naar CB
- Bij fout — `bb_code = BB_ERROR`, betaling geweigerd, ACK verstuurd met foutstatus

Deze logica wordt automatisch uitgevoerd door de polling worker.

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
| `200` | Lijst van verstuurde ACK's succesvol teruggegeven |
| `401` | Geen of ongeldig Bearer token |

---

## Opmerkingen

- Dit endpoint toont alle ACK's die jullie bank naar de CB heeft gestuurd
- Wordt gebruikt om te controleren of inkomende betalingen correct verwerkt zijn
- Samen met `/acks/in` geeft dit een volledig beeld van de payment lifecycle